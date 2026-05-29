export type DiscoveryCategory = {
  id: string;
  label: string;
  icon: "vehicle" | "property" | "handphone" | "fashion" | "babies" | "jobs" | "sport" | "service" | "furniture" | "electronics" | "books" | "hobbies" | "medics" | "kids" | "games";
};

export type DiscoveryListing = {
  id: string;
  title: string;
  price: string;
  badge: "Boost" | "Urgent";
  location: string;
  city: string;
  rating: number;
  reviewCount: number;
  image: string;
  status: "Verified" | "Premium";
  timeAgo: string;
  favorite?: boolean;
};

export type DiscoveryNotification = {
  id: string;
  title: string;
  subtitle: string;
  badge: "New" | "Sale" | "Deal" | "Hot";
  timeAgo: string;
  image: string;
};

export const discoveryQuickSearches = [
  "ford ranger",
  "macbook pro",
  "southwest resort",
  "vespa",
];

export const discoveryCategories: DiscoveryCategory[] = [
  { id: "vehicle", label: "Vehicle", icon: "vehicle" },
  { id: "property", label: "Property", icon: "property" },
  { id: "handphone", label: "Handphone", icon: "handphone" },
  { id: "fashion", label: "Fashion", icon: "fashion" },
  { id: "babies", label: "Babies", icon: "babies" },
  { id: "jobs", label: "Jobs", icon: "jobs" },
  { id: "sport", label: "Sport", icon: "sport" },
  { id: "service", label: "Service", icon: "service" },
  { id: "furniture", label: "Furniture", icon: "furniture" },
  { id: "electronics", label: "Electronics", icon: "electronics" },
  { id: "books", label: "Books", icon: "books" },
  { id: "hobbies", label: "Hobbies", icon: "hobbies" },
  { id: "medics", label: "Medics", icon: "medics" },
  { id: "kids", label: "Kids", icon: "kids" },
  { id: "games", label: "Games", icon: "games" },
];

export const discoveryListings: DiscoveryListing[] = [
  {
    id: "willow-creek",
    title: "Willow Creek Residences",
    price: "$202,5k",
    badge: "Boost",
    location: "Fishtown, Philadelphia",
    city: "Brooklyn",
    rating: 4,
    reviewCount: 60,
    image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=900&q=80",
    status: "Verified",
    timeAgo: "3d ago",
  },
  {
    id: "macbook-pro-m1",
    title: "Macbook Pro M1 2020",
    price: "$202,5k",
    badge: "Urgent",
    location: "Silver Lake, Los Angeles",
    city: "Boston",
    rating: 4,
    reviewCount: 60,
    image: "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=900&q=80",
    status: "Premium",
    timeAgo: "3d ago",
  },
  {
    id: "jetcycle-flow",
    title: "JetCycle Flow 700",
    price: "$11,2k",
    badge: "Boost",
    location: "Fishtown, Philadelphia",
    city: "Philadelphia",
    rating: 4,
    reviewCount: 60,
    image: "https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=900&q=80",
    status: "Verified",
    timeAgo: "3d ago",
    favorite: true,
  },
  {
    id: "ducati-veloce",
    title: "Ducati Veloce 999",
    price: "$202,5k",
    badge: "Urgent",
    location: "Silver Lake, Los Angeles",
    city: "Sacramento",
    rating: 4,
    reviewCount: 60,
    image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=900&q=80",
    status: "Verified",
    timeAgo: "3d ago",
  },
  {
    id: "macbook-pro-2016",
    title: "Macbook Pro M1 2016",
    price: "$1,900",
    badge: "Boost",
    location: "Boston",
    city: "Boston",
    rating: 4,
    reviewCount: 60,
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80",
    status: "Verified",
    timeAgo: "3d ago",
  },
  {
    id: "honda-jazz",
    title: "Honda Jazz 2020",
    price: "$8,000",
    badge: "Boost",
    location: "New York",
    city: "New York",
    rating: 4,
    reviewCount: 12,
    image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=900&q=80",
    status: "Premium",
    timeAgo: "1w ago",
  },
  {
    id: "macbook-pro-2012",
    title: "Macbook Pro 2012",
    price: "$800",
    badge: "Boost",
    location: "Philadelphia",
    city: "Philadelphia",
    rating: 4,
    reviewCount: 60,
    image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=900&q=80",
    status: "Premium",
    timeAgo: "1w ago",
    favorite: true,
  },
];

export const discoveryLocations = [
  "New York, NY",
  "Newark, NJ",
  "New Orleans, LA",
  "New Haven, CT",
  "Newport Beach, CA",
  "New Braunfels, TX",
  "New Bedford, MA",
  "New Albany, IN",
  "New Rochelle, NY",
];

export const discoveryNotificationSegments = [
  "All",
  "General",
  "Dentist",
  "Nutritionist",
  "Radiology",
];

export const discoveryNotifications: DiscoveryNotification[] = [
  {
    id: "notif-1",
    title: "New items you might like!",
    subtitle: "A used iPhone 13 is now listed near you.",
    badge: "New",
    timeAgo: "2 days ago",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "notif-2",
    title: "Price drop alert!",
    subtitle: "Nike Air Max is now $20 less — grab it fast!",
    badge: "Sale",
    timeAgo: "4 days ago",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "notif-3",
    title: "Flash deal near you!",
    subtitle: "The MacBook Pro 2021 is discounted for the next 24 hours.",
    badge: "Deal",
    timeAgo: "1 week ago",
    image: "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "notif-4",
    title: "Handpicked just for you",
    subtitle: "Based on your activity, you might like these listings.",
    badge: "Hot",
    timeAgo: "2 weeks ago",
    image: "https://images.unsplash.com/photo-1496171367470-9ed9a91ea931?auto=format&fit=crop&w=400&q=80",
  },
];
