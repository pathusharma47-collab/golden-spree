import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";
import { Capacitor } from "@capacitor/core";

const isNative = Capacitor.isNativePlatform();

export const hapticImpact = async (style: ImpactStyle = ImpactStyle.Medium) => {
  if (!isNative) return;
  try {
    await Haptics.impact({ style });
  } catch {}
};

export const hapticNotification = async (type: NotificationType = NotificationType.Success) => {
  if (!isNative) return;
  try {
    await Haptics.notification({ type });
  } catch {}
};

export const hapticSelection = async () => {
  if (!isNative) return;
  try {
    await Haptics.selectionStart();
    await Haptics.selectionChanged();
    await Haptics.selectionEnd();
  } catch {}
};

// Convenience shortcuts
export const hapticLight = () => hapticImpact(ImpactStyle.Light);
export const hapticMedium = () => hapticImpact(ImpactStyle.Medium);
export const hapticHeavy = () => hapticImpact(ImpactStyle.Heavy);
export const hapticSuccess = () => hapticNotification(NotificationType.Success);
export const hapticError = () => hapticNotification(NotificationType.Error);
export const hapticWarning = () => hapticNotification(NotificationType.Warning);
