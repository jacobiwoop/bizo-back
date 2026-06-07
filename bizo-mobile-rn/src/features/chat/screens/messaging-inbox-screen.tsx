import { Image } from "expo-image";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, MessageCircle, Search } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getConversations, type ConversationResource } from "@/src/lib/api/interactions";
import { resolveMediaUrl } from "@/src/lib/api/media";
import { queryClient } from "@/src/lib/query-client";
import { getRealtimeClient, logRealtime } from "@/src/lib/realtime/client";
import { useSessionStore } from "@/src/store/session";

function formatConversationTime(value: string | null): string {
  if (!value) return "";

  const date = new Date(value);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();

  if (sameDay) {
    return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  }

  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffDays === 1) return "Hier";
  if (diffDays < 7) return date.toLocaleDateString("fr-FR", { weekday: "short" });
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}

function conversationPreview(conversation: ConversationResource): string {
  if (conversation.last_message) return conversation.last_message;
  return "Conversation ouverte";
}

function InboxHeader({ onBack }: { onBack: () => void }) {
  return (
    <SafeAreaView edges={["top"]} style={styles.headerSafeArea}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" style={styles.backButton} onPress={onBack}>
          <ChevronLeft color="#1A1A1A" size={28} strokeWidth={2.5} />
        </Pressable>
        <Text style={styles.headerTitle}>Messages</Text>
        <View style={styles.headerSpacer} />
      </View>
    </SafeAreaView>
  );
}

function SearchBar({ onChangeText, value }: { onChangeText: (value: string) => void; value: string }) {
  return (
    <View style={styles.searchBox}>
      <View style={styles.searchRow}>
        <Search color="#5F5E5E" size={21} strokeWidth={2} />
        <TextInput
          style={styles.searchInput}
          onChangeText={onChangeText}
          placeholder="Rechercher une conversation..."
          placeholderTextColor="#5F5E5E"
          value={value}
        />
      </View>
    </View>
  );
}

type InboxMode = "all" | "buying" | "selling";

type ConversationSummaryPayload = {
  conversation?: ConversationResource;
};

function resolveConversationRole(conversation: ConversationResource, userId?: string | null): "buyer" | "seller" | null {
  if (conversation.current_user_role) {
    return conversation.current_user_role;
  }

  if (!userId || !conversation.listing_owner_id) {
    return null;
  }

  return conversation.listing_owner_id === userId ? "seller" : "buyer";
}

function matchesInboxMode(conversation: ConversationResource, mode: InboxMode, userId?: string | null): boolean {
  if (mode === "all") {
    return true;
  }

  const role = resolveConversationRole(conversation, userId);

  if (!role) {
    return true;
  }

  return mode === "selling" ? role === "seller" : role === "buyer";
}

function InboxModeSwitch({
  counts,
  mode,
  onChange,
}: {
  counts: Record<InboxMode, number>;
  mode: InboxMode;
  onChange: (mode: InboxMode) => void;
}) {
  const items: Array<{ label: string; value: InboxMode }> = [
    { label: "Tous", value: "all" },
    { label: "J'achete", value: "buying" },
    { label: "Je vends", value: "selling" },
  ];

  return (
    <View style={styles.modeSwitch}>
      {items.map((item) => {
        const active = mode === item.value;
        const unreadCount = counts[item.value];

        return (
          <Pressable
            key={item.value}
            onPress={() => onChange(item.value)}
            style={[styles.modeButton, active ? styles.modeButtonActive : styles.modeButtonInactive]}
          >
            <Text style={[styles.modeButtonText, active ? styles.modeButtonTextActive : styles.modeButtonTextInactive]}>
              {item.label}
            </Text>
            {unreadCount > 0 ? (
              <View style={styles.modeBadge}>
                <Text style={styles.modeBadgeText}>{unreadCount > 99 ? "99+" : unreadCount}</Text>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

function ConversationRow({
  item,
  onPress,
}: {
  item: ConversationResource;
  onPress: () => void;
}) {
  const unread = item.unread_count > 0;
  const avatar = resolveMediaUrl(item.other_user?.photo_url ?? item.listing_photo ?? null);
  const listing = item.listing_title || "Annonce";
  const time = formatConversationTime(item.last_message_at ?? item.created_at);

  return (
    <Pressable
      style={[styles.conversationRow, unread ? styles.conversationRowUnread : styles.conversationRowRead]}
      onPress={onPress}
    >
      <View style={styles.avatarWrap}>
        {avatar ? (
          <Image source={avatar} style={{ width: 52, height: 52, borderRadius: 26 }} contentFit="cover" />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarInitial}>{(item.other_user?.display_name || "B").slice(0, 1).toUpperCase()}</Text>
          </View>
        )}
      </View>
      <View style={styles.conversationContent}>
        <View style={styles.conversationTopRow}>
          <Text style={[styles.conversationName, unread ? styles.conversationNameUnread : styles.conversationNameRead]} numberOfLines={1}>
            {item.other_user?.display_name || "Utilisateur Bizo"}
          </Text>
          <Text style={styles.conversationTime}>{time}</Text>
        </View>
        <View style={styles.conversationMetaRow}>
          <Text style={styles.conversationPreview} numberOfLines={1}>
            {conversationPreview(item)}
          </Text>
          <View style={styles.listingBadge}>
            <Text style={styles.listingBadgeText} numberOfLines={1}>
              {listing}
            </Text>
          </View>
        </View>
      </View>
      {unread ? (
        <View style={styles.unreadPill}>
          <Text style={styles.unreadPillText}>{item.unread_count}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

function InboxState({ message, title }: { message: string; title: string }) {
  return (
    <View style={styles.stateBox}>
      <MessageCircle color="#C8C6C5" size={32} strokeWidth={1.8} />
      <Text style={styles.stateTitle}>{title}</Text>
      <Text style={styles.stateMessage}>{message}</Text>
    </View>
  );
}

export function MessagingInboxScreen({
  onBack,
  onOpenConversation,
}: {
  onBack: () => void;
  onOpenConversation: (conversationId: string) => void;
}) {
  const token = useSessionStore((state) => state.token);
  const userId = useSessionStore((state) => state.user?.id ?? null);
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<InboxMode>("all");
  const conversationsQuery = useQuery({
    enabled: Boolean(token),
    queryFn: getConversations,
    queryKey: ["conversations"],
    staleTime: 15_000,
  });

  useEffect(() => {
    if (!token || !userId) {
      return;
    }

    const realtime = getRealtimeClient(token);
    if (!realtime) {
      logRealtime("inbox subscription skipped");
      return;
    }

    const channelName = `users.${userId}.conversations`;
    const channel = realtime.subscribePrivate(channelName);
    logRealtime("subscribing inbox", { channelName });

    const handleSummaryUpdate = (payload: ConversationSummaryPayload) => {
      const updatedConversation = payload.conversation;

      if (!updatedConversation) {
        return;
      }

      queryClient.setQueryData<ConversationResource[]>(["conversations"], (current = []) => {
        const next = current.filter((conversation) => conversation.id !== updatedConversation.id);
        next.unshift(updatedConversation);

        return next.sort((left, right) => {
          const leftTime = new Date(left.last_message_at ?? left.created_at).getTime();
          const rightTime = new Date(right.last_message_at ?? right.created_at).getTime();
          return rightTime - leftTime;
        });
      });
    };

    channel.bind("conversation.summary.updated", handleSummaryUpdate);
    channel.bind(".conversation.summary.updated", handleSummaryUpdate);
    channel.bind("pusher:subscription_succeeded", () => logRealtime("inbox subscribed", { channelName }));
    channel.bind("pusher:subscription_error", (error: unknown) => logRealtime("inbox subscription error", { channelName, error }));

    return () => {
      logRealtime("leaving inbox", { channelName });
      channel.unbind("conversation.summary.updated", handleSummaryUpdate);
      channel.unbind(".conversation.summary.updated", handleSummaryUpdate);
      realtime.unsubscribePrivate(channelName);
    };
  }, [token, userId]);

  const conversations = conversationsQuery.data ?? [];
  const normalizedQuery = query.trim().toLowerCase();
  const unreadCounts = conversations.reduce<Record<InboxMode, number>>((totals, conversation) => {
    const unreadCount = conversation.unread_count;
    const role = resolveConversationRole(conversation, userId);

    totals.all += unreadCount;

    if (role === "buyer") {
      totals.buying += unreadCount;
    }

    if (role === "seller") {
      totals.selling += unreadCount;
    }

    return totals;
  }, { all: 0, buying: 0, selling: 0 });
  const modeConversations = conversations.filter((conversation) => matchesInboxMode(conversation, mode, userId));
  const visibleConversations = normalizedQuery
    ? modeConversations.filter((conversation) => {
        const haystack = [
          conversation.other_user?.display_name,
          conversation.listing_title,
          conversation.last_message,
        ].filter(Boolean).join(" ").toLowerCase();

        return haystack.includes(normalizedQuery);
      })
    : modeConversations;
  const emptyMessage = query
    ? "Aucune conversation ne correspond a cette recherche."
    : mode === "all"
      ? "Vos conversations apparaitront ici."
      : mode === "selling"
      ? "Les acheteurs qui vous contactent apparaitront ici."
      : "Contactez un vendeur depuis une annonce pour demarrer une discussion.";

  return (
    <View style={styles.screen}>
      <InboxHeader onBack={onBack} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <SearchBar onChangeText={setQuery} value={query} />
        <InboxModeSwitch counts={unreadCounts} mode={mode} onChange={setMode} />
        {!token ? (
          <InboxState title="Connexion requise" message="Connectez-vous pour voir vos conversations." />
        ) : conversationsQuery.isLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color="#F5C518" size="large" />
            <Text style={styles.loadingText}>Chargement des messages...</Text>
          </View>
        ) : conversationsQuery.error ? (
          <InboxState title="Messages indisponibles" message="Impossible de charger vos conversations pour le moment." />
        ) : visibleConversations.length ? (
          <View style={styles.conversationsList}>
            {visibleConversations.map((item) => (
              <ConversationRow key={item.id} item={item} onPress={() => onOpenConversation(item.id)} />
            ))}
          </View>
        ) : (
          <InboxState title="Aucune conversation" message={emptyMessage} />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  avatarFallback: {
    alignItems: "center",
    backgroundColor: "#EBE1D1",
    borderRadius: 26,
    height: 52,
    justifyContent: "center",
    width: 52,
  },
  avatarInitial: {
    color: "#4E4633",
    fontSize: 16,
    fontWeight: "800",
  },
  avatarWrap: {
    flexShrink: 0,
  },
  backButton: {
    alignItems: "center",
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  conversationContent: {
    flex: 1,
    marginLeft: 16,
    minWidth: 0,
  },
  conversationMetaRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    minWidth: 0,
  },
  conversationName: {
    color: "#1A1A1A",
    flex: 1,
    fontSize: 16,
  },
  conversationNameRead: {
    fontWeight: "700",
  },
  conversationNameUnread: {
    fontWeight: "800",
  },
  conversationPreview: {
    color: "#9CA3AF",
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    minWidth: 0,
  },
  conversationRow: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderBottomColor: "rgba(209, 197, 172, 0.5)",
    borderBottomWidth: 1,
    flexDirection: "row",
    minHeight: 76,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  conversationRowRead: {
    backgroundColor: "#FFFFFF",
  },
  conversationRowUnread: {
    backgroundColor: "#FFFFFF",
  },
  conversationTime: {
    color: "#4E4633",
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 8,
  },
  conversationTopRow: {
    alignItems: "baseline",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  conversationsList: {
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    height: 64,
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  headerSafeArea: {
    backgroundColor: "#FFFFFF",
    borderBottomColor: "rgba(209, 197, 172, 0.35)",
    borderBottomWidth: 1,
  },
  headerSpacer: {
    width: 40,
  },
  headerTitle: {
    color: "#1A1A1A",
    fontSize: 28,
    fontWeight: "800",
  },
  listingBadge: {
    backgroundColor: "#F1E7D6",
    borderRadius: 8,
    maxWidth: 136,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  listingBadgeText: {
    color: "#4E4633",
    fontSize: 10,
    fontWeight: "800",
  },
  modeButton: {
    alignItems: "center",
    borderRadius: 999,
    flex: 1,
    flexDirection: "row",
    gap: 6,
    height: 38,
    justifyContent: "center",
  },
  modeButtonActive: {
    backgroundColor: "#FFFFFF",
    elevation: 1,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
  },
  modeButtonInactive: {
    backgroundColor: "transparent",
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },
  modeButtonTextActive: {
    color: "#1A1A1A",
  },
  modeButtonTextInactive: {
    color: "#4E4633",
  },
  modeBadge: {
    alignItems: "center",
    backgroundColor: "#F5C518",
    borderRadius: 999,
    justifyContent: "center",
    minWidth: 18,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  modeBadgeText: {
    color: "#241A00",
    fontSize: 9,
    fontWeight: "900",
  },
  modeSwitch: {
    backgroundColor: "#F3F4F6",
    borderRadius: 999,
    flexDirection: "row",
    gap: 4,
    marginBottom: 16,
    padding: 4,
  },
  loadingBox: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    justifyContent: "center",
    paddingVertical: 48,
  },
  loadingText: {
    color: "#4E4633",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 12,
  },
  scrollContent: {
    paddingBottom: 96,
    paddingTop: 16,
  },
  screen: {
    backgroundColor: "#FFFFFF",
    flex: 1,
  },
  searchBox: {
    backgroundColor: "#F3F4F6",
    borderColor: "rgba(209, 197, 172, 0.6)",
    borderRadius: 999,
    borderWidth: 1,
    marginBottom: 14,
    marginHorizontal: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    color: "#1A1A1A",
    flex: 1,
    fontSize: 15,
    marginLeft: 12,
  },
  searchRow: {
    alignItems: "center",
    flexDirection: "row",
  },
  stateBox: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "rgba(209, 197, 172, 0.45)",
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    marginHorizontal: 16,
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  stateMessage: {
    color: "#4E4633",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
    textAlign: "center",
  },
  stateTitle: {
    color: "#1A1A1A",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 16,
    textAlign: "center",
  },
  unreadPill: {
    alignItems: "center",
    backgroundColor: "#F5C518",
    borderRadius: 11,
    height: 22,
    justifyContent: "center",
    marginLeft: 16,
    minWidth: 22,
    paddingHorizontal: 6,
  },
  unreadPillText: {
    color: "#1A1A1A",
    fontSize: 10,
    fontWeight: "700",
  },
});
