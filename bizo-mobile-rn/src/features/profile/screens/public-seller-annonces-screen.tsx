import { Image } from "expo-image";
import { CheckCircle, ChevronDown, ChevronLeft, Clock3, Heart, MapPin, MoreVertical, RefreshCw, SlidersHorizontal } from "lucide-react-native";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const miniAvatar =
  "https://lh3.googleusercontent.com/aida/ADBb0uiKx5lxO6EmhqIu9BRVYIlcW2tkqf9mM27B1XReh7dPAWch4i-7FIzYqQPB_GsSDPxunY0Sc-KQio1L06hiGj_nNZb535vDypNEvpeyqHctP3VeRNOTQvX2_R3Os7lpL-V-HlcgIokbDJ9dpxQ3zgwW8G-YZpAV2xOnyjt-TMoVf2G2xWfBn4QWQIMtAF-uZJqUAE9gjNMZNfHwlT-oUuOZauUMGbrV3peJZAYZBiimn64S7oeGtT5Tpg";

const sellerAdItems = [
  {
    badge: "Vente",
    badgeBg: "#FFFFFFE6",
    badgeText: "#191C1D",
    condition: "Occasion",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBTl0kQ1wESMOJ6k9Vm3_STtmQvLvgox3m2QeoYmo6RjW3Qhe5U9IUdHh8dUylmskzEiQZINyGfyYACpyf_yKtLAhXxk6Uy2wjYFoOQeozsnwatRAvM62_81AtNytBzKJEkbQyvPhDgR8dRv_NF3bX5f1UxV93BVOR0Bwc6W-G8lpSXkedeYg6TcD6jMIGrWtr8txPAq9GUKCJN4_E0JZ34nfm-apwgcIrrL21-sRgbNTm7xh4hT44g-eyY5iZ8xkiPxqxJuhGi5iw",
    location: "Paris, 11e",
    price: "120 €",
    time: "il y a 2j",
    title: "Sneakers Nike Air Max Limited Edition",
    type: "sale",
  },
  {
    badge: "Troc",
    badgeBg: "#5B5BD6",
    badgeText: "#FFFFFF",
    condition: "Neuf",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCrW_WUwswkfJlsTw9coUYBncAvtNAs5E5DnR2MZn9cd-FN5Bx0oDUK_Eb_6UL3fxEVk5MpqRAbcAFbnb3boviNdkY3rij7SZNaHGqvujyyHDEAIvMhV-e4ta_1h_zMU1ZOzXy1dQ6LXBh-Sx1Hxg2ZzkgzgM59iprtHtAk6o21oU7ogjRYiPYL-nHuDgiJfr0Fk5KTvkVoOIuYssLFjEoEner9GPyciHVqjw2HzevyHfoq9iNGORAa3ggPQr0MwRBdoe_zwZOyB30",
    location: "Lyon, 2e",
    price: "Troc",
    time: "il y a 1j",
    title: "Casque Audio Studio High-Fidelity",
    type: "trade",
  },
  {
    badge: "Vente",
    badgeBg: "#FFFFFFE6",
    badgeText: "#191C1D",
    condition: "Occasion",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCE0-jENhZO8DtlyU-ucafrNojLS_crgOF3kuOvSZiiCnB3f0W6zJIvlnBiOim8MyyH-045kXsb-mLIpgzLrhwpANypFIA0nQHEqHQDaDQTuSazrqCUpjFYR8k9lyIK7Pquor1iWrQtgF4RZmXymbotwwBqjoQmkfS02EALdslBIOtWqy3FftKFF2N5JlZOHilQ9dOe2vlJ_xUx0f6b9BvA92pW9I6EpsDj4TNEVZDNJYKG_eXbpvl_LOV1EYeqe0Jpldkbd1t5lxM",
    location: "Bordeaux",
    price: "85 €",
    sold: true,
    title: "Montre Minimaliste Cuir Véritable",
    type: "sale",
  },
  {
    badge: "Troc+Cash",
    badgeBg: "#F5C518",
    badgeText: "#695200",
    condition: "Occasion",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAsTXddnCR2B0xPq0HG8ON4kj0itrokRiXMGM7MLMoI0LPMLGb23DriWMkabfvP3cK_bfu6G8t827vYeRFPLcYKYvtY3FRE74zIBANc1ny9w0Lm_DwjpQLbHUFoeV2dlxGsx0IxK9JRnlAaqOs5s52IzI7sjOWdViHMIt0s50iWobQTjkId9stmcfO-2ObB3IU6z60bwBsS22Y8lYjgcPWoI0p331bxqy1NeoRFi-HSfI1TbTeQ2zdw-U5mo5Zv_Zk4aEzF7q2EvNo",
    location: "Lille",
    price: "45 €",
    time: "il y a 4j",
    title: "Appareil Photo Argentique Vintage",
    type: "trade-cash",
  },
];

function MiniHeader({ onBack }: { onBack: () => void }) {
  return (
    <SafeAreaView edges={["top"]} className="bg-[#F8F9FA] shadow-soft">
      <View className="h-[58px] flex-row items-center justify-between px-5">
        <Pressable className="h-9 w-9 items-center justify-center" onPress={onBack}>
          <ChevronLeft color="#191C1D" size={27} strokeWidth={2.2} />
        </Pressable>
        <View className="flex-row items-center gap-2">
          <Image source={miniAvatar} style={{ width: 32, height: 32, borderRadius: 16 }} contentFit="cover" />
          <Text className="text-[12px] font-bold text-[#191C1D]">Marc-Antoine</Text>
        </View>
        <Pressable className="h-9 w-9 items-center justify-center">
          <MoreVertical color="#191C1D" size={22} strokeWidth={2.2} />
        </Pressable>
      </View>
      <View className="flex-row border-b border-[#E1E3E4]">
        <Pressable className="flex-1 items-center border-b-[3px] border-[#F5C518] py-3">
          <Text className="text-[12px] font-bold text-[#191C1D]">Annonces</Text>
        </Pressable>
        <Pressable className="flex-1 items-center border-b-[3px] border-transparent py-3">
          <Text className="text-[12px] font-bold text-[#5F5E5E]">Avis</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function FilterChips() {
  const chips = [
    { count: "47", label: "Tout", className: "bg-[#191C1D]", textClass: "text-white" },
    { count: "28", label: "Vente", className: "border border-[#191C1D] bg-[#F8F9FA]", textClass: "text-[#191C1D]" },
    { count: "12", label: "Troc", className: "bg-[#5B5BD6]", textClass: "text-white" },
    { count: "7", label: "Troc+Cash", className: "bg-[#F5C518]", textClass: "text-[#695200]" },
  ];

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-4" contentContainerStyle={{ gap: 12, paddingHorizontal: 20 }}>
      {chips.map((chip) => (
        <Pressable key={chip.label} className={`${chip.className} flex-row items-center rounded-full px-4 py-2`}>
          <Text className={`text-[12px] font-bold ${chip.textClass}`}>{chip.label}</Text>
          <Text className={`ml-2 text-[12px] font-bold opacity-70 ${chip.textClass}`}>{chip.count}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

function SortRow() {
  return (
    <View className="mb-4 flex-row items-center justify-end gap-1 px-5">
      <SlidersHorizontal color="#5F5E5E" size={17} strokeWidth={2} />
      <Text className="text-[13px] text-[#5F5E5E]">Trier : Récent</Text>
      <ChevronDown color="#5F5E5E" size={17} strokeWidth={2} />
    </View>
  );
}

function SellerAdCard({ item }: { item: (typeof sellerAdItems)[number] }) {
  return (
    <View className="w-[48%] overflow-hidden rounded-xl bg-white shadow-soft">
      <View className="relative h-[130px] bg-[#EDEEEF]">
        <Image source={item.image} style={{ width: "100%", height: "100%" }} contentFit="cover" />
        {item.sold ? (
          <View className="absolute inset-0 items-center justify-center bg-black/50">
            <CheckCircle color="#FFFFFF" size={32} strokeWidth={2.2} />
            <Text className="mt-1 text-[14px] font-black uppercase tracking-[2px] text-white">Vendu</Text>
          </View>
        ) : null}
        <View className="absolute left-2 top-2 rounded px-2 py-[2px]" style={{ backgroundColor: item.badgeBg }}>
          <Text className="text-[10px] font-bold uppercase" style={{ color: item.badgeText }}>
            {item.badge}
          </Text>
        </View>
        {!item.sold ? (
          <Pressable className="absolute right-2 top-2">
            <Heart color="#FFFFFF" fill="#FFFFFF" size={20} strokeWidth={1.5} />
          </Pressable>
        ) : null}
      </View>

      <View className={`gap-[6px] p-[10px] ${item.sold ? "opacity-60" : ""}`}>
        <Text className="text-[13px] font-bold leading-[17px] text-[#191C1D]" numberOfLines={2}>
          {item.title}
        </Text>
        {item.type === "trade" ? (
          <View className="flex-row items-center">
            <Text className="text-[16px] font-black text-[#5B5BD6]">Troc</Text>
            <RefreshCw color="#5B5BD6" size={15} strokeWidth={2} style={{ marginLeft: 4 }} />
          </View>
        ) : item.type === "trade-cash" ? (
          <View>
            <Text className="text-[10px] font-bold uppercase text-[#5B5BD6]">Échange +</Text>
            <Text className="text-[16px] font-black text-[#F5C518]">{item.price}</Text>
          </View>
        ) : (
          <Text className="text-[16px] font-black text-[#F5C518]">{item.price}</Text>
        )}
        <View className="gap-[2px]">
          <View className="flex-row items-center">
            <MapPin color="#5F5E5E" size={13} strokeWidth={2} />
            <Text className="ml-1 text-[10px] text-[#5F5E5E]">{item.location}</Text>
          </View>
          {item.time ? (
            <View className="flex-row items-center">
              <Clock3 color="#5F5E5E" size={13} strokeWidth={2} />
              <Text className="ml-1 text-[10px] text-[#5F5E5E]">{item.time}</Text>
            </View>
          ) : null}
        </View>
        <View className="self-start rounded-full bg-[#191C1D] px-2 py-[2px]">
          <Text className="text-[9px] font-bold uppercase text-white">{item.condition}</Text>
        </View>
      </View>
    </View>
  );
}

export function PublicSellerAnnoncesScreen({ onBack }: { onBack: () => void }) {
  return (
    <View className="flex-1 bg-[#F8F9FA]">
      <MiniHeader onBack={onBack} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 42 }}>
        <FilterChips />
        <SortRow />
        <View className="flex-row flex-wrap justify-between gap-y-3 px-5">
          {sellerAdItems.map((item) => (
            <SellerAdCard key={item.title} item={item} />
          ))}
        </View>
        <View className="px-5 py-8">
          <Pressable className="h-12 flex-row items-center justify-center rounded-full border border-[#191C1D]">
            <Text className="text-[12px] font-bold text-[#191C1D]">Voir plus</Text>
            <ChevronDown color="#191C1D" size={20} strokeWidth={2} style={{ marginLeft: 8 }} />
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
