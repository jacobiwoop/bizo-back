import { Image } from "expo-image";
import {
  ArrowRight,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Database,
  Download,
  Eye,
  Heart,
  MapPin,
  MessageCircle,
  Palette,
  Share2,
  Smartphone,
  Star,
  Tag,
  X,
} from "lucide-react-native";
import * as React from "react";
import { NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollView, Text, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { DetailProduct } from "@/src/features/detail/mocks/detail-mocks";

const productImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuB-35PtfTQZfVYLlH_1bU7iosHWuZUNQUxJQWS6yJndgmh1KAXOJxXTSGuYMeYoq-AHCB0bMNygZQXzJ7fCVa58IiEYl2rsBn0m1e0q6G-VVN-IVyx1Ac6dN2ehLeh3gbmEkr20Md3ZLUYwYR9qraawQR1Gs32SVO9QL8ZOhs3gHRzu6Mgpa6UwIcTj8x7tduWmbMd5VdZc4SW7D_k1wwZx_2V0DVal8Wb78ylfFIJjn_961Lx8EjbbdrXCJxIYtW7-QemC061w3Xo";

const galleryImage =
  "https://lh3.googleusercontent.com/aida/ADBb0uhLj9_1z6foyBmwNcGrpeb4cPFo3eLSaOIdxrmKu_ON0cVyF2tpJGUB3O0RaEfZ4zX_q8SUJLagVZdb5AfFJevg3TI_WDq_U2hfZvVrwYBRhTLTZ5gnJk0rKpPRGfRHcP-afnMsr0SvU26aBxgNCOfH5wFIMQiSA8sayT6kWKIxvsCZU0mw6m2_A-PCA-yomZlWdOxlQ-qKKzO-5hPZxXytJIWRJT4CI7_J8yMGZHX1jH0eh0jTyIoaURk";

const mapImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuC52uFb76YlL6UgcoEgSPLn8MOQRz4OKF4JLjn86F3FflNmlmd90IiLD8IZ_fGXRol7wSBK9JSqL-3ALwWw9NMR3Ylu4J2_N8MW9BeW_asaPljnR2frFmId6Htx95hXGodBRQvRMkJLqBzYn3-mlHRiUNGgEUSM2RCyTUvOAkAe5lSPx4fJY8GuxEM0foNHiXPH53rID3ca76tOQm00Cqdfg4GE2oefdxFwMUApfNSm2PJSF-v0f1lXN3bvsF6Sw7FwYX_hJK1G0eM";

const sellerAvatar = "https://www.gstatic.com/labs-code/stitch/stitch-placeholder-300x300.svg";

const similarItems = [
  { id: "similar-1", title: "iPhone 13 Pro 128Go", price: "135 000 FCFA", image: productImage },
  { id: "similar-2", title: "iPhone 12 Pro Max", price: "110 000 FCFA", image: productImage },
  { id: "similar-3", title: "iPhone 14 Pro 128Go", price: "250 000 FCFA", image: productImage },
];

const characteristics = [
  { label: "État", value: "Très bon état", icon: BadgeCheck },
  { label: "Marque", value: "Apple", icon: Tag },
  { label: "Modèle", value: "13 Pro", icon: Smartphone },
  { label: "Stockage", value: "256 Go", icon: Database },
  { label: "Couleur", value: "Bleu Alpin", icon: Palette },
  { label: "Référence", value: "BZ-9921", icon: Tag },
];

function getProductPhotos(product: DetailProduct): string[] {
  if (product.photos?.length) {
    return product.photos;
  }

  return [product.image || productImage];
}

function formatProductType(product: DetailProduct): string {
  if (product.type === "TROC_CASH") {
    return "TROC+CASH";
  }

  return product.type || "VENTE";
}

function getPageIndex(event: NativeSyntheticEvent<NativeScrollEvent>, width: number): number {
  if (width <= 0) {
    return 0;
  }

  return Math.round(event.nativeEvent.contentOffset.x / width);
}

function FloatingHeader({ onBack }: { onBack: () => void }) {
  return (
    <SafeAreaView edges={["top"]} className="absolute left-0 right-0 top-0 z-20">
      <View className="h-16 flex-row items-center justify-between px-4">
        <Pressable className="h-10 w-10 items-center justify-center rounded-full bg-white/80 shadow-soft" onPress={onBack}>
          <ChevronLeft color="#1F1B11" size={24} strokeWidth={2} />
        </Pressable>
        <View className="flex-row gap-3">
          <Pressable className="h-10 w-10 items-center justify-center rounded-full bg-white/80 shadow-soft">
            <Heart color="#1F1B11" size={22} strokeWidth={2} />
          </Pressable>
          <Pressable className="h-10 w-10 items-center justify-center rounded-full bg-white/80 shadow-soft">
            <Share2 color="#1F1B11" size={21} strokeWidth={2} />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

function GalleryHero({ product, onOpen }: { product: DetailProduct; onOpen: () => void }) {
  const photos = getProductPhotos(product);
  const { width } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = React.useState(0);

  return (
    <View className="relative h-[280px] bg-[#EBE1D1]">
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => setActiveIndex(getPageIndex(event, width))}
      >
        {photos.map((photo, index) => (
          <Pressable key={`${photo}-${index}`} style={{ width, height: 280 }} onPress={onOpen}>
            <Image source={photo} style={{ width: "100%", height: "100%" }} contentFit="cover" />
          </Pressable>
        ))}
      </ScrollView>
      <View className="absolute bottom-10 left-4 rounded-full bg-[#1F1B11]/80 px-3 py-1">
        <Text className="text-[10px] font-bold text-white">
          {activeIndex + 1}/{photos.length}
        </Text>
      </View>
      <View className="absolute bottom-6 left-0 right-0 flex-row justify-center gap-[6px]">
        {photos.map((photo, index) => (
          <View
            key={`${photo}-dot-${index}`}
            className={`h-[6px] rounded-full ${index === activeIndex ? "w-4 bg-[#F5C518]" : "w-[6px] bg-white/50"}`}
          />
        ))}
      </View>
    </View>
  );
}

function ProductContentCard({ product }: { product: DetailProduct }) {
  return (
    <View className="-mt-5 rounded-t-[20px] bg-white px-4 pt-6 shadow-soft">
      <View className="mb-4 flex-row items-center justify-between">
        <View className="rounded-full bg-[#1F1B11] px-3 py-1">
          <Text className="text-[10px] font-bold tracking-[1px] text-white">{formatProductType(product)}</Text>
        </View>
        <View className="flex-row items-center gap-4">
          <View className="flex-row items-center">
            <Eye color="#4E4633" size={14} strokeWidth={2} />
            <Text className="ml-1 text-[11px] font-medium text-[#4E4633]">{product.viewCount ?? 0} vues</Text>
          </View>
          <View className="flex-row items-center">
            <Clock3 color="#4E4633" size={14} strokeWidth={2} />
            <Text className="ml-1 text-[11px] font-medium text-[#4E4633]">{product.posted.date}</Text>
          </View>
        </View>
      </View>

      <Text className="mb-2 text-[24px] font-bold leading-8 text-[#1F1B11]">{product.title}</Text>
      <View className="mb-6 flex-row items-center justify-between">
        <Text className="text-[28px] font-bold text-[#F5C518]">{product.price}</Text>
        <View className="rounded-full bg-[#22C55E]/10 px-3 py-1">
          <Text className="text-[12px] font-bold text-[#22C55E]">Négociable</Text>
        </View>
      </View>

      <View className="mb-8 flex-row flex-wrap gap-2">
        <View className="rounded-full bg-[#1F1B11] px-3 py-[6px]">
          <Text className="text-[11px] font-semibold text-white">{product.condition || "Très bon état"}</Text>
        </View>
        <View className="rounded-full bg-[#EBE1D1] px-3 py-[6px]">
          <Text className="text-[11px] font-semibold text-[#4E4633]">{product.posted.category}</Text>
        </View>
      </View>
    </View>
  );
}

function SellerCard({ product, onPress }: { product: DetailProduct; onPress: () => void }) {
  return (
    <Pressable className="mb-8 flex-row items-center justify-between rounded-[16px] bg-[#FCF3E1] p-4" onPress={onPress}>
      <View className="flex-row items-center">
        <View>
          <Image source={product.seller.avatar || sellerAvatar} style={{ width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: "#FFFFFF" }} contentFit="cover" />
          <View className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#FCF3E1] bg-[#22C55E]" />
        </View>
        <View className="ml-3">
          <Text className="text-[16px] font-bold text-[#1F1B11]">{product.seller.name}</Text>
          <View className="mt-1 flex-row items-center">
            <Star color="#F5C518" fill="#F5C518" size={14} strokeWidth={1.5} />
            <Text className="ml-1 text-[12px] font-medium text-[#4E4633]">{product.seller.rating}</Text>
          </View>
        </View>
      </View>
      <View className="rounded-full bg-[#4E4EC9]/10 px-3 py-[6px]">
        <Text className="text-[11px] font-bold text-[#4E4EC9]">{product.seller.role}</Text>
      </View>
    </Pressable>
  );
}

function DescriptionBlock({ product }: { product: DetailProduct }) {
  return (
    <View className="mb-8">
      <Text className="mb-2 text-[16px] font-bold text-[#1F1B11]">Description</Text>
      <Text className="text-[14px] leading-6 text-[#4E4633]" numberOfLines={3}>
        {product.description}
      </Text>
      <Text className="mt-1 text-[14px] font-bold text-[#4E4EC9]">Voir plus</Text>
    </View>
  );
}

function CharacteristicsGrid({ product }: { product: DetailProduct }) {
  const items = [
    { label: "État", value: product.condition || characteristics[0].value, icon: BadgeCheck },
    { label: "Catégorie", value: product.posted.category, icon: Tag },
    { label: "Mode", value: formatProductType(product), icon: Smartphone },
    { label: "Livraison", value: product.deliveryMode || "À définir", icon: Database },
    { label: "Ville", value: product.city || product.location, icon: MapPin },
    { label: "Référence", value: product.posted.idRef, icon: Tag },
  ];

  return (
    <View className="mb-8 flex-row flex-wrap justify-between gap-y-3">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <View key={item.label} className="w-[48%] flex-row items-center rounded-xl bg-[#FCF3E1] p-3">
            <Icon color="#4E4633" size={20} strokeWidth={2} />
            <View className="ml-3">
              <Text className="text-[10px] font-bold uppercase tracking-[0.8px] text-[#4E4633]">{item.label}</Text>
              <Text className="mt-[2px] text-[13px] font-semibold text-[#1F1B11]">{item.value}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function LocationBlock({ product }: { product: DetailProduct }) {
  return (
    <View className="mb-10">
      <View className="mb-3 h-40 overflow-hidden rounded-2xl">
        <Image source={mapImage} style={{ width: "100%", height: "100%" }} contentFit="cover" />
        <View className="absolute inset-0 items-center justify-center">
          <View className="h-12 w-12 items-center justify-center rounded-full bg-[#F5C518]/30">
            <View className="h-4 w-4 rounded-full border-2 border-white bg-[#F5C518] shadow-soft" />
          </View>
        </View>
      </View>
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-[16px] font-bold text-[#1F1B11]">{product.location}</Text>
          <Text className="mt-1 text-[13px] text-[#4E4633]">À 2.3 km de votre position</Text>
        </View>
        <View className="flex-row items-center">
          <Text className="text-[14px] font-bold text-[#4E4EC9]">Ouvrir dans Maps</Text>
          <ArrowRight color="#4E4EC9" size={16} strokeWidth={2} style={{ marginLeft: 4 }} />
        </View>
      </View>
    </View>
  );
}

function SimilarItems() {
  return (
    <View className="mb-6">
      <Text className="mb-4 text-[24px] font-bold text-[#1F1B11]">Annonces similaires</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-4" contentContainerStyle={{ gap: 16, paddingHorizontal: 16, paddingBottom: 16 }}>
        {similarItems.map((item) => (
          <View key={item.id} className="w-40 overflow-hidden rounded-2xl bg-white shadow-soft">
            <View className="h-28 bg-[#EBE1D1]">
              <Image source={item.image} style={{ width: "100%", height: "100%" }} contentFit="cover" />
              <View className="absolute right-2 top-2 h-6 w-6 items-center justify-center rounded-full bg-white/80">
                <Heart color="#1F1B11" size={14} strokeWidth={2} />
              </View>
            </View>
            <View className="p-3">
              <Text className="mb-1 text-[12px] font-bold text-[#1F1B11]" numberOfLines={1}>
                {item.title}
              </Text>
              <Text className="text-[14px] font-extrabold text-[#F5C518]">{item.price}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function DetailBottomBar() {
  return (
    <View className="absolute bottom-0 left-0 right-0 flex-row gap-3 bg-white p-4 shadow-soft">
      <Pressable className="h-12 flex-1 flex-row items-center justify-center rounded-full border-2 border-[#1F1B11]">
        <Tag color="#1F1B11" size={20} strokeWidth={2} />
        <Text className="ml-2 text-[14px] font-bold text-[#1F1B11]">Faire une offre</Text>
      </Pressable>
      <Pressable className="h-12 flex-[1.5] flex-row items-center justify-center rounded-full bg-[#1F1B11]">
        <MessageCircle color="#FFFFFF" fill="#FFFFFF" size={20} strokeWidth={2} />
        <Text className="ml-2 text-[14px] font-bold text-white">Contacter</Text>
      </Pressable>
    </View>
  );
}

function FullscreenGallery({ product, onClose }: { product: DetailProduct; onClose: () => void }) {
  const photos = getProductPhotos(product);
  const { width } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = React.useState(0);
  const thumbs = Array.from({ length: Math.max(photos.length, 6) });

  return (
    <View className="absolute inset-0 z-50 bg-black">
      <SafeAreaView edges={["top"]} className="absolute left-0 right-0 top-0 z-20">
        <View className="flex-row items-center justify-between bg-black/60 px-4 pb-4 pt-2">
          <Pressable className="h-10 w-10 items-center justify-center rounded-full border border-white/40" onPress={onClose}>
            <X color="#FFFFFF" size={28} strokeWidth={2} />
          </Pressable>
          <Text className="absolute left-0 right-0 text-center text-[12px] font-bold uppercase tracking-[1.4px] text-white">
            Photos ({activeIndex + 1}/{photos.length})
          </Text>
          <View className="flex-row gap-4">
            <Download color="#FFFFFF" size={23} strokeWidth={2} />
            <Share2 color="#FFFFFF" size={23} strokeWidth={2} />
          </View>
        </View>
      </SafeAreaView>

      <View className="absolute bottom-[178px] left-0 right-0 z-20">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingHorizontal: 16 }}>
          {thumbs.map((_, index) => (
            <View
              key={index}
              className={`h-14 w-14 overflow-hidden rounded-lg ${index === activeIndex ? "border-2 border-[#F5C518]" : "border border-white/10 opacity-50"}`}
            >
              {index < photos.length ? (
                <Image source={photos[index]} style={{ width: "100%", height: "100%" }} contentFit="cover" />
              ) : (
                <View className="h-full w-full items-center justify-center bg-white/5">
                  <Text className="text-white/30">+</Text>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      </View>

      <View className="flex-1 justify-center px-4 pb-[168px] pt-20">
        <ChevronLeft color="#FFFFFF" size={52} strokeWidth={1.5} style={{ left: 20, opacity: 0.35, position: "absolute", zIndex: 10 }} />
        <ChevronRight color="#FFFFFF" size={52} strokeWidth={1.5} style={{ opacity: 0.35, position: "absolute", right: 20, zIndex: 10 }} />
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => setActiveIndex(getPageIndex(event, width))}
          style={{ marginHorizontal: -16 }}
        >
          {photos.map((photo, index) => (
            <View key={`${photo}-fullscreen-${index}`} style={{ width }} className="px-4">
              <View className="min-h-[360px] overflow-hidden rounded-lg border border-white/20">
                <Image source={photo || galleryImage} style={{ width: "100%", height: "100%" }} contentFit="cover" />
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      <View className="absolute bottom-0 left-0 right-0 bg-black/90 px-4 pb-10 pt-10">
        <Text className="mb-1 text-center text-[20px] font-semibold text-white">{product.title}</Text>
        <Text className="mb-6 text-center text-[24px] font-bold text-[#F5C518]">{product.price}</Text>
        <View className="items-end">
          <Pressable className="flex-row items-center rounded-full bg-white px-5 py-[10px]" onPress={onClose}>
            <Text className="font-bold text-black">Voir l'annonce</Text>
            <ArrowRight color="#000000" size={18} strokeWidth={2} style={{ marginLeft: 8 }} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export function DetailProductScreen({
  product,
  onBack,
  onSellerPress,
}: {
  product: DetailProduct;
  onBack: () => void;
  onSellerPress: () => void;
}) {
  const [galleryOpen, setGalleryOpen] = React.useState(false);

  return (
    <View className="flex-1 bg-[#FFF8F1]">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 104 }}>
        <View>
          <GalleryHero product={product} onOpen={() => setGalleryOpen(true)} />
          <FloatingHeader onBack={onBack} />
        </View>
        <ProductContentCard product={product} />
        <View className="bg-white px-4">
          <SellerCard product={product} onPress={onSellerPress} />
          <DescriptionBlock product={product} />
          <CharacteristicsGrid product={product} />
          <LocationBlock product={product} />
          <SimilarItems />
        </View>
      </ScrollView>
      <DetailBottomBar />
      {galleryOpen ? <FullscreenGallery product={product} onClose={() => setGalleryOpen(false)} /> : null}
    </View>
  );
}
