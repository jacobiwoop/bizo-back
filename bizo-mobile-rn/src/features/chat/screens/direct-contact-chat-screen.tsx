import { CheckCheck, ChevronLeft, Image as ImageIcon, Info, Mic, MoreVertical, Send, Shield, UserCircle, X } from "lucide-react-native";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState, type ElementRef } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";
import { Image } from "expo-image";
import { KeyboardAvoidingView, KeyboardChatScrollView, KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  getConversation,
  getConversationMessages,
  markConversationRead,
  sendTextMessage,
  type ConversationResource,
  type MessageResource,
} from "@/src/lib/api/interactions";
import { resolveMediaUrl } from "@/src/lib/api/media";
import { queryClient } from "@/src/lib/query-client";
import { getRealtimeClient, logRealtime } from "@/src/lib/realtime/client";
import { useSessionStore } from "@/src/store/session";

type MessageCreatedPayload = {
  message?: MessageResource;
};

function mergeMessages(current: MessageResource[], incoming: MessageResource): MessageResource[] {
  if (current.some((message) => message.id === incoming.id)) {
    return current.map((message) => message.id === incoming.id ? { ...message, ...incoming, delivery_status: "sent" } : message);
  }

  return [...current, incoming].sort((left, right) => new Date(left.created_at).getTime() - new Date(right.created_at).getTime());
}

function formatMessageTime(value: string): string {
  return new Date(value).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function ChatHeader({ conversation, onBack }: { conversation?: ConversationResource | null; onBack: () => void }) {
  const avatar = resolveMediaUrl(conversation?.other_user?.photo_url ?? null);
  const name = conversation?.other_user?.display_name || "Conversation";
  const subtitle = conversation?.listing_title || "Message Bizo";

  return (
    <SafeAreaView edges={["top"]} className="bg-white shadow-soft">
      <View className="h-16 flex-row items-center justify-between px-4">
        <View className="flex-row items-center gap-3">
          <Pressable className="h-9 w-9 items-center justify-center" onPress={onBack}>
            <ChevronLeft color="#151C27" size={27} strokeWidth={2.2} />
          </Pressable>
          <View className="flex-row items-center gap-2">
            <View>
              {avatar ? (
                <Image source={avatar} style={{ width: 36, height: 36, borderRadius: 18 }} contentFit="cover" />
              ) : (
                <View className="h-9 w-9 items-center justify-center rounded-full bg-[#EDEEEF]">
                  <Text className="text-[13px] font-black text-[#5F5E5E]">{name.slice(0, 1).toUpperCase()}</Text>
                </View>
              )}
            </View>
            <View>
              <Text className="text-[15px] font-bold leading-5 text-[#1A1A1A]" numberOfLines={1}>{name}</Text>
              <Text className="max-w-[190px] text-[11px] font-medium text-[#5F5E5E]" numberOfLines={1}>{subtitle}</Text>
            </View>
          </View>
        </View>
        <Pressable className="h-9 w-9 items-center justify-center">
          <MoreVertical color="#6B7280" size={23} strokeWidth={2.2} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function InfoBanner() {
  const [visible, setVisible] = useState(true);

  if (!visible) {
    return null;
  }

  return (
    <View className="flex-row items-center justify-between bg-[#EFF6FF] px-4 py-[10px]">
      <View className="flex-row items-center gap-2">
        <Info color="#5B5BD6" size={16} strokeWidth={2.2} />
        <Text className="text-[12px] font-bold text-[#5B5BD6]">Restez sur Bizo pour échanger en sécurité</Text>
      </View>
      <Pressable className="h-6 w-6 items-center justify-center" onPress={() => setVisible(false)}>
        <X color="#6B7280" size={15} strokeWidth={2.2} />
      </Pressable>
    </View>
  );
}

function StarterCard({ conversation }: { conversation?: ConversationResource | null }) {
  return (
    <View className="items-center">
      <View className="w-[280px] items-center rounded-2xl bg-[#F3F4F6] p-4 shadow-soft">
        <UserCircle color="#6B7280" size={32} strokeWidth={1.8} />
        <Text className="mt-2 text-center text-[14px] font-bold text-[#1A1A1A]">Conversation avec {conversation?.other_user?.display_name || "un utilisateur Bizo"}</Text>
        <Text className="mt-1 text-center text-[12px] text-[#6B7280]" numberOfLines={2}>{conversation?.listing_title || "Annonce Bizo"}</Text>
      </View>
    </View>
  );
}

function DateSeparator() {
  return (
    <View className="items-center">
      <View className="rounded-full bg-[#E7EEFE] px-3 py-1">
        <Text className="text-[12px] font-medium text-[#6B7280]">Aujourd&apos;hui</Text>
      </View>
    </View>
  );
}

function MessageBubble({
  message,
  sent,
}: {
  message: MessageResource;
  sent?: boolean;
}) {
  const image = resolveMediaUrl(message.image_url);
  const proposalTitle = message.proposal?.offered_listing_title;
  const content = message.type === "image"
    ? "Photo"
    : message.type === "troc_proposal"
      ? `Proposition: ${proposalTitle || "échange"}`
      : message.text || "";

  return (
    <View className={`max-w-[85%] ${sent ? "ml-auto items-end" : "items-start"}`}>
      <View className={`${sent ? "rounded-tr-none bg-[#1A1A1A]" : "rounded-tl-none bg-white"} rounded-2xl p-[14px] shadow-soft`}>
        {image ? <Image source={image} style={{ width: 180, height: 140, borderRadius: 12, marginBottom: 8 }} contentFit="cover" /> : null}
        <Text className={`text-[14px] leading-[21px] ${sent ? "text-white" : "text-[#1A1A1A]"}`}>{content}</Text>
        <View className={`mt-1 flex-row items-center justify-end ${sent ? "gap-1" : ""}`}>
          <Text className={`text-[11px] ${sent ? "text-gray-400" : "text-[#6B7280]"}`}>{formatMessageTime(message.created_at)}</Text>
          {sent ? (
            message.delivery_status === "failed" ? (
              <Text className="text-[11px] font-bold text-[#FFDAD6]">Echec</Text>
            ) : message.delivery_status === "sending" ? (
              <Text className="text-[11px] font-bold text-gray-400">Envoi...</Text>
            ) : (
              <CheckCheck color="#F5C518" size={14} strokeWidth={2} />
            )
          ) : null}
        </View>
      </View>
    </View>
  );
}

function SecurityBanner() {
  return (
    <View className="items-center">
      <View className="max-w-[90%] flex-row items-center gap-2 rounded-full border border-[#BA1A1A]/10 bg-[#FFDAD6]/30 px-4 py-2">
        <Shield color="#BA1A1A" size={16} strokeWidth={2.2} />
        <Text className="text-[11px] font-medium text-[#1A1A1A]">Pour votre sécurité, restez sur la messagerie Bizo.</Text>
      </View>
    </View>
  );
}

function ChatMessages({
  conversation,
  isLoading,
  messages,
  onRetry,
  userId,
}: {
  conversation?: ConversationResource | null;
  isLoading?: boolean;
  messages: MessageResource[];
  onRetry?: () => void;
  userId?: string | null;
}) {
  const scrollRef = useRef<ElementRef<typeof KeyboardChatScrollView>>(null);

  return (
    <KeyboardChatScrollView
      ref={scrollRef}
      className="flex-1"
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      keyboardLiftBehavior="whenAtEnd"
      contentContainerStyle={{ gap: 24, paddingBottom: 24, paddingHorizontal: 16, paddingTop: 24 }}
      onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
    >
      <StarterCard conversation={conversation} />
      <DateSeparator />
      {isLoading ? (
        <View className="items-center py-8">
          <ActivityIndicator color="#F5C518" size="large" />
          <Text className="mt-3 text-[13px] font-semibold text-[#6B7280]">Chargement des messages...</Text>
        </View>
      ) : messages.length ? (
        messages.map((message, index) => (
          <View key={message.id} className="gap-6">
            {index === 2 ? <SecurityBanner /> : null}
            <MessageBubble message={message} sent={message.sender_id === userId} />
          </View>
        ))
      ) : (
        <View className="items-center py-8">
          <Text className="text-center text-[14px] font-semibold text-[#6B7280]">Aucun message pour le moment.</Text>
          {onRetry ? (
            <Pressable className="mt-3 rounded-full bg-[#1A1A1A] px-5 py-2" onPress={onRetry}>
              <Text className="text-[13px] font-bold text-white">Rafraichir</Text>
            </Pressable>
          ) : null}
        </View>
      )}
    </KeyboardChatScrollView>
  );
}

function ChatInputBar({
  disabled,
  error,
  onSend,
}: {
  disabled?: boolean;
  error?: string | null;
  onSend: (message: string) => void;
}) {
  const [message, setMessage] = useState("");
  const trimmedMessage = message.trim();
  const send = () => {
    if (!trimmedMessage || disabled) {
      return;
    }

    onSend(trimmedMessage);
    setMessage("");
  };

  return (
    <SafeAreaView edges={["bottom"]} className="border-t border-gray-100 bg-white">
      {error ? (
        <Text className="px-4 pt-2 text-[12px] font-semibold text-[#BA1A1A]">{error}</Text>
      ) : null}
      <View className="flex-row items-center gap-3 px-4 py-3">
        <View className="flex-row items-center gap-2">
          <Pressable className="h-8 w-8 items-center justify-center">
            <ImageIcon color="#6B7280" size={22} strokeWidth={2} />
          </Pressable>
          <Pressable className="h-8 w-8 items-center justify-center">
            <Mic color="#6B7280" size={22} strokeWidth={2} />
          </Pressable>
        </View>
        <View className="min-h-[42px] flex-1 justify-center rounded-full bg-[#F3F4F6] px-4">
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Votre message..."
            placeholderTextColor="#6B7280"
            className="text-[14px] text-[#1A1A1A]"
            editable={!disabled}
            returnKeyType="send"
            onSubmitEditing={send}
          />
        </View>
        <Pressable className={`h-10 w-10 items-center justify-center rounded-full shadow-soft ${trimmedMessage && !disabled ? "bg-[#1A1A1A]" : "bg-[#C8C6C5]"}`} disabled={!trimmedMessage || disabled} onPress={send}>
          <Send color="#FFFFFF" size={20} strokeWidth={2.2} style={{ marginLeft: 2 }} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

export function DirectContactChatScreen({ conversationId, onBack }: { conversationId: string; onBack: () => void }) {
  const user = useSessionStore((state) => state.user);
  const token = useSessionStore((state) => state.token);
  const markedReadKeyRef = useRef<string | null>(null);
  const conversationQuery = useQuery({
    enabled: Boolean(conversationId),
    queryFn: () => getConversation(conversationId),
    queryKey: ["conversation", conversationId],
    staleTime: 15_000,
  });
  const messagesQuery = useQuery({
    enabled: Boolean(conversationId),
    queryFn: () => getConversationMessages(conversationId),
    queryKey: ["conversation-messages", conversationId],
    staleTime: 5_000,
  });
  const markReadMutation = useMutation({
    mutationFn: () => markConversationRead(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
  const sendMutation = useMutation({
    mutationFn: (text: string) => sendTextMessage(conversationId, text),
    onMutate: async (text) => {
      await queryClient.cancelQueries({ queryKey: ["conversation-messages", conversationId] });

      const optimisticMessage: MessageResource = {
        conv_id: conversationId,
        created_at: new Date().toISOString(),
        delivery_status: "sending",
        id: `local-${Date.now()}`,
        image_url: null,
        is_read: true,
        proposal: null,
        sender_id: user?.id ?? "",
        text,
        type: "text",
      };

      queryClient.setQueryData<MessageResource[]>(["conversation-messages", conversationId], (current = []) => [
        ...current,
        optimisticMessage,
      ]);

      return { optimisticMessage };
    },
    onError: (_error, _text, context) => {
      if (!context?.optimisticMessage) {
        return;
      }

      queryClient.setQueryData<MessageResource[]>(["conversation-messages", conversationId], (current = []) =>
        current.map((message) => message.id === context.optimisticMessage.id ? { ...message, delivery_status: "failed" } : message),
      );
    },
    onSuccess: async (message, _text, context) => {
      queryClient.setQueryData<MessageResource[]>(["conversation-messages", conversationId], (current = []) => {
        const withoutOptimistic = context?.optimisticMessage
          ? current.filter((item) => item.id !== context.optimisticMessage.id)
          : current;

        return mergeMessages(withoutOptimistic, { ...message, delivery_status: "sent" });
      });

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["conversation", conversationId] }),
        queryClient.invalidateQueries({ queryKey: ["conversations"] }),
      ]);
    },
  });

  useEffect(() => {
    if (!conversationId || !messagesQuery.data?.length || markReadMutation.isPending) {
      return;
    }

    const lastMessage = messagesQuery.data[messagesQuery.data.length - 1];
    const readKey = `${conversationId}:${lastMessage.id}:${messagesQuery.data.length}`;

    if (markedReadKeyRef.current === readKey) {
      return;
    }

    markedReadKeyRef.current = readKey;
    markReadMutation.mutate();
  }, [conversationId, markReadMutation, messagesQuery.data]);

  useEffect(() => {
    if (!conversationId || !token) {
      return;
    }

    const realtime = getRealtimeClient(token);
    if (!realtime) {
      logRealtime("conversation subscription skipped", { conversationId });
      return;
    }

    const channelName = `conversation.${conversationId}`;
    const channel = realtime.subscribePrivate(channelName);
    logRealtime("subscribing conversation", { channelName });

    const handleMessageCreated = (payload: MessageCreatedPayload) => {
      if (!payload.message) {
        return;
      }

      queryClient.setQueryData<MessageResource[]>(["conversation-messages", conversationId], (current = []) =>
        mergeMessages(current, { ...payload.message!, delivery_status: "sent" }),
      );

      queryClient.invalidateQueries({ queryKey: ["conversation", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    };

    channel.bind("conversation.message.created", handleMessageCreated);
    channel.bind(".conversation.message.created", handleMessageCreated);
    channel.bind("pusher:subscription_succeeded", () => logRealtime("conversation subscribed", { channelName }));
    channel.bind("pusher:subscription_error", (error: unknown) => logRealtime("conversation subscription error", { channelName, error }));

    return () => {
      logRealtime("leaving conversation", { channelName });
      channel.unbind("conversation.message.created", handleMessageCreated);
      channel.unbind(".conversation.message.created", handleMessageCreated);
      realtime.unsubscribePrivate(channelName);
    };
  }, [conversationId, token]);

  return (
    <KeyboardProvider>
      <KeyboardAvoidingView behavior="padding" style={{ backgroundColor: "#F9FAFB", flex: 1 }}>
        <ChatHeader conversation={conversationQuery.data} onBack={onBack} />
        <InfoBanner />
        {conversationQuery.error || messagesQuery.error ? (
          <View className="flex-1 items-center justify-center px-6">
            <Text className="text-center text-[18px] font-black text-[#151C27]">Conversation indisponible</Text>
            <Text className="mt-2 text-center text-[13px] leading-5 text-[#6B7280]">Impossible de charger cette discussion pour le moment.</Text>
            <Pressable
              className="mt-4 rounded-full bg-[#1A1A1A] px-5 py-3"
              onPress={() => {
                conversationQuery.refetch();
                messagesQuery.refetch();
              }}
            >
              <Text className="text-[13px] font-bold text-white">Reessayer</Text>
            </Pressable>
          </View>
        ) : (
          <ChatMessages
            conversation={conversationQuery.data}
            isLoading={conversationQuery.isLoading || messagesQuery.isLoading}
            messages={messagesQuery.data ?? []}
            onRetry={() => messagesQuery.refetch()}
            userId={user?.id}
          />
        )}
        <ChatInputBar
          disabled={Boolean(conversationQuery.error || messagesQuery.error)}
          error={sendMutation.error ? "Message non envoye. Verifiez votre connexion et reessayez." : null}
          onSend={(text) => sendMutation.mutate(text)}
        />
      </KeyboardAvoidingView>
    </KeyboardProvider>
  );
}
