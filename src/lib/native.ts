import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import { SplashScreen } from "@capacitor/splash-screen";
import { Keyboard } from "@capacitor/keyboard";
import { App as CapApp } from "@capacitor/app";
import { PushNotifications } from "@capacitor/push-notifications";
import { LocalNotifications } from "@capacitor/local-notifications";

export const isNative = () => Capacitor.isNativePlatform();
export const platform = () => Capacitor.getPlatform(); // 'ios' | 'android' | 'web'

/** One-shot initialization called once from main.tsx */
export async function initNative() {
  if (!isNative()) return;

  // Status bar — light theme app
  try {
    await StatusBar.setStyle({ style: Style.Light });
    if (platform() === "android") {
      await StatusBar.setBackgroundColor({ color: "#FAF8F2" });
    }
    await StatusBar.setOverlaysWebView({ overlay: false });
  } catch {}

  // Hide splash after the app paints
  try {
    setTimeout(() => SplashScreen.hide().catch(() => {}), 400);
  } catch {}

  // Keyboard niceties
  try {
    Keyboard.addListener("keyboardWillShow", () => {
      document.body.classList.add("kb-open");
    });
    Keyboard.addListener("keyboardWillHide", () => {
      document.body.classList.remove("kb-open");
    });
  } catch {}

  // Android hardware back → SPA history back; exit when at root
  try {
    CapApp.addListener("backButton", () => {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        CapApp.exitApp();
      }
    });
  } catch {}

  // Local notifications permission (fallback for in-app reminders)
  try {
    await LocalNotifications.requestPermissions();
  } catch {}
}

/**
 * Register for push notifications and persist the device token in `device_tokens`.
 * Call after the user has signed in.
 */
export async function registerPushForUser(userId: string) {
  if (!isNative()) return;
  try {
    const perm = await PushNotifications.checkPermissions();
    let granted = perm.receive === "granted";
    if (!granted) {
      const r = await PushNotifications.requestPermissions();
      granted = r.receive === "granted";
    }
    if (!granted) return;

    await PushNotifications.register();

    PushNotifications.addListener("registration", async (token) => {
      try {
        const { supabase } = await import("@/integrations/supabase/client");
        await supabase.from("device_tokens" as any).upsert(
          {
            user_id: userId,
            token: token.value,
            platform: platform(),
          },
          { onConflict: "token" }
        );
      } catch (e) {
        console.warn("push token persist failed", e);
      }
    });

    PushNotifications.addListener("registrationError", (err) => {
      console.warn("push register error", err);
    });
  } catch (e) {
    console.warn("push setup failed", e);
  }
}