import { Image } from "expo-image";
import { useQuery } from "@tanstack/react-query";
import { Clock3, ImageIcon, MessageCircle, Search } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getConversations, type ConversationResource } from "@/src/lib/api/interactions";
import { resolveMediaUrl } from "@/src/lib/api/media";
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

function InboxHeader() {
  return (
    <SafeAreaView edges={["top"]} style={styles.headerSafeArea}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitle}>Messages</Text>
        </View>
        <View style={styles.headerIcon}>
          <MessageCircle color="#745B00" size={22} strokeWidth={2.2} />
        </View>
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

function ConversationRow({
  item,
  onPress,
}: {
  item: ConversationResource;
  onPress: () => void;
}) {
  const unread = item.unread_count > 0;
  const avatar = resolveMediaUrl(item.other_user?.photo_url ?? null);
  const listing = item.listing_title || "Annonce";
  const time = formatConversationTime(item.last_message_at ?? item.created_at);

  return (
    <Pressable
      style={[styles.conversationRow, unread ? styles.conversationRowUnread : styles.conversationRowRead]}
      onPress={onPress}
    >
      <View>
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
          {item.listing_photo ? <ImageIcon color="#5F5E5E" size={16} strokeWidth={2} /> : <Clock3 color="#5F5E5E" size={15} strokeWidth={2} />}
          <Text style={styles.conversationPreview} numberOfLines={1}>
            {conversationPreview(item)}
          </Text>
          <View style={[styles.listingBadge, unread ? styles.listingBadgeUnread : styles.listingBadgeRead]}>
            <Text style={[styles.listingBadgeText, unread ? styles.listingBadgeTextUnread : styles.listingBadgeTextRead]} numberOfLines={1}>
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

export function MessagingInboxScreen({ onOpenConversation }: { onOpenConversation: (conversationId: string) => void }) {
  const token = useSessionStore((state) => state.token);
  const [query, setQuery] = useState("");
  const conversationsQuery = useQuery({
    enabled: Boolean(token),
    queryFn: getConversations,
    queryKey: ["conversations"],
    staleTime: 15_000,
  });
  const conversations = conversationsQuery.data ?? [];
  const normalizedQuery = query.trim().toLowerCase();
  const visibleConversations = normalizedQuery
    ? conversations.filter((conversation) => {
        const haystack = [
          conversation.other_user?.display_name,
          conversation.listing_title,
          conversation.last_message,
        ].filter(Boolean).join(" ").toLowerCase();

        return haystack.includes(normalizedQuery);
      })
    : conversations;

  return (
    <View style={styles.screen}>
      <InboxHeader />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 96, paddingHorizontal: 16, paddingTop: 16 }}>
        <SearchBar onChangeText={setQuery} value={query} />
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
          <View style={styles.conversationsBox}>
            {visibleConversations.map((item) => (
              <ConversationRow key={item.id} item={item} onPress={() => onOpenConversation(item.id)} />
            ))}
          </View>
        ) : (
          <InboxState title="Aucune conversation" message={query ? "Aucune conversation ne correspond à cette recherche." : "Contactez un vendeur depuis une annonce pour démarrer une discussion."} />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  avatarFallback: {
    alignItems: "center",
    backgroundColor: "#EDEEEF",
    borderRadius: 26,
    height: 52,
    justifyContent: "center",
    width: 52,
  },
  avatarInitial: {
    color: "#5F5E5E",
    fontSize: 16,
    fontWeight: "900",
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
  },
  conversationName: {
    color: "#151C27",
    flex: 1,
    fontSize: 18,
  },
  conversationNameRead: {
    fontWeight: "500",
  },
  conversationNameUnread: {
    fontWeight: "700",
  },
  conversationPreview: {
    color: "#5F5E5E",
    flex: 1,
    fontSize: 14,
    minWidth: 0,
  },
  conversationRow: {
    alignItems: "center",
    borderBottomColor: "rgba(209, 197, 172, 0.1)",
    borderBottomWidth: 1,
    flexDirection: "row",
    height: 80,
    paddingHorizontal: 16,
  },
  conversationRowRead: {
    backgroundColor: "#FFFFFF",
  },
  conversationRowUnread: {
    backgroundColor: "#FAFAFA",
    borderLeftColor: "#5B5BD6",
    borderLeftWidth: 3,
  },
  conversationTime: {
    color: "#5F5E5E",
    fontSize: 12,
    marginLeft: 8,
  },
  conversationTopRow: {
    alignItems: "baseline",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  conversationsBox: {
    backgroundColor: "#FFFFFF",
    borderColor: "rgba(209, 197, 172, 0.1)",
    borderRadius: 12,
    borderWidth: 1,
    elevation: 2,
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    height: 64,
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  headerIcon: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  headerSafeArea: {
    backgroundColor: "#F9F9FF",
    elevation: 2,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
  },
  headerTitle: {
    color: "#151C27",
    fontSize: 24,
    fontWeight: "700",
  },
  headerTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 16,
  },
  listingBadge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  listingBadgeRead: {
    backgroundColor: "#DCE2F3",
  },
  listingBadgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  listingBadgeTextRead: {
    color: "#5F5E5E",
  },
  listingBadgeTextUnread: {
    color: "#241A00",
  },
  listingBadgeUnread: {
    backgroundColor: "#F5C518",
  },
  loadingBox: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    justifyContent: "center",
    paddingVertical: 48,
  },
  loadingText: {
    color: "#5F5E5E",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 12,
  },
  screen: {
    backgroundColor: "#F9F9FF",
    flex: 1,
  },
  searchBox: {
    backgroundColor: "#F3F4F6",
    borderColor: "rgba(209, 197, 172, 0.2)",
    borderRadius: 999,
    borderWidth: 1,
    elevation: 2,
    marginBottom: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
  },
  searchInput: {
    color: "#151C27",
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  searchRow: {
    alignItems: "center",
    flexDirection: "row",
  },
  stateBox: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "rgba(209, 197, 172, 0.1)",
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  stateMessage: {
    color: "#5F5E5E",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
    textAlign: "center",
  },
  stateTitle: {
    color: "#151C27",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 16,
    textAlign: "center",
  },
  unreadPill: {
    alignItems: "center",
    backgroundColor: "#F5C518",
    borderRadius: 10,
    height: 20,
    justifyContent: "center",
    marginLeft: 16,
    width: 20,
  },
  unreadPillText: {
    color: "#1A1A1A",
    fontSize: 10,
    fontWeight: "700",
  },
});
