import { useQuery } from "@tanstack/react-query";

import { getListing } from "@/src/lib/api/listings";
import { resolveMediaUrl } from "@/src/lib/api/media";
import { ListingAttributes, ListingResource } from "@/src/lib/api/types";
import { DetailProduct } from "@/src/features/detail/mocks/detail-mocks";
import { listingCategories } from "@/src/lib/categories/listing-categories";

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

function humanizeValue(value?: string | null): string {
  if (!value) {
    return "À définir";
  }

  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatCondition(value: string): string {
  const labels: Record<string, string> = {
    bon: "Bon état",
    correct: "État correct",
    excellent: "Très bon état",
    neuf: "Neuf",
  };

  return labels[value] ?? humanizeValue(value);
}

function formatDeliveryMode(value: string): string {
  const labels: Record<string, string> = {
    les_deux: "Livraison ou remise en main propre",
    livraison: "Livraison",
    main_propre: "Remise en main propre",
  };

  return labels[value] ?? humanizeValue(value);
}

function getCategoryLabel(categoryId: string): string {
  return listingCategories.find((category) => category.id === categoryId)?.label ?? humanizeValue(categoryId);
}

function formatAttributeValue(value: ListingAttributes[string]): string | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (Array.isArray(value)) {
    return value.length ? value.join(", ") : null;
  }

  if (typeof value === "boolean") {
    return value ? "Oui" : "Non";
  }

  return String(value);
}

function mapAttributes(categoryId: string, attributes: ListingAttributes): DetailProduct["attributes"] {
  const categoryFields = listingCategories.find((category) => category.id === categoryId)?.fields ?? [];
  const knownKeys = new Set(categoryFields.map((field) => field.key));
  const rows = categoryFields
    .map((field) => {
      const value = formatAttributeValue(attributes[field.key]);

      return value ? { label: field.label, value } : null;
    })
    .filter((row): row is { label: string; value: string } => Boolean(row));

  Object.entries(attributes).forEach(([key, rawValue]) => {
    if (knownKeys.has(key)) {
      return;
    }

    const value = formatAttributeValue(rawValue);
    if (value) {
      rows.push({ label: humanizeValue(key), value });
    }
  });

  return rows;
}

export function mapListingToDetailProduct(listing: ListingResource): DetailProduct {
  const photos = listing.photos.map((photo) => resolveMediaUrl(photo)).filter((photo): photo is string => Boolean(photo));
  const locationParts = [listing.neighborhood, listing.city].filter(Boolean);
  const sellerRating = listing.owner
    ? `${listing.owner.rating.toFixed(1)} (${listing.owner.review_count} avis)`
    : "Nouveau vendeur";

  return {
    attributes: mapAttributes(listing.category, listing.attributes ?? {}),
    badge: listing.is_boosted ? "Boost" : "Urgent",
    city: listing.city || listing.country || "Localisation",
    condition: formatCondition(listing.condition),
    deliveryMode: formatDeliveryMode(listing.delivery_mode),
    description: listing.description,
    displayLat: listing.display_lat,
    displayLng: listing.display_lng,
    exchangeFor: listing.exchange_for,
    favoriteCount: listing.favorite_count,
    id: listing.id,
    image: photos[0] || fallbackImage,
    location: locationParts.length ? locationParts.join(", ") : listing.city || "Localisation à confirmer",
    locationAccuracy: listing.location_accuracy,
    photos: photos.length ? photos : [fallbackImage],
    posted: {
      category: getCategoryLabel(listing.category),
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
    stats: [formatCondition(listing.condition), getCategoryLabel(listing.category), formatDeliveryMode(listing.delivery_mode)],
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
    isFetching: query.isFetching,
    product: query.data ? mapListingToDetailProduct(query.data) : null,
  };
}
