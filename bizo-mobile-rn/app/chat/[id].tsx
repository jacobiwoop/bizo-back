import { useRouter } from "expo-router";

import { DirectContactChatScreen } from "@/src/features/chat/screens/direct-contact-chat-screen";

export default function ChatThreadRoute() {
  const router = useRouter();

  return <DirectContactChatScreen onBack={() => router.back()} />;
}
