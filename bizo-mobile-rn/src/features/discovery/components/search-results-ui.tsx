import { Image } from "expo-image";
import * as React from "react";
import {
  ArrowRight,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Grid2X2,
  Heart,
  List,
  LocateFixed,
  MapPin,
  Package,
  RotateCcw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  ThumbsUp,
  X,
} from "lucide-react-native";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View, useWindowDimensions } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { listingCategories } from "@/src/lib/categories/listing-categories";

type SearchMode = "grid" | "list";

export type SearchFilters = {
  category: string | null;
  city: string;
  condition: string | null;
  maxPrice: string;
  minPrice: string;
  sort: "recent" | "price_asc" | "price_desc";
  type: "VENTE" | "TROC" | "TROC_CASH" | null;
};

export type SearchListing = {
  id: string;
  title: string;
  price: string;
  city: string;
  time: string;
  condition: "Neuf" | "Occasion";
  image: string;
  urgent?: boolean;
  favorite?: boolean;
};

const searchListings: SearchListing[] = [
  {
    id: "iphone-13-pro-256-graphite",
    title: "iPhone 13 Pro - 256GB Graphite",
    price: "749 €",
    city: "Paris 16e",
    time: "il y a 3h",
    condition: "Occasion",
    urgent: true,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDlgbbZ85syNqtG1y0mvmmKlSbDXLaQFGlzNTp2vX_1S2Jw7zOBaVTg5jkUwPdIKfegzuOJ__k6xUHyqLSnE9-A3YuJG33jGl2G2JXQ8aVVDaX1TH-4KtJelQXsxNi25lSGcidPxQ5GjixbooiTH5Z57J8JUu_sbksBF7_ScYRvLK4aU3x_9GrlCsaC2MO5_gaenXauryn1ERJt5VC50DdU_r1Vwtk0Yu-5UrOv_0dtOCdFEyDT_YncLZTyTN8S4NeWdh91yu5VE-k",
  },
  {
    id: "iphone-13-128-rose",
    title: "iPhone 13 128GB Rose Neuf",
    price: "620 €",
    city: "Lyon",
    time: "il y a 5h",
    condition: "Neuf",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD3-_bHPT6bOQoG75gsQZ5DzcqVM5Ly3UAKd7ncLKsBBHxfZCHByIH8cTxSqeK3Ft5AXUfEDADKoBj_VBLbeq9JwC2iSj9x0UxJZGDES9_Spzo_kvq3Yk0Mq__OYvwrFE9kEPKG_gHIvqs5EMC3hK6AyBoL4q6u2h9bAenkdMj0cEKZ_cgpwnR3kB6Uq4-yIxSd2ykOkwo8b2ArL2UfTyLeMmgsVacxG3SibkJkRD1KVjgMipWByQPsGOIEL3mySwnEWuDC0OWlgQA",
  },
  {
    id: "iphone-13-pro-max-blue",
    title: "iPhone 13 Pro Max - Blue Sierra",
    price: "810 €",
    city: "Bordeaux",
    time: "il y a 1j",
    condition: "Occasion",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDSUoRrfKxXvmTNr4tb7TbrdJitS1HRf2Ldt3OAiNz-16fULXAP-ibZoPo0CzRxNwPlwpzTXDvD58C-Pveyf8RPoS-TOvVYHna-g2ofRzZdqBGCoo1HD3RD9dPg0LC25-WuALy2XZteMAvOPOz_vZkXPrlZox8X0Deco0_B2asdQMT3A-yp7ev4rmTQZEEvPeGDNCecteOzWZs3W5JipDF4cpVjZtVq2xPLu3c9HAq99aneKn16SB0cvuf4VEiKR1QQ5Ve7dr6JI7M",
  },
  {
    id: "iphone-13-mini-128",
    title: "iPhone 13 Mini - 128GB Lumière",
    price: "490 €",
    city: "Nantes",
    time: "il y a 2j",
    condition: "Occasion",
    urgent: true,
    favorite: true,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDpWeGQZ9QwWhJlab-jKUqZbsYYL5TJDAIKtXA4Bl24TV4F-01Suw85HlSXOHO8a7qyT5B9HWFw27RsLXjdy1szcDm48Yws0NHkLDvwFioAvtxo66RV9zjLw_KfCm2mXUM2OoTEj8rNynkQ7xwuVlB9wJvRF1WM2WqcZedOyUlRKIq9J2r0XqO9tBbDP39RvMkEIGZ_-kKLogv-cqydwrCgJnmGzYnQUoJbFW9eWtkqPx4NnOJoyirV6T-N2EiUIgaHKC0Y5igHqKY",
  },
];

function UrgentBadge() {
  return (
    <View className="absolute left-1 top-1 flex-row items-center rounded px-[6px] py-[2px] shadow-soft" style={{ backgroundColor: "#B79200" }}>
      <Star color="#241A00" fill="#241A00" size={10} strokeWidth={1.5} />
      <Text className="ml-1 text-[8px] font-black text-[#241A00]">URGENT</Text>
    </View>
  );
}

export function SearchResultsHeader({
  onChangeQuery,
  query,
  onBack,
  onCancel,
}: {
  onChangeQuery: (query: string) => void;
  query: string;
  onBack: () => void;
  onCancel: () => void;
}) {
  return (
    <SafeAreaView edges={["top"]} className="border-b border-[#E1E3E4] bg-[#F8F9FA] shadow-soft">
      <View className="h-[58px] flex-row items-center gap-3 px-4">
        <Pressable className="h-8 w-8 items-center justify-center" onPress={onBack}>
          <ChevronLeft color="#191C1D" size={26} strokeWidth={2} />
        </Pressable>
        <View className="h-10 flex-1 flex-row items-center rounded-full bg-[#F3F4F5] px-4">
          <Search color="#5F5E5E" size={20} strokeWidth={2} />
          <TextInput
            className="ml-2 flex-1 text-[14px] font-bold text-[#191C1D]"
            onChangeText={onChangeQuery}
            placeholder="Rechercher"
            placeholderTextColor="#5F5E5E"
            value={query}
          />
          {query ? (
            <Pressable onPress={() => onChangeQuery("")}>
              <X color="#5F5E5E" size={18} strokeWidth={2} />
            </Pressable>
          ) : null}
        </View>
        <Pressable onPress={onCancel}>
          <Text className="text-[14px] font-bold text-[#5F5E5E]">Annuler</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

export function SearchResultsMeta({
  isLoading,
  mode,
  onChangeMode,
  total,
}: {
  isLoading?: boolean;
  mode: SearchMode;
  onChangeMode: (mode: SearchMode) => void;
  total: number;
}) {
  return (
    <View className="flex-row items-center justify-between px-5 py-4">
      <View className="flex-row items-center">
        <Text className="text-[12px] font-bold uppercase tracking-[1.2px] text-[#5F5E5E]">{total} annonce{total > 1 ? "s" : ""}</Text>
        {isLoading ? <ActivityIndicator color="#5B5BD6" size="small" style={{ marginLeft: 8 }} /> : null}
      </View>
      <View className="flex-row rounded-full bg-[#EDEEEF] p-1">
        <Pressable
          className={`h-8 w-8 items-center justify-center rounded-full ${mode === "list" ? "bg-[#191C1D]" : "bg-transparent"}`}
          onPress={() => onChangeMode("list")}
        >
          <List color={mode === "list" ? "#FFFFFF" : "#5F5E5E"} size={18} strokeWidth={2} />
        </Pressable>
        <Pressable
          className={`h-8 w-8 items-center justify-center rounded-full ${mode === "grid" ? "bg-[#191C1D]" : "bg-transparent"}`}
          onPress={() => onChangeMode("grid")}
        >
          <Grid2X2 color={mode === "grid" ? "#FFFFFF" : "#5F5E5E"} size={18} strokeWidth={2} />
        </Pressable>
      </View>
    </View>
  );
}

function getActiveFilterChips(filters: SearchFilters): string[] {
  const chips: string[] = [];
  const category = listingCategories.find((item) => item.id === filters.category);

  if (category) chips.push(category.label);
  if (filters.city.trim()) chips.push(filters.city.trim());
  if (filters.type === "VENTE") chips.push("Vente");
  if (filters.type === "TROC") chips.push("Troc");
  if (filters.type === "TROC_CASH") chips.push("Troc + cash");
  if (filters.condition) chips.push(filters.condition === "neuf" ? "Neuf" : filters.condition === "excellent" ? "Très bon" : filters.condition === "bon" ? "Bon" : "Correct");
  if (filters.minPrice || filters.maxPrice) chips.push(`${filters.minPrice || "0"} - ${filters.maxPrice || "max"} FCFA`);
  if (filters.sort === "price_asc") chips.push("Prix croissant");
  if (filters.sort === "price_desc") chips.push("Prix décroissant");

  return chips;
}

export function SearchFilterChips({ filters, onOpenFilter }: { filters: SearchFilters; onOpenFilter: () => void }) {
  const activeChips = getActiveFilterChips(filters);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="mb-6"
      contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}
    >
      <Pressable className="h-9 flex-row items-center rounded-full bg-[#191C1D] px-4" onPress={onOpenFilter}>
        <SlidersHorizontal color="#FFFFFF" size={18} strokeWidth={2} />
        <Text className="ml-[6px] text-[12px] font-bold text-white">Filtres</Text>
      </Pressable>
      {(activeChips.length ? activeChips : ["Catégorie", "Prix", "Localisation", "État"]).map((filter) => (
        <Pressable
          key={filter}
          className={`h-9 flex-row items-center rounded-full border px-4 ${activeChips.length ? "border-[#191C1D] bg-[#191C1D]" : "border-[#D1C5AC] bg-white"}`}
          onPress={onOpenFilter}
        >
          <Text className={`text-[12px] font-bold ${activeChips.length ? "text-white" : "text-[#4E4633]"}`}>{filter}</Text>
          {activeChips.length ? <ChevronDown color="#FFFFFF" size={16} strokeWidth={2} style={{ marginLeft: 4 }} /> : null}
        </Pressable>
      ))}
    </ScrollView>
  );
}

export function SearchResultListCard({
  listing,
  onPress,
}: {
  listing: SearchListing;
  onPress?: () => void;
}) {
  return (
    <Pressable className="relative flex-row gap-4 rounded-xl bg-white p-3 shadow-soft" onPress={onPress}>
      <View className="h-[90px] w-[90px] overflow-hidden rounded-lg bg-[#EDEEEF]">
        <Image source={listing.image} style={{ width: "100%", height: "100%" }} contentFit="cover" />
        {listing.urgent ? <UrgentBadge /> : null}
      </View>
      <View className="min-w-0 flex-1 justify-between py-[2px]">
        <Text className="pr-7 text-[14px] font-bold leading-[18px] text-[#191C1D]" numberOfLines={1}>
          {listing.title}
        </Text>
        <Text className="text-[20px] font-black text-[#F5C518]">{listing.price}</Text>
        <View className="flex-row items-center">
          <View className="flex-row items-center">
            <MapPin color="#5F5E5E" size={14} strokeWidth={2} />
            <Text className="ml-[2px] text-[11px] text-[#5F5E5E]">{listing.city}</Text>
          </View>
          <View className="ml-3 flex-row items-center">
            <Clock3 color="#5F5E5E" size={14} strokeWidth={2} />
            <Text className="ml-[2px] text-[11px] text-[#5F5E5E]">{listing.time}</Text>
          </View>
          <View className="ml-3 rounded-full bg-[#191C1D] px-2 py-[2px]">
            <Text className="text-[9px] font-bold text-white">{listing.condition}</Text>
          </View>
        </View>
      </View>
      <Heart
        color={listing.favorite ? "#BA1A1A" : "#5F5E5E"}
        fill={listing.favorite ? "#BA1A1A" : "transparent"}
        size={20}
        strokeWidth={2}
        style={{ position: "absolute", right: 16, top: 16 }}
      />
    </Pressable>
  );
}

export function SearchResultGridCard({
  listing,
  onPress,
}: {
  listing: SearchListing;
  onPress?: () => void;
}) {
  return (
    <Pressable className="w-[48%] overflow-hidden rounded-xl bg-white shadow-soft" onPress={onPress}>
      <View className="h-[118px] overflow-hidden bg-[#EDEEEF]">
        <Image source={listing.image} style={{ width: "100%", height: "100%" }} contentFit="cover" />
        {listing.urgent ? <UrgentBadge /> : null}
        <View className="absolute right-2 top-2 h-7 w-7 items-center justify-center rounded-full bg-white/85">
          <Heart
            color={listing.favorite ? "#BA1A1A" : "#5F5E5E"}
            fill={listing.favorite ? "#BA1A1A" : "transparent"}
            size={17}
          />
        </View>
      </View>
      <View className="p-3">
        <Text className="text-[13px] font-bold leading-[17px] text-[#191C1D]" numberOfLines={2}>
          {listing.title}
        </Text>
        <Text className="mt-1 text-[18px] font-black text-[#F5C518]">{listing.price}</Text>
        <View className="mt-2 flex-row items-center justify-between">
          <Text className="text-[10px] text-[#5F5E5E]" numberOfLines={1}>
            {listing.city}
          </Text>
          <Text className="rounded-full bg-[#191C1D] px-2 py-[2px] text-[9px] font-bold text-white">
            {listing.condition}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export function SearchResultsContent({
  isLoading,
  listings,
  mode,
  onListingPress,
}: {
  isLoading?: boolean;
  listings: SearchListing[];
  mode: SearchMode;
  onListingPress?: (id: string) => void;
}) {
  if (isLoading) {
    return (
      <View className="items-center justify-center px-5 py-16">
        <ActivityIndicator color="#F5C518" size="large" />
        <Text className="mt-4 text-[14px] font-semibold text-[#5F5E5E]">Recherche en cours...</Text>
      </View>
    );
  }

  if (listings.length === 0) {
    return (
      <View className="items-center justify-center px-8 py-16">
        <Text className="text-center text-[20px] font-black text-[#191C1D]">Aucun résultat</Text>
        <Text className="mt-2 text-center text-[14px] leading-5 text-[#5F5E5E]">Essayez une autre recherche ou retirez quelques filtres.</Text>
      </View>
    );
  }

  if (mode === "grid") {
    return (
      <View className="flex-row flex-wrap justify-between gap-y-4 px-5">
        {listings.map((listing) => (
          <SearchResultGridCard key={listing.id} listing={listing} onPress={() => onListingPress?.(listing.id)} />
        ))}
      </View>
    );
  }

  return (
    <View className="gap-4 px-5">
      {listings.map((listing) => (
        <SearchResultListCard key={listing.id} listing={listing} onPress={() => onListingPress?.(listing.id)} />
      ))}
    </View>
  );
}

function FilterSectionTitle({ children }: { children: string }) {
  return <Text className="text-[12px] font-bold uppercase tracking-[1.1px] text-[#5F5E5E]">{children}</Text>;
}

function SortChip({ label, onPress, selected = false }: { label: string; onPress: () => void; selected?: boolean }) {
  return (
    <Pressable className={`rounded-full border px-6 py-[10px] ${selected ? "border-[#191C1D] bg-[#191C1D]" : "border-[#D1C5AC] bg-[#EDEEEF]"}`} onPress={onPress}>
      <Text className={`text-[14px] ${selected ? "font-bold text-white" : "text-[#191C1D]"}`}>{label}</Text>
    </Pressable>
  );
}

function ConditionCard({
  label,
  icon,
  onPress,
  selected = false,
}: {
  label: string;
  icon: "sparkles" | "shield" | "thumb" | "package";
  onPress: () => void;
  selected?: boolean;
}) {
  const Icon = icon === "sparkles" ? Sparkles : icon === "shield" ? ShieldCheck : icon === "thumb" ? ThumbsUp : Package;

  return (
    <Pressable className={`w-[48%] rounded-xl border p-4 ${selected ? "border-[#191C1D] bg-[#191C1D]" : "border-[#D1C5AC] bg-white"}`} onPress={onPress}>
      <View className="flex-row items-start justify-between">
        <View>
          <Icon color={selected ? "#FFFFFF" : "#5F5E5E"} size={20} fill={selected && icon === "sparkles" ? "#FFFFFF" : "transparent"} />
          <Text className={`mt-1 text-[14px] ${selected ? "font-bold text-white" : "font-medium text-[#191C1D]"}`}>
            {label}
          </Text>
        </View>
        {selected ? <CheckCircle color="#F5C518" fill="#F5C518" size={20} /> : null}
      </View>
    </Pressable>
  );
}

export function SearchFilterSheet({
  filters,
  onApply,
  onClose,
  onReset,
}: {
  filters: SearchFilters;
  onApply: (filters: SearchFilters) => void;
  onClose: () => void;
  onReset: () => void;
}) {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const bottomNavigationOffset = Math.max(insets.bottom + 18, 40);
  const sheetHeight = Math.round(height * 0.85);
  const [draft, setDraft] = React.useState(filters);
  const updateDraft = (patch: Partial<SearchFilters>) => setDraft((current) => ({ ...current, ...patch }));
  const category = listingCategories.find((item) => item.id === draft.category);
  const resultLabel = "Appliquer les filtres";

  return (
    <View
      className="overflow-hidden rounded-t-[24px] bg-white shadow-soft"
      style={{ height: Math.min(sheetHeight, height - bottomNavigationOffset - 28), marginBottom: bottomNavigationOffset }}
    >
      <View className="items-center pb-2 pt-3">
        <View className="h-[6px] w-10 rounded-full bg-[#D1D5DB]" />
      </View>
      <View className="flex-row items-center justify-between border-b border-[#EDEEEF] px-5 py-4">
        <Text className="text-[22px] font-black text-[#191C1D]">Filtres</Text>
        <Pressable className="h-10 w-10 items-center justify-center rounded-full bg-[#EDEEEF]" onPress={onClose}>
          <X color="#191C1D" size={20} strokeWidth={2} />
        </Pressable>
      </View>

      <ScrollView className="flex-1 px-5" contentContainerStyle={{ gap: 32, paddingBottom: 48, paddingTop: 24 }}>
        <View>
          <FilterSectionTitle>Catégorie</FilterSectionTitle>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4 -mx-5" contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}>
            <Pressable className={`rounded-full border px-4 py-[10px] ${draft.category === null ? "border-[#191C1D] bg-[#191C1D]" : "border-[#D1C5AC] bg-white"}`} onPress={() => updateDraft({ category: null })}>
              <Text className={`text-[13px] font-bold ${draft.category === null ? "text-white" : "text-[#191C1D]"}`}>Toutes</Text>
            </Pressable>
            {listingCategories.map((item) => (
              <Pressable key={item.id} className={`rounded-full border px-4 py-[10px] ${draft.category === item.id ? "border-[#191C1D] bg-[#191C1D]" : "border-[#D1C5AC] bg-white"}`} onPress={() => updateDraft({ category: item.id })}>
                <Text className={`text-[13px] font-bold ${draft.category === item.id ? "text-white" : "text-[#191C1D]"}`}>{item.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
          {category ? <Text className="mt-3 text-[12px] font-semibold text-[#5F5E5E]">Filtre actif: {category.label}</Text> : null}
        </View>

        <View>
          <FilterSectionTitle>Trier par</FilterSectionTitle>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4 -mx-5" contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}>
            <SortChip label="Plus récent" selected={draft.sort === "recent"} onPress={() => updateDraft({ sort: "recent" })} />
            <SortChip label="Prix croissant" selected={draft.sort === "price_asc"} onPress={() => updateDraft({ sort: "price_asc" })} />
            <SortChip label="Prix décroissant" selected={draft.sort === "price_desc"} onPress={() => updateDraft({ sort: "price_desc" })} />
          </ScrollView>
        </View>

        <View>
          <FilterSectionTitle>Type d’annonce</FilterSectionTitle>
          <View className="mt-4 flex-row flex-wrap gap-2">
            {[
              { label: "Tous", value: null },
              { label: "Vente", value: "VENTE" },
              { label: "Troc", value: "TROC" },
              { label: "Troc + cash", value: "TROC_CASH" },
            ].map((item) => {
              const selected = draft.type === item.value;

              return (
                <Pressable key={item.label} className={`rounded-full border px-4 py-[10px] ${selected ? "border-[#191C1D] bg-[#191C1D]" : "border-[#D1C5AC] bg-white"}`} onPress={() => updateDraft({ type: item.value as SearchFilters["type"] })}>
                  <Text className={`text-[13px] font-bold ${selected ? "text-white" : "text-[#191C1D]"}`}>{item.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View>
          <View className="flex-row items-center justify-between">
            <FilterSectionTitle>Fourchette de prix</FilterSectionTitle>
            <Text className="text-[14px] font-black text-[#745B00]">FCFA</Text>
          </View>
          <View className="mt-5 flex-row gap-4">
            {[
              { key: "minPrice", value: draft.minPrice },
              { key: "maxPrice", value: draft.maxPrice },
            ].map((item, index) => (
              <View key={item.key} className="flex-1">
                <Text className="absolute -top-2 left-3 z-10 bg-white px-1 text-[10px] font-bold uppercase text-[#5F5E5E]">
                  {index === 0 ? "Min" : "Max"}
                </Text>
                <View className="h-[52px] flex-row items-center rounded-xl border border-[#D1C5AC] bg-white px-4">
                  <TextInput
                    className="flex-1 text-[16px] text-[#191C1D]"
                    keyboardType="number-pad"
                    onChangeText={(value) => updateDraft({ [item.key]: value.replace(/[^\d]/g, "") } as Partial<SearchFilters>)}
                    placeholder={index === 0 ? "0" : "Max"}
                    value={item.value}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        <View>
          <FilterSectionTitle>État / Condition</FilterSectionTitle>
          <View className="mt-4 flex-row flex-wrap justify-between gap-y-3">
            <ConditionCard icon="sparkles" label="Neuf" selected={draft.condition === "neuf"} onPress={() => updateDraft({ condition: draft.condition === "neuf" ? null : "neuf" })} />
            <ConditionCard icon="shield" label="Très bon état" selected={draft.condition === "excellent"} onPress={() => updateDraft({ condition: draft.condition === "excellent" ? null : "excellent" })} />
            <ConditionCard icon="thumb" label="Bon état" selected={draft.condition === "bon"} onPress={() => updateDraft({ condition: draft.condition === "bon" ? null : "bon" })} />
            <ConditionCard icon="package" label="État correct" selected={draft.condition === "correct"} onPress={() => updateDraft({ condition: draft.condition === "correct" ? null : "correct" })} />
          </View>
        </View>

        <View>
          <FilterSectionTitle>Localisation</FilterSectionTitle>
          <View className="mt-4 flex-row items-center justify-between rounded-xl border border-[#D1C5AC] bg-white p-4">
            <View className="flex-row items-center">
              <View className="h-12 w-12 items-center justify-center rounded-full bg-[#E4E5FF]">
                <MapPin color="#5B5BD6" size={24} strokeWidth={2} />
              </View>
              <View className="ml-4">
                <Text className="text-[12px] font-bold uppercase tracking-[1px] text-[#5F5E5E]">Ville</Text>
                <TextInput
                  className="mt-1 min-w-[190px] text-[16px] font-bold text-[#191C1D]"
                  onChangeText={(city) => updateDraft({ city })}
                  placeholder="Ex: Cotonou"
                  value={draft.city}
                />
              </View>
            </View>
          </View>
        </View>

        <View className="h-3" />
      </ScrollView>

      <View
        className="flex-row items-center gap-4 border-t border-[#EDEEEF] bg-white px-5 pt-4"
        style={{ paddingBottom: Math.max(insets.bottom + 92, 118) }}
      >
        <Pressable className="flex-row items-center px-2 py-4" onPress={onReset}>
          <RotateCcw color="#5F5E5E" size={20} strokeWidth={2} />
          <Text className="ml-2 text-[14px] font-bold text-[#5F5E5E]">Réinitialiser</Text>
        </Pressable>
        <Pressable className="flex-1 flex-row items-center justify-between rounded-full bg-[#191C1D] px-6 py-4 shadow-soft" onPress={() => onApply(draft)}>
          <Text className="text-[16px] font-bold text-white">{resultLabel}</Text>
          <ArrowRight color="#FFFFFF" size={22} strokeWidth={2} />
        </Pressable>
      </View>
    </View>
  );
}

export { searchListings };
