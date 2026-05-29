import { Image } from "expo-image";
import {
  ArrowLeftRight,
  ArrowRight,
  Bell,
  CarFront,
  Heart,
  House,
  MapPin,
  MonitorSmartphone,
  Plus,
  Search,
  Shirt,
  SlidersHorizontal,
  Tag,
  User,
} from "lucide-react-native";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const bizoBrandLogo = require("../../../../design/bizo/bizo_brand_logo/brand.png");

type Category = {
  id: string;
  label: string;
  icon: "vehicle" | "home" | "phone" | "fashion" | "more";
  color: string;
  background: string;
};

export type Listing = {
  id: string;
  title: string;
  value: string;
  badge: "VENTE" | "TROC" | "TROC+CASH";
  badgeColor: string;
  image: string;
  seller: string;
  meta: string;
  favorite?: boolean;
};

export type CompactListing = {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  image: string;
};

const categories: Category[] = [
  { id: "vehicles", label: "Véhicules", icon: "vehicle", color: "#00687C", background: "#D7F3FA" },
  { id: "property", label: "Immobilier", icon: "home", color: "#745B00", background: "#FFE08B" },
  { id: "electronics", label: "Électro", icon: "phone", color: "#006D3B", background: "#D5F2DF" },
  { id: "fashion", label: "Mode", icon: "fashion", color: "#BA1A1A", background: "#FFDAD6" },
  { id: "more", label: "Plus", icon: "more", color: "#5F5E5E", background: "#E8EAED" },
];

const recentListings: Listing[] = [
  {
    id: "sony-wh-1000xm4",
    title: "Sony WH-1000XM4",
    value: "185,000 FCFA",
    badge: "VENTE",
    badgeColor: "#2A313D",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAquGbs5XEpp5Ve_MPFdWdE3PMBBhFXuCg5lkAkxMHwr4f9x1keBLbtcCSY8vV1a0sKKGgnamXaSLKPai5rPN4hnhaN0KKgVrxAYYXCHJ9yZMGY6MPog1kA_kObUSScM8UjLdBLyptQ8TqqDKIvQFlOkSZPsdjKhs557HAV96hftqY39O1cju51h41vTCwt5QulWKzardOda-Ctk5QV4dOWULy_BV0LbrzFQntnkreliaOEd3fvHevMHZtYd4eZyrdtSquLtu8wVac",
    seller: "Yannick",
    meta: "Il y a 2h",
  },
  {
    id: "iphone-13-pro",
    title: "iPhone 13 Pro 256G",
    value: "Contre Samsung",
    badge: "TROC",
    badgeColor: "#00687C",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAu-3CP6vOwWMnmAfpcC6UU9lJ-Jnb88E-3TQB2ywUJ4UrzL1-YNcqhUb85KAlgvGyraMUeXeigr0WP6ZL98ZAXS3-x40WIBePGeVNZU_aFBDjd1PJFWOiOs0QR02wH6_jHHOhmOjMIKHrNx6UCiH-CX2XAnIv41T4HEO8S-wm2wJkvj8HN__P9To3FGuqCodf0u5BRgC0C-ukJnPNVT4T6c6MKr-X1EOfZmL_L6sDV8PTLoElOrgp_FN52qyfJ5IQ38U-S94LH-Jc",
    seller: "Sarah G.",
    meta: "Cocody",
    favorite: true,
  },
];

const tradeListings: CompactListing[] = [
  {
    id: "nike-air-max",
    title: "Nike Air Max Limited",
    subtitle: "Contre Jordan 4 + 10k",
    badge: "TROC+CASH",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD2p4XTm4nI_C0sUTBWefXKjSI7s_TRSCDAzVr_q34hVSGEHJtVdH0v-xTbn34nQFonHkOyBNoYwj7Kj45-OchxcfErCTPNoh95qVMZZL6TX2uDiesHBbHzsqxjTuj9tD09P-XEZJick__xVB8_xOtHqfU_uwqbNchZxdzPqoONky61tjkel6vAwgfAbjFww0Vu9ZzD2K0D4l0K7LIa3T8cQIb3JFqhGQBzdI3CJTvZrG24oMt_2CpND2WJ0KMOzZpKvzszvpr3tAE",
  },
  {
    id: "macbook-air-m1",
    title: "MacBook Air M1 2020",
    subtitle: "Contre PC Gaming",
    badge: "TROC",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC2ca28xCI8Oy8vuWVRcrj-1BXZeJXEkD_KsSWfyHrDVKvvCGuLJSGRRz4wtZpQAQgxJf_Z9ltmvzcDj-5NFGlsGzOcdNvgULtv6uhmkt4wPBQJTRC2BbhaefYhqPkfrwfWaVZYMosXgn5fANGzf2AZ2YTAMVztKTc6MfwebM0LKdgGJqef01kq5CDoc-x4E6AkAkQp8is4sj2hgqu7d7RyTrhEdVbfKlAC91z4jD5e0IRlmz0uGwoN9vaB_cfzSvTeUQg23wQZjjg",
  },
];

const dealListings: CompactListing[] = [
  {
    id: "fauteuil-design",
    title: "45,000 FCFA",
    subtitle: "Fauteuil Design",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDuDeFdqb5_sybJG4fE4HfPKyLYJtK7OGU6j2IpwDCDKMgxgAm9aqEuWlR7KckhnFqR6_XdwvsBryr02gp25G0jZKNwoXmaQsunjLX24MZFp7hgghziYw2U1G0rtLm-xMsVPM17dXAEGPnfNKpgIgBfGaVtpqfw6XMe2ovKv3QYIdpZOqV_3muqNOKl3ctUZ85RsvJfdAK67Igqkyap9SVhEPAmLf_h5olLKKLaVbR1TLOAKUrPkhkscIz75CV6WzrsXLtR3WxTIVk",
  },
  {
    id: "vtt-cross",
    title: "120,000 FCFA",
    subtitle: "VTT Cross 200",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuARU7RGjoEFjZ682tyoqngPWdYGSpCpVz_FN-mYgbBPFelXw0vyYC2kJs6boNIJusVz2b2sAiNI2tcOuCRLJnSk05QE2hYh2rbeGZmlUYqtkqNu9DCzmfmQF71cEA_4pIykWxh4DNzJLIYko0fcTOw1_Nz-_VaxUAwB1W2NHsTW5hTuYpKUg_UYYeXuwJA8txb98GOg33B84o1s_8YHf0fSHFTZxpCMgC3bQ3ZcbydT-lE2kEce1qlSNLAULkt7N-38tfbkVTXtSt0",
  },
  {
    id: "montre-quartz",
    title: "15,000 FCFA",
    subtitle: "Montre Quartz",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCPnrfVzgazjC7cOwtBo5a3Xd4NWSqVM7MTAgr0olEwkdBY6j0OSGgZL1ZK4b-FnyA-JOilAehJSd0Ar4gK1qKMfDxq1N_EgA11gaDcZO-xaq4ubSKT2qsfQROpGIlhl9qP-q99k9PSskcul1yYRzGusypwnZB5aC43huhVEJR8hsIJPVgzhlX5gAz5rNyAv8yiVm-u9G6aQwkaBbNGA3_qga7UHmtkhGAAwd18O0kyC0ms_46RP3ybus3-hr6FxxkHSRa5F0WBaKQ",
  },
];

function CategoryIcon({ category }: { category: Category }) {
  const props = { color: category.color, size: 30, strokeWidth: 2 };

  if (category.icon === "vehicle") return <CarFront {...props} />;
  if (category.icon === "home") return <House {...props} />;
  if (category.icon === "phone") return <MonitorSmartphone {...props} />;
  if (category.icon === "fashion") return <Shirt {...props} />;
  return <Plus {...props} />;
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

export function CategoryRail({ onViewAll }: { onViewAll?: () => void }) {
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
          <Pressable key={category.id} className="items-center">
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
        <Image source={listing.image} style={{ width: "100%", height: "100%" }} contentFit="cover" />
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
        <Image source={item.image} style={{ width: "100%", height: "100%" }} contentFit="cover" />
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
      <Image source={item.image} style={{ width: "100%", height: 96, borderRadius: 12 }} contentFit="cover" />
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
  onListingPress?: (id: string) => void;
  recentListingsData?: Listing[];
  tradeListingsData?: CompactListing[];
  dealListingsData?: CompactListing[];
  isLoading?: boolean;
  errorMessage?: string | null;
}) {
  const visibleRecentListings = recentListingsData?.length ? recentListingsData : recentListings;
  const visibleTradeListings = tradeListingsData?.length ? tradeListingsData : tradeListings;
  const visibleDealListings = dealListingsData?.length ? dealListingsData : dealListings;

  return (
    <View className="flex-1 bg-[#FAFAFA]">
      <MarketplaceHeader onBellPress={onBellPress} onLocationPress={onLocationPress} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 126 }}>
        <MarketplaceSearchBar onFilterPress={onFilterPress} />
        <TransactionTabs />
        <MarketplaceHero />
        <CategoryRail onViewAll={onCategoriesPress} />

        <View className="mb-8 px-4">
          <Text className="mb-4 text-[24px] font-bold text-[#191C1D]">Annonces récentes</Text>
          {isLoading || errorMessage ? (
            <View className="mb-3 rounded-[16px] border border-[#E5E5E5] bg-white px-4 py-3">
              <Text className="text-[12px] font-semibold text-[#5F5E5E]">
                {isLoading ? "Chargement des annonces..." : errorMessage}
              </Text>
            </View>
          ) : null}
          <View className="flex-row justify-between">
            {visibleRecentListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} onPress={() => onListingPress?.(listing.id)} />
            ))}
          </View>
        </View>

        <View className="mb-8">
          <SectionHeader title="Trocs à proximité" subtitle="Échanges rapides près de chez vous" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 16, paddingHorizontal: 16 }}
          >
            {visibleTradeListings.map((item) => (
              <HorizontalTradeCard key={item.id} item={item} />
            ))}
          </ScrollView>
        </View>

        <View className="mb-8">
          <SectionHeader title="Les Bons Plans" tone="deal" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 16, paddingHorizontal: 16 }}
          >
            {visibleDealListings.map((item) => (
              <HorizontalDealCard key={item.id} item={item} />
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}
