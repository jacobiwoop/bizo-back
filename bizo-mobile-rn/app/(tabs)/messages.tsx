import { useRouter } from "expo-router";

import { MessagingInboxScreen } from "@/src/features/chat/screens/messaging-inbox-screen";

export default function MessagesRoute() {
  const router = useRouter();

  return <MessagingInboxScreen onOpenConversation={() => router.push("/chat/direct-contact")} />;
}
