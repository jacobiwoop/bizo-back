import { useQuery } from "@tanstack/react-query";

import { SearchFilters, SearchListing } from "@/src/features/discovery/components/search-results-ui";
import { normalizeApiError } from "@/src/lib/api/errors";
import { getListings, ListingsQueryParams } from "@/src/lib/api/listings";
import { resolveMediaUrl } from "@/src/lib/api/media";
import { ListingResource } from "@/src/lib/api/types";

const fallbackImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAquGbs5XEpp5Ve_MPFdWdE3PMBBhFXuCg5lkAkxMHwr4f9x1keBLbtcCSY8vV1a0sKKGgnamXaSLKPai5rPN4hnhaN0KKgVrxAYYXCHJ9yZMGY6MPog1kA_kObUSScM8UjLdBLyptQ8TqqDKIvQFlOkSZPsdjKhs557HAV96hftqY39O1cju51h41vTCwt5QulWKzardOda-Ctk5QV4dOWULy_BV0LbrzFQntnkreliaOEd3fvHevMHZtYd4eZyrdtSquLtu8wVac";

function formatAmount(amount: number): string {
  return `${amount.toLocaleString("fr-FR")} FCFA`;
}

function formatPrice(listing: ListingResource): string {
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

  const minutes = Math.max(1, Math.floor((Date.now() - createdAt) / 60000));

  if (minutes < 60) return `il y a ${minutes} min`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours}h`;

  return `il y a ${Math.floor(hours / 24)}j`;
}

function formatCondition(value: string): SearchListing["condition"] {
  return value === "neuf" ? "Neuf" : "Occasion";
}

function mapListing(listing: ListingResource): SearchListing {
  return {
    city: [listing.neighborhood, listing.city].filter(Boolean).join(", ") || listing.city || "Localisation",
    condition: formatCondition(listing.condition),
    favorite: listing.favorite_count > 0,
    id: listing.id,
    image: resolveMediaUrl(listing.photos[0]) ?? fallbackImage,
    price: formatPrice(listing),
    time: formatTime(listing.created_at),
    title: listing.title,
    urgent: listing.is_boosted,
  };
}

function buildParams(query: string, filters: SearchFilters): ListingsQueryParams {
  return {
    category: filters.category ?? undefined,
    city: filters.city.trim() || undefined,
    condition: filters.condition ?? undefined,
    max_price: filters.maxPrice ? Number(filters.maxPrice) : undefined,
    min_price: filters.minPrice ? Number(filters.minPrice) : undefined,
    per_page: 30,
    q: query.trim() || undefined,
    sort: filters.sort,
    type: filters.type ?? undefined,
  };
}

export function useSearchListings(query: string, filters: SearchFilters) {
  const requestParams = buildParams(query, filters);
  const searchQuery = useQuery({
    queryFn: () => getListings(requestParams),
    queryKey: ["search-listings", requestParams],
    staleTime: 30_000,
  });
  const listings = searchQuery.data?.data ?? [];

  return {
    errorMessage: searchQuery.error ? normalizeApiError(searchQuery.error).message : null,
    isFetching: searchQuery.isFetching,
    isLoading: searchQuery.isLoading,
    listings: listings.map(mapListing),
    total: searchQuery.data?.meta?.total ?? listings.length,
  };
}
