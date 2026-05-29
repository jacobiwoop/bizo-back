import { Image } from "expo-image";
import { router } from "expo-router";
import {
  ArrowLeft,
  CheckCircle,
  Clock3,
  Edit3,
  Eye,
  Heart,
  ImageOff,
  LogOut,
  MessageCircle,
  RefreshCw,
  Share2,
  SlidersHorizontal,
  ShoppingBag,
  Settings,
  Star,
  Trash2,
  TrendingUp,
  User,
  UserRoundCheck,
  Verified,
  X,
} from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useLogoutMutation } from "@/src/features/auth/api/use-auth-mutations";
import { resolveMediaUrl } from "@/src/lib/api/media";
import { ApiUser } from "@/src/lib/api/types";
import { useSessionStore } from "@/src/store/session";

const profileAvatar =
  "https://lh3.googleusercontent.com/aida/ADBb0uiKx5lxO6EmhqIu9BRVYIlcW2tkqf9mM27B1XReh7dPAWch4i-7FIzYqQPB_GsSDPxunY0Sc-KQio1L06hiGj_nNZb535vDypNEvpeyqHctP3VeRNOTQvX2_R3Os7lpL-V-HlcgIokbDJ9dpxQ3zgwW8G-YZpAV2xOnyjt-TMoVf2G2xWfBn4QWQIMtAF-uZJqUAE9gjNMZNfHwlT-oUuOZauUMGbrV3peJZAYZBiimn64S7oeGtT5Tpg";

const draftImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCyV--A43e3iRFqbvnZHClg32tCYZJe4ScqwH6ZVSfJLAtyLMiqfYN1hd6QomPVgQU4gLYvy7MWDhra7B-Aurs07-VfcqceQi_W2VHO-9FZoJc-Ftr7iVU2LTPTeRjgsWLIO2PJMb0zsefMJHl4ZYts7BlmhCAQJpvAYmqIXC1TfhmbyFwCb3KfdECmnxsJCFazPyOhO18wo6qonH-e4lAQ-I9JxGkkuGJEx0218Br4SVPZIY2bFmHq_KojDjnHt58gwxlPY8dAAf8";

type ProfileTab = "Actives" | "Vendues" | "Brouillons" | "Favoris";

const soldItems = [
  {
    buyer: "Martin D.",
    date: "Vendu le 12 Mai 2026",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAgZP5ImJbLQio5b_qYNsW-Uq5DZzYNYSVvaKlT_UyRIGLgoIUQocsLoUs7_qLFqr16zj0W_jiiIjkCOgSZYht2xKLwExrvcToZwX0YAuaALIqxuJMURgAEjmGOtf5yIkcGJ4z5KkHktn0LPBELzSiUQUlHwjp8xISLjACPdUU2QuomsBDahvAwC23fwoD6863pbQGfbPVmUQm6i0uLjNjnD-Br3tW9ltreMUT-hNRaiUWsLgPUc18i2zbFhBDedPXsWpuD30oLa5o",
    price: "1 200 €",
    title: "MacBook Pro M2",
  },
  {
    buyer: "Sarah L.",
    date: "Vendu le 08 Mai 2026",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCBIPQ_mxQ1PWSIDdt4ZtvDsYHYXqRz59SvzFPSAGqBMR_3a9Kho60ork4N7EIHge-sopq-JSRo7HsmiCfjlWyCfin33Yl7aJCq6Lv8GkWWLhx9Pqo1K1431DNUR50AuIatssq3ODypCo2rvVhIID_HiFGWg1iceJfByiChfPOs5m7P9cIZB3ifXFaqTWgMurh1i2gUO-PUICnZ2CaitKVSlL1FYqcKym1HByyr7oFH_QKyEb3P0MoKP0usEOcFPB4CL4w-9-1IbdE",
    price: "85 €",
    title: "Veste Cuir Zara",
  },
  {
    buyer: "Thomas K.",
    date: "Vendu le 02 Mai 2026",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAwV-HDjahelxsJJ5Nst1v1qld0XxWoXoldn7kZYRIQQyvODXd3Q2Z3Sh0sjp8dffZT1LTmU6Kb1IyIILOSjg1hEaV9vr3-9Tl-5jhZDNG_48eAg3jyDIyOJTRh_ZaJ-W2UYakn59BaC_MH33BSfa1WW8a5aY0G49qSsOZGzXA5FM3s4Zs2guxbJ3McGv0KvaoAJ4NklZsXy6CrzZkVqpbDJtS-j1-e15nVUOp1KE4vk-SV16Hg1p3rLPAzvQ_Is2eYhxsO6lTSHIw",
    price: "140 €",
    title: "Nike Air Max",
  },
  {
    buyer: "Claire M.",
    date: "Vendu le 28 Avril 2026",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCuOtGGFGj1SfrGA1Vv71MrniH_53lyz36B5qdy-tciYvvm19FX7Xo0MPnlv3EVrYnUB6IWQdMq2zBPGNvRP_LCPebURU7mKMFmbFt3oHhGTQ3Wn1Hi5Yzg1PXh00mH3yxRXHtDG-Zav7TgbfOKJ8jlmDMtTXyeDY_mQ6cT5FaorNKMuuUi0pMg_d3vHAShvjCGFF-lOggRsbAETnBoO9281zUb1k8hqqyvFAckRewVa1oRv730OU8AzJ2fKo8u5pOt3NvVtDBYTRc",
    price: "190 €",
    title: "Bose Soundlink",
  },
];

const activeItems = [
  {
    badge: "VENTE",
    badgeColor: "#1C1B1B",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAMHYQ-VEEg97wEHAskELTelyikQg8DZLCX8REUfkN-vKuDhVmTy20vYRcTNJouVCD6XyznSjsnvBHG6e-PjSxFsTb48NHkYkYqf9XG3q5rWxqKn0W3qpCScpMEFZZp4qmTCn3J3scJb3mGojM5iMkdBaw--uZPvBoPWO5i7L4ppW6gdP7TpABT4MAHQ-PL3rnWlDko-fZEwykA-bRIxLrBs1w1cp3yfTMlsTexvqK_p-tUjaPsjyW0xspjSudDqx3Nx0jGsDbFAxE",
    location: "Paris • 2j",
    price: "120 €",
    title: "Casque Audio Studio High-Fi Noir",
    views: "243",
  },
  {
    badge: "TROC",
    badgeColor: "#5B5BD6",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBQPzxgF_Mq_Za0wBCd8SOKCIRbnx-CEIWPKEWycbidWH2SgBvO4vso9WkXVQ_5t8qMOPC3rpxE7JMKRMpuPTaWD-MPUmGjiU_j_CK-zV_ahbVb5jq6zlBd4ofjZlooQrub8EpmGF31JDXOWh-ouT69atlJcJFR2hx_fO3BdI5mIOSe0umYdFcp7j9LYT5YMjVCrTkUN25sXbbYNrJz1VBAKZwp1-N0jJ5uXdMDVSdBpmcVwt1fNNdvorF4O79D36OzVk5HnEJglbU",
    location: "Lyon • 5j",
    price: "À Troquer",
    title: 'MacBook Pro 13" M1 Excellent État',
    views: "89",
  },
  {
    badge: "TROC + CASH",
    badgeColor: "#F5C518",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCtYqwdoPpxEoWfy1Qp6LV9tbPb30P804hGH2OlbpaIz996gQ5FI6sL82BnOAhjUpzPXm0FF07tajJU-oe6-lYIPN6C23UKk70iAPI3yvzH_YMqUrVguWijw3XGpUVqJqk_ylJceSQxy2p0BVmLqQogU9Zn-so_minNDwx0auwIgFNOW6xeL1yQ2opcvH3A8apJCDPHiXidFQED32ihq5-sYyvfsubYFRuk_SV-D_1E8wu-X2VY3diEEM3SW5py0sR4l11q_R-t6xo",
    location: "Bordeaux • 12h",
    price: "45 € + Troc",
    title: "Baskets Running Pro Performance Red",
    views: "156",
  },
  {
    badge: "VENTE",
    badgeColor: "#1C1B1B",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCAW16eE4-vPXZDTa6oN-_fPmHSfE_l_dOamHsI4KRAAQfdxYKykXSGLh4WMHiLXPvFqKH0tUDWo8ON6djl2Zh7xdw99n-1HiNvtlrXD4xozWhtGdRgD2Y5-6PRZ4z9FNXKdrEAV12C_LyO6ajvD3RwYJGn7_s1VH6x1TNPQEnPB5m-2dgatKptpdA9SfeVCVJrbLnUYLUIyf4BMRuRRQ7G1IGD68Yc_8S-LPVSiWdzWaY1TrtaFd_NsUkE3QgT5Z7CtGNk-Yr7TH0",
    location: "Nice • 1sem",
    price: "380 €",
    title: "iPad Air 4 64Go Gris Sidéral",
    views: "512",
  },
];

const favoriteItems = [
  {
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCRwSYOl3V8ezmxFmmqyKwzvBjKHr6MZR5UqRM_TRKajQS50St-_tkMqBHdMezoYfrnie3aUl5oisnMejTocgMhhymwB4glbpnBQSFahbTlPB0kU9XHYURz5MDhRmLbWzBhFXcHa9RgzBaN0tTzvrL-_3-yeNOsIYPEtu74zwhqNRyo2I0IiDAyq3vH5B5j7RObe58c0nJX86w6PdiZ_7YreIyEKOE58785KGyQSpwJJPZ8xpKNTipASnlWul0YKrUmBg7ivn03sXE",
    badge: "VENTE",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAMhgOIUAdZi_8EPtbpFUVN0HltFI6xdDDKPE7bDpbBu8Wws-AtD3cyxE9VWRc2XiWEL83H3NQPaY-i6rV9AhUQzXvXGqXCHHWtVXL_kFWtqY7pH1a6ZvF35y1so4n_6YFla4Xxq8SnzS90XHPuu6weJCPlPyMt1EOMQYejkKYPZA6ZGWJ1vy8_maLzpRPQ2fk-542aSdF29xaB57ZTM4uqI0rPcUz_OGnRZ7-uXfRo1uh54bC8EFzOFk4hGs9R3ObKNM90H3D1VRw",
    price: "750€",
    seller: "Thomas B.",
    title: "iPhone 13 Pro",
    verified: true,
  },
  {
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCPq_Wy8ucQEbEfU8jjOawqeFlL9f8RwQ4NTY0Zojq8KgpR3Mc1RdF5ARUHc5O9wxjN5Xiqyng89HM3r4-K3Rm98VrjWQtApgINgaXWgQddqlfOMuOUkvsbRf9hb_U8xfd4os3FgCvDYY4KG_1-3LyOUchlcFhpRbB6KJ0Ux_PIkbq_iPi72G7uy5iMqDLrFBxiy5BDuGVO9zj5Oz9RYiQvWQu_6Qmu2-iRVu2gYkDVPx-U56pXH37po4uX0ZxQLjcxBMpuH9rzHfI",
    badge: "TROC",
    disabled: true,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAVUJRmD9E7khW-eXr--DSJCXYo4DV2JRneGJLjKhONQFBGcbG49I_ekZvs_Xj_A02Adm30yku8algz8XYMdEWeSydEMLHTImY9jR_5MnR_jEKHDgU2GENNGANedq43LG66U6peMeymrK2OCfGvBt3mJ_MRLY49X-pVeRU68YT2oaC8h21NqljdSVutgZIg-MDSsONJqUk9GXuMtIUUrKH3vc00jcUIUjtP_G4FBuWOI6BfiQb3JkSJOuT1dx9MV1DERyVdWVEOfaA",
    price: "400€",
    seller: "Sophie L.",
    title: "PlayStation 5",
  },
  {
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDFyJ6gS7KJ2WnqlT197TQ7DRdMRLTau1ySfrGOnyf9BEl4DKAUyqgvroQYymoqweR0jGTLvTaD0hW9TKDVJIWFGoPTCUaX9gGnHtKlVfv5Uc-9tybICuYURtzeckmTafq8DH8Ld7kOoVW2lKkr-0lIB-TPV3tTYlIpzcNtAVFXiuZ7NCoZGCUwhREnAC5U4MjkmHrt4MkuYsngHTKVMCSQUY7eZZycCH-GkkM1YdzGGQtP7jLnyMRijQa38M3fbDNbOf83kUElY1Q",
    badge: "VENTE",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAuO_BLCx7wEn2FLwMcF3_4tffGf_6s6NRpKLvkLR9C7ehZxA7tT2M1TIuxAO23iBZQU5VMUeIZz3HnGqQ0cT7WM6dxT5FLTTK8PHq9rE3PX4Qamb8wHQyixpEz4BEUXfnamKnxGk5FPJLyZumNlzwHxn1nmEMD0NXdB2H6rqY8fgSeUw6mX-kHLqezDhRYmQDUfNerfmQ4lcHBqPcLCII899YgzzMKZjUM81Z50cY7R4Ocss6pKynfoy2L3VZMUxhJqnoojBwh_fU",
    price: "850€",
    seller: "Lucas M.",
    title: "MacBook Air M1",
    verified: true,
  },
  {
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBM2VSsi1qLMwKennUxMO6pp7wmlM-j9X6yzXXTutSKAviQrPVB8-69VisiP3yefe2CNBkzCRVm60ZmHPUgfL635DSUabTPsMSHK7IKnx7jttTul9JiR0ZlzdD5Rt3Hn-NaT5YFCOCIGtgPriA6SexQYcRKNExceRIwsrL21onMzkV3djQIOdWLmDfjiR9q6-oTD255_GnXygvp2V3_Q9QK9u3cP6pE3inSq-k0BvymM3RR8-lDYVJfAsrL69JHWFbS4TcBcugzkWU",
    badge: "VENTE",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBzGuD6hQoW-1rYsdeQckYBMneqvUARlIKUzuCeqhRRYcBgK2yYVRlxexD7gdVIbxjbIQAFkOpCaKe2yyacfM7Bc7SYLFEa8z57Th9SmBEMB1qFkSNqkCEdo2kSlW1X_UWm0EOHoVykZQx09b6JLkdsTLpdpRGbmo6RfG0Pcm5QBaeByPhxuw3a9il-23SKqmP6YEXc6aopwtynoAOItFaFcwBLb_M3JfmZKPujLequamzMfpckHhTy8R0HekQB6Ga30rPI3NrzA0Y",
    price: "120€",
    seller: "Emma R.",
    title: "Nike Air Jordan",
  },
];

function ProfileHeader({ onOpenSettings }: { onOpenSettings: () => void }) {
  return (
    <SafeAreaView edges={["top"]} className="bg-[#F8F9FA]/95">
      <View className="h-[64px] flex-row items-center justify-between px-5">
        <View className="flex-row items-center">
          <ArrowLeft color="#745B00" size={24} strokeWidth={2} />
          <Text className="ml-2 text-[24px] font-black text-[#745B00]">Mon Profil</Text>
        </View>
        <Pressable className="h-10 w-10 items-center justify-center rounded-full" onPress={onOpenSettings}>
          <Settings color="#5F5E5E" size={22} strokeWidth={2} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function UserSummary({ user }: { user: ApiUser | null }) {
  const avatar = resolveMediaUrl(user?.photo_url) ?? profileAvatar;
  const displayName = user?.display_name || user?.email || "Utilisateur Bizo";
  const badge = user?.is_verified ? "Vendeur vérifié" : "Compte Bizo";

  return (
    <View className="flex-row items-center gap-4">
      <View>
        <Image source={avatar} style={{ width: 80, height: 80, borderRadius: 40, borderWidth: 4, borderColor: "#FFFFFF" }} contentFit="cover" />
        <View className="absolute -bottom-1 -right-1 h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#F5C518]">
          <Verified color="#695200" fill="#F5C518" size={17} strokeWidth={2.2} />
        </View>
      </View>
      <View className="flex-1">
        <Text className="text-[22px] font-black text-[#191C1D]">{displayName}</Text>
        <View className="mt-2 self-start flex-row items-center rounded-full bg-[#E2DFDE] px-3 py-1">
          <UserRoundCheck color="#636262" size={13} strokeWidth={2} />
          <Text className="ml-1 text-[10px] font-bold uppercase tracking-[0.7px] text-[#636262]">{badge}</Text>
        </View>
      </View>
    </View>
  );
}

function StatsBanner() {
  return (
    <View className="flex-row items-center justify-between rounded-xl border border-[#EDEEEF] bg-white p-4 shadow-soft">
      <View className="flex-row items-center">
        <View className="h-10 w-10 items-center justify-center rounded-full bg-[#F5C518]/20">
          <TrendingUp color="#745B00" size={22} strokeWidth={2} />
        </View>
        <View className="ml-3">
          <Text className="text-[14px] font-bold text-[#191C1D]">1 243 vues cette semaine</Text>
          <Text className="mt-1 text-[13px] text-[#5F5E5E]">Votre profil est très actif</Text>
        </View>
      </View>
      <Text className="text-[13px] font-bold text-green-600">+12%</Text>
    </View>
  );
}

function QuickStats() {
  const stats = [
    { value: "47", label: "Annonces" },
    { value: "4.8", label: "Note", star: true },
    { value: "312", label: "Followers" },
    { value: "5", label: "Messages" },
  ];

  return (
    <View className="flex-row rounded-xl bg-white py-4 shadow-soft">
      {stats.map((item, index) => (
        <View key={item.label} className={`flex-1 items-center justify-center ${index < stats.length - 1 ? "border-r border-[#EDEEEF]" : ""}`}>
          <View className="flex-row items-center">
            <Text className="text-[21px] font-black text-[#191C1D]">{item.value}</Text>
            {item.star ? <Star color="#F5C518" fill="#F5C518" size={14} style={{ marginLeft: 2 }} /> : null}
          </View>
          <Text className="mt-1 text-[9px] font-bold uppercase tracking-[0.7px] text-[#5F5E5E]">{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

function ProfileTabs({
  activeTab,
  onChange,
}: {
  activeTab: ProfileTab;
  onChange: (tab: ProfileTab) => void;
}) {
  const tabs = ["Actives", "Vendues", "Brouillons", "Favoris"];

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-5" contentContainerStyle={{ gap: 24, paddingHorizontal: 20 }}>
      {tabs.map((tab) => {
        const active = tab === activeTab;
        return (
          <Pressable key={tab} className={`border-b-2 pb-3 ${active ? "border-[#F5C518]" : "border-transparent"}`} onPress={() => onChange(tab as ProfileTab)}>
            <Text className={`text-[13px] font-bold ${active ? "text-[#191C1D]" : "text-[#5F5E5E]"}`}>{tab}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function CompletionBar({ value }: { value: number }) {
  return (
    <View className="mt-1">
      <Text className="mb-1 text-[10px] font-bold text-[#5B5BD6]">Complétion {value}%</Text>
      <View className="h-[6px] overflow-hidden rounded-full bg-[#EDEEEF]">
        <View className="h-full rounded-full bg-[#5B5BD6]" style={{ width: `${value}%` }} />
      </View>
    </View>
  );
}

function DraftCard({
  title,
  price,
  completion,
  image,
  empty,
  saved,
}: {
  title: string;
  price: string;
  completion: number;
  image?: string;
  empty?: boolean;
  saved: string;
}) {
  return (
    <View className="w-[48%] overflow-hidden rounded-xl border-2 border-dashed border-[#D1D5DB] bg-white shadow-soft">
      <View className="relative aspect-square bg-[#E7E8E9]">
        {image ? (
          <Image source={image} style={{ width: "100%", height: "100%", opacity: 0.6 }} contentFit="cover" />
        ) : (
          <View className="h-full w-full items-center justify-center bg-[#E1E3E4]">
            <ImageOff color="#A0A0A0" size={38} strokeWidth={1.8} />
          </View>
        )}
        <View className="absolute left-2 top-2 rounded-full bg-[#5F5E5E]/80 px-2 py-[2px]">
          <Text className="text-[10px] font-bold text-white">BROUILLON</Text>
        </View>
        <View className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-5 -translate-y-5 items-center justify-center rounded-full bg-white/90 shadow-soft">
          <Edit3 color="#5F5E5E" size={20} strokeWidth={2} />
        </View>
      </View>
      <View className="gap-2 p-3">
        <Text className={`text-[14px] ${empty ? "italic text-[#5F5E5E]" : "font-bold text-[#191C1D]"}`} numberOfLines={1}>
          {title}
        </Text>
        <Text className={`text-[14px] ${empty ? "italic text-[#5F5E5E]" : "font-black text-[#745B00]"}`} numberOfLines={1}>
          {price}
        </Text>
        <View className="flex-row items-center">
          <Clock3 color="#5F5E5E" size={12} strokeWidth={2} />
          <Text className="ml-1 text-[10px] text-[#5F5E5E]">{saved}</Text>
        </View>
        <CompletionBar value={completion} />
        <View className="mt-2 gap-[6px]">
          <Pressable className="rounded-lg bg-[#5B5BD6]/10 py-2">
            <Text className="text-center text-[11px] font-bold text-[#5B5BD6]">Continuer</Text>
          </Pressable>
          <View className="flex-row gap-[6px]">
            <Pressable className="flex-1 rounded-lg bg-[#EDEEEF] py-2">
              <Text className="text-center text-[11px] font-bold text-[#5F5E5E]">Publier</Text>
            </Pressable>
            <Pressable className="flex-1 rounded-lg bg-[#FFDAD6]/30 py-2">
              <Text className="text-center text-[11px] font-bold text-[#BA1A1A]">Supprimer</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

function SoldSummaryBanner() {
  return (
    <View className="flex-row items-center rounded-xl bg-[#49DBFF]/20 p-4">
      <View className="h-10 w-10 items-center justify-center rounded-full bg-[#00687C]">
        <ShoppingBag color="#FFFFFF" size={21} strokeWidth={2} />
      </View>
      <View className="ml-4">
        <Text className="text-[14px] font-bold text-[#191C1D]">38 transactions réussies</Text>
        <Text className="mt-1 text-[13px] text-[#5F5E5E]">Continuez comme ça!</Text>
      </View>
    </View>
  );
}

function SoldCard({
  item,
}: {
  item: (typeof soldItems)[number];
}) {
  return (
    <View className="w-[48%] overflow-hidden rounded-xl bg-white shadow-soft">
      <View className="relative aspect-square bg-[#E1E3E4]">
        <Image source={item.image} style={{ width: "100%", height: "100%", opacity: 0.45 }} contentFit="cover" />
        <View className="absolute inset-0 items-center justify-center bg-black/50">
          <CheckCircle color="#FFFFFF" size={32} strokeWidth={2.2} />
          <Text className="mt-1 text-[12px] font-bold tracking-[2px] text-white">VENDU</Text>
        </View>
      </View>
      <View className="flex-1 p-3">
        <Text className="mb-1 text-[14px] font-bold text-[#191C1D]" numberOfLines={1}>
          {item.title}
        </Text>
        <Text className="text-[13px] text-[#5F5E5E] line-through">{item.price}</Text>
        <Text className="mb-2 text-[13px] font-bold text-green-600">{item.date}</Text>
        <View className="mb-3 flex-row items-center">
          <User color="#5F5E5E" size={14} strokeWidth={2} />
          <Text className="ml-1 text-[11px] text-[#5F5E5E]">À: {item.buyer}</Text>
        </View>
        <View className="mt-auto flex-row justify-between border-t border-[#EDEEEF] pt-2">
          <Eye color="#5F5E5E" size={20} strokeWidth={2} />
          <RefreshCw color="#5F5E5E" size={20} strokeWidth={2} />
          <Star color="#745B00" fill="#745B00" size={20} strokeWidth={2} />
        </View>
      </View>
    </View>
  );
}

function DraftsContent() {
  return (
    <View className="flex-row flex-wrap justify-between gap-y-4">
      <DraftCard completion={60} image={draftImage} price="250,00 €" saved="Sauvegardé il y a 2j" title="Appareil Photo Vintage" />
      <DraftCard completion={20} empty price="Prix non défini" saved="Sauvegardé il y a 5j" title="Sans titre" />
    </View>
  );
}

function SoldContent() {
  return (
    <View className="gap-4">
      <SoldSummaryBanner />
      <View className="flex-row flex-wrap justify-between gap-y-4">
        {soldItems.map((item) => (
          <SoldCard key={item.title} item={item} />
        ))}
      </View>
    </View>
  );
}

function ActiveCard({ item }: { item: (typeof activeItems)[number] }) {
  const lightBadge = item.badgeColor === "#F5C518";

  return (
    <View className="w-[48%] overflow-hidden rounded-2xl bg-white shadow-soft">
      <View className="relative h-[120px]">
        <Image source={item.image} style={{ width: "100%", height: "100%" }} contentFit="cover" />
        <View className="absolute left-2 top-2 rounded-full px-2 py-[2px]" style={{ backgroundColor: item.badgeColor }}>
          <Text className={`text-[9px] font-bold ${lightBadge ? "text-[#241A00]" : "text-white"}`}>{item.badge}</Text>
        </View>
        <View className="absolute right-2 top-2 flex-row items-center rounded-full bg-black/40 px-[6px] py-[2px]">
          <Eye color="#FFFFFF" size={10} />
          <Text className="ml-[2px] text-[10px] font-bold text-white">{item.views}</Text>
        </View>
      </View>
      <View className="flex-1 p-3">
        <Text className="mb-1 text-[13px] font-bold leading-[17px] text-[#191C1D]" numberOfLines={2}>
          {item.title}
        </Text>
        <Text className="mb-2 text-[15px] font-black text-[#F5C518]">{item.price}</Text>
        <Text className="text-[11px] text-[#5F5E5E]">{item.location}</Text>
      </View>
      <View className="flex-row border-t border-[#D1C5AC]">
        {[Edit3, CheckCircle, Trash2].map((Icon, index) => (
          <Pressable key={index} className={`flex-1 items-center py-2 ${index < 2 ? "border-r border-[#D1C5AC]" : ""}`}>
            <Icon color={index === 2 ? "#BA1A1A" : "#5F5E5E"} size={18} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function ActiveContent() {
  return (
    <View className="flex-row flex-wrap justify-between gap-y-4">
      {activeItems.map((item) => (
        <ActiveCard key={item.title} item={item} />
      ))}
    </View>
  );
}

function FavoriteCard({ item }: { item: (typeof favoriteItems)[number] }) {
  const unavailable = Boolean(item.disabled);
  const trade = item.badge === "TROC";

  return (
    <View className={`w-[48%] overflow-hidden rounded-xl bg-white shadow-soft ${unavailable ? "opacity-90" : ""}`}>
      <View className="relative aspect-square">
        <Image source={item.image} style={{ width: "100%", height: "100%" }} contentFit="cover" />
        {unavailable ? (
          <View className="absolute inset-0 items-center justify-center bg-black/60">
            <Text className="border-2 border-white px-4 py-1 text-[18px] font-black tracking-[4px] text-white">VENDU</Text>
          </View>
        ) : null}
        <View className={`absolute left-2 top-2 rounded-full px-2 py-[2px] ${trade ? "bg-[#00687C]" : "bg-[#F5C518]"}`}>
          <Text className={`text-[10px] font-black ${trade ? "text-white" : "text-[#695200]"}`}>{item.badge}</Text>
        </View>
        <View className="absolute right-2 top-2 h-8 w-8 items-center justify-center rounded-full bg-white/80 shadow-soft">
          <Heart color="#F5C518" fill="#F5C518" size={18} />
        </View>
      </View>
      <View className="p-3">
        <Text className="text-[14px] font-black text-[#191C1D]" numberOfLines={1}>
          {item.title}
        </Text>
        <Text className="mt-1 text-[16px] font-black text-[#F5C518]">{item.price}</Text>
        <View className="mb-3 mt-2 flex-row items-center">
          <Image source={item.avatar} style={{ width: 20, height: 20, borderRadius: 10 }} contentFit="cover" />
          <Text className="ml-1 flex-1 text-[11px] text-[#5F5E5E]" numberOfLines={1}>
            {item.seller}
          </Text>
          {item.verified ? <Verified color="#00687C" fill="#00687C" size={12} /> : null}
        </View>
        <View className="gap-2 border-t border-[#D1C5AC]/40 pt-2">
          <Pressable className={`rounded-lg py-[7px] ${unavailable ? "bg-[#D1C5AC]" : "bg-[#191C1D]"}`}>
            <Text className={`text-center text-[11px] font-bold ${unavailable ? "text-[#191C1D]" : "text-white"}`}>
              {unavailable ? "Plus disponible" : "Contacter"}
            </Text>
          </Pressable>
          {unavailable ? (
            <Pressable className="rounded-lg bg-[#E1E3E4]/60 py-[7px]">
              <Text className="text-center text-[11px] font-medium text-[#BA1A1A]">Retirer des favoris</Text>
            </Pressable>
          ) : (
            <View className="flex-row gap-2">
              <Pressable className="flex-1 flex-row items-center justify-center rounded-lg bg-[#E1E3E4]/60 py-[7px]">
                <Share2 color="#5F5E5E" size={12} />
                <Text className="ml-1 text-[11px] font-medium text-[#5F5E5E]">Partager</Text>
              </Pressable>
              <Pressable className="flex-1 rounded-lg bg-[#E1E3E4]/60 py-[7px]">
                <Text className="text-center text-[11px] font-medium text-[#BA1A1A]">Retirer</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

function FavoritesContent() {
  return (
    <View className="gap-4">
      <View className="flex-row justify-end">
        <View className="flex-row items-center">
          <SlidersHorizontal color="#5F5E5E" size={18} />
          <Text className="ml-1 text-[13px] text-[#5F5E5E]">Trier : Récent</Text>
        </View>
      </View>
      <View className="flex-row flex-wrap justify-between gap-y-4">
        {favoriteItems.map((item) => (
          <FavoriteCard key={item.title} item={item} />
        ))}
      </View>
    </View>
  );
}

function ProfileSettingsSheet({
  error,
  isLoggingOut,
  onClose,
  onLogout,
}: {
  error: string | null;
  isLoggingOut: boolean;
  onClose: () => void;
  onLogout: () => void;
}) {
  return (
    <View className="absolute inset-0 z-50 justify-end">
      <Pressable className="absolute inset-0 bg-black/25" onPress={onClose} />
      <View className="rounded-t-[28px] bg-white px-5 pb-8 pt-4 shadow-soft">
        <View className="mb-5 flex-row items-center justify-between">
          <View>
            <Text className="text-[22px] font-black text-[#191C1D]">Paramètres</Text>
            <Text className="mt-1 text-[13px] text-[#5F5E5E]">Actions du compte</Text>
          </View>
          <Pressable className="h-10 w-10 items-center justify-center rounded-full bg-[#F3F4F5]" onPress={onClose}>
            <X color="#5F5E5E" size={20} strokeWidth={2.2} />
          </Pressable>
        </View>

        {error ? (
          <View className="mb-4 rounded-2xl border border-[#BA1A1A]/20 bg-[#FFF2F0] px-4 py-3">
            <Text className="text-[13px] font-semibold leading-5 text-[#BA1A1A]">{error}</Text>
          </View>
        ) : null}

        <Pressable
          className={`h-[54px] flex-row items-center justify-center rounded-full ${isLoggingOut ? "bg-[#C8C6C5]" : "bg-[#191C1D]"}`}
          disabled={isLoggingOut}
          onPress={onLogout}
        >
          <LogOut color="#FFFFFF" size={20} strokeWidth={2.2} />
          <Text className="ml-2 text-[15px] font-bold text-white">{isLoggingOut ? "Déconnexion..." : "Se déconnecter"}</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function PrivateProfileDraftsScreen() {
  const [activeTab, setActiveTab] = useState<ProfileTab>("Brouillons");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const user = useSessionStore((state) => state.user);
  const logoutMutation = useLogoutMutation();

  const handleLogout = () => {
    setLogoutError(null);
    logoutMutation.mutate(undefined, {
      onError: () => setLogoutError("La déconnexion serveur a échoué, mais la session locale sera réinitialisée."),
      onSettled: () => {
        setSettingsOpen(false);
        router.replace("/(auth)/sign-in");
      },
    });
  };

  return (
    <View className="flex-1 bg-[#F8F9FA]">
      <ProfileHeader onOpenSettings={() => setSettingsOpen(true)} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 24, paddingBottom: 112, paddingHorizontal: 20, paddingTop: 16 }}>
        <UserSummary user={user} />
        <StatsBanner />
        <QuickStats />
        <ProfileTabs activeTab={activeTab} onChange={setActiveTab} />
        {activeTab === "Actives" ? <ActiveContent /> : null}
        {activeTab === "Vendues" ? <SoldContent /> : null}
        {activeTab === "Brouillons" ? <DraftsContent /> : null}
        {activeTab === "Favoris" ? <FavoritesContent /> : null}
      </ScrollView>
      {settingsOpen ? (
        <ProfileSettingsSheet
          error={logoutError}
          isLoggingOut={logoutMutation.isPending}
          onClose={() => setSettingsOpen(false)}
          onLogout={handleLogout}
        />
      ) : null}
    </View>
  );
}
