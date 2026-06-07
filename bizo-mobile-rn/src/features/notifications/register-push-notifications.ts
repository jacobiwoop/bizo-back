import * as Notifications from "expo-notifications";
import messaging from "@react-native-firebase/messaging";
import { Platform } from "react-native";

import { updateFcmToken } from "@/src/lib/api/auth";

export const BIZO_NOTIFICATION_CHANNEL_ID = "bizo-alerts";

let notificationHandlerConfigured = false;

export function configureNotificationHandler() {
  if (notificationHandlerConfigured) {
    return;
  }

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  notificationHandlerConfigured = true;
}

export async function registerAndroidPushNotifications() {
  if (Platform.OS !== "android") {
    return null;
  }

  const existingChannel = await Notifications.getNotificationChannelAsync(BIZO_NOTIFICATION_CHANNEL_ID);

  if (existingChannel?.sound === "custom") {
    await Notifications.deleteNotificationChannelAsync(BIZO_NOTIFICATION_CHANNEL_ID);
  }

  await Notifications.setNotificationChannelAsync(BIZO_NOTIFICATION_CHANNEL_ID, {
    importance: Notifications.AndroidImportance.MAX,
    lightColor: "#F5C518",
    name: "Bizo",
    vibrationPattern: [0, 250, 250, 250],
  });

  const existingPermissions = await Notifications.getPermissionsAsync();
  const finalPermissions =
    existingPermissions.status === "granted"
      ? existingPermissions
      : await Notifications.requestPermissionsAsync();

  if (finalPermissions.status !== "granted") {
    return null;
  }

  await messaging().requestPermission();
  const fcmToken = await messaging().getToken();

  if (!fcmToken) {
    return null;
  }

  await updateFcmToken({ fcm_token: fcmToken });

  return fcmToken;
}
