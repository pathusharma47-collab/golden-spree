import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.lovable.9f4852c61da046f495685e522bc8ac8c",
  appName: "Maheshwari Alankar",
  webDir: "dist",
  // Hot-reload from Lovable sandbox while developing.
  // Comment out the `server` block before producing a release build for the stores.
  server: {
    url: "https://9f4852c6-1da0-46f4-9568-5e522bc8ac8c.lovableproject.com?forceHideBadge=true",
    cleartext: true,
  },
  ios: {
    contentInset: "always",
    backgroundColor: "#FAF8F2",
    limitsNavigationsToAppBoundDomains: false,
  },
  android: {
    backgroundColor: "#FAF8F2",
    allowMixedContent: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: "#FAF8F2",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#FAF8F2",
      overlaysWebView: false,
    },
    Keyboard: {
      resize: "native",
      resizeOnFullScreen: true,
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
};

export default config;
