import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "@/contexts/WalletContext";
import { ArrowLeft, Plus, ArrowDownToLine, Wallet, ArrowUpRight, ArrowDownLeft, Sparkles, Fingerprint, Loader2, CreditCard, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useKYC } from "@/hooks/useKYC";
import { useAuth } from "@/contexts/AuthContext";
import { useRazorpay } from "@/hooks/useRazorpay";
import { hapticLight, hapticSuccess, hapticError, hapticHeavy, hapticWarning } from "@/utils/haptics";
import { usePaymentTransactions, type PaymentTransaction } from "@/hooks/usePaymentTransactions";
import { TransactionDetailsDialog } from "@/components/TransactionDetailsDialog";

const WalletPage = () => {
  const { balance, transactions, addFunds, withdraw, isNewUser } = useWallet();
  const navigate = useNavigate();
  const { isVerified, loading: kycLoading } = useKYC();
  const { user } = useAuth();
  const { loading: paymentLoading, initiatePayment, initiatePayout } = useRazorpay();
  const { transactions: paymentTxs, refetch: refetchPayments, waitForOrderSuccess } = usePaymentTransactions();

  const [mode, setMode] = useState<"add" | "withdraw" | null>(null);
  const [amount, setAmount] = useState("");
  const [withdrawMode, setWithdrawMode] = useState<"wallet" | "upi" | "bank">("wallet");
  const [upiId, setUpiId] = useState("");
  const [bankDetails, setBankDetails] = useState({ account_number: "", ifsc: "", beneficiary_name: "" });
  const [syncingFunds, setSyncingFunds] = useState(false);
  const [selectedTx, setSelectedTx] = useState<PaymentTransaction | null>(null);

  // Safety net: when WalletPage mounts (e.g. after Razorpay redirect),
  // forcibly clean up any leftover Razorpay body styles / overlays so the
  // page can never be left blank.
  useEffect(() => {
    const cleanup = () => {
      try {
        document.body.style.overflow = "";
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        document.body.style.height = "";
        document.body.style.paddingRight = "";
        document.documentElement.style.overflow = "";
        document
          .querySelectorAll(".razorpay-container, .razorpay-backdrop, .razorpay-checkout-frame")
          .forEach((el) => el.remove());
      } catch (_) {
        /* noop */
      }
    };
    cleanup();
    // Also run a moment later in case Razorpay re-applies styles asynchronously
    const t = setTimeout(cleanup, 500);
    return () => clearTimeout(t);
  }, []);

  const handleAddFunds = async () => {
    const num = parseFloat(amount);
    if (!num || num <= 0) {
      hapticError();
      toast.error("Enter a valid amount");
      return;
    }

    hapticHeavy();

    const result = await initiatePayment(
      num,
      user?.name || "Customer",
      user?.email || ""
    );

    // Always sync if we have an orderId — even on "cancelled", the payment
    // may have actually completed (iframe / 3DS redirect cases where the
    // Razorpay handler callback never fires).
    if (result.orderId) {
      setSyncingFunds(true);
      const tx = await waitForOrderSuccess(result.orderId);
      setSyncingFunds(false);

      if (tx?.status === "success") {
        addFunds(num);
        await refetchPayments();
        hapticSuccess();
        toast.success(`₹${num.toLocaleString("en-IN")} added to wallet`, {
          description: `Payment ID: ${tx.payment_id ?? result.paymentId ?? ""}`,
        });
        setAmount("");
        setMode(null);
        return;
      }

      if (result.success) {
        // Razorpay said success but DB didn't confirm in time
        hapticError();
        toast.error("Payment could not be confirmed", {
          description: "If money was deducted it will be refunded.",
        });
        return;
      }
    }

    if (result.error && result.error !== "Payment cancelled") {
      hapticError();
      toast.error("Payment failed", { description: result.error });
    }
  };

  const handleWithdraw = async () => {
    const num = parseFloat(amount);
    if (!num || num <= 0) {
      hapticError();
      toast.error("Enter a valid amount");
      return;
    }
    if (num > balance) {
      hapticError();
      toast.error("Insufficient balance");
      return;
    }

    hapticHeavy();

    if (withdrawMode === "wallet") {
      // Just deduct from wallet (for later use)
      const ok = withdraw(num);
      if (ok) {
        hapticSuccess();
        toast.success(`₹${num.toLocaleString("en-IN")} withdrawn to wallet`);
      }
    } else if (withdrawMode === "upi") {
      if (!upiId) {
        hapticError();
        toast.error("Enter your UPI ID");
        return;
      }
      const result = await initiatePayout(num, "UPI", { upi_id: upiId });
      if (result.success) {
        withdraw(num);
        hapticSuccess();
        toast.success(`₹${num.toLocaleString("en-IN")} sent to ${upiId}`, {
          description: `Payout ID: ${result.payoutId}`,
        });
      } else {
        hapticError();
        toast.error("Payout failed", { description: result.error });
        return;
      }
    } else if (withdrawMode === "bank") {
      if (!bankDetails.account_number || !bankDetails.ifsc || !bankDetails.beneficiary_name) {
        hapticError();
        toast.error("Fill all bank details");
        return;
      }
      const result = await initiatePayout(num, "IMPS", bankDetails);
      if (result.success) {
        withdraw(num);
        hapticSuccess();
        toast.success(`₹${num.toLocaleString("en-IN")} transferred to bank`, {
          description: `Payout ID: ${result.payoutId}`,
        });
      } else {
        hapticError();
        toast.error("Transfer failed", { description: result.error });
        return;
      }
    }
    setAmount("");
    setMode(null);
    setUpiId("");
    setBankDetails({ account_number: "", ifsc: "", beneficiary_name: "" });
  };

  const handleWithdrawClick = () => {
    if (!isVerified) {
      hapticWarning();
      toast.error("Complete KYC to withdraw funds");
      navigate("/kyc");
      return;
    }
    hapticLight();
    setMode(mode === "withdraw" ? null : "withdraw");
  };

  return (
    <div className="px-5 pt-12 pb-28 max-w-lg mx-auto">
      <motion.button whileTap={{ scale: 0.9 }} onClick={() => { hapticLight(); navigate(-1); }} className="text-muted-foreground mb-4">
        <ArrowLeft size={22} />
      </motion.button>

      <h1 className="font-display text-2xl font-bold text-foreground">Wallet</h1>
      <p className="text-sm text-muted-foreground mt-1">Manage your funds</p>

      {isNewUser && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05, duration: 0.4 }}
          className="mt-4 gold-gradient rounded-xl px-4 py-3 flex items-center gap-3"
        >
          <Sparkles size={18} className="text-primary-foreground" />
          <p className="text-sm font-semibold text-primary-foreground">₹100 Welcome Bonus Added! 🎁</p>
        </motion.div>
      )}

      {/* Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-6 glass-card p-6 text-center"
      >
        <div className="w-14 h-14 mx-auto rounded-2xl gold-gradient flex items-center justify-center gold-glow mb-3">
          <Wallet size={24} className="text-primary-foreground" />
        </div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider">Available Balance</p>
        <p className="text-4xl font-display font-bold text-foreground mt-1">
          ₹{balance.toLocaleString("en-IN")}
        </p>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 gap-3 mt-4"
      >
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => { hapticLight(); setMode(mode === "add" ? null : "add"); }}
          className={`py-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
            mode === "add" ? "gold-gradient text-primary-foreground gold-glow" : "glass-card text-foreground"
          }`}
        >
          <Plus size={18} /> Add Funds
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleWithdrawClick}
          className={`py-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
            mode === "withdraw" ? "bg-destructive text-destructive-foreground" : "glass-card text-foreground"
          }`}
        >
          <ArrowDownToLine size={18} /> Withdraw
        </motion.button>
      </motion.div>

      {/* Add Funds Panel */}
      <AnimatePresence>
        {mode === "add" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="glass-card p-5 mt-4 space-y-4">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">Amount to Add (₹)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full text-2xl font-display font-bold bg-transparent text-foreground outline-none placeholder:text-muted-foreground/30"
                autoFocus
              />
              <div className="flex gap-2">
                {[500, 1000, 2000, 5000].map((a) => (
                  <motion.button
                    key={a}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => { hapticLight(); setAmount(String(a)); }}
                    className="flex-1 py-2 rounded-lg border border-border/50 text-xs font-medium text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors"
                  >
                    ₹{a}
                  </motion.button>
                ))}
              </div>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleAddFunds}
                disabled={paymentLoading || syncingFunds}
                className="w-full h-12 rounded-xl font-semibold flex items-center justify-center gap-2 gold-gradient text-primary-foreground gold-glow disabled:opacity-50"
              >
                {syncingFunds ? (
                  <><Loader2 size={18} className="animate-spin" /> Confirming payment...</>
                ) : paymentLoading ? (
                  <><Loader2 size={18} className="animate-spin" /> Processing...</>
                ) : (
                  <><CreditCard size={18} /> Pay & Add Funds</>
                )}
              </motion.button>
              <p className="text-[10px] text-center text-muted-foreground">Powered by Razorpay • Secure Payment</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Withdraw Panel */}
      <AnimatePresence>
        {mode === "withdraw" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="glass-card p-5 mt-4 space-y-4">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">Amount to Withdraw (₹)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full text-2xl font-display font-bold bg-transparent text-foreground outline-none placeholder:text-muted-foreground/30"
                autoFocus
              />
              <div className="flex gap-2">
                {[500, 1000, 2000, 5000].map((a) => (
                  <motion.button
                    key={a}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => { hapticLight(); setAmount(String(a)); }}
                    className="flex-1 py-2 rounded-lg border border-border/50 text-xs font-medium text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors"
                  >
                    ₹{a}
                  </motion.button>
                ))}
              </div>

              {/* Withdraw Method Selector */}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Transfer To</p>
                <div className="grid grid-cols-2 gap-2">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { hapticLight(); setWithdrawMode("upi"); }}
                    className={`py-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      withdrawMode === "upi" ? "bg-primary text-primary-foreground" : "glass-card text-foreground"
                    }`}
                  >
                    <Fingerprint size={16} /> UPI
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { hapticLight(); setWithdrawMode("bank"); }}
                    className={`py-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      withdrawMode === "bank" ? "bg-primary text-primary-foreground" : "glass-card text-foreground"
                    }`}
                  >
                    <Building2 size={16} /> Bank
                  </motion.button>
                </div>
              </div>

              {/* UPI Input */}
              <AnimatePresence>
                {withdrawMode === "upi" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="Enter UPI ID (e.g. name@upi)"
                      className="w-full px-4 py-3 rounded-xl bg-muted/50 text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Bank Details */}
              <AnimatePresence>
                {withdrawMode === "bank" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <input
                      type="text"
                      value={bankDetails.beneficiary_name}
                      onChange={(e) => setBankDetails((d) => ({ ...d, beneficiary_name: e.target.value }))}
                      placeholder="Account holder name"
                      className="w-full px-4 py-3 rounded-xl bg-muted/50 text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
                    />
                    <input
                      type="text"
                      value={bankDetails.account_number}
                      onChange={(e) => setBankDetails((d) => ({ ...d, account_number: e.target.value }))}
                      placeholder="Account number"
                      className="w-full px-4 py-3 rounded-xl bg-muted/50 text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
                    />
                    <input
                      type="text"
                      value={bankDetails.ifsc}
                      onChange={(e) => setBankDetails((d) => ({ ...d, ifsc: e.target.value }))}
                      placeholder="IFSC code"
                      className="w-full px-4 py-3 rounded-xl bg-muted/50 text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleWithdraw}
                disabled={paymentLoading}
                className="w-full h-12 rounded-xl font-semibold flex items-center justify-center gap-2 bg-destructive text-destructive-foreground disabled:opacity-50"
              >
                {paymentLoading ? (
                  <><Loader2 size={18} className="animate-spin" /> Processing...</>
                ) : (
                  <>Withdraw to {withdrawMode === "upi" ? "UPI" : "Bank Account"}</>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Razorpay Payment Transactions */}
      <div className="mt-6">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Payment History</p>
        {paymentTxs.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground text-xs">
            No payments yet. Tap a row below to view details.
          </div>
        ) : (
          <div className="space-y-2">
            {paymentTxs.map((tx, i) => {
              const isSuccess = tx.status === "success";
              const isFailed = tx.status === "failed";
              return (
                <motion.button
                  key={tx.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { hapticLight(); setSelectedTx(tx); }}
                  className="w-full glass-card p-4 flex items-center gap-3 text-left"
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    isSuccess ? "bg-emerald-500/10" : isFailed ? "bg-destructive/10" : "bg-muted"
                  }`}>
                    {isSuccess ? (
                      <ArrowDownLeft size={16} className="text-emerald-500" />
                    ) : isFailed ? (
                      <ArrowUpRight size={16} className="text-destructive" />
                    ) : (
                      <Loader2 size={16} className="text-muted-foreground animate-spin" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {tx.description || "Razorpay Payment"}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(tx.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })} • {tx.status}
                    </p>
                  </div>
                  <p className={`text-sm font-semibold ${
                    isSuccess ? "text-emerald-500" : isFailed ? "text-destructive" : "text-muted-foreground"
                  }`}>
                    ₹{Number(tx.amount).toLocaleString("en-IN")}
                  </p>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>

      {/* Wallet Activity (local) */}
      <div className="mt-6">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Wallet Activity</p>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No activity yet. Add funds to get started ✨
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx, i) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="glass-card p-4 flex items-center gap-3"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  tx.type === "credit" ? "bg-emerald-500/10" : "bg-destructive/10"
                }`}>
                  {tx.type === "credit"
                    ? <ArrowDownLeft size={16} className="text-emerald-500" />
                    : <ArrowUpRight size={16} className="text-destructive" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{tx.description}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(tx.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <p className={`text-sm font-semibold ${tx.type === "credit" ? "text-emerald-500" : "text-destructive"}`}>
                  {tx.type === "credit" ? "+" : "-"}₹{tx.amount.toLocaleString("en-IN")}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <TransactionDetailsDialog
        open={!!selectedTx}
        onOpenChange={(o) => !o && setSelectedTx(null)}
        transaction={selectedTx}
      />
    </div>
  );
};


export default WalletPage;
