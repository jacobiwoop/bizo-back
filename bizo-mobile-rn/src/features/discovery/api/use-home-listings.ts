import { useQuery } from "@tanstack/react-query";

import { getListings } from "@/src/lib/api/listings";
import { normalizeApiError } from "@/src/lib/api/errors";
import { resolveMediaUrl } from "@/src/lib/api/media";
import { ListingResource } from "@/src/lib/api/types";
import { CompactListing, Listing } from "@/src/features/discovery/components/marketplace-home-ui";

function formatAmount(amount: number): string {
  return `${amount.toLocaleString("fr-FR")} FCFA`;
}

function formatListingValue(listing: ListingResource): string {
  if (listing.type === "TROC") {
    return `Contre ${listing.exchange_for || "proposition"}`;
  }

  if (listing.type === "TROC_CASH") {
    return listing.cash_complement ? `${formatAmount(listing.cash_complement)} + Troc` : "Troc + cash";
  }

  return listing.price ? formatAmount(listing.price) : "Prix sur demande";
}

function formatTime(value: string): string {
  const createdAt = new Date(value).getTime();

  if (Number.isNaN(createdAt)) {
    return "Récemment";
  }

  const diffMs = Date.now() - createdAt;
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60000));

  if (diffMinutes < 60) {
    return `Il y a ${diffMinutes} min`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `Il y a ${diffHours}h`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `Il y a ${diffDays}j`;
}

function listingBadge(listing: ListingResource): Listing["badge"] {
  return listing.type === "TROC_CASH" ? "TROC+CASH" : listing.type;
}

function listingBadgeColor(listing: ListingResource): string {
  if (listing.type === "TROC") {
    return "#00687C";
  }

  if (listing.type === "TROC_CASH") {
    return "#745B00";
  }

  return "#2A313D";
}

function listingImage(listing: ListingResource): string | null {
  return resolveMediaUrl(listing.photos?.[0]) ?? null;
}

function mapListingCard(listing: ListingResource): Listing {
  const location = listing.neighborhood || listing.city;

  return {
    id: listing.id,
    title: listing.title,
    value: formatListingValue(listing),
    badge: listingBadge(listing),
    badgeColor: listingBadgeColor(listing),
    image: listingImage(listing),
    seller: listing.owner?.display_name || "Vendeur Bizo",
    meta: location || formatTime(listing.created_at),
    favorite: listing.favorite_count > 0,
  };
}

function mapCompactListing(listing: ListingResource): CompactListing {
  return {
    id: listing.id,
    title: listing.type === "VENTE" ? formatListingValue(listing) : listing.title,
    subtitle: listing.type === "VENTE" ? listing.title : formatListingValue(listing),
    badge: listing.type === "VENTE" ? undefined : listingBadge(listing),
    image: listingImage(listing),
  };
}

export function useHomeListings() {
  const query = useQuery({
    queryFn: () => getListings({ per_page: 12 }),
    queryKey: ["home-listings"],
    staleTime: 60_000,
  });

  const listings = query.data?.data ?? [];
  const tradeSource = listings.filter((listing) => listing.type !== "VENTE");
  const dealSource = listings.filter((listing) => listing.type === "VENTE");

  return {
    dealListings: dealSource.slice(0, 5).map(mapCompactListing),
    errorMessage: query.error
      ? normalizeApiError(query.error).message
      : null,
    isLoading: query.isLoading,
    recentListings: listings.slice(0, 2).map(mapListingCard),
    tradeListings: tradeSource.slice(0, 5).map(mapCompactListing),
  };
}
