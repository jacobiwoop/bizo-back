import { NativeModules, Platform } from "react-native";

type BizoCustomNotificationsModule = {
  showMessageNotification(payload: BizoCustomMessageNotificationPayload): Promise<boolean>;
};

export type BizoCustomMessageNotificationPayload = {
  notificationId?: string;
  conversationId?: string;
  senderName: string;
  body: string;
  avatarUrl?: string;
  listingTitle?: string;
};

const nativeModule = NativeModules.BizoCustomNotifications as BizoCustomNotificationsModule | undefined;

export function canUseBizoCustomNotifications() {
  return Platform.OS === "android" && Boolean(nativeModule?.showMessageNotification);
}

export async function showBizoCustomMessageNotification(payload: BizoCustomMessageNotificationPayload) {
  if (!canUseBizoCustomNotifications()) {
    return false;
  }

  return Boolean(await nativeModule?.showMessageNotification(payload));
}
