import { useRouter } from "expo-router";
import { ChevronDown, ChevronUp } from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import {
  DiscoveryNotificationCard,
  DiscoveryNotificationSegments,
  DiscoveryScreenFrame,
  DiscoveryTitleHeader,
} from "@/src/features/discovery/components/discovery-ui";
import {
  discoveryNotifications,
  discoveryNotificationSegments,
} from "@/src/features/discovery/mocks/discovery-mocks";

function NotificationAnatomyPreview() {
  const [expanded, setExpanded] = useState(false);
  const fullMessage =
    "Bonjour, je suis interesse par ton article. Est-ce que le prix est encore negociable si je passe le recuperer aujourd'hui ?";

  return (
    <View className="mx-4 mb-4 rounded-[20px] bg-white px-4 py-4 shadow-soft">
      <View className="mb-4">
        <Text className="text-[18px] font-semibold text-[#111111]">Apercu message compact</Text>
        <Text className="mt-1 text-[12px] leading-4 text-[#686868]">
          Format cible: logo app garde l'identite Bizo, avatar carre arrondi pour l'expediteur.
        </Text>
      </View>

      <View className="rounded-[16px] bg-[#1A1A1A] px-[14px] py-3">
        <View className="min-h-[72px] flex-row items-center">
          <View className="h-[52px] w-[52px] items-center justify-center rounded-[10px] bg-[#E8ECFF]">
            <Text className="text-[17px] font-bold text-[#2F66F3]">JW</Text>
          </View>

          <View className="ml-3 flex-1 justify-center">
            <View className="flex-row items-center justify-between">
              <Text className="max-w-[65%] text-[15px] font-bold text-white" numberOfLines={1}>
                jacobi
              </Text>
              <Text className="text-[13px] text-[#9CA3AF]">• 2 min</Text>
            </View>

            <Text className="mt-1 text-[14px] text-[#9CA3AF]" numberOfLines={expanded ? 5 : 1}>
              {fullMessage}
            </Text>
          </View>

          <Pressable
            accessibilityLabel={expanded ? "Reduire l'apercu" : "Agrandir l'apercu"}
            className="ml-[10px] h-9 w-9 items-center justify-center rounded-full bg-[#2D2D2D]"
            onPress={() => setExpanded((value) => !value)}
          >
            {expanded ? (
              <ChevronUp color="#FFFFFF" size={18} strokeWidth={2.2} />
            ) : (
              <ChevronDown color="#FFFFFF" size={18} strokeWidth={2.2} />
            )}
          </Pressable>
        </View>

      </View>
    </View>
  );
}

function GroupedNotificationPreview() {
  const [expanded, setExpanded] = useState(false);
  const rows = [
    ["AK", "Akatsuki <⁄> Dev", "Muka'z : Photo", "2 min", "#2A2F3A"],
    ["RS", "Ressi", "Merci", "1 h", "#E8ECFF"],
    ["22", "+229 95 05 98 25", "Bonjour mon grand comment vas-tu ?", "4 h", "#F1E8DF"],
    ["LU", "Lucifer", "Sticker", "2 h", "#ECECEC"],
  ];

  return (
    <View className="mx-4 mb-4 rounded-[20px] bg-white px-4 py-4 shadow-soft">
      <View className="mb-4">
        <Text className="text-[18px] font-semibold text-[#111111]">Apercu groupe compact</Text>
        <Text className="mt-1 text-[12px] leading-4 text-[#686868]">
          Plusieurs messages de plusieurs discussions, separes de la notification individuelle.
        </Text>
      </View>

      <View className="rounded-[16px] bg-[#1A1A1A] px-[14px] py-3">
        <View className="mb-[10px] flex-row items-center justify-between">
          <View className="flex-1 flex-row items-center">
            <View className="h-7 w-7 items-center justify-center rounded-full bg-[#23C15F]">
              <Text className="text-[12px] font-bold text-white">b</Text>
            </View>
            <Text className="ml-2 flex-1 text-[13px] text-[#9CA3AF]" numberOfLines={1}>
              <Text className="font-bold text-white">Bizo</Text> • 224 messages de 7 discussions • 2 min
            </Text>
          </View>
          <Pressable
            accessibilityLabel={expanded ? "Reduire le groupe" : "Agrandir le groupe"}
            className="ml-[10px] h-9 w-9 items-center justify-center rounded-full bg-[#2D2D2D]"
            onPress={() => setExpanded((value) => !value)}
          >
            {expanded ? (
              <ChevronUp color="#FFFFFF" size={18} strokeWidth={2.2} />
            ) : (
              <ChevronDown color="#FFFFFF" size={18} strokeWidth={2.2} />
            )}
          </Pressable>
        </View>

        {(expanded ? rows : rows.slice(1, 4)).map(([initials, name, message, time, color], index) => (
          <View
            key={`${name}-${message}`}
            className={`flex-row items-center ${index > 0 ? (expanded ? "mt-4" : "mt-[6px]") : ""}`}
          >
            <View
              className={`${expanded ? "h-[52px] w-[52px]" : "h-9 w-9"} items-center justify-center rounded-[8px]`}
              style={{ backgroundColor: color }}
            >
              <Text className={`${expanded ? "text-[13px]" : "text-[11px]"} font-bold text-[#2F66F3]`}>
                {initials}
              </Text>
            </View>

            <View className="ml-[10px] flex-1">
              <View className="flex-row items-center">
                <Text className="max-w-[68%] text-[14px] font-bold text-white" numberOfLines={1}>
                  {name}
                </Text>
                <Text className="ml-1 text-[12px] text-[#9CA3AF]">• {time}</Text>
              </View>
              <Text className="mt-1 text-[13px] text-[#F1F1F1]" numberOfLines={1}>
                {message}
              </Text>
            </View>

            {expanded ? (
              <View className="ml-[10px] h-8 w-8 items-center justify-center rounded-full bg-[#2D2D2D]">
                <ChevronDown color="#FFFFFF" size={16} strokeWidth={2.2} />
              </View>
            ) : null}
          </View>
        ))}
      </View>
    </View>
  );
}

export function DiscoveryNotificationScreen() {
  const router = useRouter();
  const [activeSegment, setActiveSegment] = useState("All");

  return (
    <DiscoveryScreenFrame background="#F3F3F3">
      <View className="flex-1 bg-[#F3F3F3]">
        <DiscoveryTitleHeader title="Notification" onBack={() => router.back()} />
        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
          <DiscoveryNotificationSegments
            items={discoveryNotificationSegments}
            activeItem={activeSegment}
            onSelect={setActiveSegment}
          />
          <View className="mt-3" />
          <NotificationAnatomyPreview />
          <GroupedNotificationPreview />
          <View className="gap-6">
            {discoveryNotifications.map((notification) => (
              <DiscoveryNotificationCard key={notification.id} notification={notification} />
            ))}
          </View>
        </ScrollView>
      </View>
    </DiscoveryScreenFrame>
  );
}
