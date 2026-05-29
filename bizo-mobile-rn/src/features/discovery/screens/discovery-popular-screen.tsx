import { useState } from "react";
import { ScrollView, View } from "react-native";
import { useRouter } from "expo-router";

import {
  DiscoveryGridCard,
  DiscoverySearchResultCard,
  DiscoveryScreenFrame,
  DiscoveryPopularControls,
  DiscoveryTitleHeader,
} from "@/src/features/discovery/components/discovery-ui";
import { discoveryListings } from "@/src/features/discovery/mocks/discovery-mocks";

export function DiscoveryPopularScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<"grid" | "list">("grid");

  return (
    <DiscoveryScreenFrame background="#F3F3F3">
      <DiscoveryTitleHeader title="Popular Items" onBack={() => router.back()} />
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 120 }}>
        <DiscoveryPopularControls mode={mode} onChangeMode={setMode} />

        {mode === "grid" ? (
          <View className="mt-8 flex-row flex-wrap justify-between gap-y-5 px-4">
            {discoveryListings.slice(0, 4).map((listing) => (
              <DiscoveryGridCard key={listing.id} listing={listing} onPress={() => router.push(`/listing/${listing.id}`)} />
            ))}
          </View>
        ) : (
          <View className="mt-8 gap-4">
            {discoveryListings.slice(4).map((listing) => (
              <DiscoverySearchResultCard key={listing.id} listing={listing} onPress={() => router.push(`/listing/${listing.id}`)} />
            ))}
          </View>
        )}
      </ScrollView>
    </DiscoveryScreenFrame>
  );
}
