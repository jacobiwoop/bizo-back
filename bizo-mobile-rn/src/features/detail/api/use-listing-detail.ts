import { useQuery } from "@tanstack/react-query";

import { getListing } from "@/src/lib/api/listings";
import { resolveMediaUrl } from "@/src/lib/api/media";
import { ListingResource } from "@/src/lib/api/types";
import { DetailProduct } from "@/src/features/detail/mocks/detail-mocks";

const fallbackImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuB-35PtfTQZfVYLlH_1bU7iosHWuZUNQUxJQWS6yJndgmh1KAXOJxXTSGuYMeYoq-AHCB0bMNygZQXzJ7fCVa58IiEYl2rsBn0m1e0q6G-VVN-IVyx1Ac6dN2ehLeh3gbmEkr20Md3ZLUYwYR9qraawQR1Gs32SVO9QL8ZOhs3gHRzu6Mgpa6UwIcTj8x7tduWmbMd5VdZc4SW7D_k1wwZx_2V0DVal8Wb78ylfFIJjn_961Lx8EjbbdrXCJxIYtW7-QemC061w3Xo";

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

function formatDate(value: string): string {
  const createdAt = new Date(value).getTime();

  if (Number.isNaN(createdAt)) {
    return "Publié récemment";
  }

  const diffMinutes = Math.max(1, Math.floor((Date.now() - createdAt) / 60000));

  if (diffMinutes < 60) {
    return `Publié il y a ${diffMinutes} min`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `Publié il y a ${diffHours}h`;
  }

  return `Publié il y a ${Math.floor(diffHours / 24)}j`;
}

function humanizeValue(value: string): string {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function mapListingToDetailProduct(listing: ListingResource): DetailProduct {
  const photos = listing.photos.map((photo) => resolveMediaUrl(photo)).filter((photo): photo is string => Boolean(photo));
  const locationParts = [listing.neighborhood, listing.city].filter(Boolean);
  const sellerRating = listing.owner
    ? `${listing.owner.rating.toFixed(1)} (${listing.owner.review_count} avis)`
    : "Nouveau vendeur";

  return {
    badge: listing.is_boosted ? "Boost" : "Urgent",
    city: listing.city || listing.country || "Localisation",
    condition: humanizeValue(listing.condition),
    deliveryMode: humanizeValue(listing.delivery_mode),
    description: listing.description,
    exchangeFor: listing.exchange_for,
    id: listing.id,
    image: photos[0] || fallbackImage,
    location: locationParts.length ? locationParts.join(", ") : listing.city || "Localisation à confirmer",
    photos: photos.length ? photos : [fallbackImage],
    posted: {
      category: listing.category,
      date: formatDate(listing.created_at),
      idRef: `BZ-${listing.id.slice(0, 8).toUpperCase()}`,
    },
    price: formatPrice(listing),
    recommendation: listing.tags[0] || "Annonce disponible sur Bizo",
    seller: {
      avatar: resolveMediaUrl(listing.owner?.photo_url) || "",
      id: listing.owner?.id,
      name: listing.owner?.display_name || "Vendeur Bizo",
      rating: sellerRating,
      role: listing.owner?.is_verified ? "Vendeur vérifié" : "Vendeur",
      verified: listing.owner?.is_verified,
    },
    stats: [humanizeValue(listing.condition), listing.category, humanizeValue(listing.delivery_mode)],
    title: listing.title,
    type: listing.type,
    variant: "others",
    viewCount: listing.view_count,
  };
}

export function useListingDetail(id?: string) {
  const query = useQuery({
    enabled: Boolean(id),
    queryFn: () => getListing(id as string),
    queryKey: ["listing-detail", id],
    staleTime: 30_000,
  });

  return {
    error: query.error,
    isLoading: query.isLoading,
    product: query.data ? mapListingToDetailProduct(query.data) : null,
  };
}
