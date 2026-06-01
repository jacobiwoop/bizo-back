import { useRouter } from "expo-router";

import { useHomeListings } from "@/src/features/discovery/api/use-home-listings";
import { MarketplaceHome } from "@/src/features/discovery/components/marketplace-home-ui";
import type { ListingCategoryId } from "@/src/lib/categories/listing-categories";
import { useDiscoveryStore } from "@/src/store/discovery";

export function DiscoveryHomeScreen() {
  const router = useRouter();
  const setSearchContext = useDiscoveryStore((state) => state.setSearchContext);
  const { dealListings, errorMessage, isLoading, recentListings, tradeListings } = useHomeListings();
  const openCategorySearch = (categoryId: ListingCategoryId) => {
    setSearchContext({ category: categoryId, query: "" });
    router.push("/search");
  };

  return (
    <MarketplaceHome
      dealListingsData={dealListings}
      errorMessage={errorMessage}
      isLoading={isLoading}
      onBellPress={() => router.push("/notification")}
      onCategoriesPress={() => router.push("/category")}
      onCategoryPress={openCategorySearch}
      onFilterPress={() => router.push("/search-filter")}
      onListingPress={(id) => router.push(`/listing/${id}`)}
      onLocationPress={() => router.push("/location")}
      recentListingsData={recentListings}
      tradeListingsData={tradeListings}
    />
  );
}
