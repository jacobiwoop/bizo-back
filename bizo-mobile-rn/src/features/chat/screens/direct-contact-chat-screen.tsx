import { CheckCheck, ChevronLeft, Image as ImageIcon, Info, Mic, MoreVertical, Send, Shield, UserCircle, X } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { Image } from "expo-image";
import { KeyboardStickyView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";

const martinAvatar =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDEYgs--UU8MhNu_bzr0XCKwaRuczowlGt4p0R1PjbUqxEf-qgjL42bb82c_6vw7A--eAR6TBHDUYB9DbGxHrcQZIThipJGh4KcDBr3shWID0zG-ai8CdAgzG1g75ZFrADXmTQfyXd-sUVdj8xK1FWqJXWH5vZR7yeQKe3KB6tP5AwGHtGXzainVQ3_Qlu3J4p_To-3HAnxKaYofk8jtire9CxBzfRqxntQaKEvcYa5wyymI6-sRLgGUQojoAZfHF_NA2mkhvIx_9U";

function ChatHeader({ onBack }: { onBack: () => void }) {
  return (
    <SafeAreaView edges={["top"]} className="bg-white shadow-soft">
      <View className="h-16 flex-row items-center justify-between px-4">
        <View className="flex-row items-center gap-3">
          <Pressable className="h-9 w-9 items-center justify-center" onPress={onBack}>
            <ChevronLeft color="#151C27" size={27} strokeWidth={2.2} />
          </Pressable>
          <View className="flex-row items-center gap-2">
            <View>
              <Image source={martinAvatar} style={{ width: 36, height: 36, borderRadius: 18 }} contentFit="cover" />
              <View className="absolute bottom-0 right-0 h-[10px] w-[10px] rounded-full border-2 border-white bg-[#22C55E]" />
            </View>
            <View>
              <Text className="text-[15px] font-bold leading-5 text-[#1A1A1A]">Martin D.</Text>
              <Text className="text-[11px] font-medium text-[#22C55E]">En ligne</Text>
            </View>
          </View>
        </View>
        <Pressable className="h-9 w-9 items-center justify-center">
          <MoreVertical color="#6B7280" size={23} strokeWidth={2.2} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function InfoBanner() {
  const [visible, setVisible] = useState(true);

  if (!visible) {
    return null;
  }

  return (
    <View className="flex-row items-center justify-between bg-[#EFF6FF] px-4 py-[10px]">
      <View className="flex-row items-center gap-2">
        <Info color="#5B5BD6" size={16} strokeWidth={2.2} />
        <Text className="text-[12px] font-bold text-[#5B5BD6]">Contact direct — aucune annonce liée</Text>
      </View>
      <Pressable className="h-6 w-6 items-center justify-center" onPress={() => setVisible(false)}>
        <X color="#6B7280" size={15} strokeWidth={2.2} />
      </Pressable>
    </View>
  );
}

function StarterCard() {
  return (
    <View className="items-center">
      <View className="w-[280px] items-center rounded-2xl bg-[#F3F4F6] p-4 shadow-soft">
        <UserCircle color="#6B7280" size={32} strokeWidth={1.8} />
        <Text className="mt-2 text-[14px] font-bold text-[#1A1A1A]">Vous avez contacté Martin D.</Text>
        <Text className="mt-1 text-[12px] text-[#6B7280]">depuis son profil public</Text>
        <Text className="mt-2 text-[11px] text-[#6B7280]">12 Mai 2026</Text>
      </View>
    </View>
  );
}

function DateSeparator() {
  return (
    <View className="items-center">
      <View className="rounded-full bg-[#E7EEFE] px-3 py-1">
        <Text className="text-[12px] font-medium text-[#6B7280]">Aujourd&apos;hui</Text>
      </View>
    </View>
  );
}

function MessageBubble({
  children,
  sent,
  time,
}: {
  children: string;
  sent?: boolean;
  time: string;
}) {
  return (
    <View className={`max-w-[85%] ${sent ? "ml-auto items-end" : "items-start"}`}>
      <View className={`${sent ? "rounded-tr-none bg-[#1A1A1A]" : "rounded-tl-none bg-white"} rounded-2xl p-[14px] shadow-soft`}>
        <Text className={`text-[14px] leading-[21px] ${sent ? "text-white" : "text-[#1A1A1A]"}`}>{children}</Text>
        <View className={`mt-1 flex-row items-center justify-end ${sent ? "gap-1" : ""}`}>
          <Text className={`text-[11px] ${sent ? "text-gray-400" : "text-[#6B7280]"}`}>{time}</Text>
          {sent ? <CheckCheck color="#F5C518" size={14} strokeWidth={2} /> : null}
        </View>
      </View>
    </View>
  );
}

function SecurityBanner() {
  return (
    <View className="items-center">
      <View className="max-w-[90%] flex-row items-center gap-2 rounded-full border border-[#BA1A1A]/10 bg-[#FFDAD6]/30 px-4 py-2">
        <Shield color="#BA1A1A" size={16} strokeWidth={2.2} />
        <Text className="text-[11px] font-medium text-[#1A1A1A]">Pour votre sécurité, restez sur la messagerie Bizo.</Text>
      </View>
    </View>
  );
}

function ChatMessages() {
  const scrollRef = useRef<ScrollView>(null);

  return (
    <ScrollView
      ref={scrollRef}
      className="flex-1"
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ gap: 24, paddingBottom: 24, paddingHorizontal: 16, paddingTop: 24 }}
      onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
    >
      <StarterCard />
      <DateSeparator />
      <MessageBubble time="09:41">
        Bonjour ! J&apos;ai vu que vous proposiez des services de conseil en logistique sur votre profil. Seriez-vous disponible pour un court appel cette semaine ?
      </MessageBubble>
      <MessageBubble sent time="09:45">
        Bonjour Martin, merci de me contacter. Effectivement, je suis disponible jeudi après-midi. Quel créneau vous conviendrait ?
      </MessageBubble>
      <SecurityBanner />
      <MessageBubble time="09:50">Parfait, disons 15h30 ? Je vous enverrai une invitation calendrier si cela vous va.</MessageBubble>
    </ScrollView>
  );
}

function ChatInputBar() {
  const [message, setMessage] = useState("");

  return (
    <SafeAreaView edges={["bottom"]} className="border-t border-gray-100 bg-white">
      <View className="flex-row items-center gap-3 px-4 py-3">
        <View className="flex-row items-center gap-2">
          <Pressable className="h-8 w-8 items-center justify-center">
            <ImageIcon color="#6B7280" size={22} strokeWidth={2} />
          </Pressable>
          <Pressable className="h-8 w-8 items-center justify-center">
            <Mic color="#6B7280" size={22} strokeWidth={2} />
          </Pressable>
        </View>
        <View className="min-h-[42px] flex-1 justify-center rounded-full bg-[#F3F4F6] px-4">
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Votre message..."
            placeholderTextColor="#6B7280"
            className="text-[14px] text-[#1A1A1A]"
          />
        </View>
        <Pressable className="h-10 w-10 items-center justify-center rounded-full bg-[#1A1A1A] shadow-soft" onPress={() => setMessage("")}>
          <Send color="#FFFFFF" size={20} strokeWidth={2.2} style={{ marginLeft: 2 }} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

export function DirectContactChatScreen({ onBack }: { onBack: () => void }) {
  return (
    <View className="flex-1 bg-[#F9FAFB]">
      <ChatHeader onBack={onBack} />
      <InfoBanner />
      <ChatMessages />
      <KeyboardStickyView>
        <ChatInputBar />
      </KeyboardStickyView>
    </View>
  );
}
