import { discoveryListings } from "@/src/features/discovery/mocks/discovery-mocks";

export type DetailVariant = "vehicle" | "others" | "scrolling";

export type DetailProduct = {
  id: string;
  variant: DetailVariant;
  title: string;
  price: string;
  location: string;
  city: string;
  image: string;
  photos?: string[];
  type?: "VENTE" | "TROC" | "TROC_CASH";
  badge: "Boost" | "Urgent";
  stats: string[];
  recommendation: string;
  description: string;
  seller: {
    id?: string;
    name: string;
    role: string;
    rating: string;
    avatar: string;
    verified?: boolean;
  };
  posted: {
    date: string;
    category: string;
    idRef: string;
  };
  viewCount?: number;
  condition?: string;
  deliveryMode?: string;
  exchangeFor?: string | null;
  attributes?: Array<{
    label: string;
    value: string;
  }>;
  favoriteCount?: number;
  preferredSellerAds?: string[];
};

const listingById = Object.fromEntries(discoveryListings.map((listing) => [listing.id, listing]));

export const detailProducts: Record<string, DetailProduct> = {
  "honda-jazz": {
    id: "honda-jazz",
    variant: "vehicle",
    title: "Honda Jazz 2020",
    price: "$8,000",
    location: "New York",
    city: "New York",
    image: listingById["honda-jazz"].image,
    badge: "Boost",
    stats: ["2020", "Automatic", "48.500 km"],
    recommendation: "Recommended for city driving",
    description:
      "Clean body, tidy interior, smooth transmission and a fuel-efficient engine. The car has been regularly serviced and is ready for daily use with no urgent maintenance expected.",
    seller: {
      name: "Sophia Turner",
      role: "Preferred Seller",
      rating: "4.9 • 124 reviews",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
    },
    posted: {
      date: "May 22, 2026",
      category: "Vehicle",
      idRef: "BZ-VEH-2020-884",
    },
  },
  "macbook-pro-m1": {
    id: "macbook-pro-m1",
    variant: "others",
    title: "Macbook Pro M1 2020",
    price: "$202,5k",
    location: "Silver Lake, Los Angeles",
    city: "Los Angeles",
    image: listingById["macbook-pro-m1"].image,
    badge: "Urgent",
    stats: ['14"', "512 GB", "Like new"],
    recommendation: "Great fit for remote work",
    description:
      "Apple M1 machine in excellent condition with strong battery health, bright display and no hardware issue. Perfect for editing, development, study and hybrid work setups.",
    seller: {
      name: "Daniel Brooks",
      role: "Top Rated Seller",
      rating: "4.8 • 89 reviews",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
    },
    posted: {
      date: "May 18, 2026",
      category: "Electronics",
      idRef: "BZ-ELC-2020-442",
    },
  },
  "willow-creek": {
    id: "willow-creek",
    variant: "scrolling",
    title: "Willow Creek Residences",
    price: "$202,5k",
    location: "Fishtown, Philadelphia",
    city: "Philadelphia",
    image: listingById["willow-creek"].image,
    badge: "Boost",
    stats: ["3 Beds", "2 Baths", "1.980 sqft"],
    recommendation: "Strong value in this district",
    description:
      "Modern finishes, generous natural light and a calm neighborhood setting. This residence combines practical family space with a polished interior and quick access to schools, cafés and transit.",
    seller: {
      name: "Natalie Morgan",
      role: "Agency Partner",
      rating: "4.9 • 206 reviews",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=300&q=80",
    },
    posted: {
      date: "May 14, 2026",
      category: "Property",
      idRef: "BZ-PRP-2026-918",
    },
    preferredSellerAds: ["JetCycle Flow 700", "Ducati Veloce 999", "Macbook Pro M1 2016"],
  },
};

export function getDetailProduct(id?: string) {
  if (id && detailProducts[id]) {
    return detailProducts[id];
  }

  return detailProducts["honda-jazz"];
}

export function getMockDetailProduct(id?: string) {
  if (!id) {
    return detailProducts["honda-jazz"];
  }

  return detailProducts[id] ?? null;
}
