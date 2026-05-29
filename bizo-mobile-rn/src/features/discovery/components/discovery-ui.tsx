import { Image } from "expo-image";
import {
  Bell,
  BookOpen,
  BriefcaseBusiness,
  CarFront,
  ChevronLeft,
  CirclePlus,
  Gamepad2,
  Heart,
  House,
  LayoutGrid,
  List,
  MapPin,
  MonitorSmartphone,
  PackagePlus,
  PillBottle,
  Search,
  SlidersHorizontal,
  Settings2,
  Shirt,
  ShoppingCart,
  Sofa,
  Star,
  Trophy,
  Truck,
  X,
} from "lucide-react-native";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  DiscoveryCategory,
  DiscoveryListing,
  DiscoveryNotification,
} from "@/src/features/discovery/mocks/discovery-mocks";

const sansText = { fontFamily: "sans-serif" } as const;
const sansMediumText = { fontFamily: "sans-serif-medium" } as const;
const sansBoldText = { fontFamily: "sans-serif" } as const;

function CategoryIcon({ icon }: { icon: DiscoveryCategory["icon"] }) {
  const common = { size: 34, strokeWidth: 1.9, color: "#111111" };

  switch (icon) {
    case "vehicle":
      return <CarFront {...common} color="#26B6F3" />;
    case "property":
      return <House {...common} color="#F7A312" />;
    case "handphone":
      return <MonitorSmartphone {...common} color="#1F4C8D" />;
    case "fashion":
      return <Shirt {...common} color="#FF6C6C" />;
    case "babies":
      return <ShoppingCart {...common} color="#21B85C" />;
    case "jobs":
      return <BriefcaseBusiness {...common} color="#FF6C6C" />;
    case "sport":
      return <Trophy {...common} color="#6D49D8" />;
    case "service":
      return <Truck {...common} color="#6AC1C8" />;
    case "furniture":
      return <Sofa {...common} color="#F1C84B" />;
    case "electronics":
      return <PackagePlus {...common} color="#E46AD1" />;
    case "books":
      return <BookOpen {...common} color="#2F6BFF" />;
    case "hobbies":
      return <ShoppingCart {...common} color="#27C0DF" />;
    case "medics":
      return <PillBottle {...common} color="#7E54EE" />;
    case "kids":
      return <CirclePlus {...common} color="#FF962F" />;
    case "games":
      return <Gamepad2 {...common} color="#E46AD1" />;
  }
}

export function DiscoveryBlueHeader({
  title,
  showBack = false,
  showSearch = false,
  showLocation = false,
  showFilter = false,
  showBell = false,
  searchValue,
  rightQuickChips,
  onBack,
}: {
  title?: string;
  showBack?: boolean;
  showSearch?: boolean;
  showLocation?: boolean;
  showFilter?: boolean;
  showBell?: boolean;
  searchValue?: string;
  rightQuickChips?: string[];
  onBack?: () => void;
}) {
  return (
    <View className="rounded-b-[56px] bg-[#2F66F3] px-6 pb-9 pt-6">
      <View className="flex-row items-center justify-between">
        {showBack ? (
          <Pressable
            className="h-[72px] w-[72px] items-center justify-center rounded-[22px] bg-[#4C95FF]"
            onPress={onBack}
          >
            <ChevronLeft color="#FFFFFF" size={34} strokeWidth={2.2} />
          </Pressable>
        ) : (
          <View className="w-6" />
        )}
        {title ? <Text className="text-[30px] font-semibold text-white">{title}</Text> : <View />}
        {!showBack ? (
          <View className="flex-row items-center gap-5">
            {showLocation ? <MapPin color="#FFFFFF" size={30} strokeWidth={2} /> : null}
            {showBell ? (
              <View>
                <Bell color="#FFFFFF" size={30} strokeWidth={2} />
                <View className="absolute -right-1 top-0 h-4 w-4 rounded-full bg-[#FF0000]" />
              </View>
            ) : null}
          </View>
        ) : (
          <View className="w-[72px] items-end">
            {showLocation ? <MapPin color="#FFFFFF" size={30} strokeWidth={2} /> : null}
            {showFilter ? <Settings2 color="#FFFFFF" size={30} strokeWidth={2} /> : null}
          </View>
        )}
      </View>

      {showSearch ? (
        <View className="mt-7 flex-row items-center">
          <View className="flex-1 flex-row items-center rounded-full bg-white px-6 py-[15px]">
            <Search color="#A0A0A0" size={26} strokeWidth={2} />
            <TextInput
              className="ml-4 flex-1 text-[17px] text-ink"
              defaultValue={searchValue}
              placeholder="Search items"
              placeholderTextColor="#A0A0A0"
            />
          </View>
          {showLocation ? (
            <Pressable className="ml-5">
              <MapPin color="#FFFFFF" size={30} strokeWidth={2} />
            </Pressable>
          ) : null}
          {showFilter ? (
            <Pressable className="ml-5">
              <Settings2 color="#FFFFFF" size={30} strokeWidth={2} />
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {rightQuickChips?.length ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-5"
          contentContainerStyle={{ gap: 14, paddingRight: 24 }}
        >
          {rightQuickChips.map((chip) => (
            <View key={chip} className="flex-row items-center rounded-full bg-[#245AE0] px-4 py-[9px]">
              <Text className="text-[13px] font-medium capitalize text-white">{chip}</Text>
              <Search color="#FFFFFF" size={15} strokeWidth={2} style={{ marginLeft: 8 }} />
            </View>
          ))}
        </ScrollView>
      ) : null}
    </View>
  );
}

export function DiscoveryHomeTopSection({
  searchValue,
  rightQuickChips,
  onQuickChipPress,
  onLocationPress,
  onBellPress,
}: {
  searchValue: string;
  rightQuickChips: string[];
  onQuickChipPress?: (chip: string) => void;
  onLocationPress?: () => void;
  onBellPress?: () => void;
}) {
  return (
    <View style={{ height: 329, backgroundColor: "#2F66F3" }}>
      <View className="absolute -left-24 -top-24 h-[360px] w-[360px] rounded-full border border-white/10" />
      <View className="absolute right-[-40px] top-[-24px] h-[360px] w-[360px] rounded-full border border-white/10" />

      <View className="px-6 pt-[50px]">
        <View className="h-10 flex-row items-center">
          <View className="h-10 flex-1 flex-row items-center rounded-full bg-white px-4">
            <Search color="#A8A8AE" size={22} strokeWidth={2} />
            <TextInput
              className="ml-4 flex-1 text-[16px] text-[#8E8E93]"
              defaultValue={searchValue}
              placeholder="Search"
              placeholderTextColor="#8E8E93"
              style={sansText}
            />
          </View>
          <Pressable className="ml-4" onPress={onLocationPress}>
            <MapPin color="#FFFFFF" size={28} strokeWidth={2} />
          </Pressable>
          <Pressable className="ml-4" onPress={onBellPress}>
            <Bell color="#FFFFFF" size={28} strokeWidth={2} />
            <View className="absolute -right-1 top-0 h-3 w-3 rounded-full bg-[#FF0000]" />
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-[10px]"
          contentContainerStyle={{ gap: 10, paddingRight: 24 }}
        >
          {rightQuickChips.map((chip) => (
            <Pressable
              key={chip}
              className="h-[22px] flex-row items-center rounded-full bg-[#2A57CA] px-4"
              onPress={() => onQuickChipPress?.(chip)}
            >
              <Text className="text-[11px] font-medium capitalize text-white" style={sansMediumText}>
                {chip}
              </Text>
              <Search color="#FFFFFF" size={14} strokeWidth={2} style={{ marginLeft: 7 }} />
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

export function CategoryCarouselCard({
  categories,
  onPress,
  onCategoryPress,
}: {
  categories: DiscoveryCategory[];
  onPress: () => void;
  onCategoryPress?: (category: DiscoveryCategory) => void;
}) {
  return (
    <View className="rounded-[34px] bg-white px-7 py-7 shadow-soft">
      <View className="flex-row flex-wrap justify-between gap-y-8">
        {categories.slice(0, 10).map((category) => (
          <Pressable
            key={category.id}
            className="w-[18%] items-center"
            onPress={() => onCategoryPress?.(category)}
          >
            <CategoryIcon icon={category.icon} />
            <Text className="mt-3 text-center text-[10px] font-medium text-ink">{category.label}</Text>
          </Pressable>
        ))}
      </View>
      <View className="mt-7 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <View className="h-[10px] w-12 rounded-full bg-[#2F66F3]" />
          <View className="h-[10px] w-[10px] rounded-full bg-[#D7D7D7]" />
          <View className="h-[10px] w-[10px] rounded-full bg-[#D7D7D7]" />
        </View>
        <Pressable className="rounded-full bg-[#F3F6FF] px-4 py-2" onPress={onPress}>
          <Text className="text-[12px] font-medium text-[#2F66F3]">All Categories</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function DiscoveryHomeCategoryCard({
  categories,
  onPress,
  onCategoryPress,
}: {
  categories: DiscoveryCategory[];
  onPress: () => void;
  onCategoryPress?: (category: DiscoveryCategory) => void;
}) {
  return (
    <View className="rounded-[30px] bg-white px-[10px] pb-[14px] pt-5 shadow-soft">
      <View className="px-2">
        <View className="flex-row flex-wrap justify-between">
          {categories.slice(0, 10).map((category, index) => (
            <Pressable
              key={category.id}
              className={`w-[20%] items-center ${index >= 5 ? "mt-[10px]" : ""}`}
              onPress={() => onCategoryPress?.(category)}
            >
              <CategoryIcon icon={category.icon} />
              <Text
                className="mt-[9px] text-center text-[9px] leading-[14px] text-ink"
                style={sansMediumText}
              >
                {category.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View className="mt-[12px] flex-row items-center justify-center">
        <View className="h-[6px] w-6 rounded-full bg-[#2F66F3]" />
        <View className="ml-[4px] h-[6px] w-[6px] rounded-full bg-[#D2D2D2]" />
        <View className="ml-[4px] h-[6px] w-[6px] rounded-full bg-[#D2D2D2]" />
      </View>

      <Pressable className="absolute bottom-3 right-4 rounded-full bg-[#F3F6FF] px-3 py-[6px]" onPress={onPress}>
        <Text className="text-[10px] text-[#2F66F3]" style={sansMediumText}>
          All
        </Text>
      </Pressable>
    </View>
  );
}

export function DiscoveryCategoryGrid({
  categories,
  onCategoryPress,
}: {
  categories: DiscoveryCategory[];
  onCategoryPress?: (category: DiscoveryCategory) => void;
}) {
  return (
    <View className="flex-row flex-wrap justify-between gap-y-12">
      {categories.map((category) => (
        <Pressable
          key={category.id}
          className="w-[31%] items-center"
          onPress={() => onCategoryPress?.(category)}
        >
          <CategoryIcon icon={category.icon} />
          <Text className="mt-5 text-center text-[14px] font-medium text-ink">{category.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function ListingBadge({ badge }: { badge: DiscoveryListing["badge"] }) {
  return (
    <View className={`rounded-[10px] px-3 py-2 ${badge === "Boost" ? "bg-[#FFD550]" : "bg-[#FFE3D7]"}`}>
      <Text
        className={`text-[13px] ${badge === "Boost" ? "text-ink" : "text-[#F37E43]"}`}
        style={sansMediumText}
      >
        {badge === "Boost" ? "⚡ Boost" : "⏰ Urgent"}
      </Text>
    </View>
  );
}

function StatusPill({ status }: { status: DiscoveryListing["status"] }) {
  if (status === "Verified") {
    return (
      <View className="rounded-full bg-[#DCF4DA] px-3 py-2">
        <Text className="text-[12px] text-[#49A55A]" style={sansMediumText}>⚙ Verified</Text>
      </View>
    );
  }

  return (
    <View className="rounded-full bg-[#E6EEFF] px-3 py-2">
      <Text className="text-[12px] text-[#3363E6]" style={sansMediumText}>🎖 Premium</Text>
    </View>
  );
}

function RatingRow({ rating, reviewCount }: { rating: number; reviewCount: number }) {
  return (
    <View className="mt-2 flex-row items-center">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          color={index < rating ? "#FFB800" : "#D0D0D0"}
          fill={index < rating ? "#FFB800" : "#D0D0D0"}
          size={16}
          strokeWidth={1.6}
        />
      ))}
      <Text className="ml-1 text-[12px] text-[#8C8C8C]" style={sansText}>({reviewCount})</Text>
    </View>
  );
}

function SearchResultRatingRow({ rating, reviewCount }: { rating: number; reviewCount: number }) {
  return (
    <View className="ml-4 flex-row items-center">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          color={index < rating ? "#FFB800" : "#D0D0D0"}
          fill={index < rating ? "#FFB800" : "#D0D0D0"}
          size={11}
          strokeWidth={1.4}
        />
      ))}
      <Text className="ml-1 text-[10px] text-[#8C8C8C]" style={sansText}>({reviewCount})</Text>
    </View>
  );
}

export function DiscoverySearchHeader({
  query,
  onBack,
  onLocationPress,
  onFilterPress,
}: {
  query: string;
  onBack: () => void;
  onLocationPress?: () => void;
  onFilterPress?: () => void;
}) {
  return (
    <View style={{ height: 168, backgroundColor: "#2F66F3" }}>
      <View className="absolute -right-14 -top-10 h-[240px] w-[240px] rounded-full border border-white/10" />
      <View className="absolute right-8 top-0 h-[220px] w-[220px] rounded-full border border-white/10" />
      <View className="px-4 pb-4 pt-3">
        <View className="flex-row items-center justify-between">
          <Pressable
            className="h-12 w-12 items-center justify-center rounded-[16px] bg-[#4A95FB]"
            onPress={onBack}
          >
            <ChevronLeft color="#FFFFFF" size={24} strokeWidth={2.2} />
          </Pressable>
          <Text className="text-[26px] font-semibold text-white">Search</Text>
          <View className="w-12" />
        </View>

        <View className="mt-11 flex-row items-center px-4">
          <View className="h-10 flex-1 flex-row items-center rounded-full bg-white px-5">
            <Search color="#A8A8AE" size={22} strokeWidth={2} />
            <TextInput
              className="ml-4 flex-1 text-[16px] text-[#8E8E93]"
              defaultValue={query}
              placeholder="Search"
              placeholderTextColor="#8E8E93"
              style={sansText}
            />
          </View>
          <Pressable className="ml-4" onPress={onLocationPress}>
            <MapPin color="#FFFFFF" size={28} strokeWidth={2} />
          </Pressable>
          <Pressable className="ml-5" onPress={onFilterPress}>
            <SlidersHorizontal color="#FFFFFF" size={28} strokeWidth={2} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export function DiscoveryTitleHeader({
  title,
  onBack,
}: {
  title: string;
  onBack: () => void;
}) {
  return (
    <View style={{ height: 124, backgroundColor: "#2F66F3" }}>
      <View className="absolute -right-14 -top-10 h-[240px] w-[240px] rounded-full border border-white/10" />
      <View className="absolute right-8 top-0 h-[220px] w-[220px] rounded-full border border-white/10" />
      <View className="px-4 pb-6 pt-3">
        <View className="flex-row items-center justify-between">
          <Pressable
            className="h-12 w-12 items-center justify-center rounded-[16px] bg-[#4A95FB]"
            onPress={onBack}
          >
            <ChevronLeft color="#FFFFFF" size={24} strokeWidth={2.2} />
          </Pressable>
          <Text className="text-[26px] font-semibold text-white">{title}</Text>
          <View className="w-12" />
        </View>
      </View>
    </View>
  );
}

export function DiscoveryCategoryHeader({ onBack }: { onBack: () => void }) {
  return <DiscoveryTitleHeader title="Category" onBack={onBack} />;
}

export function DiscoveryCategoryMenu({
  categories,
  onCategoryPress,
}: {
  categories: DiscoveryCategory[];
  onCategoryPress?: (category: DiscoveryCategory) => void;
}) {
  return (
    <View className="px-[22px] pt-6">
      <View className="flex-row flex-wrap justify-between">
        {categories.map((category, index) => (
          <Pressable
            key={category.id}
            className={`h-[100px] w-[100px] items-center ${index >= 3 ? "mt-6" : ""}`}
            onPress={() => onCategoryPress?.(category)}
          >
            <View className="mt-4">
              <CategoryIcon icon={category.icon} />
            </View>
            <Text className="mt-[13px] text-center text-[12px] font-medium leading-[16px] text-ink">
              {category.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export function DiscoverySearchSummary({
  label,
  mode,
  onChangeMode,
}: {
  label: string;
  mode: "grid" | "list";
  onChangeMode: (mode: "grid" | "list") => void;
}) {
  return (
    <View className="flex-row items-center justify-between px-4 pt-8">
      <View className="rounded-[16px] bg-white px-5 py-[11px] shadow-soft">
        <Text className="text-[16px] font-medium text-ink">{label}</Text>
      </View>

      <View className="flex-row rounded-[16px] bg-white px-[10px] py-2 shadow-soft">
        <View
          className={`h-10 w-10 items-center justify-center rounded-[10px] ${mode === "list" ? "bg-white shadow-soft" : "bg-transparent"}`}
          onStartShouldSetResponder={() => true}
          onResponderRelease={() => onChangeMode("list")}
        >
          <List color="#787878" size={18} strokeWidth={2} />
        </View>
        <View
          className={`ml-[10px] h-10 w-10 items-center justify-center rounded-[10px] ${mode === "grid" ? "bg-white shadow-soft" : "bg-transparent"}`}
          onStartShouldSetResponder={() => true}
          onResponderRelease={() => onChangeMode("grid")}
        >
          <LayoutGrid color="#A0A0A0" size={18} strokeWidth={2} />
        </View>
      </View>
    </View>
  );
}

export function DiscoveryPopularControls({
  mode,
  onChangeMode,
}: {
  mode: "grid" | "list";
  onChangeMode: (mode: "grid" | "list") => void;
}) {
  return (
    <View className="flex-row items-center justify-between px-4 pt-8">
      <View className="flex-row rounded-[16px] bg-white px-[10px] py-2 shadow-soft">
        <Pressable className="rounded-[10px] bg-white px-4 py-[10px] shadow-soft">
          <Text className="text-[13px] font-medium text-[#8A8A8A]">Services</Text>
        </Pressable>
        <Pressable className="ml-[10px] rounded-[10px] bg-white px-4 py-[10px] shadow-soft">
          <Text className="text-[13px] font-medium text-ink">Ads</Text>
        </Pressable>
      </View>

      <View className="flex-row rounded-[16px] bg-white px-[10px] py-2 shadow-soft">
        <Pressable
          className={`h-10 w-10 items-center justify-center rounded-[10px] ${mode === "list" ? "bg-white shadow-soft" : "bg-transparent"}`}
          onPress={() => onChangeMode("list")}
        >
          <List color="#787878" size={18} strokeWidth={2} />
        </Pressable>
        <Pressable
          className={`ml-[10px] h-10 w-10 items-center justify-center rounded-[10px] ${mode === "grid" ? "bg-white shadow-soft" : "bg-transparent"}`}
          onPress={() => onChangeMode("grid")}
        >
          <LayoutGrid color="#787878" size={18} strokeWidth={2} />
        </Pressable>
      </View>
    </View>
  );
}

export function DiscoverySearchResultCard({
  listing,
  onPress,
}: {
  listing: DiscoveryListing;
  onPress?: () => void;
}) {
  return (
    <Pressable
      className="mx-4 flex-row rounded-[18px] bg-white px-[10px] py-[6px] shadow-soft"
      onPress={onPress}
    >
      <View className="h-[100px] w-[120px] overflow-hidden rounded-[14px]">
        <Image source={listing.image} style={{ width: "100%", height: "100%" }} contentFit="cover" />
        <View className="absolute left-3 top-3">
          <ListingBadge badge={listing.badge} />
        </View>
        <View className="absolute right-[6px] top-3 rounded-[8px] bg-white px-[6px] py-[3px]">
          <Text className="text-[13px] font-medium text-[#F37E43]">{listing.price}</Text>
        </View>
      </View>

      <View className="ml-[16px] flex-1 pt-[11px]">
        <View className="flex-row items-start justify-between">
          <Text className="max-w-[82%] text-[18px] font-medium leading-[24px] text-ink">{listing.title}</Text>
          <View className="h-[42px] w-[42px] items-center justify-center rounded-full bg-white shadow-soft">
            <Heart
              color={listing.favorite ? "#F37E43" : "#111111"}
              fill={listing.favorite ? "#F37E43" : "transparent"}
              size={20}
            />
          </View>
        </View>

        <View className="mt-[10px] flex-row items-center">
          <MapPin color="#4FA556" fill="#4FA556" size={16} />
          <Text className="ml-[6px] text-[12px] text-ink">{listing.location}</Text>
          {listing.reviewCount ? (
            <SearchResultRatingRow rating={listing.rating} reviewCount={listing.reviewCount} />
          ) : null}
        </View>

        <View className="mt-[14px] flex-row items-center">
          <StatusPill status={listing.status} />
          <Text className="ml-4 text-[12px] font-medium text-ink">{listing.timeAgo}</Text>
        </View>
      </View>
    </Pressable>
  );
}

export function DiscoveryLocationHeader({
  query,
  onBack,
  onClose,
}: {
  query: string;
  onBack: () => void;
  onClose: () => void;
}) {
  return (
    <View style={{ height: 168, backgroundColor: "#2F66F3" }}>
      <View className="absolute -right-14 -top-10 h-[240px] w-[240px] rounded-full border border-white/10" />
      <View className="absolute right-8 top-0 h-[220px] w-[220px] rounded-full border border-white/10" />
      <View className="px-4 pb-4 pt-3">
        <View className="flex-row items-center justify-between">
          <Pressable
            className="h-12 w-12 items-center justify-center rounded-[16px] bg-[#4A95FB]"
            onPress={onBack}
          >
            <ChevronLeft color="#FFFFFF" size={24} strokeWidth={2.2} />
          </Pressable>
          <Text className="text-[26px] font-semibold text-white">Search</Text>
          <View className="w-12" />
        </View>

        <View className="mt-11 flex-row items-center px-4">
          <View className="h-10 flex-1 flex-row items-center rounded-full bg-white px-5">
            <MapPin color="#111111" size={22} strokeWidth={2} />
            <TextInput
              className="ml-4 flex-1 text-[16px] text-ink"
              defaultValue={query}
              placeholder="Location"
              placeholderTextColor="#8E8E93"
              style={sansText}
            />
            <Pressable onPress={onClose}>
              <X color="#111111" size={20} strokeWidth={2} />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

export function DiscoveryLocationList({
  locations,
  onSelect,
}: {
  locations: string[];
  onSelect?: (location: string) => void;
}) {
  return (
    <View className="px-6 pt-[14px]">
      {locations.map((location, index) => (
        <Pressable
          key={location}
          className={`${index === 0 ? "" : "mt-4"} flex-row items-center py-2`}
          onPress={() => onSelect?.(location)}
        >
          <MapPin color="#111111" fill="#111111" size={28} />
          <Text className="ml-[28px] text-[18px] text-ink" style={sansText}>
            {location}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

function NotificationBadge({
  badge,
}: {
  badge: DiscoveryNotification["badge"];
}) {
  const tone =
    badge === "New"
      ? "bg-[#FFE4D8] text-[#FF8A47]"
      : badge === "Sale"
        ? "bg-[#DDF2FF] text-[#1195F5]"
        : badge === "Deal"
          ? "bg-[#E4F5E3] text-[#54AE5A]"
          : "bg-[#FFD9D3] text-[#FF5D47]";

  return (
    <View className={`rounded-full px-4 py-[6px] ${tone.split(" ")[0]}`}>
      <Text className={`text-[11px] font-medium ${tone.split(" ")[1]}`}>{badge}</Text>
    </View>
  );
}

export function DiscoveryNotificationSegments({
  items,
  activeItem,
  onSelect,
}: {
  items: string[];
  activeItem: string;
  onSelect: (item: string) => void;
}) {
  const widthMap: Record<string, number> = {
    All: 45,
    General: 81,
    Dentist: 77,
    Nutritionist: 102,
    Radiology: 96,
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="pt-[21px]"
      contentContainerStyle={{ gap: 8, paddingLeft: 16, paddingRight: 48 }}
    >
      {items.map((item) => {
        const active = item === activeItem;
        return (
          <Pressable
            key={item}
            className={`h-[34px] items-center justify-center rounded-[14px] px-[14px] ${active ? "bg-[#3769F0]" : "bg-white"}`}
            style={{ width: widthMap[item] ?? undefined }}
            onPress={() => onSelect(item)}
          >
            <Text
              className={`text-[14px] font-medium ${active ? "text-white" : "text-[#595959]"}`}
              style={sansMediumText}
            >
              {item}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export function DiscoveryNotificationCard({
  notification,
}: {
  notification: DiscoveryNotification;
}) {
  const tallCard = notification.badge === "Deal" || notification.badge === "Hot";

  return (
    <View className={`mx-4 rounded-[20px] bg-white px-4 py-4 shadow-soft ${tallCard ? "min-h-[121px]" : "min-h-[106px]"}`}>
      <View className="flex-row">
        <Image
          source={notification.image}
          style={{ width: 70, height: tallCard ? 89 : 74, borderRadius: 20 }}
          contentFit="cover"
        />
        <View className="ml-[22px] flex-1">
          <Text className="text-[18px] font-semibold leading-[24px] text-ink" style={sansBoldText}>
            {notification.title}
          </Text>
          <Text className={`mt-[8px] text-[13px] leading-[18px] text-ink ${tallCard ? "" : "max-h-[18px]"}`} numberOfLines={tallCard ? 2 : 1} style={sansText}>
            {notification.subtitle}
          </Text>
          <View className="mt-[12px] flex-row items-center">
            <NotificationBadge badge={notification.badge} />
            <Text className="ml-4 text-[12px] font-medium text-ink" style={sansMediumText}>
              {notification.timeAgo}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export function DiscoveryFilterSheet({
  onApply,
}: {
  onApply: () => void;
}) {
  const primaryChip = "rounded-[14px] border border-[#D8D8D8] px-7 py-[12px]";
  const selectedChip = "rounded-[14px] bg-[#3769F0] px-7 py-[12px]";

  return (
    <View className="h-[756px] rounded-t-[32px] bg-white">
      <View className="items-center pt-5">
        <View className="h-[6px] w-[60px] rounded-full bg-[#D9D9D9]" />
      </View>
      <ScrollView className="flex-1 px-6 pt-6" contentContainerStyle={{ paddingBottom: 120 }}>
        <View className="flex-row items-center justify-between">
          <Text className="text-[24px] font-semibold text-ink" style={sansBoldText}>Filters</Text>
          <View className="h-6 w-6" />
        </View>

        <View className="mt-10">
          <View className="flex-row items-center justify-between">
            <Text className="text-[20px] font-semibold text-ink" style={sansBoldText}>Price</Text>
            <Text className="text-[20px] text-[#8B8B90]" style={sansText}>$0-$8,000</Text>
          </View>
          <View className="mt-8 flex-row items-center">
            <View className="h-4 w-4 rounded-full border-[5px] border-[#3769F0] bg-white" />
            <View className="h-[3px] flex-1 bg-[#3769F0]" />
            <View className="h-4 w-4 rounded-full border-[5px] border-[#3769F0] bg-white" />
            <View className="h-[3px] flex-1 bg-[#E0E0E0]" />
          </View>
        </View>

        <View className="mt-12">
          <Text className="text-[20px] font-semibold text-ink" style={sansBoldText}>Condition</Text>
          <View className="mt-7 flex-row flex-wrap gap-4">
            <View className={selectedChip}><Text className="text-[15px] font-medium text-white" style={sansMediumText}>New</Text></View>
            <View className={primaryChip}><Text className="text-[15px] text-[#595959]" style={sansText}>Preloved</Text></View>
            <View className={primaryChip}><Text className="text-[15px] text-[#595959]" style={sansText}>Refurbished</Text></View>
          </View>
        </View>

        <View className="mt-12">
          <Text className="text-[20px] font-semibold text-ink" style={sansBoldText}>Seller Type</Text>
          <View className="mt-7 flex-row flex-wrap gap-4">
            <View className={selectedChip}><Text className="text-[15px] font-medium text-white" style={sansMediumText}>Individual</Text></View>
            <View className={primaryChip}><Text className="text-[15px] text-[#595959]" style={sansText}>Dealer</Text></View>
          </View>
        </View>

        <View className="mt-12">
          <Text className="text-[20px] font-semibold text-ink" style={sansBoldText}>Brand</Text>
          <View className="mt-7 flex-row flex-wrap gap-4">
            <View className={selectedChip}><Text className="text-[15px] font-medium text-white" style={sansMediumText}>Audi</Text></View>
            <View className={primaryChip}><Text className="text-[15px] text-[#595959]" style={sansText}>BMW</Text></View>
            <View className={primaryChip}><Text className="text-[15px] text-[#595959]" style={sansText}>Chevrolet</Text></View>
            <View className={primaryChip}><Text className="text-[15px] text-[#595959]" style={sansText}>Daihatsu</Text></View>
            <View className={primaryChip}><Text className="text-[15px] text-[#595959]" style={sansText}>Dodge</Text></View>
            <View className={primaryChip}><Text className="text-[15px] text-[#595959]" style={sansText}>Fiat</Text></View>
            <View className={selectedChip}><Text className="text-[15px] font-medium text-white" style={sansMediumText}>Ford</Text></View>
            <View className={primaryChip}><Text className="text-[15px] text-[#595959]" style={sansText}>Honda</Text></View>
            <View className={primaryChip}><Text className="text-[15px] text-[#595959]" style={sansText}>Hyundai</Text></View>
            <View className={primaryChip}><Text className="text-[15px] text-[#595959]" style={sansText}>Isuzu</Text></View>
            <View className={primaryChip}><Text className="text-[15px] text-[#595959]" style={sansText}>Mazda</Text></View>
            <View className={primaryChip}><Text className="text-[15px] text-[#595959]" style={sansText}>Mitsubishi</Text></View>
            <View className={primaryChip}><Text className="text-[15px] text-[#595959]" style={sansText}>Nissan</Text></View>
            <View className={primaryChip}><Text className="text-[15px] text-[#595959]" style={sansText}>Suzuki</Text></View>
            <View className={primaryChip}><Text className="text-[15px] text-[#595959]" style={sansText}>Toyota</Text></View>
          </View>
        </View>

        <View className="mt-12">
          <Text className="text-[20px] font-semibold text-ink" style={sansBoldText}>Mileage (km)</Text>
          <View className="mt-7 flex-row flex-wrap gap-4">
            <View className={selectedChip}><Text className="text-[15px] font-medium text-white" style={sansMediumText}>0 - 5.000</Text></View>
            <View className={primaryChip}><Text className="text-[15px] text-[#595959]" style={sansText}>5.000 - 50.000</Text></View>
            <View className={primaryChip}><Text className="text-[15px] text-[#595959]" style={sansText}>50.000 - 100.0000</Text></View>
            <View className={primaryChip}><Text className="text-[15px] text-[#595959]" style={sansText}>{"> 100.000"}</Text></View>
          </View>
        </View>
      </ScrollView>

      <View className="border-t border-[#F0F0F0] bg-white px-6 pb-6 pt-5">
        <View className="flex-row items-center">
          <Text className="text-[20px] font-medium text-[#F58C52]" style={sansMediumText}>Reset</Text>
          <Pressable className="ml-8 flex-1 rounded-full bg-[#F58C52] py-5" onPress={onApply}>
            <Text className="text-center text-[20px] font-semibold text-white" style={sansMediumText}>
              Apply Filter
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export function DiscoveryGridCard({
  listing,
  onPress,
  interactive = true,
}: {
  listing: DiscoveryListing;
  onPress?: () => void;
  interactive?: boolean;
}) {
  const content = (
    <View className="w-full rounded-[26px] border border-[#ECECEC] bg-white p-4 shadow-soft">
      <View className="overflow-hidden rounded-[16px]">
        <Image source={listing.image} style={{ width: "100%", height: 142 }} contentFit="cover" />
        <View className="absolute left-3 top-3">
          <ListingBadge badge={listing.badge} />
        </View>
        <View className="absolute right-3 top-3 rounded-[10px] bg-white px-3 py-2">
          <Text className="text-[13px] font-medium text-[#F37E43]" style={sansMediumText}>
            {listing.price}
          </Text>
        </View>
      </View>

      <View className="mt-4 flex-row items-start justify-between">
        <Text className="max-w-[78%] text-[15px] leading-6 text-ink" style={sansMediumText}>
          {listing.title}
        </Text>
        <View className="h-9 w-9 items-center justify-center rounded-full bg-white shadow-soft">
          <Heart
            color={listing.favorite ? "#F37E43" : "#111111"}
            fill={listing.favorite ? "#F37E43" : "transparent"}
            size={18}
          />
        </View>
      </View>
      <RatingRow rating={listing.rating} reviewCount={listing.reviewCount} />
      <View className="mt-3 flex-row items-center">
        <MapPin color="#52A95A" fill="#52A95A" size={15} />
        <Text className="ml-2 text-[12px] text-ink" style={sansText}>
          {listing.location}
        </Text>
      </View>
      <View className="mt-3 flex-row items-center">
        <StatusPill status={listing.status} />
        <Text className="ml-3 text-[12px] text-ink" style={sansText}>
          {listing.timeAgo}
        </Text>
      </View>
    </View>
  );

  if (!interactive || !onPress) {
    return <View className="w-[47.6%]">{content}</View>;
  }

  return (
    <Pressable className="w-[47.6%]" onPress={onPress}>
      {content}
    </Pressable>
  );
}

export function DiscoveryListCard({
  listing,
  onPress,
}: {
  listing: DiscoveryListing;
  onPress?: () => void;
}) {
  return (
    <Pressable className="flex-row rounded-[24px] bg-white p-4 shadow-soft" onPress={onPress}>
      <View className="w-[36%] overflow-hidden rounded-[18px]">
        <Image source={listing.image} style={{ width: "100%", height: 152 }} contentFit="cover" />
        <View className="absolute left-3 top-3">
          <ListingBadge badge={listing.badge} />
        </View>
        <View className="absolute right-3 top-3 rounded-[10px] bg-white px-3 py-2">
          <Text className="text-[13px] font-medium text-[#F37E43]">{listing.price}</Text>
        </View>
      </View>

      <View className="ml-4 flex-1">
        <View className="flex-row items-start justify-between">
          <Text className="max-w-[80%] text-[16px] font-medium leading-6 text-ink">{listing.title}</Text>
          <View className="h-10 w-10 items-center justify-center rounded-full bg-white shadow-soft">
            <Heart
              color={listing.favorite ? "#F37E43" : "#111111"}
              fill={listing.favorite ? "#F37E43" : "transparent"}
              size={20}
            />
          </View>
        </View>
        <View className="mt-3 flex-row items-center">
          <MapPin color="#52A95A" fill="#52A95A" size={16} />
          <Text className="ml-2 text-[12px] text-ink">{listing.city}</Text>
          <View className="ml-4">
            <RatingRow rating={listing.rating} reviewCount={listing.reviewCount} />
          </View>
        </View>
        <View className="mt-5 flex-row items-center">
          <StatusPill status={listing.status} />
          <Text className="ml-3 text-[12px] text-ink">{listing.timeAgo}</Text>
        </View>
      </View>
    </Pressable>
  );
}

export function DiscoveryTopActions({
  leftItems,
  activeLeft,
  rightMode,
  onChangeMode,
}: {
  leftItems: string[];
  activeLeft: string;
  rightMode: "grid" | "list";
  onChangeMode: (mode: "grid" | "list") => void;
}) {
  return (
    <View className="flex-row items-center justify-between">
      <View className="flex-row rounded-[18px] bg-white p-3 shadow-soft">
        {leftItems.map((item) => (
          <View
            key={item}
            className={`rounded-[12px] px-5 py-3 ${item === activeLeft ? "bg-white shadow-soft" : "bg-transparent"}`}
          >
            <Text className={`text-[14px] ${item === activeLeft ? "text-ink" : "text-[#8A8A8A]"}`}>{item}</Text>
          </View>
        ))}
      </View>

      <View className="flex-row rounded-[18px] bg-white p-3 shadow-soft">
        <Pressable
          className={`rounded-[12px] px-4 py-3 ${rightMode === "list" ? "bg-white shadow-soft" : ""}`}
          onPress={() => onChangeMode("list")}
        >
          <Text className="text-[18px] text-[#8A8A8A]">☰</Text>
        </Pressable>
        <Pressable
          className={`rounded-[12px] px-4 py-3 ${rightMode === "grid" ? "bg-white shadow-soft" : ""}`}
          onPress={() => onChangeMode("grid")}
        >
          <Text className="text-[18px] text-[#8A8A8A]">⌘</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function DiscoveryScreenFrame({
  children,
  background = "#F3F3F3",
}: {
  children: React.ReactNode;
  background?: string;
}) {
  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: background }} edges={["top", "bottom"]}>
      {children}
    </SafeAreaView>
  );
}
