import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { updateFcmToken } from "@/src/lib/api/auth";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerAndroidPushNotifications() {
  if (Platform.OS !== "android") {
    return null;
  }

  await Notifications.setNotificationChannelAsync("default", {
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

  const deviceToken = await Notifications.getDevicePushTokenAsync();
  const fcmToken = deviceToken.data;

  if (!fcmToken) {
    return null;
  }

  await updateFcmToken({ fcm_token: fcmToken });

  return fcmToken;
}
