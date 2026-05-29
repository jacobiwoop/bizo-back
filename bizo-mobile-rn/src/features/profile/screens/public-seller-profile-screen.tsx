import { Image } from "expo-image";
import {
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle,
  ChevronLeft,
  Clock3,
  MapPin,
  MessageCircle,
  MoreVertical,
  ShoppingBag,
  Star,
  UserPlus,
} from "lucide-react-native";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const sellerAvatar =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD2p1C65ToJ8nCJ9IUP9ACS39UvSOph7YOZRGYnKzENcZ2WCGiwqr-C4nNg-aKfqZmsRxE5GRTntC6uWw68KEjTvtykST1vZ8WZs37z6ZnyYI54T61q9Z9J-k5NgqDn5JdpTliNMjpfirq9uYdzL8f4A1KCp5MkXfxZsDANfejvHpueK_4_eVdpHt43Cnbvc-jkf-7Cl7YrIBDbhFINDTpNcDND1pqWVyxHnO_eg0lEpjD-f7QzXzv3spx6FXAsOBHI-1v-TsamWbU";

const listingImage =
  "https://lh3.googleusercontent.com/aida/ADBb0uh87IkLFidw7GYFSqWQWd1E3mP2pJ0uTVj2ZF-WThGORhMIw_Pqf2GfCxK-sA9BRkei2b_rNTxhpG4iAt1u1RwC6Puu8w-f4wL7oLzn6Q9g88N4RWAKA9DGz_GM_SLdUHi8D1PjV1ovLjNeUWg8Tibix_rewC0YavAHvD6so9sjMZZKUquHp6nACfOfBGOURCg0qFJdM8KT4RRmCnDtW1LvYOycmvQ_OJrh0cPfB9gPF15q_cq_pzKhMw";

const sellerListings = [
  {
    badges: [
      { label: "Vente", color: "#1C1B1B" },
      { label: "Troc", color: "#5B5BD6" },
    ],
    location: "Lyon, France",
    price: "840€",
    title: "Vintage Leica M3 Replica",
  },
  {
    badges: [{ label: "Troc + Cash", color: "#22C55E" }],
    location: "Paris, France",
    price: "1 200€",
    title: "Optique Summicron 50mm",
  },
  {
    badges: [{ label: "Vente", color: "#1C1B1B" }],
    location: "Lyon, France",
    price: "65€",
    title: "Courroie Cuir Artisanal",
  },
  {
    badges: [{ label: "Troc", color: "#5B5BD6" }],
    location: "Annecy, France",
    price: "95€",
    title: "Lot 5x Kodak Portra 400",
  },
];

function PublicSellerHeader({ onBack }: { onBack: () => void }) {
  return (
    <SafeAreaView edges={["top"]} className="bg-white shadow-soft">
      <View className="h-[58px] flex-row items-center justify-between px-5">
        <Pressable className="h-10 w-10 items-center justify-center rounded-full" onPress={onBack}>
          <ChevronLeft color="#191C1D" size={27} strokeWidth={2.2} />
        </Pressable>
        <Text className="text-[15px] font-bold text-[#191C1D]">Profil</Text>
        <Pressable className="h-10 w-10 items-center justify-center rounded-full">
          <MoreVertical color="#191C1D" size={22} strokeWidth={2.2} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function BadgePill({ label, tone }: { label: string; tone: "yellow" | "blue" | "dark" }) {
  const styles = {
    blue: "bg-[#5B5BD6]",
    dark: "bg-[#191C1D]",
    yellow: "bg-[#F5C518]",
  };
  const text = tone === "yellow" ? "text-[#695200]" : "text-white";

  return (
    <View className={`${styles[tone]} rounded-full px-3 py-[5px]`}>
      <Text className={`text-[12px] font-bold ${text}`}>{label}</Text>
    </View>
  );
}

function SellerHero() {
  return (
    <View className="items-center bg-[#E9EEFF] px-5 pb-6 pt-10">
      <View className="relative mb-4">
        <View className="h-[84px] w-[84px] overflow-hidden rounded-full border-[3px] border-[#F5C518] bg-white">
          <Image source={sellerAvatar} style={{ width: "100%", height: "100%" }} contentFit="cover" />
        </View>
        <View className="absolute bottom-0 right-0 h-[25px] w-[25px] items-center justify-center rounded-full border-2 border-white bg-[#5B5BD6]">
          <Check color="#FFFFFF" size={14} strokeWidth={3} />
        </View>
      </View>

      <Text className="mb-1 text-[22px] font-black text-[#191C1D]">Marc-Antoine</Text>
      <View className="mb-6 flex-row items-center">
        <CalendarDays color="#5F5E5E" size={14} strokeWidth={2} />
        <Text className="ml-[6px] text-[13px] text-[#5F5E5E]">Membre depuis Mars 2022</Text>
      </View>

      <View className="mb-8 flex-row flex-wrap justify-center gap-2">
        <BadgePill label="Super Vendeur" tone="yellow" />
        <BadgePill label="Vérifié" tone="blue" />
        <BadgePill label="Top Troc" tone="dark" />
      </View>

      <View className="mb-8 w-full flex-row justify-between px-2">
        <View className="flex-1 items-center">
          <Text className="text-[22px] font-black text-[#191C1D]">47</Text>
          <Text className="mt-1 text-[13px] text-[#5F5E5E]">Annonces</Text>
        </View>
        <View className="flex-1 items-center">
          <View className="flex-row items-center">
            <Text className="text-[22px] font-black text-[#191C1D]">4.8</Text>
            <Star color="#F5C518" fill="#F5C518" size={16} strokeWidth={1.5} style={{ marginLeft: 4 }} />
          </View>
          <Text className="mt-1 text-[13px] text-[#5F5E5E]">Note</Text>
        </View>
        <View className="flex-1 items-center">
          <Text className="text-[22px] font-black text-[#191C1D]">312</Text>
          <Text className="mt-1 text-[13px] text-[#5F5E5E]">Followers</Text>
        </View>
      </View>

      <View className="w-full flex-row gap-3 px-4">
        <Pressable className="h-12 flex-1 flex-row items-center justify-center rounded-full bg-[#191C1D] shadow-soft">
          <MessageCircle color="#FFFFFF" fill="#FFFFFF" size={19} strokeWidth={2} />
          <Text className="ml-2 text-[14px] font-bold text-white">Contacter</Text>
        </Pressable>
        <Pressable className="h-12 flex-1 flex-row items-center justify-center rounded-full border-2 border-[#191C1D]">
          <UserPlus color="#191C1D" size={19} strokeWidth={2.2} />
          <Text className="ml-2 text-[14px] font-bold text-[#191C1D]">Suivre</Text>
        </Pressable>
      </View>
    </View>
  );
}

function QuickInfo() {
  return (
    <View className="flex-row items-center justify-between border-b border-[#EDEEEF] bg-white px-5 py-4">
      <View className="flex-row items-center">
        <Clock3 color="#5F5E5E" size={17} strokeWidth={2} />
        <Text className="ml-[5px] text-[12px] text-[#191C1D]">Répond en 1h</Text>
      </View>
      <View className="flex-row items-center">
        <CheckCircle color="#22C55E" size={17} strokeWidth={2} />
        <Text className="ml-[5px] text-[12px] text-[#22C55E]">96% positifs</Text>
      </View>
      <View className="flex-row items-center">
        <ShoppingBag color="#5F5E5E" size={17} strokeWidth={2} />
        <Text className="ml-[5px] text-[12px] text-[#191C1D]">38 ventes</Text>
      </View>
    </View>
  );
}

function PublicProfileTabs({ onOpenListings }: { onOpenListings: () => void }) {
  return (
    <View className="flex-row border-b border-[#EDEEEF] bg-white">
      <Pressable className="flex-1 items-center border-b-[3px] border-[#F5C518] py-4" onPress={onOpenListings}>
        <Text className="text-[14px] font-bold text-[#191C1D]">Annonces (47)</Text>
      </Pressable>
      <Pressable className="flex-1 items-center border-b-[3px] border-transparent py-4">
        <Text className="text-[14px] font-bold text-[#5F5E5E]">Avis (24)</Text>
      </Pressable>
    </View>
  );
}

function ViewAllListingsCard({ onPress }: { onPress: () => void }) {
  return (
    <Pressable className="w-[48%] overflow-hidden rounded-xl border border-[#E1E3E4] bg-white shadow-soft" onPress={onPress}>
      <View className="aspect-[0.67] items-center justify-center bg-[#F5C518]/15 px-4">
        <View className="mb-4 h-14 w-14 items-center justify-center rounded-full bg-[#191C1D]">
          <ArrowRight color="#FFFFFF" size={25} strokeWidth={2.4} />
        </View>
        <Text className="text-center text-[18px] font-black text-[#191C1D]">Tout voir</Text>
        <Text className="mt-2 text-center text-[12px] leading-5 text-[#5F5E5E]">Voir les 47 annonces de Marc-Antoine</Text>
      </View>
    </Pressable>
  );
}

function SellerListingCard({ item }: { item: (typeof sellerListings)[number] }) {
  return (
    <View className="w-[48%] overflow-hidden rounded-xl bg-white shadow-soft">
      <View className="relative aspect-[0.67] bg-[#EDEEEF]">
        <Image source={listingImage} style={{ width: "100%", height: "100%" }} contentFit="cover" />
        <View className="absolute left-2 top-2 gap-1">
          {item.badges.map((badge) => (
            <View key={badge.label} className="self-start rounded px-2 py-[3px]" style={{ backgroundColor: `${badge.color}CC` }}>
              <Text className="text-[10px] font-bold uppercase tracking-[0.8px] text-white">{badge.label}</Text>
            </View>
          ))}
        </View>
      </View>
      <View className="p-3">
        <Text className="mb-1 text-[13px] font-bold text-[#191C1D]" numberOfLines={1}>
          {item.title}
        </Text>
        <Text className="mb-1 text-[20px] font-black text-[#F5C518]">{item.price}</Text>
        <View className="flex-row items-center">
          <MapPin color="#5F5E5E" size={12} strokeWidth={2} />
          <Text className="ml-1 text-[11px] text-[#5F5E5E]" numberOfLines={1}>
            {item.location}
          </Text>
        </View>
      </View>
    </View>
  );
}

export function PublicSellerProfileScreen({
  onBack,
  onOpenListings,
}: {
  onBack: () => void;
  onOpenListings: () => void;
}) {
  return (
    <View className="flex-1 bg-[#F8F9FA]">
      <PublicSellerHeader onBack={onBack} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 36 }}>
        <SellerHero />
        <QuickInfo />
        <PublicProfileTabs onOpenListings={onOpenListings} />
        <View className="flex-row flex-wrap justify-between gap-y-4 px-5 py-6">
          {sellerListings.slice(0, 3).map((item) => (
            <SellerListingCard key={item.title} item={item} />
          ))}
          <ViewAllListingsCard onPress={onOpenListings} />
        </View>
      </ScrollView>
    </View>
  );
}
