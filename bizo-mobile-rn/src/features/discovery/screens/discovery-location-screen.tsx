import { router } from "expo-router";
import { ScrollView, View } from "react-native";

import {
  DiscoveryLocationHeader,
  DiscoveryLocationList,
  DiscoveryScreenFrame,
} from "@/src/features/discovery/components/discovery-ui";
import { discoveryLocations } from "@/src/features/discovery/mocks/discovery-mocks";
import { useDiscoveryStore } from "@/src/store/discovery";

export function DiscoveryLocationScreen() {
  const query = useDiscoveryStore((state) => state.searchQuery || "New");
  const category = useDiscoveryStore((state) => state.searchCategory);
  const setSearchContext = useDiscoveryStore((state) => state.setSearchContext);

  return (
    <DiscoveryScreenFrame background="#FFFFFF">
      <View className="flex-1 bg-white">
        <DiscoveryLocationHeader
          query={query}
          onBack={() => router.back()}
          onClose={() => router.back()}
        />
        <ScrollView className="flex-1 bg-white" contentContainerStyle={{ paddingBottom: 140 }}>
          <DiscoveryLocationList
            locations={discoveryLocations}
            onSelect={(location) => {
              setSearchContext({ query: location, category });
              router.replace("/search");
            }}
          />
        </ScrollView>
      </View>
    </DiscoveryScreenFrame>
  );
}
