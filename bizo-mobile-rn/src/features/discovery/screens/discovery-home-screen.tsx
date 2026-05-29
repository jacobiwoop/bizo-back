import { useRouter } from "expo-router";

import { useHomeListings } from "@/src/features/discovery/api/use-home-listings";
import { MarketplaceHome } from "@/src/features/discovery/components/marketplace-home-ui";

export function DiscoveryHomeScreen() {
  const router = useRouter();
  const { dealListings, errorMessage, isLoading, recentListings, tradeListings } = useHomeListings();

  return (
    <MarketplaceHome
      dealListingsData={dealListings}
      errorMessage={errorMessage}
      isLoading={isLoading}
      onBellPress={() => router.push("/notification")}
      onCategoriesPress={() => router.push("/category")}
      onFilterPress={() => router.push("/search-filter")}
      onListingPress={(id) => router.push(`/listing/${id}`)}
      onLocationPress={() => router.push("/location")}
      recentListingsData={recentListings}
      tradeListingsData={tradeListings}
    />
  );
}
