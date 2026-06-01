import { router } from "expo-router";

import { MessagingInboxScreen } from "@/src/features/chat/screens/messaging-inbox-screen";

export default function MessagesRoute() {
  return <MessagingInboxScreen onOpenConversation={(conversationId) => router.push(`/chat/${conversationId}`)} />;
}
