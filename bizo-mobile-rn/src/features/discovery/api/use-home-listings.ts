import { useQuery } from "@tanstack/react-query";

import { getListings } from "@/src/lib/api/listings";
import { normalizeApiError } from "@/src/lib/api/errors";
import { resolveMediaUrl } from "@/src/lib/api/media";
import { ListingResource } from "@/src/lib/api/types";
import { CompactListing, Listing } from "@/src/features/discovery/components/marketplace-home-ui";

const fallbackImages = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAquGbs5XEpp5Ve_MPFdWdE3PMBBhFXuCg5lkAkxMHwr4f9x1keBLbtcCSY8vV1a0sKKGgnamXaSLKPai5rPN4hnhaN0KKgVrxAYYXCHJ9yZMGY6MPog1kA_kObUSScM8UjLdBLyptQ8TqqDKIvQFlOkSZPsdjKhs557HAV96hftqY39O1cju51h41vTCwt5QulWKzardOda-Ctk5QV4dOWULy_BV0LbrzFQntnkreliaOEd3fvHevMHZtYd4eZyrdtSquLtu8wVac",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAu-3CP6vOwWMnmAfpcC6UU9lJ-Jnb88E-3TQB2ywUJ4UrzL1-YNcqhUb85KAlgvGyraMUeXeigr0WP6ZL98ZAXS3-x40WIBePGeVNZU_aFBDjd1PJFWOiOs0QR02wH6_jHHOhmOjMIKHrNx6UCiH-CX2XAnIv41T4HEO8S-wm2wJkvj8HN__P9To3FGuqCodf0u5BRgC0C-ukJnPNVT4T6c6MKr-X1EOfZmL_L6sDV8PTLoElOrgp_FN52qyfJ5IQ38U-S94LH-Jc",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDuDeFdqb5_sybJG4fE4HfPKyLYJtK7OGU6j2IpwDCDKMgxgAm9aqEuWlR7KckhnFqR6_XdwvsBryr02gp25G0jZKNwoXmaQsunjLX24MZFp7hgghziYw2U1G0rtLm-xMsVPM17dXAEGPnfNKpgIgBfGaVtpqfw6XMe2ovKv3QYIdpZOqV_3muqNOKl3ctUZ85RsvJfdAK67Igqkyap9SVhEPAmLf_h5olLKKLaVbR1TLOAKUrPkhkscIz75CV6WzrsXLtR3WxTIVk",
];

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

function listingImage(listing: ListingResource, index: number): string {
  return resolveMediaUrl(listing.photos?.[0]) ?? fallbackImages[index % fallbackImages.length];
}

function mapListingCard(listing: ListingResource, index: number): Listing {
  const location = listing.neighborhood || listing.city;

  return {
    id: listing.id,
    title: listing.title,
    value: formatListingValue(listing),
    badge: listingBadge(listing),
    badgeColor: listingBadgeColor(listing),
    image: listingImage(listing, index),
    seller: listing.owner?.display_name || "Vendeur Bizo",
    meta: location || formatTime(listing.created_at),
    favorite: listing.favorite_count > 0,
  };
}

function mapCompactListing(listing: ListingResource, index: number): CompactListing {
  return {
    id: listing.id,
    title: listing.type === "VENTE" ? formatListingValue(listing) : listing.title,
    subtitle: listing.type === "VENTE" ? listing.title : formatListingValue(listing),
    badge: listing.type === "VENTE" ? undefined : listingBadge(listing),
    image: listingImage(listing, index),
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
      ? `${normalizeApiError(query.error).message} Contenu d'exemple affiché.`
      : null,
    isLoading: query.isLoading,
    recentListings: listings.slice(0, 2).map(mapListingCard),
    tradeListings: tradeSource.slice(0, 5).map(mapCompactListing),
  };
}
