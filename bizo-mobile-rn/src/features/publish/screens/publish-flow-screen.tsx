import { Image } from "expo-image";
import { router } from "expo-router";
import {
  ArrowDownCircle,
  ArrowRight,
  ArrowUpCircle,
  Armchair,
  BadgeDollarSign,
  Bookmark,
  Camera,
  CarFront,
  Check,
  CheckCircle,
  ChevronRight,
  CircleX,
  Edit3,
  Home,
  Info,
  Lightbulb,
  MapPin,
  Minus,
  Package,
  Plus,
  Rocket,
  RotateCcw,
  Save,
  Search,
  Shirt,
  Smartphone,
  Sparkles,
  Trophy,
  X,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, type DimensionValue, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type PublishMode = "sale" | "trade" | "trade-cash";
type PublishStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;

const colors = {
  background: "#F8F9FA",
  surface: "#FFFFFF",
  surfaceLow: "#F3F4F5",
  surfaceHigh: "#E1E3E4",
  text: "#191C1D",
  muted: "#5F5E5E",
  outline: "#D1C5AC",
  primary: "#F5C518",
  primaryText: "#695200",
  dark: "#191C1D",
  violet: "#5B5BD6",
};

const photos = [
  "https://lh3.googleusercontent.com/aida/ADBb0uh87IkLFidw7GYFSqWQWd1E3mP2pJ0uTVj2ZF-WThGORhMIw_Pqf2GfCxK-sA9BRkei2b_rNTxhpG4iAt1u1RwC6Puu8w-f4wL7oLzn6Q9g88N4RWAKA9DGz_GM_SLdUHi8D1PjV1ovLjNeUWg8Tibix_rewC0YavAHvD6so9sjMZZKUquHp6nACfOfBGOURCg0qFJdM8KT4RRmCnDtW1LvYOycmvQ_OJrh0cPfB9gPF15q_cq_pzKhMw",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDfelK77Nmuqc5_8eRqRia3m9NuJnAzKfOWZYQbbwGxNZjxMQSFQgmhjnmaB-gS3cbzpDAU_HWPt6J-Gnh6u4lJC6Tf-U7rQiAqQdcPLlfgcP7ISw585oN9oGK9FKPUzQUtcSMzrdzdugVzbPEHoIp-ef_Y0M7XQzTujDFNqvP1fWq1qfErDjejeg5fI0q5brLxgpHF94cG9LHcrTIvcWuLomj0vLCRUdWGc8abm3sS7PByr4SZXSGEZX2FSbcXgNqDmNFZKmQpZWQ",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCl1J2JkQt14uMliAZXeORX3LaqTCyRglI7z5Rm4ZmwY4FECZYPHWl700sZO6pIBpAuQqg7rHqWh9LPhs5MllTleaK2raso3bQt0DI8X4OkZOBqa2loDk6t0Lq2QSHVBZzThM53G1VSQWBsPvMZmxpOJdYIMYjC3Ki7tYdT1y3cPknmyYX1yb9NJ4rbTPFkn4U0dyHgH0XS12M_Wte-X_B_LFiSrjUZNv4oCGhLNClNkjldTLfRj5mRxH6xQ4c4MUq_FYFVqJIZWyk",
];

const mapImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAyRpQqK4fUNelktUs2pH4jNKU20tlGE_1xgGT_pt4jU-nh-yZKiJxvrCso7h63jXRwn7tpLa8OBUnZlntPMkYDT0oqpzmme3VHTrJ6flZAikh4poCM1Zag5lwzwq4WE59_OKBNR9eBfFNX98SmA-ebU7JC78RLWfdCsR3LKxmo5TSaD5dx0F8oAfv-jXkrZI8WEF54RnHwIzr22ECDtLQJo6q-M2xrs3Q-PDHhi74KPYLR-pa5UBk-cLiQlAXoQXA6nrYKm5RLKHs";

function Header({
  step,
  onBack,
  onClose,
}: {
  step: PublishStep;
  onBack: () => void;
  onClose: () => void;
}) {
  const progress = `${(step / 7) * 100}%` as DimensionValue;

  return (
    <SafeAreaView edges={["top"]} className="bg-[#F8F9FA]">
      <View className="px-5 pb-3 pt-2">
        <View className="h-11 flex-row items-center justify-between">
          <Pressable className="h-10 w-10 items-center justify-center" onPress={step === 1 ? onClose : onBack}>
            {step === 1 ? <X color={colors.text} size={25} /> : <ChevronRight color={colors.text} size={25} style={{ transform: [{ rotate: "180deg" }] }} />}
          </Pressable>
          <Text className="text-[15px] font-bold text-[#191C1D]">Publier une annonce</Text>
          <Pressable className="h-10 flex-row items-center justify-center">
            <Save color={colors.violet} size={18} />
            <Text className="ml-1 text-[13px] font-bold text-[#5B5BD6]">Brouillon</Text>
          </Pressable>
        </View>
        <View className="mt-3 h-1 overflow-hidden rounded-full bg-[#E1E3E4]">
          <View className="h-full rounded-full bg-[#F5C518]" style={{ width: progress }} />
        </View>
      </View>
    </SafeAreaView>
  );
}

function Footer({
  label = "Continuer",
  onNext,
  secondary,
}: {
  label?: string;
  onNext: () => void;
  secondary?: string;
}) {
  return (
    <View className="absolute bottom-0 left-0 right-0 gap-3 border-t border-[#E1E3E4] bg-white px-5 pb-6 pt-4">
      <Pressable className="h-14 flex-row items-center justify-center rounded-full bg-[#191C1D] shadow-soft" onPress={onNext}>
        <Text className="text-[16px] font-bold text-white">{label}</Text>
        <ArrowRight color="#FFFFFF" size={20} strokeWidth={2.4} style={{ marginLeft: 8 }} />
      </Pressable>
      {secondary ? <Text className="text-center text-[14px] font-bold text-[#5F5E5E]">{secondary}</Text> : null}
    </View>
  );
}

function ModeCard({
  title,
  subtitle,
  selected,
  icon,
  onPress,
}: {
  title: string;
  subtitle: string;
  selected: boolean;
  icon: "sale" | "trade" | "cash";
  onPress: () => void;
}) {
  const Icon = icon === "sale" ? BadgeDollarSign : icon === "trade" ? RotateCcw : Package;

  return (
    <Pressable className={`rounded-xl border bg-white p-5 shadow-soft ${selected ? "border-[#F5C518]" : "border-[#E1E3E4]"}`} onPress={onPress}>
      <View className="flex-row items-center">
        <View className={`h-12 w-12 items-center justify-center rounded-full ${selected ? "bg-[#F5C518]" : "bg-[#F3F4F5]"}`}>
          <Icon color={selected ? "#241A00" : "#191C1D"} size={24} />
        </View>
        <View className="ml-4 flex-1">
          <Text className="text-[18px] font-black text-[#191C1D]">{title}</Text>
          <Text className="mt-1 text-[14px] leading-5 text-[#5F5E5E]">{subtitle}</Text>
        </View>
        {selected ? <CheckCircle color="#F5C518" fill="#F5C518" size={24} /> : null}
      </View>
    </Pressable>
  );
}

function StepShell({ children }: { children: React.ReactNode }) {
  return (
    <ScrollView className="flex-1 bg-[#F8F9FA]" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 132 }}>
      <View className="px-5 pt-6">{children}</View>
    </ScrollView>
  );
}

function StepOne({ mode, setMode }: { mode: PublishMode; setMode: (mode: PublishMode) => void }) {
  return (
    <StepShell>
      <Text className="text-[30px] font-black leading-9 text-[#191C1D]">Comment souhaitez-vous vendre ?</Text>
      <Text className="mt-2 text-[16px] leading-6 text-[#5F5E5E]">Choisissez le type d’annonce. Vous pourrez ajuster les détails ensuite.</Text>
      <View className="mt-8 gap-4">
        <ModeCard icon="sale" selected={mode === "sale"} title="Vente classique" subtitle="Fixez un prix et recevez des demandes d’achat." onPress={() => setMode("sale")} />
        <ModeCard icon="trade" selected={mode === "trade"} title="Troc" subtitle="Échangez votre article contre un autre objet." onPress={() => setMode("trade")} />
        <ModeCard icon="cash" selected={mode === "trade-cash"} title="Troc + Cash" subtitle="Échange avec un complément d’argent." onPress={() => setMode("trade-cash")} />
      </View>
    </StepShell>
  );
}

const categories = [
  { label: "Véhicules", icon: CarFront },
  { label: "Immobilier", icon: Home },
  { label: "Électronique", icon: Smartphone, selected: true },
  { label: "Mode", icon: Shirt },
  { label: "Maison", icon: Armchair },
  { label: "Sport", icon: Trophy },
];

function StepTwo() {
  return (
    <StepShell>
      <View className="flex-row items-center">
        <Text className="text-[13px] font-bold uppercase tracking-[1px] text-[#5F5E5E]">Accueil</Text>
        <ChevronRight color="#5F5E5E" size={12} />
        <Text className="text-[13px] font-bold uppercase tracking-[1px] text-[#5F5E5E]">Catégorie</Text>
      </View>
      <View className="relative mt-6">
        <Search color="#5F5E5E" size={20} style={{ left: 16, position: "absolute", top: 12, zIndex: 1 }} />
        <TextInput className="h-11 rounded-full bg-[#F3F4F5] pl-12 pr-4 text-[15px] text-[#191C1D]" placeholder="Rechercher une catégorie..." placeholderTextColor="#5F5E5E" />
      </View>
      <View className="mt-6 overflow-hidden rounded-2xl bg-white shadow-soft">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <Pressable key={category.label} className={`flex-row items-center border-b border-[#EDEEEF] px-5 py-5 ${category.selected ? "border-l-4 border-l-[#F5C518] bg-[#FFFBEB]" : ""}`}>
              <Icon color={category.selected ? "#191C1D" : "#5F5E5E"} size={24} />
              <Text className={`ml-4 flex-1 text-[16px] ${category.selected ? "font-black text-[#191C1D]" : "font-semibold text-[#5F5E5E]"}`}>{category.label}</Text>
              {category.selected ? <CheckCircle color="#F5C518" fill="#F5C518" size={20} /> : <ChevronRight color="#5F5E5E" size={20} />}
            </Pressable>
          );
        })}
      </View>
      <View className="mt-6 flex-row rounded-2xl bg-[#F3F4F5] p-4">
        <Lightbulb color="#745B00" size={22} />
        <Text className="ml-3 flex-1 text-[13px] leading-5 text-[#4E4633]">Choisir la bonne catégorie augmente la visibilité de votre annonce.</Text>
      </View>
    </StepShell>
  );
}

function PhotoTile({ index, url }: { index: number; url?: string }) {
  if (!url) {
    return (
      <View className="aspect-square items-center justify-center rounded-xl border-2 border-dashed border-[#D1C5AC] bg-white">
        {index === 0 ? <Camera color="#807660" size={26} /> : <Plus color="#D1C5AC" size={24} />}
        {index === 0 ? <Text className="mt-1 text-[11px] font-bold text-[#807660]">Ajouter</Text> : null}
      </View>
    );
  }

  return (
    <View className="aspect-square overflow-hidden rounded-xl bg-white">
      <Image source={url} style={{ width: "100%", height: "100%" }} contentFit="cover" />
      <View className="absolute right-1 top-1 h-7 w-7 items-center justify-center rounded-full bg-black/60">
        <CircleX color="#FFFFFF" size={18} />
      </View>
      {index === 1 ? (
        <View className="absolute bottom-1 left-1 rounded bg-black/65 px-2 py-[2px]">
          <Text className="text-[10px] font-bold text-white">Photo principale</Text>
        </View>
      ) : null}
    </View>
  );
}

function StepThree() {
  return (
    <StepShell>
      <Text className="text-[24px] font-black text-[#191C1D]">Ajoutez vos photos</Text>
      <Text className="mt-2 text-[14px] leading-5 text-[#5F5E5E]">La première photo sera utilisée comme couverture de l’annonce.</Text>
      <View className="mt-6 flex-row flex-wrap justify-between gap-y-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <View key={index} className="w-[31%]">
            <PhotoTile index={index} url={index > 0 && index < 3 ? photos[index - 1] : undefined} />
          </View>
        ))}
      </View>
      <View className="mt-6 flex-row items-center rounded-2xl bg-[#EEF0FF] p-4">
        <Info color="#5B5BD6" size={22} fill="#5B5BD6" />
        <Text className="ml-3 flex-1 text-[13px] leading-5 text-[#5B5BD6]">Ajoutez jusqu’à 6 photos nettes pour obtenir plus de contacts.</Text>
      </View>
    </StepShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View>
      <Text className="mb-2 text-[13px] font-bold text-[#191C1D]">{label}</Text>
      {children}
    </View>
  );
}

function InputBox({ placeholder, multiline = false }: { placeholder: string; multiline?: boolean }) {
  return (
    <TextInput
      className={`rounded-xl border border-[#E1E3E4] bg-white px-4 text-[15px] text-[#191C1D] ${multiline ? "h-[120px] py-3" : "h-12"}`}
      multiline={multiline}
      placeholder={placeholder}
      placeholderTextColor="#9A9A9A"
      textAlignVertical={multiline ? "top" : "center"}
    />
  );
}

function StepFour() {
  const states = ["Neuf", "Très bon état", "Bon état", "État correct", "Pour pièces"];

  return (
    <StepShell>
      <Text className="mb-4 text-[30px] font-black leading-9 text-[#191C1D]">Décrivez votre article</Text>
      <View className="mb-6 self-start flex-row items-center rounded-full bg-[#F3F4F5] px-4 py-2">
        <Smartphone color="#191C1D" size={18} />
        <Text className="ml-2 text-[13px] font-bold text-[#191C1D]">Électronique › Smartphones</Text>
        <Edit3 color="#5F5E5E" size={16} style={{ marginLeft: 6 }} />
      </View>
      <View className="gap-5">
        <Field label="Titre de l’annonce">
          <InputBox placeholder="Ex: iPhone 13 Pro 256Go Bleu" />
        </Field>
        <Field label="Description">
          <InputBox multiline placeholder="Décrivez l'état, les accessoires inclus..." />
        </Field>
        <Field label="État">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {states.map((state) => {
              const selected = state === "Très bon état";
              return (
                <View key={state} className={`rounded-full border px-4 py-2 ${selected ? "border-[#745B00] bg-[#745B00]/5" : "border-[#E1E3E4] bg-white"}`}>
                  <Text className={`text-[12px] font-bold ${selected ? "text-[#745B00]" : "text-[#191C1D]"}`}>{state}</Text>
                </View>
              );
            })}
          </ScrollView>
        </Field>
        <Field label="Marque">
          <InputBox placeholder="Ex: Apple" />
        </Field>
        <Field label="Modèle">
          <InputBox placeholder="Ex: iPhone 13 Pro" />
        </Field>
      </View>
    </StepShell>
  );
}

function StepFiveSale() {
  return (
    <StepShell>
      <Text className="text-[32px] font-black text-[#191C1D]">Quel est votre prix ?</Text>
      <View className="mt-8 items-center">
        <View className="flex-row items-end">
          <TextInput className="w-40 text-center text-[48px] font-black text-[#191C1D]" keyboardType="number-pad" placeholder="0" defaultValue="150000" />
          <Text className="mb-3 text-[20px] font-bold text-[#5F5E5E]">FCFA</Text>
        </View>
      </View>
      <View className="mt-8 gap-3">
        {[
          ["Prix ferme", "Les acheteurs ne peuvent pas négocier"],
          ["Négociable", "Permettre aux acheteurs de proposer un prix"],
          ["Faire une offre", "Recevoir toutes les propositions"],
        ].map(([title, subtitle], index) => (
          <View key={title} className={`flex-row items-center rounded-2xl border p-4 ${index === 1 ? "border-[#F5C518] bg-[#FFFBEB]" : "border-[#E1E3E4] bg-white"}`}>
            {index === 0 ? <BadgeDollarSign color="#191C1D" size={22} /> : index === 1 ? <MessageIcon /> : <Sparkles color="#191C1D" size={22} />}
            <View className="ml-3 flex-1">
              <Text className="text-[15px] font-bold text-[#191C1D]">{title}</Text>
              <Text className="mt-1 text-[12px] text-[#5F5E5E]">{subtitle}</Text>
            </View>
            {index === 1 ? <CheckCircle color="#F5C518" fill="#F5C518" size={22} /> : <View className="h-6 w-6 rounded-full border border-[#E1E3E4]" />}
          </View>
        ))}
      </View>
    </StepShell>
  );
}

function MessageIcon() {
  return <Info color="#191C1D" size={22} />;
}

function StepFiveTrade() {
  return (
    <StepShell>
      <Text className="text-[30px] font-black leading-9 text-[#191C1D]">Que souhaitez-vous en échange?</Text>
      <Text className="mt-2 text-[15px] leading-6 text-[#5F5E5E]">Décrivez les objets que vous acceptez pour cet échange.</Text>
      <View className="mt-8 rounded-2xl bg-white p-4 shadow-soft">
        <TextInput className="h-[140px] text-[16px] text-[#191C1D]" multiline placeholder="Ex: Cherche vélo de ville, trottinette électrique ou console PS5..." placeholderTextColor="#999999" textAlignVertical="top" />
        <Text className="text-right text-[12px] text-[#5F5E5E]">0/300</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-5" contentContainerStyle={{ gap: 8 }}>
        {["Téléphone", "Ordinateur", "Vélo", "Console", "Électroménager"].map((chip) => (
          <View key={chip} className="rounded-full border border-[#D1C5AC] bg-white px-4 py-2">
            <Text className="text-[14px] text-[#5F5E5E]">{chip}</Text>
          </View>
        ))}
      </ScrollView>
      <View className="mt-8 flex-row items-center justify-between rounded-2xl bg-[#F3F4F5] p-4">
        <View className="flex-row items-center">
          <SlidersMini />
          <Text className="ml-3 text-[15px] font-bold text-[#191C1D]">Accepter les propositions proches</Text>
        </View>
        <View className="h-7 w-12 items-end rounded-full bg-[#191C1D] p-1">
          <View className="h-5 w-5 rounded-full bg-white" />
        </View>
      </View>
    </StepShell>
  );
}

function SlidersMini() {
  return <Info color="#745B00" size={22} />;
}

function StepFiveTradeCash() {
  return (
    <StepShell>
      <Text className="text-[24px] font-black text-[#191C1D]">Troc avec complément</Text>
      <Text className="mt-2 text-[15px] leading-6 text-[#5F5E5E]">Précisez l’échange souhaité et le complément cash.</Text>
      <View className="mt-6 rounded-xl border border-[#E5E7EB] bg-white p-4">
        <TextInput className="h-[140px] text-[15px] text-[#191C1D]" multiline placeholder="Ex: Cherche vélo de ville, trottinette électrique ou console PS5..." placeholderTextColor="#999999" textAlignVertical="top" />
      </View>
      <View className="mt-8 items-center">
        <Text className="text-[13px] font-bold uppercase tracking-[1px] text-[#5F5E5E]">Complément cash</Text>
        <View className="mt-3 flex-row items-end">
          <TextInput className="w-32 border-b-2 border-[#E1E3E4] text-center text-[48px] font-black text-[#191C1D]" keyboardType="number-pad" defaultValue="0" />
          <Text className="mb-3 text-[20px] font-bold text-[#5F5E5E]">FCFA</Text>
        </View>
      </View>
      <View className="mt-8 flex-row gap-3">
        <View className="flex-1 flex-row items-center justify-center rounded-xl bg-[#2A313D] px-4 py-[14px]">
          <ArrowDownCircle color="#FFFFFF" size={20} />
          <Text className="ml-2 font-bold text-white">Je reçois</Text>
        </View>
        <View className="flex-1 flex-row items-center justify-center rounded-xl border border-[#D1C5AC] bg-[#F3F4F5] px-4 py-[14px]">
          <ArrowUpCircle color="#4E4633" size={20} />
          <Text className="ml-2 font-bold text-[#4E4633]">Je donne</Text>
        </View>
      </View>
    </StepShell>
  );
}

function StepSix() {
  return (
    <StepShell>
      <Text className="text-[24px] font-black leading-8 text-[#191C1D]">Où se trouve votre article?</Text>
      <Text className="mt-2 text-[15px] leading-6 text-[#5F5E5E]">La localisation approximative aide les acheteurs à vous trouver.</Text>
      <View className="relative mt-6">
        <MapPin color="#5B5BD6" size={22} style={{ left: 16, position: "absolute", top: 13, zIndex: 1 }} />
        <TextInput className="h-12 rounded-2xl border border-[#8283FF] bg-white px-12 text-[15px] text-[#191C1D]" placeholder="Ex: Paris, 75001" defaultValue="Cocody, Abidjan" />
        <MapPin color="#5F5E5E" size={20} style={{ position: "absolute", right: 16, top: 14 }} />
      </View>
      <View className="mt-4">
        {["Cocody Riviera, Abidjan", "Cocody Angré, Abidjan"].map((place) => (
          <View key={place} className="flex-row items-center py-2">
            <MapPin color="#5F5E5E" size={18} />
            <Text className="ml-3 text-[14px] text-[#5F5E5E]">{place}</Text>
          </View>
        ))}
      </View>
      <View className="mt-5 h-[220px] overflow-hidden rounded-3xl bg-white shadow-soft">
        <Image source={mapImage} style={{ width: "100%", height: "100%" }} contentFit="cover" />
        <View className="absolute inset-0 items-center justify-center">
          <MapPin color="#F5C518" fill="#F5C518" size={44} />
        </View>
        <View className="absolute right-3 top-3 gap-2">
          <View className="h-8 w-8 items-center justify-center rounded-lg bg-white shadow-soft"><Plus color="#191C1D" size={18} /></View>
          <View className="h-8 w-8 items-center justify-center rounded-lg bg-white shadow-soft"><Minus color="#191C1D" size={18} /></View>
        </View>
      </View>
      <View className="mt-5 flex-row gap-2">
        {["Masquer rue", "Quartier", "Adresse exacte"].map((label, index) => (
          <View key={label} className={`flex-1 rounded-full border px-2 py-3 ${index === 1 ? "border-[#191C1D] bg-[#191C1D]" : "border-[#D1C5AC] bg-white"}`}>
            <Text className={`text-center text-[12px] font-bold ${index === 1 ? "text-white" : "text-[#5F5E5E]"}`}>{label}</Text>
          </View>
        ))}
      </View>
    </StepShell>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between border-b border-[#EDEEEF] py-4">
      <View>
        <Text className="text-[12px] font-bold uppercase tracking-[1px] text-[#5F5E5E]">{label}</Text>
        <Text className="mt-1 text-[15px] font-semibold text-[#191C1D]">{value}</Text>
      </View>
      <Edit3 color="#5F5E5E" size={18} />
    </View>
  );
}

function StepSeven({ mode }: { mode: PublishMode }) {
  const modeLabel = mode === "sale" ? "Vente" : mode === "trade" ? "Troc" : "Troc + Cash";

  return (
    <StepShell>
      <View className="items-center">
        <View className="h-10 w-10 items-center justify-center rounded-full bg-[#D7F3FA]">
          <Check color="#00687C" size={20} strokeWidth={3} />
        </View>
        <Text className="mt-5 text-center text-[24px] font-black text-[#191C1D]">Vérifiez votre annonce</Text>
        <Text className="mt-2 text-center text-[14px] leading-5 text-[#5F5E5E]">Dernière étape avant publication.</Text>
      </View>
      <View className="mt-6 overflow-hidden rounded-3xl bg-white shadow-soft">
        <Image source={photos[0]} style={{ width: "100%", height: 190 }} contentFit="cover" />
        <View className="p-4">
          <View className="flex-row items-start justify-between">
            <Text className="max-w-[70%] text-[20px] font-black leading-6 text-[#191C1D]">Leica M3 Replica - État Exceptionnel</Text>
            <Text className="text-[18px] font-black text-[#F5C518]">150 000 FCFA</Text>
          </View>
          <View className="mt-3 flex-row items-center">
            <MapPin color="#5F5E5E" size={14} />
            <Text className="ml-1 text-[12px] text-[#5F5E5E]">Cocody, Abidjan</Text>
            <Text className="mx-3 text-[#D1C5AC]">•</Text>
            <Text className="text-[12px] text-[#5F5E5E]">Maintenant</Text>
          </View>
        </View>
      </View>
      <View className="mt-6 rounded-2xl bg-white px-4 shadow-soft">
        <SummaryRow label="Mode" value={modeLabel} />
        <SummaryRow label="Catégorie" value="Électronique › Smartphones" />
        <SummaryRow label="État" value="Très bon état" />
        <SummaryRow label="Localisation" value="Cocody, Abidjan" />
        <SummaryRow label="Photos" value="3 photos ajoutées" />
      </View>
    </StepShell>
  );
}

export function PublishFlowScreen() {
  const [step, setStep] = useState<PublishStep>(1);
  const [mode, setMode] = useState<PublishMode>("sale");

  const content = useMemo(() => {
    if (step === 1) return <StepOne mode={mode} setMode={setMode} />;
    if (step === 2) return <StepTwo />;
    if (step === 3) return <StepThree />;
    if (step === 4) return <StepFour />;
    if (step === 5 && mode === "sale") return <StepFiveSale />;
    if (step === 5 && mode === "trade") return <StepFiveTrade />;
    if (step === 5) return <StepFiveTradeCash />;
    if (step === 6) return <StepSix />;
    return <StepSeven mode={mode} />;
  }, [mode, step]);

  const next = () => {
    if (step === 7) {
      router.push("/(tabs)/home");
      return;
    }

    setStep((current) => (Math.min(current + 1, 7) as PublishStep));
  };

  const back = () => setStep((current) => (Math.max(current - 1, 1) as PublishStep));
  const close = () => router.back();

  return (
    <View className="flex-1 bg-[#F8F9FA]">
      <Header step={step} onBack={back} onClose={close} />
      {content}
      <Footer label={step === 7 ? "Publier maintenant" : "Continuer"} onNext={next} secondary={step === 3 ? "Retour" : step === 7 ? "Enregistrer comme brouillon" : undefined} />
    </View>
  );
}
