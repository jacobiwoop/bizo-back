import { Image } from "expo-image";
import { Heart } from "lucide-react-native";
import { Text, View } from "react-native";

type HomeCardProps = {
  title: string;
  price: string;
  badge: string;
  location: string;
  status: string;
  image: string;
};

export function HomeCard({ title, price, badge, location, status, image }: HomeCardProps) {
  return (
    <View className="w-[48%] rounded-[28px] border border-line bg-white p-3 shadow-soft">
      <View className="overflow-hidden rounded-[22px]">
        <Image source={image} style={{ width: "100%", height: 164 }} contentFit="cover" />
        <View className="absolute left-3 top-3 rounded-full bg-[#FFD85B] px-3 py-1">
          <Text className="text-xs font-semibold text-ink">{badge}</Text>
        </View>
        <View className="absolute right-3 top-3 rounded-full bg-white px-3 py-1">
          <Text className="text-xs font-semibold text-[#F2994A]">{price}</Text>
        </View>
      </View>

      <View className="mt-3 flex-row items-start justify-between">
        <Text className="max-w-[80%] text-[17px] font-semibold text-ink">{title}</Text>
        <View className="h-10 w-10 items-center justify-center rounded-full border border-line bg-white">
          <Heart size={18} color="#111111" />
        </View>
      </View>

      <Text className="mt-3 text-sm text-muted">{location}</Text>
      <Text className="mt-2 text-sm font-medium text-[#35B46B]">{status}</Text>
    </View>
  );
}
