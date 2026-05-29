import { useRouter } from "expo-router";
import { ScrollView, View } from "react-native";

import {
  DiscoveryCategoryHeader,
  DiscoveryCategoryMenu,
  DiscoveryScreenFrame,
} from "@/src/features/discovery/components/discovery-ui";
import { discoveryCategories } from "@/src/features/discovery/mocks/discovery-mocks";
import { useDiscoveryStore } from "@/src/store/discovery";

export function DiscoveryCategoryScreen() {
  const router = useRouter();
  const setSearchContext = useDiscoveryStore((state) => state.setSearchContext);
  return (
    <DiscoveryScreenFrame background="#FFFFFF">
      <DiscoveryCategoryHeader onBack={() => router.back()} />
      <ScrollView className="flex-1 bg-white" contentContainerStyle={{ paddingBottom: 100 }}>
        <DiscoveryCategoryMenu
          categories={discoveryCategories}
          onCategoryPress={(category) => {
            setSearchContext({ query: category.label, category: category.label });
            router.push("/search");
          }}
        />
      </ScrollView>
    </DiscoveryScreenFrame>
  );
}
