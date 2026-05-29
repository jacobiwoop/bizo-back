import { router } from "expo-router";
import { ScrollView, View } from "react-native";

import { BottomSheetModal } from "@/src/features/auth/components/auth-ui";
import {
  SearchFilterChips,
  SearchFilterSheet,
  SearchResultsContent,
  SearchResultsHeader,
  SearchResultsMeta,
} from "@/src/features/discovery/components/search-results-ui";
import { useDiscoveryStore } from "@/src/store/discovery";

export function DiscoverySearchScreen({ mode }: { mode: "grid" | "list" }) {
  const query = useDiscoveryStore((state) => state.searchQuery);
  const showFilter = useDiscoveryStore((state) => state.filterSheetOpen);
  const openFilterSheet = useDiscoveryStore((state) => state.openFilterSheet);
  const closeFilterSheet = useDiscoveryStore((state) => state.closeFilterSheet);
  const searchLabel = query || "iPhone 13";

  return (
    <View className="flex-1 bg-[#F8F9FA]">
      <SearchResultsHeader query={searchLabel} onBack={() => router.back()} onCancel={() => router.back()} />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 112 }}>
        <SearchResultsMeta
          mode={mode}
          onChangeMode={(nextMode) => {
            if (nextMode === mode) {
              return;
            }

            router.replace(nextMode === "grid" ? "/search-grid" : "/search");
          }}
        />
        <SearchFilterChips onOpenFilter={openFilterSheet} />
        <SearchResultsContent mode={mode} onListingPress={(id) => router.push(`/listing/${id}`)} />
      </ScrollView>

      {showFilter ? (
        <BottomSheetModal backdrop={<View className="flex-1" />} onClose={closeFilterSheet} overlayOpacity={0.4}>
          <SearchFilterSheet onApply={closeFilterSheet} onClose={closeFilterSheet} />
        </BottomSheetModal>
      ) : null}
    </View>
  );
}
