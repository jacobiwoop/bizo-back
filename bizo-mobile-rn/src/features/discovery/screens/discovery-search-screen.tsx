import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";

import { BottomSheetModal } from "@/src/features/auth/components/auth-ui";
import { useSearchListings } from "@/src/features/discovery/api/use-search-listings";
import {
  SearchFilters,
  SearchFilterChips,
  SearchFilterSheet,
  SearchResultsContent,
  SearchResultsHeader,
  SearchResultsMeta,
} from "@/src/features/discovery/components/search-results-ui";
import { listingCategories } from "@/src/lib/categories/listing-categories";
import { useDiscoveryStore } from "@/src/store/discovery";

const initialFilters: SearchFilters = {
  category: null,
  city: "",
  condition: null,
  maxPrice: "",
  minPrice: "",
  sort: "recent",
  type: null,
};

export function DiscoverySearchScreen({ mode }: { mode: "grid" | "list" }) {
  const query = useDiscoveryStore((state) => state.searchQuery);
  const searchCategory = useDiscoveryStore((state) => state.searchCategory);
  const showFilter = useDiscoveryStore((state) => state.filterSheetOpen);
  const setSearchContext = useDiscoveryStore((state) => state.setSearchContext);
  const openFilterSheet = useDiscoveryStore((state) => state.openFilterSheet);
  const closeFilterSheet = useDiscoveryStore((state) => state.closeFilterSheet);
  const [inputQuery, setInputQuery] = useState(query || "");
  const [debouncedQuery, setDebouncedQuery] = useState(query || "");
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const searchResults = useSearchListings(debouncedQuery, filters);

  useEffect(() => {
    setInputQuery(query || "");
    setDebouncedQuery(query || "");
  }, [query]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(inputQuery);
      setSearchContext({ query: inputQuery });
    }, 350);

    return () => clearTimeout(timeout);
  }, [inputQuery, setSearchContext]);

  useEffect(() => {
    if (searchCategory) {
      const category = listingCategories.find((item) => item.id === searchCategory || item.label === searchCategory);
      setFilters((current) => ({ ...current, category: category?.id ?? null }));
    }
  }, [searchCategory]);

  return (
    <View className="flex-1 bg-[#F8F9FA]">
      <SearchResultsHeader
        query={inputQuery}
        onBack={() => router.back()}
        onCancel={() => router.back()}
        onChangeQuery={setInputQuery}
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 112 }}>
        <SearchResultsMeta
          isLoading={searchResults.isFetching}
          mode={mode}
          onChangeMode={(nextMode) => {
            if (nextMode === mode) {
              return;
            }

            router.replace(nextMode === "grid" ? "/search-grid" : "/search");
          }}
          total={searchResults.total}
        />
        <SearchFilterChips filters={filters} onOpenFilter={openFilterSheet} />
        <SearchResultsContent isLoading={searchResults.isLoading} listings={searchResults.listings} mode={mode} onListingPress={(id) => router.push(`/listing/${id}`)} />
      </ScrollView>

      {showFilter ? (
        <BottomSheetModal backdrop={<View className="flex-1" />} onClose={closeFilterSheet} overlayOpacity={0.4}>
          <SearchFilterSheet
            filters={filters}
            onApply={(nextFilters) => {
              setFilters(nextFilters);
              closeFilterSheet();
            }}
            onClose={closeFilterSheet}
            onReset={() => {
              setFilters(initialFilters);
              closeFilterSheet();
            }}
          />
        </BottomSheetModal>
      ) : null}
    </View>
  );
}
