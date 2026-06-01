import { Image } from "expo-image";
import * as React from "react";
import {
  ArrowLeftRight,
  ArrowRight,
  Bell,
  CarFront,
  Heart,
  House,
  ImageIcon,
  MapPin,
  MonitorSmartphone,
  Plus,
  Search,
  Shirt,
  SlidersHorizontal,
  Tag,
  User,
} from "lucide-react-native";
import { Animated, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { ListingCategoryId } from "@/src/lib/categories/listing-categories";

const bizoBrandLogo = require("../../../../design/bizo/bizo_brand_logo/brand.png");

type Category = {
  id: string;
  label: string;
  icon: "vehicle" | "home" | "phone" | "fashion" | "more";
  color: string;
  background: string;
  searchCategoryId?: ListingCategoryId;
};

export type Listing = {
  id: string;
  title: string;
  value: string;
  badge: "VENTE" | "TROC" | "TROC+CASH";
  badgeColor: string;
  image?: string | null;
  seller: string;
  meta: string;
  favorite?: boolean;
};

export type CompactListing = {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  image?: string | null;
};

const categories: Category[] = [
  { id: "vehicles", label: "Véhicules", icon: "vehicle", color: "#00687C", background: "#D7F3FA", searchCategoryId: "vehicules" },
  { id: "property", label: "Immobilier", icon: "home", color: "#745B00", background: "#FFE08B", searchCategoryId: "maison" },
  { id: "electronics", label: "Électro", icon: "phone", color: "#006D3B", background: "#D5F2DF", searchCategoryId: "electronique" },
  { id: "fashion", label: "Mode", icon: "fashion", color: "#BA1A1A", background: "#FFDAD6", searchCategoryId: "vetements" },
  { id: "more", label: "Plus", icon: "more", color: "#5F5E5E", background: "#E8EAED" },
];

function CategoryIcon({ category }: { category: Category }) {
  const props = { color: category.color, size: 30, strokeWidth: 2 };

  if (category.icon === "vehicle") return <CarFront {...props} />;
  if (category.icon === "home") return <House {...props} />;
  if (category.icon === "phone") return <MonitorSmartphone {...props} />;
  if (category.icon === "fashion") return <Shirt {...props} />;
  return <Plus {...props} />;
}

function ListingImage({ source, rounded = false }: { source?: string | null; rounded?: boolean }) {
  if (source) {
    return <Image source={source} style={{ width: "100%", height: "100%", borderRadius: rounded ? 12 : 0 }} contentFit="cover" />;
  }

  return (
    <View className={`h-full w-full items-center justify-center bg-[#EDEEEF] ${rounded ? "rounded-xl" : ""}`}>
      <ImageIcon color="#A6AAAD" size={28} strokeWidth={1.8} />
    </View>
  );
}

function SkeletonBlock({ className }: { className: string }) {
  const opacity = React.useRef(new Animated.Value(0.52)).current;

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { duration: 720, toValue: 1, useNativeDriver: true }),
        Animated.timing(opacity, { duration: 720, toValue: 0.52, useNativeDriver: true }),
      ]),
    );

    animation.start();

    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View style={{ opacity }}>
      <View className={`bg-[#E6E8EA] ${className}`} />
    </Animated.View>
  );
}

function ListingCardSkeleton() {
  return (
    <View className="w-[48%] overflow-hidden rounded-[18px] bg-white shadow-soft">
      <SkeletonBlock className="h-[130px] w-full" />
      <View className="p-3">
        <SkeletonBlock className="h-4 w-[82%] rounded-full" />
        <SkeletonBlock className="mt-3 h-5 w-[68%] rounded-full" />
        <View className="mt-3 flex-row items-center justify-between">
          <SkeletonBlock className="h-4 w-[44%] rounded-full" />
          <SkeletonBlock className="h-4 w-[28%] rounded-full" />
        </View>
      </View>
    </View>
  );
}

function HorizontalTradeCardSkeleton() {
  return (
    <View className="w-[200px] overflow-hidden rounded-[18px] bg-white shadow-soft">
      <SkeletonBlock className="h-[100px] w-full" />
      <View className="p-3">
        <SkeletonBlock className="h-4 w-[78%] rounded-full" />
        <SkeletonBlock className="mt-2 h-3 w-[58%] rounded-full" />
      </View>
    </View>
  );
}

function HorizontalDealCardSkeleton() {
  return (
    <View className="w-[160px] rounded-[18px] border border-[#ECEEEF] bg-white p-3 shadow-soft">
      <SkeletonBlock className="h-24 w-full rounded-xl" />
      <SkeletonBlock className="mt-3 h-4 w-[74%] rounded-full" />
      <SkeletonBlock className="mt-2 h-3 w-[62%] rounded-full" />
    </View>
  );
}

function SectionEmptyState({ message }: { message: string }) {
  return (
    <View className="mx-4 rounded-[16px] border border-[#E5E5E5] bg-white px-4 py-4">
      <Text className="text-[12px] font-semibold text-[#5F5E5E]">{message}</Text>
    </View>
  );
}

export function MarketplaceHeader({
  onLocationPress,
  onBellPress,
}: {
  onLocationPress?: () => void;
  onBellPress?: () => void;
}) {
  return (
    <SafeAreaView edges={["top"]} className="bg-white">
      <View className="h-[64px] flex-row items-center justify-between bg-white px-4 shadow-soft">
        <View className="flex-row items-center">
          <Image source={bizoBrandLogo} style={{ width: 92, height: 42 }} contentFit="contain" />
        </View>

        <View className="flex-row items-center">
          <Pressable className="mr-4 flex-row items-center" onPress={onLocationPress}>
            <MapPin color="#5F5E5E" size={18} strokeWidth={2} />
            <Text className="ml-1 text-[12px] font-semibold text-[#5F5E5E]">Abidjan</Text>
          </Pressable>
          <Pressable onPress={onBellPress}>
            <Bell color="#191C1D" size={24} strokeWidth={2} />
            <View className="absolute -right-[2px] top-0 h-2 w-2 rounded-full border border-white bg-[#BA1A1A]" />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

export function MarketplaceSearchBar({ onFilterPress }: { onFilterPress?: () => void }) {
  return (
    <View className="px-4 py-4">
      <View className="h-[52px] flex-row items-center rounded-full border border-[#D8DADC] bg-[#F3F4F5] px-4">
        <Search color="#5F5E5E" size={22} strokeWidth={2} />
        <TextInput
          className="ml-2 flex-1 text-[15px] font-medium text-[#191C1D]"
          placeholder="Rechercher sur Bizo..."
          placeholderTextColor="#8A8F92"
        />
        <View className="mx-3 h-6 w-[1px] bg-[#D8DADC]" />
        <Pressable onPress={onFilterPress}>
          <SlidersHorizontal color="#00687C" size={22} strokeWidth={2} />
        </Pressable>
      </View>
    </View>
  );
}

export function TransactionTabs() {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="mb-4"
      contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}
    >
      <Pressable className="h-[38px] justify-center rounded-full bg-[#2A313D] px-6">
        <Text className="text-[12px] font-bold text-white">Tout</Text>
      </Pressable>
      <Pressable className="h-[38px] flex-row items-center justify-center rounded-full border border-[#00687C] bg-white px-4">
        <ArrowLeftRight color="#00687C" size={18} strokeWidth={2} />
        <Text className="ml-2 text-[12px] font-bold text-[#00687C]">Troc</Text>
      </Pressable>
      <Pressable className="h-[38px] flex-row items-center justify-center rounded-full border border-[#F5C518] bg-white px-4">
        <ArrowLeftRight color="#695200" size={18} strokeWidth={2} />
        <Text className="ml-2 text-[12px] font-bold text-[#695200]">Troc+Cash</Text>
      </Pressable>
    </ScrollView>
  );
}

export function MarketplaceHero() {
  return (
    <View className="mb-8 px-4">
      <View className="h-[140px] overflow-hidden rounded-[28px] bg-[#1A1A1A] p-6 shadow-soft">
        <View className="absolute -bottom-8 -right-5 opacity-15">
          <Tag color="#FFFFFF" size={170} strokeWidth={1.5} />
        </View>
        <View className="relative z-10 flex-1 justify-between">
          <View>
            <View className="mb-2 self-start rounded-full bg-[#F5C518] px-2 py-[2px]">
              <Text className="text-[10px] font-black tracking-[0.8px] text-[#695200]">NOUVEAU</Text>
            </View>
            <Text className="max-w-[190px] text-[24px] font-bold leading-[27px] text-white">
              Trouvez, vendez ou échangez.
            </Text>
          </View>
          <View className="flex-row items-end justify-between">
            <Text className="max-w-[160px] text-[11px] font-medium text-white/70">
              Des milliers d'annonces près de vous.
            </Text>
            <Pressable className="h-8 flex-row items-center rounded-full border border-white px-4">
              <Text className="text-[12px] font-bold text-white">Explorer</Text>
              <ArrowRight color="#FFFFFF" size={16} strokeWidth={2} style={{ marginLeft: 6 }} />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

export function CategoryRail({
  onCategoryPress,
  onViewAll,
}: {
  onCategoryPress?: (categoryId: ListingCategoryId) => void;
  onViewAll?: () => void;
}) {
  return (
    <View className="mb-8">
      <View className="mb-4 flex-row items-center justify-between px-4">
        <Text className="text-[24px] font-bold text-[#191C1D]">Catégories</Text>
        <Pressable onPress={onViewAll}>
          <Text className="text-[12px] font-bold text-[#00687C]">Voir tout</Text>
        </Pressable>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 16, paddingHorizontal: 16 }}
      >
        {categories.map((category) => (
          <Pressable
            key={category.id}
            className="items-center"
            onPress={() => (category.searchCategoryId ? onCategoryPress?.(category.searchCategoryId) : onViewAll?.())}
          >
            <View
              className="h-16 w-16 items-center justify-center rounded-[18px]"
              style={{ backgroundColor: category.background }}
            >
              <CategoryIcon category={category} />
            </View>
            <Text className="mt-2 text-[12px] font-bold text-[#191C1D]">{category.label}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

export function ListingCard({ listing, onPress }: { listing: Listing; onPress?: () => void }) {
  return (
    <Pressable className="w-[48%] overflow-hidden rounded-[18px] bg-white shadow-soft" onPress={onPress}>
      <View className="h-[130px] overflow-hidden">
        <ListingImage source={listing.image} />
        <View className="absolute left-2 top-2 rounded-full px-2 py-[3px]" style={{ backgroundColor: listing.badgeColor }}>
          <Text className="text-[10px] font-black text-white">{listing.badge}</Text>
        </View>
        <View className="absolute right-2 top-2 h-7 w-7 items-center justify-center rounded-full bg-white/85">
          <Heart
            color={listing.favorite ? "#BA1A1A" : "#5F5E5E"}
            fill={listing.favorite ? "#BA1A1A" : "transparent"}
            size={18}
            strokeWidth={2}
          />
        </View>
      </View>
      <View className="p-3">
        <Text className="text-[13px] font-bold text-[#191C1D]" numberOfLines={1}>
          {listing.title}
        </Text>
        <Text
          className={`mt-1 text-[16px] font-bold ${listing.badge === "TROC" ? "text-[#00687C]" : "text-[#F5C518]"}`}
          numberOfLines={1}
        >
          {listing.value}
        </Text>
        <View className="mt-2 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="h-[18px] w-[18px] items-center justify-center rounded-full border border-[#D8DADC] bg-[#F3F4F5]">
              <User color="#5F5E5E" size={10} strokeWidth={2} />
            </View>
            <Text className="ml-[6px] text-[11px] text-[#5F5E5E]" numberOfLines={1}>
              {listing.seller}
            </Text>
          </View>
          <Text className="text-[11px] text-[#8A8F92]" numberOfLines={1}>
            {listing.meta}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export function SectionHeader({
  title,
  subtitle,
  tone = "trade",
}: {
  title: string;
  subtitle?: string;
  tone?: "trade" | "deal";
}) {
  const color = tone === "trade" ? "#00687C" : "#745B00";
  const background = tone === "trade" ? "#D7F3FA" : "#FFE08B";

  return (
    <View className="mb-4 flex-row items-center px-4">
      <View className="h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: background }}>
        {tone === "trade" ? (
          <ArrowLeftRight color={color} size={22} strokeWidth={2.2} />
        ) : (
          <Tag color={color} size={22} strokeWidth={2.2} />
        )}
      </View>
      <View className="ml-2">
        <Text className="text-[24px] font-bold text-[#191C1D]">{title}</Text>
        {subtitle ? <Text className="text-[11px] font-medium text-[#5F5E5E]">{subtitle}</Text> : null}
      </View>
    </View>
  );
}

export function HorizontalTradeCard({ item }: { item: CompactListing }) {
  return (
    <Pressable className="w-[200px] overflow-hidden rounded-[18px] bg-white shadow-soft">
      <View className="h-[100px]">
        <ListingImage source={item.image} />
        {item.badge ? (
          <View className="absolute bottom-2 left-2 rounded bg-[#00687C] px-2 py-[2px]">
            <Text className="text-[9px] font-black text-white">{item.badge}</Text>
          </View>
        ) : null}
      </View>
      <View className="p-3">
        <Text className="text-[12px] font-bold text-[#191C1D]" numberOfLines={1}>
          {item.title}
        </Text>
        <Text className="mt-1 text-[11px] text-[#5F5E5E]" numberOfLines={1}>
          {item.subtitle}
        </Text>
      </View>
    </Pressable>
  );
}

export function HorizontalDealCard({ item }: { item: CompactListing }) {
  return (
    <Pressable className="w-[160px] rounded-[18px] border border-[#ECEEEF] bg-white p-3 shadow-soft">
      <View className="h-24 overflow-hidden rounded-xl">
        <ListingImage rounded source={item.image} />
      </View>
      <Text className="mt-2 text-[14px] font-bold text-[#F5C518]" numberOfLines={1}>
        {item.title}
      </Text>
      <Text className="text-[10px] text-[#5F5E5E]" numberOfLines={1}>
        {item.subtitle}
      </Text>
    </Pressable>
  );
}

export function MarketplaceHome({
  onLocationPress,
  onBellPress,
  onFilterPress,
  onCategoriesPress,
  onCategoryPress,
  onListingPress,
  recentListingsData,
  tradeListingsData,
  dealListingsData,
  isLoading,
  errorMessage,
}: {
  onLocationPress?: () => void;
  onBellPress?: () => void;
  onFilterPress?: () => void;
  onCategoriesPress?: () => void;
  onCategoryPress?: (categoryId: ListingCategoryId) => void;
  onListingPress?: (id: string) => void;
  recentListingsData?: Listing[];
  tradeListingsData?: CompactListing[];
  dealListingsData?: CompactListing[];
  isLoading?: boolean;
  errorMessage?: string | null;
}) {
  const visibleRecentListings = recentListingsData ?? [];
  const visibleTradeListings = tradeListingsData ?? [];
  const visibleDealListings = dealListingsData ?? [];

  return (
    <View className="flex-1 bg-[#FAFAFA]">
      <MarketplaceHeader onBellPress={onBellPress} onLocationPress={onLocationPress} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 126 }}>
        <MarketplaceSearchBar onFilterPress={onFilterPress} />
        <TransactionTabs />
        <MarketplaceHero />
        <CategoryRail onCategoryPress={onCategoryPress} onViewAll={onCategoriesPress} />

        <View className="mb-8 px-4">
          <Text className="mb-4 text-[24px] font-bold text-[#191C1D]">Annonces récentes</Text>
          {errorMessage ? (
            <View className="mb-3 rounded-[16px] border border-[#E5E5E5] bg-white px-4 py-3">
              <Text className="text-[12px] font-semibold text-[#5F5E5E]">{errorMessage}</Text>
            </View>
          ) : null}
          <View className="flex-row justify-between">
            {isLoading ? (
              <>
                <ListingCardSkeleton />
                <ListingCardSkeleton />
              </>
            ) : visibleRecentListings.length ? (
              visibleRecentListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} onPress={() => onListingPress?.(listing.id)} />
              ))
            ) : (
              <View className="w-full">
                <SectionEmptyState message="Aucune annonce récente pour le moment." />
              </View>
            )}
          </View>
        </View>

        <View className="mb-8">
          <SectionHeader title="Trocs à proximité" subtitle="Échanges rapides près de chez vous" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 16, paddingHorizontal: 16 }}
          >
            {isLoading
              ? [0, 1, 2].map((item) => <HorizontalTradeCardSkeleton key={item} />)
              : visibleTradeListings.length
                ? visibleTradeListings.map((item) => (
                    <HorizontalTradeCard key={item.id} item={item} />
                  ))
                : <SectionEmptyState message="Aucun troc disponible pour le moment." />}
          </ScrollView>
        </View>

        <View className="mb-8">
          <SectionHeader title="Les Bons Plans" tone="deal" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 16, paddingHorizontal: 16 }}
          >
            {isLoading
              ? [0, 1, 2].map((item) => <HorizontalDealCardSkeleton key={item} />)
              : visibleDealListings.length
                ? visibleDealListings.map((item) => (
                    <HorizontalDealCard key={item.id} item={item} />
                  ))
                : <SectionEmptyState message="Aucun bon plan disponible pour le moment." />}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}
