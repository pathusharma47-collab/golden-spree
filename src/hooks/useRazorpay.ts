import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayPaymentResult {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const useRazorpay = () => {
  const [loading, setLoading] = useState(false);

  const initiatePayment = useCallback(
    async (
      amount: number,
      userName: string,
      userEmail: string,
      userPhone?: string
    ): Promise<{ success: boolean; paymentId?: string; orderId?: string; error?: string }> => {
      setLoading(true);
      try {
        const loaded = await loadRazorpayScript();
        if (!loaded) {
          throw new Error("Failed to load Razorpay SDK");
        }

        // Create order via edge function
        const { data: orderData, error: orderError } = await supabase.functions.invoke(
          "razorpay-create-order",
          { body: { amount, user_email: userEmail, description: `Add ₹${amount} to wallet` } }
        );

        if (orderError || !orderData?.order_id) {
          throw new Error(orderError?.message || orderData?.error || "Failed to create order");
        }

        // Open Razorpay checkout
        return new Promise((resolve) => {
          let settled = false;
          const safeResolve = (result: { success: boolean; paymentId?: string; error?: string }) => {
            if (settled) return;
            settled = true;
            // Defensive: restore body styles in case Razorpay didn't clean up
            // (happens occasionally inside iframe/preview contexts and causes a "blank" screen)
            try {
              document.body.style.overflow = "";
              document.body.style.position = "";
              document.body.style.top = "";
              document.body.style.width = "";
              document.body.style.height = "";
              document.body.style.paddingRight = "";
              document.documentElement.style.overflow = "";
              // Remove any leftover Razorpay containers
              document
                .querySelectorAll(".razorpay-container, .razorpay-backdrop")
                .forEach((el) => el.remove());
            } catch (_) {
              /* noop */
            }
            resolve(result);
          };

          const options = {
            key: orderData.key_id,
            amount: orderData.amount,
            currency: orderData.currency,
            name: "Maheshwari Alankar",
            description: `Add ₹${amount} to wallet`,
            order_id: orderData.order_id,
            handler: async (response: RazorpayPaymentResult) => {
              try {
                const { data: verifyData, error: verifyError } = await supabase.functions.invoke(
                  "razorpay-verify-payment",
                  { body: response }
                );

                if (verifyError || !verifyData?.verified) {
                  safeResolve({ success: false, error: "Payment verification failed" });
                } else {
                  safeResolve({ success: true, paymentId: response.razorpay_payment_id });
                }
              } catch (err: any) {
                safeResolve({ success: false, error: err.message });
              }
            },
            prefill: {
              name: userName,
              email: userEmail,
              contact: userPhone || "",
            },
            theme: { color: "#D4A853" },
            modal: {
              ondismiss: () => {
                safeResolve({ success: false, error: "Payment cancelled" });
              },
              escape: true,
              backdropclose: false,
              confirm_close: false,
            },
            retry: { enabled: false },
          };

          try {
            const rzp = new window.Razorpay(options);
            rzp.on("payment.failed", (response: any) => {
              safeResolve({
                success: false,
                error: response.error?.description || "Payment failed",
              });
            });
            rzp.open();
          } catch (err: any) {
            safeResolve({ success: false, error: err?.message || "Failed to open checkout" });
          }
        });
      } catch (err: any) {
        return { success: false, error: err.message };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const initiatePayout = useCallback(
    async (
      amount: number,
      mode: "UPI" | "IMPS",
      details: { upi_id?: string; account_number?: string; ifsc?: string; beneficiary_name?: string }
    ): Promise<{ success: boolean; payoutId?: string; error?: string }> => {
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke("razorpay-payout", {
          body: { amount, mode, ...details },
        });

        if (error || !data?.success) {
          throw new Error(error?.message || data?.error || "Payout failed");
        }

        return { success: true, payoutId: data.payout_id };
      } catch (err: any) {
        return { success: false, error: err.message };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { loading, initiatePayment, initiatePayout };
};
