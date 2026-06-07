import notifee, {
  AndroidCategory,
  AndroidImportance,
  AndroidStyle,
} from "@notifee/react-native";
import messaging, { type FirebaseMessagingTypes } from "@react-native-firebase/messaging";
import { Platform } from "react-native";

export const BIZO_NATIVE_MESSAGE_CHANNEL_ID = "bizo-alerts";

type MessagePushData = {
  type?: string;
  conv_id?: string;
  conversation_id?: string;
  title?: string;
  body?: string;
  sender_id?: string;
  sender_name?: string;
  sender_photo_url?: string;
  notification_avatar_url?: string;
  listing_photo_url?: string;
  listing_title?: string;
};

function normalizeText(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function isMessagePush(data: MessagePushData): boolean {
  return data.type === "new_message" || data.type === "troc_proposal";
}

function conversationIdFrom(data: MessagePushData): string | undefined {
  return normalizeText(data.conv_id) ?? normalizeText(data.conversation_id);
}

async function ensureNativeMessageChannel() {
  if (Platform.OS !== "android") {
    return;
  }

  await notifee.createChannel({
    id: BIZO_NATIVE_MESSAGE_CHANNEL_ID,
    importance: AndroidImportance.HIGH,
    lights: true,
    name: "Bizo",
    vibration: true,
  });
}

export async function displayNativeMessageNotification(remoteMessage: FirebaseMessagingTypes.RemoteMessage) {
  if (Platform.OS !== "android") {
    return;
  }

  const data = (remoteMessage.data ?? {}) as MessagePushData;

  if (!isMessagePush(data)) {
    return;
  }

  const conversationId = conversationIdFrom(data);
  const senderName = normalizeText(data.sender_name) ?? normalizeText(data.title) ?? "Nouveau message";
  const body = normalizeText(data.body) ?? "Nouveau message";
  const sender = {
    id: normalizeText(data.sender_id) ?? senderName,
    name: senderName,
    important: true,
  };

  await ensureNativeMessageChannel();

  await notifee.displayNotification({
    id: conversationId ? `conversation-${conversationId}` : remoteMessage.messageId,
    title: senderName,
    body,
    data: {
      conv_id: conversationId ?? "",
      type: data.type ?? "new_message",
    },
    android: {
      autoCancel: true,
      category: AndroidCategory.MESSAGE,
      channelId: BIZO_NATIVE_MESSAGE_CHANNEL_ID,
      color: "#111111",
      groupId: conversationId ? `conversation-${conversationId}` : "bizo-messages",
      pressAction: {
        id: "default",
      },
      style: {
        type: AndroidStyle.MESSAGING,
        person: {
          id: "current-user",
          name: "Vous",
        },
        messages: [
          {
            text: body,
            timestamp: Date.now(),
            person: sender,
          },
        ],
      },
    },
  });
}

export function registerForegroundNativeMessageNotifications() {
  if (Platform.OS !== "android") {
    return () => undefined;
  }

  const unsubscribeMessage = messaging().onMessage(displayNativeMessageNotification);

  return () => {
    unsubscribeMessage();
  };
}

notifee.onBackgroundEvent(async () => undefined);

messaging().setBackgroundMessageHandler(displayNativeMessageNotification);
