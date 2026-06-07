import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";

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

const logoSource = require("../../../../assets/icon-svg/logo_b_unique.png");

function NotificationAnatomyPreview() {
  return (
    <View className="mx-4 mb-4 rounded-[20px] bg-white px-4 py-4 shadow-soft">
      <View className="mb-4">
        <Text className="text-[18px] font-semibold text-[#111111]">Anatomie d'une notification</Text>
        <Text className="mt-1 text-[12px] leading-4 text-[#686868]">
          Le logo Bizo reste l'identite principale. La photo de l'expediteur reste l'avatar conversationnel.
        </Text>
      </View>

      <View className="rounded-[18px] bg-[#F4F4F4] px-3 py-3">
        <View className="flex-row rounded-[16px] bg-[#1E1E1E] px-3 py-3">
          <View className="items-center">
            <View className="h-11 w-11 items-center justify-center overflow-hidden rounded-[12px] bg-white">
              <Image source={logoSource} style={{ height: 38, width: 38 }} contentFit="contain" />
            </View>
            <Text className="mt-2 text-center text-[10px] font-semibold text-white">Bizo</Text>
          </View>

          <View className="ml-3 flex-1">
            <View className="flex-row items-center">
              <View className="items-center">
                <View className="h-10 w-10 items-center justify-center rounded-full bg-[#E8ECFF]">
                  <Text className="text-[13px] font-bold text-[#2F66F3]">JW</Text>
                </View>
              </View>

              <View className="ml-3 flex-1">
                <Text className="text-[15px] font-semibold text-white" numberOfLines={1}>
                  jacobi
                </Text>
                <Text className="mt-2 text-[13px] leading-4 text-[#E4E4E4]" numberOfLines={2}>
                  Test notif logo Bizo 17:27:47
                </Text>
              </View>
            </View>
          </View>
        </View>
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
        <DiscoveryNotificationSegments
          items={discoveryNotificationSegments}
          activeItem={activeSegment}
          onSelect={setActiveSegment}
        />
        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100, paddingTop: 8 }}>
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
