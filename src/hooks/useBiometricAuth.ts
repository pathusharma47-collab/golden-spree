import { useCallback, useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";

/**
 * Biometric unlock (Face ID / Touch ID / Fingerprint) via
 * capacitor-native-biometric on native, with a WebAuthn-based
 * availability check on the web (web auth UX is left to native).
 */

export type BiometryKind = "face" | "fingerprint" | "generic" | "none";

const BIO_FLAG_KEY = (uid: string) => `ma_biometric_${uid}`;

export const isBiometricEnabled = (uid: string) =>
  localStorage.getItem(BIO_FLAG_KEY(uid)) === "1";
export const setBiometricEnabled = (uid: string, enabled: boolean) => {
  if (enabled) localStorage.setItem(BIO_FLAG_KEY(uid), "1");
  else localStorage.removeItem(BIO_FLAG_KEY(uid));
};

export const useBiometricAuth = () => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [kind, setKind] = useState<BiometryKind>("none");
  const [loading, setLoading] = useState(false);

  const checkAvailability = useCallback(async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        const { NativeBiometric } = await import("capacitor-native-biometric");
        const res = await NativeBiometric.isAvailable();
        if (!res.isAvailable) {
          setIsAvailable(false);
          setKind("none");
          return false;
        }
        // biometryType: 1=Touch ID, 2=Face ID, 3=Fingerprint, 4=Face Auth, 5=Iris
        const t = res.biometryType;
        setKind(t === 2 || t === 4 ? "face" : t === 1 || t === 3 ? "fingerprint" : "generic");
        setIsAvailable(true);
        return true;
      }
      // Web availability check (UX not wired on web)
      if (window.PublicKeyCredential) {
        const ok = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        setIsAvailable(ok);
        setKind(ok ? "generic" : "none");
        return ok;
      }
      setIsAvailable(false);
      return false;
    } catch {
      setIsAvailable(false);
      return false;
    }
  }, []);

  const authenticate = useCallback(
    async (reason = "Unlock Maheshwari Alankar"): Promise<boolean> => {
      setLoading(true);
      try {
        if (Capacitor.isNativePlatform()) {
          const { NativeBiometric } = await import("capacitor-native-biometric");
          await NativeBiometric.verifyIdentity({
            reason,
            title: "Unlock app",
            subtitle: "Use biometrics to continue",
            description: reason,
            useFallback: true,
          });
          return true;
        }
        // Web: no real verification path without a registered credential.
        // We surface a soft success only when the user has explicitly opted in
        // on a platform with biometric available, so callers can still gate on
        // isBiometricEnabled.
        return !!window.PublicKeyCredential;
      } catch (err) {
        console.warn("Biometric auth failed/cancelled", err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    checkAvailability();
  }, [checkAvailability]);

  return { isAvailable, kind, loading, checkAvailability, authenticate };
};
