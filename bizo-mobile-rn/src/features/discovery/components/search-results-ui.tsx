import { Image } from "expo-image";
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
import { Pressable, ScrollView, Text, TextInput, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type SearchMode = "grid" | "list";

type SearchListing = {
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

const filters = ["Prix ↓", "Localisation", "État", "Catégorie"];

function UrgentBadge() {
  return (
    <View className="absolute left-1 top-1 flex-row items-center rounded px-[6px] py-[2px] shadow-soft" style={{ backgroundColor: "#B79200" }}>
      <Star color="#241A00" fill="#241A00" size={10} strokeWidth={1.5} />
      <Text className="ml-1 text-[8px] font-black text-[#241A00]">URGENT</Text>
    </View>
  );
}

export function SearchResultsHeader({
  query,
  onBack,
  onCancel,
}: {
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
            defaultValue={query}
            placeholder="Rechercher"
            placeholderTextColor="#5F5E5E"
          />
          <X color="#5F5E5E" size={18} strokeWidth={2} />
        </View>
        <Pressable onPress={onCancel}>
          <Text className="text-[14px] font-bold text-[#5F5E5E]">Annuler</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

export function SearchResultsMeta({
  mode,
  onChangeMode,
}: {
  mode: SearchMode;
  onChangeMode: (mode: SearchMode) => void;
}) {
  return (
    <View className="flex-row items-center justify-between px-5 py-4">
      <Text className="text-[12px] font-bold uppercase tracking-[1.2px] text-[#5F5E5E]">124 annonces</Text>
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

export function SearchFilterChips({ onOpenFilter }: { onOpenFilter: () => void }) {
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
      {filters.map((filter) => {
        const selected = filter === "Localisation";
        return (
          <Pressable
            key={filter}
            className={`h-9 flex-row items-center rounded-full border px-4 ${selected ? "border-[#191C1D] bg-[#191C1D]" : "border-[#D1C5AC] bg-white"}`}
            onPress={filter === "Localisation" ? onOpenFilter : undefined}
          >
            <Text className={`text-[12px] font-bold ${selected ? "text-white" : "text-[#4E4633]"}`}>{filter}</Text>
            {selected ? <ChevronDown color="#FFFFFF" size={16} strokeWidth={2} style={{ marginLeft: 4 }} /> : null}
          </Pressable>
        );
      })}
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
  mode,
  onListingPress,
}: {
  mode: SearchMode;
  onListingPress?: (id: string) => void;
}) {
  if (mode === "grid") {
    return (
      <View className="flex-row flex-wrap justify-between gap-y-4 px-5">
        {searchListings.map((listing) => (
          <SearchResultGridCard key={listing.id} listing={listing} onPress={() => onListingPress?.(listing.id)} />
        ))}
      </View>
    );
  }

  return (
    <View className="gap-4 px-5">
      {searchListings.map((listing) => (
        <SearchResultListCard key={listing.id} listing={listing} onPress={() => onListingPress?.(listing.id)} />
      ))}
    </View>
  );
}

function FilterSectionTitle({ children }: { children: string }) {
  return <Text className="text-[12px] font-bold uppercase tracking-[1.1px] text-[#5F5E5E]">{children}</Text>;
}

function SortChip({ label, selected = false }: { label: string; selected?: boolean }) {
  return (
    <View className={`rounded-full border px-6 py-[10px] ${selected ? "border-[#191C1D] bg-[#191C1D]" : "border-[#D1C5AC] bg-[#EDEEEF]"}`}>
      <Text className={`text-[14px] ${selected ? "font-bold text-white" : "text-[#191C1D]"}`}>{label}</Text>
    </View>
  );
}

function ConditionCard({
  label,
  icon,
  selected = false,
}: {
  label: string;
  icon: "sparkles" | "shield" | "thumb" | "package";
  selected?: boolean;
}) {
  const Icon = icon === "sparkles" ? Sparkles : icon === "shield" ? ShieldCheck : icon === "thumb" ? ThumbsUp : Package;

  return (
    <View className={`w-[48%] rounded-xl border p-4 ${selected ? "border-[#191C1D] bg-[#191C1D]" : "border-[#D1C5AC] bg-white"}`}>
      <View className="flex-row items-start justify-between">
        <View>
          <Icon color={selected ? "#FFFFFF" : "#5F5E5E"} size={20} fill={selected && icon === "sparkles" ? "#FFFFFF" : "transparent"} />
          <Text className={`mt-1 text-[14px] ${selected ? "font-bold text-white" : "font-medium text-[#191C1D]"}`}>
            {label}
          </Text>
        </View>
        {selected ? <CheckCircle color="#F5C518" fill="#F5C518" size={20} /> : null}
      </View>
    </View>
  );
}

export function SearchFilterSheet({
  onApply,
  onClose,
}: {
  onApply: () => void;
  onClose: () => void;
}) {
  const { height } = useWindowDimensions();
  const sheetHeight = Math.round(height * 0.85);

  return (
    <View className="overflow-hidden rounded-t-[24px] bg-white shadow-soft" style={{ height: sheetHeight }}>
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
          <View className="mt-4 self-start flex-row items-center rounded-full bg-[#191C1D] px-4 py-[10px] shadow-soft">
            <Text className="text-[14px] text-white">Électronique &gt; Smartphones</Text>
            <X color="#FFFFFF" size={18} strokeWidth={2} style={{ marginLeft: 8 }} />
          </View>
        </View>

        <View>
          <FilterSectionTitle>Trier par</FilterSectionTitle>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4 -mx-5" contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}>
            <SortChip label="Pertinence" selected />
            <SortChip label="Prix croissant ↑" />
            <SortChip label="Prix décroissant ↓" />
            <SortChip label="Plus récent" />
          </ScrollView>
        </View>

        <View>
          <View className="flex-row items-center justify-between">
            <FilterSectionTitle>Fourchette de prix</FilterSectionTitle>
            <Text className="text-[20px] font-black text-[#745B00]">0€ — 500€</Text>
          </View>
          <View className="mt-6 h-6 justify-center">
            <View className="h-[6px] rounded-full bg-[#E1E3E4]" />
            <View className="absolute left-0 h-[6px] w-[60%] rounded-full bg-[#F5C518]" />
            <View className="absolute left-0 h-6 w-6 rounded-full border-4 border-[#F5C518] bg-white shadow-soft" />
            <View className="absolute left-[58%] h-6 w-6 rounded-full border-4 border-[#F5C518] bg-white shadow-soft" />
          </View>
          <View className="mt-5 flex-row gap-4">
            {["0", "500"].map((value, index) => (
              <View key={value} className="flex-1">
                <Text className="absolute -top-2 left-3 z-10 bg-white px-1 text-[10px] font-bold uppercase text-[#5F5E5E]">
                  {index === 0 ? "Min" : "Max"}
                </Text>
                <View className="h-[52px] flex-row items-center rounded-xl border border-[#D1C5AC] bg-white px-4">
                  <Text className="flex-1 text-[16px] text-[#191C1D]">{value}</Text>
                  <Text className="text-[16px] text-[#5F5E5E]">€</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View>
          <FilterSectionTitle>État / Condition</FilterSectionTitle>
          <View className="mt-4 flex-row flex-wrap justify-between gap-y-3">
            <ConditionCard icon="sparkles" label="Neuf" selected />
            <ConditionCard icon="shield" label="Très bon état" />
            <ConditionCard icon="thumb" label="Bon état" />
            <ConditionCard icon="package" label="Occasion" />
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
                <Text className="text-[16px] font-bold text-[#191C1D]">Paris, 75000</Text>
                <Text className="mt-1 text-[14px] text-[#5F5E5E]">Île-de-France, FR</Text>
              </View>
            </View>
            <ChevronRight color="#C8C6C5" size={22} strokeWidth={2} />
          </View>
          <View className="mt-5">
            <View className="flex-row items-center justify-between">
              <Text className="text-[14px] font-medium text-[#5F5E5E]">Rayon</Text>
              <Text className="text-[12px] font-bold text-[#745B00]">25 km</Text>
            </View>
            <View className="mt-3 h-[6px] rounded-full bg-[#E1E3E4]">
              <View className="h-[6px] w-1/4 rounded-full bg-[#F5C518]" />
              <View className="absolute left-[23%] -top-[9px] h-6 w-6 rounded-full border-4 border-white bg-[#F5C518] shadow-soft" />
            </View>
          </View>
        </View>

        <View className="h-3" />
      </ScrollView>

      <View className="flex-row items-center gap-4 border-t border-[#EDEEEF] bg-white px-5 py-6">
        <Pressable className="flex-row items-center px-2 py-4">
          <RotateCcw color="#5F5E5E" size={20} strokeWidth={2} />
          <Text className="ml-2 text-[14px] font-bold text-[#5F5E5E]">Réinitialiser</Text>
        </Pressable>
        <Pressable className="flex-1 flex-row items-center justify-between rounded-full bg-[#191C1D] px-6 py-4 shadow-soft" onPress={onApply}>
          <Text className="text-[16px] font-bold text-white">Voir 124 résultats</Text>
          <ArrowRight color="#FFFFFF" size={22} strokeWidth={2} />
        </Pressable>
      </View>
    </View>
  );
}

export { searchListings };
