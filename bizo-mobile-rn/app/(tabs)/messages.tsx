import { router } from "expo-router";

import { MessagingInboxScreen } from "@/src/features/chat/screens/messaging-inbox-screen";

export default function MessagesRoute() {
  return (
    <MessagingInboxScreen
      onBack={() => {
        if (router.canGoBack()) {
          router.back();
          return;
        }

        router.replace("/(tabs)/home");
      }}
      onOpenConversation={(conversationId) => router.push(`/chat/${conversationId}`)}
    />
  );
}
