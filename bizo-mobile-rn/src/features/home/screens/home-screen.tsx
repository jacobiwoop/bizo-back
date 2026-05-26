import { Bell, House, MapPin, Search } from "lucide-react-native";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { AppScreen } from "@/src/components/ui/screen";
import { HomeCard } from "@/src/components/ui/home-card";

const categories = [
  "Vehicle",
  "Property",
  "Handphone",
  "Fashion",
  "Babies",
  "Jobs",
  "Sport",
  "Service",
  "Furniture",
  "Electronic",
];

const quickSearches = ["ford ranger", "macbook pro", "southwest resort", "vespa"];

const cards = [
  {
    title: "Willow Creek Residences",
    price: "$202,5k",
    badge: "Boost",
    location: "Fishtown, Philadelphia",
    status: "Verified  3d ago",
    image:
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Macbook Pro M1 2020",
    price: "$202,5k",
    badge: "Urgent",
    location: "Silver Lake, Los Angeles",
    status: "Premium  3d ago",
    image:
      "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "JetCycle Flow 700",
    price: "$11,2k",
    badge: "Boost",
    location: "West Loop, Chicago",
    status: "Verified  1d ago",
    image:
      "https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Ducati Veloce 999",
    price: "$202,5k",
    badge: "Urgent",
    location: "Brooklyn, New York",
    status: "Premium  2d ago",
    image:
      "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=900&q=80",
  },
];

export function HomeScreen() {
  return (
    <AppScreen className="bg-white">
      <ScrollView className="flex-1 bg-white" contentContainerStyle={{ paddingBottom: 180 }}>
        <View className="rounded-b-[52px] bg-[#2F6BFF] px-6 pb-8 pt-5">
          <View className="flex-row items-center justify-between">
            <Text className="text-[18px] font-semibold text-white">9:41</Text>
            <View className="flex-row items-center gap-4">
              <Pressable className="h-11 w-11 items-center justify-center rounded-full bg-white/10">
                <MapPin color="#FFFFFF" size={22} />
              </Pressable>
              <Pressable className="h-11 w-11 items-center justify-center rounded-full bg-white/10">
                <Bell color="#FFFFFF" size={22} />
              </Pressable>
            </View>
          </View>

          <View className="mt-6 flex-row items-center rounded-full bg-white px-5 py-4">
            <Search color="#A3A3A3" size={24} />
            <TextInput
              defaultValue="Dell XPS"
              placeholder="Search items"
              className="ml-4 flex-1 text-[18px] text-ink"
              placeholderTextColor="#A3A3A3"
            />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-5">
            <View className="flex-row gap-3">
              {quickSearches.map((item) => (
                <View key={item} className="rounded-full bg-[#1D57DE] px-4 py-2">
                  <Text className="text-sm font-medium text-white">{item}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        <View className="-mt-8 px-6">
          <View className="rounded-[34px] bg-white px-5 py-6 shadow-soft">
            <View className="flex-row flex-wrap justify-between gap-y-5">
              {categories.map((item) => (
                <View key={item} className="w-[18%] items-center">
                  <View className="h-14 w-14 items-center justify-center rounded-[18px] bg-shell">
                    <House size={24} color="#111111" />
                  </View>
                  <Text className="mt-2 text-center text-xs font-medium text-ink">{item}</Text>
                </View>
              ))}
            </View>
            <View className="mt-5 flex-row items-center justify-center gap-2">
              <View className="h-2 w-10 rounded-full bg-[#2F6BFF]" />
              <View className="h-2 w-2 rounded-full bg-[#D7D7D7]" />
              <View className="h-2 w-2 rounded-full bg-[#D7D7D7]" />
            </View>
          </View>
        </View>

        <View className="mt-8 px-6">
          <View className="mb-5 flex-row items-center justify-between">
            <Text className="text-[34px] font-semibold tracking-[-0.8px] text-ink">Popular Items</Text>
            <Text className="text-lg font-medium text-[#2F6BFF]">See All</Text>
          </View>

          <View className="flex-row flex-wrap justify-between gap-y-5">
            {cards.map((card) => (
              <HomeCard key={card.title} {...card} />
            ))}
          </View>
        </View>
      </ScrollView>
    </AppScreen>
  );
}
