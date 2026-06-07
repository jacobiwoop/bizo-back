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

            <Text className="mt-1 text-[14px] text-[#9CA3AF]" numberOfLines={expanded ? 2 : 1}>
              Test notif logo Bizo 17:27:47
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

        {expanded ? (
          <View className="mt-1 border-t border-[#2D2D2D] pt-3">
            {[
              ["DW", "desmarc", "Je suis disponible, tu peux passer voir l'article."],
              ["JW", "jacobi", "Ok, je confirme dans la messagerie Bizo."],
            ].map(([initials, name, message], index) => (
              <View key={`${name}-${message}`} className={`flex-row items-center ${index > 0 ? "mt-3" : ""}`}>
                <View className="h-10 w-10 items-center justify-center rounded-[8px] bg-[#E8ECFF]">
                  <Text className="text-[13px] font-bold text-[#2F66F3]">{initials}</Text>
                </View>
                <View className="ml-[10px] flex-1">
                  <Text className="text-[14px] font-bold text-white" numberOfLines={1}>
                    {name}
                  </Text>
                  <Text className="mt-1 text-[13px] text-[#9CA3AF]" numberOfLines={1}>
                    {message}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : null}
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
