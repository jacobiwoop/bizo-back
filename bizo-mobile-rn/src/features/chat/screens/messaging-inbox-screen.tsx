import { Image } from "expo-image";
import { Camera, Edit, Menu, Search } from "lucide-react-native";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const conversations = [
  {
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCSsplh_8rh7EY1EAyWuNTe79pQzT9mt1foCcgg6odnvarItzYWFJtfbF0Iew6KjRecXbAW8Le1o9d7wTvH9iYeUOhCEnsCY_CcGqDK-Rydad4K8zELsRcsd-wr39lbzaGAqQ80zWBQb6FJsnmcZgM3SRaNE4sMUtW6XuGpsHE8XDHPI2DUtEQ8ovUpj_REV5-zci9QcTocPdYIGal9UbrIy_q2hnu7vmJ47x9bVG7hoSRJXO9UQQwJnwk7JM4EoY6ogvh82l9RV_k",
    listing: "iPhone 13 Pro",
    message: "Est-ce que le prix est négociable ?",
    name: "Thomas B.",
    online: true,
    time: "10:30",
    unread: 3,
  },
  {
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCISEJ5FJDAUuQaTNMaNFfWUngiYKfNnhZ3PPfTC85gwkf8xO11Xx7gPiVbqVlVbUP-_KBn6t51GzrKrnn3sEg0exug_nBYn3POpdgr_eUScbKCMaNiweNNE8jbnXpiKtgPGiRwZfmUGrsi9o9Z7WisO4f_NQcAf-xDDivubZtIsA4USOu-agh83PoU3EeybsukjbjyVdWMjcs0cgD_GYntboM-gcQImmOzIVRnz_mMQyVFtxn4hThIvmVZXtQfTYiHwvt8SKn8GUM",
    listing: "PlayStation 5",
    message: "Photo",
    name: "Sophie L.",
    photo: true,
    time: "Hier",
  },
  {
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCX_teCWSt-FdR5c-9zwQeok5IBKjq2jwfyVcLcfNSG_wj95Fc-oWlDSMAMFpmqlaOstxBmP4vxSbsDUgLEEDygYYUT3vhvd2Qhlgb3A_-HpCg8OGoUII1ZPs8LOpCuPSPU_vqM-vezLbfGSiQrsUmLs989ZqJ2KFvGtX1RuMdfGSPqMbn3MIbxXsQl9pdCZAqZ2zfJjimgGSUdrKmdOKPQhFiT7G4S5MX8bWGcqHbW1gTobMZu5Z1lIM9Ahoei3AQWK1MtnDMfu8c",
    listing: "MacBook Air M1",
    message: "C'est parfait, merci !",
    name: "Lucas M.",
    online: true,
    time: "Lun.",
  },
];

function InboxHeader() {
  return (
    <SafeAreaView edges={["top"]} className="bg-[#F9F9FF] shadow-soft">
      <View className="h-16 flex-row items-center justify-between px-4">
        <View className="flex-row items-center gap-4">
          <Pressable className="h-10 w-10 items-center justify-center rounded-full">
            <Menu color="#745B00" size={24} strokeWidth={2.2} />
          </Pressable>
          <Text className="text-[24px] font-bold text-[#151C27]">Messages</Text>
        </View>
        <Pressable className="h-10 w-10 items-center justify-center rounded-full">
          <Edit color="#745B00" size={22} strokeWidth={2.2} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function SearchBar() {
  return (
    <View className="mb-6 rounded-full border border-[#D1C5AC]/20 bg-[#F3F4F6] px-4 py-3 shadow-soft">
      <View className="flex-row items-center">
        <Search color="#5F5E5E" size={21} strokeWidth={2} />
        <TextInput
          className="ml-3 flex-1 text-[16px] text-[#151C27]"
          placeholder="Rechercher une conversation..."
          placeholderTextColor="#5F5E5E"
        />
      </View>
    </View>
  );
}

function FilterChips() {
  const chips = [
    { label: "Tous", active: true },
    { label: "Non lus", dot: true },
    { label: "Vente" },
    { label: "Troc" },
    { label: "Sans annonce" },
  ];

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6" contentContainerStyle={{ gap: 12 }}>
      {chips.map((chip) => (
        <Pressable
          key={chip.label}
          className={`h-9 flex-row items-center rounded-full px-6 ${chip.active ? "bg-[#1A1A1A]" : "border border-[#D1C5AC] bg-white"}`}
        >
          {chip.dot ? <View className="mr-2 h-2 w-2 rounded-full bg-[#5B5BD6]" /> : null}
          <Text className={`text-[12px] font-bold ${chip.active ? "text-white" : "text-[#151C27]"}`}>{chip.label}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

function ConversationRow({
  item,
  onPress,
}: {
  item: (typeof conversations)[number];
  onPress: () => void;
}) {
  const unread = Boolean(item.unread);

  return (
    <Pressable
      className={`h-20 flex-row items-center border-b border-[#D1C5AC]/10 px-4 ${unread ? "border-l-[3px] border-l-[#5B5BD6] bg-[#FAFAFA]" : "bg-white"}`}
      onPress={onPress}
    >
      <View>
        <Image source={item.avatar} style={{ width: 52, height: 52, borderRadius: 26 }} contentFit="cover" />
        <View className={`absolute bottom-0 right-0 h-[14px] w-[14px] rounded-full border-2 border-white ${item.online ? "bg-[#22C55E]" : "bg-gray-400"}`} />
      </View>
      <View className="ml-4 min-w-0 flex-1">
        <View className="mb-[2px] flex-row items-baseline justify-between">
          <Text className={`flex-1 text-[18px] ${unread ? "font-bold" : "font-medium"} text-[#151C27]`} numberOfLines={1}>
            {item.name}
          </Text>
          <Text className="ml-2 text-[12px] text-[#5F5E5E]">{item.time}</Text>
        </View>
        <View className="flex-row items-center gap-2">
          {item.photo ? <Camera color="#5F5E5E" size={16} strokeWidth={2} /> : null}
          <Text className={`min-w-0 flex-1 text-[14px] ${item.photo ? "italic" : ""} text-[#5F5E5E]`} numberOfLines={1}>
            {item.message}
          </Text>
          <View className={`${unread ? "bg-[#F5C518]" : "bg-[#DCE2F3]"} rounded-full px-2 py-[2px]`}>
            <Text className={`text-[10px] font-bold ${unread ? "text-[#241A00]" : "text-[#5F5E5E]"}`} numberOfLines={1}>
              {item.listing}
            </Text>
          </View>
        </View>
      </View>
      {unread ? (
        <View className="ml-4 h-5 w-5 items-center justify-center rounded-full bg-[#F5C518]">
          <Text className="text-[10px] font-bold text-[#1A1A1A]">{item.unread}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

export function MessagingInboxScreen({ onOpenConversation }: { onOpenConversation: () => void }) {
  return (
    <View className="flex-1 bg-[#F9F9FF]">
      <InboxHeader />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 96, paddingHorizontal: 16, paddingTop: 16 }}>
        <SearchBar />
        <FilterChips />
        <View className="overflow-hidden rounded-xl border border-[#D1C5AC]/10 bg-white shadow-soft">
          {conversations.map((item) => (
            <ConversationRow key={item.name} item={item} onPress={onOpenConversation} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
