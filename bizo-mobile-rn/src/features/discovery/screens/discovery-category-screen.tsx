import { useRouter } from "expo-router";
import {
  CarFront,
  ChevronLeft,
  House,
  MonitorSmartphone,
  Search,
  Shirt,
  Smartphone,
  Wrench,
} from "lucide-react-native";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { listingCategories, type ListingCategoryDefinition, type ListingCategoryIcon } from "@/src/lib/categories/listing-categories";
import { useDiscoveryStore } from "@/src/store/discovery";

const categoryTheme: Record<ListingCategoryIcon, { background: string; color: string }> = {
  electronics: { background: "#D5F2DF", color: "#006D3B" },
  fashion: { background: "#FFDAD6", color: "#BA1A1A" },
  home: { background: "#FFE08B", color: "#745B00" },
  phone: { background: "#E4E5FF", color: "#4B55D9" },
  service: { background: "#E8EAED", color: "#3F484C" },
  vehicle: { background: "#D7F3FA", color: "#00687C" },
};

function CategoryIcon({ icon, selectedColor }: { icon: ListingCategoryIcon; selectedColor: string }) {
  const props = { color: selectedColor, size: 30, strokeWidth: 2.1 };

  if (icon === "phone") return <Smartphone {...props} />;
  if (icon === "electronics") return <MonitorSmartphone {...props} />;
  if (icon === "vehicle") return <CarFront {...props} />;
  if (icon === "fashion") return <Shirt {...props} />;
  if (icon === "home") return <House {...props} />;
  return <Wrench {...props} />;
}

function CategoryCard({
  category,
  onPress,
}: {
  category: ListingCategoryDefinition;
  onPress: () => void;
}) {
  const theme = categoryTheme[category.icon];

  return (
    <Pressable className="w-[48%] rounded-[18px] border border-[#ECEEEF] bg-white p-4 shadow-soft" onPress={onPress}>
      <View className="h-14 w-14 items-center justify-center rounded-[16px]" style={{ backgroundColor: theme.background }}>
        <CategoryIcon icon={category.icon} selectedColor={theme.color} />
      </View>
      <Text className="mt-4 text-[16px] font-black text-[#191C1D]">{category.label}</Text>
      <Text className="mt-1 text-[12px] font-semibold text-[#5F5E5E]">Explorer</Text>
    </Pressable>
  );
}

export function DiscoveryCategoryScreen() {
  const router = useRouter();
  const setSearchContext = useDiscoveryStore((state) => state.setSearchContext);
  const openSearch = (category: ListingCategoryDefinition | null) => {
    setSearchContext({ category: category?.id ?? null, query: "" });
    router.push("/search");
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FAFAFA]" edges={["top", "bottom"]}>
      <View className="h-[64px] flex-row items-center justify-between border-b border-[#EDEEEF] bg-white px-4">
        <Pressable className="h-10 w-10 items-center justify-center rounded-full bg-[#F3F4F5]" onPress={() => router.back()}>
          <ChevronLeft color="#191C1D" size={24} strokeWidth={2.2} />
        </Pressable>
        <Text className="text-[20px] font-black text-[#191C1D]">Toutes les catégories</Text>
        <View className="h-10 w-10" />
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 116, paddingHorizontal: 16, paddingTop: 18 }}>
        <Pressable
          className="mb-5 flex-row items-center justify-between rounded-[18px] bg-[#191C1D] px-5 py-4 shadow-soft"
          onPress={() => openSearch(null)}
        >
          <View>
            <Text className="text-[16px] font-black text-white">Toutes les annonces</Text>
            <Text className="mt-1 text-[12px] font-semibold text-white/65">Tout voir</Text>
          </View>
          <View className="h-11 w-11 items-center justify-center rounded-full bg-white/10">
            <Search color="#FFFFFF" size={22} strokeWidth={2} />
          </View>
        </Pressable>

        <View className="flex-row flex-wrap justify-between gap-y-4">
          {listingCategories.map((category) => (
            <CategoryCard key={category.id} category={category} onPress={() => openSearch(category)} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
