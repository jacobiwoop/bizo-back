import { useLocalSearchParams, useRouter } from "expo-router";

import { DirectContactChatScreen } from "@/src/features/chat/screens/direct-contact-chat-screen";

export default function ChatThreadRoute() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const conversationId = Array.isArray(params.id) ? params.id[0] : params.id;

  return <DirectContactChatScreen conversationId={conversationId ?? ""} onBack={() => router.back()} />;
}
