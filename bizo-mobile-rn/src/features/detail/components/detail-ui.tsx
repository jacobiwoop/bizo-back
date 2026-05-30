import { Image } from "expo-image";
import { Camera as MapLibreCamera, Map as MapLibreMap, Marker as MapLibreMarker, type StyleSpecification } from "@maplibre/maplibre-react-native";
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
  Handshake,
  MapPin,
  MessageCircle,
  Palette,
  Package,
  Share2,
  ShieldCheck,
  Smartphone,
  Star,
  Tag,
  Truck,
  X,
} from "lucide-react-native";
import * as React from "react";
import { Modal, NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollView, Text, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { DetailProduct } from "@/src/features/detail/mocks/detail-mocks";

const productImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuB-35PtfTQZfVYLlH_1bU7iosHWuZUNQUxJQWS6yJndgmh1KAXOJxXTSGuYMeYoq-AHCB0bMNygZQXzJ7fCVa58IiEYl2rsBn0m1e0q6G-VVN-IVyx1Ac6dN2ehLeh3gbmEkr20Md3ZLUYwYR9qraawQR1Gs32SVO9QL8ZOhs3gHRzu6Mgpa6UwIcTj8x7tduWmbMd5VdZc4SW7D_k1wwZx_2V0DVal8Wb78ylfFIJjn_961Lx8EjbbdrXCJxIYtW7-QemC061w3Xo";

const galleryImage =
  "https://lh3.googleusercontent.com/aida/ADBb0uhLj9_1z6foyBmwNcGrpeb4cPFo3eLSaOIdxrmKu_ON0cVyF2tpJGUB3O0RaEfZ4zX_q8SUJLagVZdb5AfFJevg3TI_WDq_U2hfZvVrwYBRhTLTZ5gnJk0rKpPRGfRHcP-afnMsr0SvU26aBxgNCOfH5wFIMQiSA8sayT6kWKIxvsCZU0mw6m2_A-PCA-yomZlWdOxlQ-qKKzO-5hPZxXytJIWRJT4CI7_J8yMGZHX1jH0eh0jTyIoaURk";

const sellerAvatar = "https://www.gstatic.com/labs-code/stitch/stitch-placeholder-300x300.svg";

const detailMapStyle: StyleSpecification = {
  glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
  layers: [{ id: "osm-raster", source: "osm", type: "raster" }],
  sources: {
    osm: {
      attribution: "© OpenStreetMap contributors",
      tileSize: 256,
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      type: "raster",
    },
  },
  version: 8,
};

function getProductCoordinate(product: DetailProduct): [number, number] | null {
  if (typeof product.displayLat !== "number" || typeof product.displayLng !== "number") {
    return null;
  }

  return [product.displayLng, product.displayLat];
}

function getLocationZoom(product: DetailProduct): number {
  if (product.locationAccuracy === "city") {
    return 12;
  }

  if (product.locationAccuracy === "exact") {
    return 15;
  }

  return 14;
}

function ListingMapMarker() {
  return (
    <View className="items-center">
      <View className="h-11 w-11 items-center justify-center rounded-full bg-[#F5C518] shadow-soft">
        <MapPin color="#191C1D" fill="#191C1D" size={24} />
      </View>
      <View className="-mt-1 h-3 w-3 rotate-45 bg-[#F5C518]" />
    </View>
  );
}

function getProductPhotos(product: DetailProduct): string[] {
  if (product.photos?.length) {
    return product.photos;
  }

  return [product.image || productImage];
}

function formatProductType(product: DetailProduct): string {
  if (product.type === "TROC") {
    return "Troc";
  }

  if (product.type === "TROC_CASH") {
    return "Troc + cash";
  }

  return "Vente";
}

function getPrimaryActionLabel(product: DetailProduct): string {
  if (product.type === "TROC") {
    return "Proposer";
  }

  if (product.type === "TROC_CASH") {
    return "Négocier";
  }

  return "Faire offre";
}

function getDecisionLabel(product: DetailProduct): string {
  if (product.type === "TROC") {
    return "Échange recherché";
  }

  if (product.type === "TROC_CASH") {
    return "Complément + échange";
  }

  return "Prix demandé";
}

function getModeTheme(product: DetailProduct) {
  if (product.type === "TROC") {
    return {
      accent: "#5B5BD6",
      badgeBackground: "#5B5BD6",
      badgeText: "#FFFFFF",
      border: "#C7D2FE",
      iconBackground: "#EEF2FF",
      panel: "#EEF2FF",
      text: "#3730A3",
    };
  }

  if (product.type === "TROC_CASH") {
    return {
      accent: "#F5C518",
      badgeBackground: "#F5C518",
      badgeText: "#1A1A1A",
      border: "#F1E2BD",
      iconBackground: "#FFFBEB",
      panel: "#FFFBEB",
      text: "#745B00",
    };
  }

  return {
    accent: "#F5C518",
    badgeBackground: "#1A1A1A",
    badgeText: "#FFFFFF",
    border: "#E5E7EB",
    iconBackground: "#F3F4F6",
    panel: "#FFFFFF",
    text: "#1A1A1A",
  };
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

function MiniListingHeader({ product, onBack }: { product: DetailProduct; onBack: () => void }) {
  const image = getProductPhotos(product)[0] || productImage;

  return (
    <SafeAreaView edges={["top"]} className="absolute left-0 right-0 top-0 z-30 bg-white shadow-soft">
      <View className="h-[72px] flex-row items-center border-b border-[#E5E7EB] px-3">
        <Pressable className="mr-2 h-9 w-9 items-center justify-center rounded-full bg-[#F3F4F6]" onPress={onBack}>
          <ChevronLeft color="#1A1A1A" size={22} strokeWidth={2.2} />
        </Pressable>
        <Image source={image} style={{ width: 48, height: 48, borderRadius: 12 }} contentFit="cover" />
        <View className="ml-3 min-w-0 flex-1">
          <Text className="text-[13px] font-black leading-4 text-[#1A1A1A]" numberOfLines={1}>
            {product.title}
          </Text>
          <Text className="mt-1 text-[11px] leading-4 text-[#6B7280]" numberOfLines={1}>
            {product.description}
          </Text>
        </View>
        <Text className="ml-3 max-w-[104px] text-right text-[13px] font-black text-[#F5C518]" numberOfLines={2}>
          {product.price}
        </Text>
      </View>
    </SafeAreaView>
  );
}

function GalleryHero({ product, onOpen }: { product: DetailProduct; onOpen: () => void }) {
  const photos = getProductPhotos(product);
  const { width } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = React.useState(0);

  return (
    <View className="relative h-[280px] bg-[#F3F4F6]">
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
  const typeLabel = formatProductType(product);
  const exchangeLabel = product.type === "TROC" ? product.exchangeFor || "Proposition d’échange" : product.exchangeFor;
  const decisionLabel = getDecisionLabel(product);
  const theme = getModeTheme(product);
  const isTradeOnly = product.type === "TROC";

  return (
    <View className="-mt-4 rounded-t-2xl bg-white px-4 pt-6">
      <View className="mb-4 flex-row items-center justify-between gap-3">
        <View className="rounded-full px-3 py-[6px]" style={{ backgroundColor: theme.badgeBackground }}>
          <Text className="text-[10px] font-bold uppercase tracking-[1px]" style={{ color: theme.badgeText }}>{typeLabel}</Text>
        </View>
        <View className="min-w-0 flex-1 flex-row items-center justify-end gap-3">
          <View className="flex-row items-center">
            <Eye color="#6B7280" size={14} strokeWidth={2} />
            <Text className="ml-1 text-[11px] font-medium text-[#6B7280]">{product.viewCount ?? 0} vues</Text>
          </View>
          <View className="flex-row items-center">
            <Clock3 color="#6B7280" size={14} strokeWidth={2} />
            <Text className="ml-1 text-[11px] font-medium text-[#6B7280]">{product.posted.date}</Text>
          </View>
        </View>
      </View>

      <Text className="text-[25px] font-black leading-8 text-[#1A1A1A]">{product.title}</Text>

      <View className="mt-5 rounded-2xl border p-4" style={{ backgroundColor: theme.panel, borderColor: theme.border }}>
        <Text className="text-[11px] font-black uppercase tracking-[1px]" style={{ color: theme.text }}>{decisionLabel}</Text>
        <Text className={`mt-1 font-black leading-9 ${isTradeOnly ? "text-[24px]" : "text-[30px]"}`} style={{ color: isTradeOnly ? "#1A1A1A" : "#F5C518" }}>
          {product.price}
        </Text>
        {exchangeLabel ? (
          <View className="mt-3 flex-row rounded-xl bg-white p-3">
            <Handshake color={theme.text} size={20} strokeWidth={2.4} />
            <View className="ml-2 flex-1">
              <Text className="text-[11px] font-bold uppercase tracking-[0.8px]" style={{ color: theme.text }}>Recherche</Text>
              <Text className="mt-[2px] text-[14px] font-semibold leading-5 text-[#1A1A1A]">{exchangeLabel}</Text>
            </View>
          </View>
        ) : null}
      </View>

      <View className="mt-4 flex-row gap-2">
        <View className="flex-1 rounded-2xl bg-[#F9FAFB] p-3">
          <Package color="#6B7280" size={18} strokeWidth={2.2} />
          <Text className="mt-2 text-[10px] font-black uppercase tracking-[0.8px] text-[#6B7280]">État</Text>
          <Text className="mt-[2px] text-[13px] font-bold text-[#1A1A1A]" numberOfLines={2}>{product.condition || "À définir"}</Text>
        </View>
        <View className="flex-1 rounded-2xl bg-[#F9FAFB] p-3">
          <Truck color="#6B7280" size={18} strokeWidth={2.2} />
          <Text className="mt-2 text-[10px] font-black uppercase tracking-[0.8px] text-[#6B7280]">Livraison</Text>
          <Text className="mt-[2px] text-[13px] font-bold text-[#1A1A1A]" numberOfLines={2}>{product.deliveryMode || "À définir"}</Text>
        </View>
        <View className="flex-1 rounded-2xl bg-[#F9FAFB] p-3">
          <MapPin color="#6B7280" size={18} strokeWidth={2.2} />
          <Text className="mt-2 text-[10px] font-black uppercase tracking-[0.8px] text-[#6B7280]">Lieu</Text>
          <Text className="mt-[2px] text-[13px] font-bold text-[#1A1A1A]" numberOfLines={2}>{product.city || product.location}</Text>
        </View>
      </View>
    </View>
  );
}

function SellerCard({ product, onPress }: { product: DetailProduct; onPress: () => void }) {
  return (
    <Pressable className="mb-8 mt-5 rounded-2xl bg-[#F9FAFB] p-4" onPress={onPress}>
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-[16px] font-black text-[#1A1A1A]">Vendeur</Text>
        <View className="flex-row items-center">
          <Text className="text-[13px] font-bold text-[#5B5BD6]">Voir profil</Text>
          <ArrowRight color="#5B5BD6" size={15} strokeWidth={2.4} style={{ marginLeft: 3 }} />
        </View>
      </View>
      <View className="flex-row items-center justify-between">
        <View className="flex-1 flex-row items-center">
          <View>
            <Image source={product.seller.avatar || sellerAvatar} style={{ width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: "#FFFFFF" }} contentFit="cover" />
            <View className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-[#22C55E]" />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-[16px] font-bold text-[#1A1A1A]">{product.seller.name}</Text>
            <View className="mt-1 flex-row items-center">
              <Star color="#F5C518" fill="#F5C518" size={14} strokeWidth={1.5} />
              <Text className="ml-1 text-[12px] font-medium text-[#6B7280]">{product.seller.rating}</Text>
            </View>
          </View>
        </View>
        <View className="ml-2 flex-row items-center rounded-full bg-[#EEF2FF] px-3 py-[6px]">
          <ShieldCheck color="#5B5BD6" size={14} strokeWidth={2.2} />
          <Text className="ml-1 text-[11px] font-bold text-[#5B5BD6]">{product.seller.role}</Text>
        </View>
      </View>
    </Pressable>
  );
}

function DescriptionBlock({ product }: { product: DetailProduct }) {
  const [expanded, setExpanded] = React.useState(false);
  const canExpand = product.description.length > 160;

  return (
    <View className="mb-8">
      <Text className="mb-2 text-[16px] font-bold text-[#1A1A1A]">Description</Text>
      <Text className="text-[14px] leading-6 text-[#6B7280]" numberOfLines={expanded ? undefined : 4}>
        {product.description}
      </Text>
      {canExpand ? (
        <Pressable className="self-start" onPress={() => setExpanded((current) => !current)}>
          <Text className="mt-1 text-[14px] font-bold text-[#5B5BD6]">{expanded ? "Voir moins" : "Voir plus"}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function CharacteristicsGrid({ product }: { product: DetailProduct }) {
  const baseItems = [
    { label: "État", value: product.condition || "À définir", icon: BadgeCheck },
    { label: "Catégorie", value: product.posted.category, icon: Tag },
    { label: "Mode", value: formatProductType(product), icon: Smartphone },
    { label: "Livraison", value: product.deliveryMode || "À définir", icon: Database },
    { label: "Ville", value: product.city || product.location, icon: MapPin },
    { label: "Référence", value: product.posted.idRef, icon: Tag },
  ];
  const attributeItems =
    product.attributes?.map((attribute) => ({
      icon: Palette,
      label: attribute.label,
      value: attribute.value,
    })) ?? [];
  const items = [...baseItems, ...attributeItems];

  return (
    <View className="mb-8">
      <Text className="mb-3 text-[16px] font-bold text-[#1A1A1A]">Caractéristiques</Text>
      <View className="flex-row flex-wrap justify-between gap-y-3">
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <View key={`${item.label}-${index}`} className="w-[48%] flex-row items-center rounded-xl bg-[#F9FAFB] p-3">
              <Icon color="#6B7280" size={20} strokeWidth={2} />
              <View className="ml-3 flex-1">
                <Text className="text-[10px] font-bold uppercase tracking-[0.8px] text-[#6B7280]">{item.label}</Text>
                <Text className="mt-[2px] text-[13px] font-semibold text-[#1A1A1A]" numberOfLines={2}>
                  {item.value}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function LocationBlock({ product }: { product: DetailProduct }) {
  const [mapOpen, setMapOpen] = React.useState(false);
  const coordinate = getProductCoordinate(product);
  const zoom = getLocationZoom(product);

  return (
    <View className="mb-10">
      <Text className="mb-3 text-[16px] font-bold text-[#1A1A1A]">Localisation</Text>
      <Pressable className="mb-3 h-40 overflow-hidden rounded-2xl bg-[#EFF6FF]" disabled={!coordinate} onPress={() => setMapOpen(true)}>
        {coordinate ? (
          <MapLibreMap
            attribution
            compass={false}
            doubleTapZoom={false}
            dragPan={false}
            logo={false}
            mapStyle={detailMapStyle}
            scaleBar={false}
            style={{ height: "100%", width: "100%" }}
            touchPitch={false}
            touchRotate={false}
            touchZoom={false}
          >
            <MapLibreCamera center={coordinate} duration={0} zoom={zoom} />
            <MapLibreMarker anchor="bottom" lngLat={coordinate}>
              <ListingMapMarker />
            </MapLibreMarker>
          </MapLibreMap>
        ) : (
          <View className="h-full w-full items-center justify-center bg-[#F3F4F6] px-6">
            <MapPin color="#6B7280" size={28} strokeWidth={2.2} />
            <Text className="mt-2 text-center text-[13px] font-semibold text-[#6B7280]">Carte indisponible pour cette annonce</Text>
          </View>
        )}
        {coordinate ? (
          <View className="absolute bottom-3 right-3 rounded-full bg-white/95 px-3 py-2 shadow-soft">
            <Text className="text-[12px] font-black text-[#1A1A1A]">Agrandir</Text>
          </View>
        ) : null}
      </Pressable>
      <View className="flex-row items-center justify-between">
        <View className="min-w-0 flex-1 pr-3">
          <Text className="text-[16px] font-bold text-[#1A1A1A]">{product.location}</Text>
          <Text className="mt-1 text-[13px] text-[#6B7280]">{product.deliveryMode || "Mode de livraison à confirmer"}</Text>
        </View>
        <Pressable className="flex-row items-center opacity-70" disabled={!coordinate} onPress={() => setMapOpen(true)}>
          <Text className="text-[14px] font-bold text-[#5B5BD6]">Voir la carte</Text>
          <ArrowRight color="#5B5BD6" size={16} strokeWidth={2} style={{ marginLeft: 4 }} />
        </Pressable>
      </View>
      <Modal animationType="slide" onRequestClose={() => setMapOpen(false)} visible={mapOpen && Boolean(coordinate)}>
        <SafeAreaView className="flex-1 bg-[#F8F9FA]">
          <View className="flex-1">
            {coordinate ? (
              <MapLibreMap
                attribution
                compass
                doubleTapZoom
                dragPan
                logo={false}
                mapStyle={detailMapStyle}
                scaleBar={false}
                style={{ height: "100%", width: "100%" }}
                touchPitch={false}
                touchRotate={false}
                touchZoom
              >
                <MapLibreCamera center={coordinate} duration={0} zoom={zoom + 1} />
                <MapLibreMarker anchor="bottom" lngLat={coordinate}>
                  <ListingMapMarker />
                </MapLibreMarker>
              </MapLibreMap>
            ) : null}
            <View className="absolute left-4 right-4 top-4 flex-row items-center justify-between">
              <Pressable className="h-12 w-12 items-center justify-center rounded-full bg-white shadow-soft" onPress={() => setMapOpen(false)}>
                <ChevronLeft color="#191C1D" size={26} strokeWidth={2.2} />
              </Pressable>
              <View className="ml-3 min-w-0 flex-1 rounded-full bg-white/95 px-4 py-3 shadow-soft">
                <Text className="text-[13px] font-black text-[#191C1D]" numberOfLines={1}>{product.location}</Text>
              </View>
            </View>
            <View className="absolute bottom-0 left-0 right-0 rounded-t-3xl bg-white px-5 pb-6 pt-5 shadow-soft">
              <Text className="text-[17px] font-black text-[#1A1A1A]">{product.location}</Text>
              <Text className="mt-1 text-[13px] leading-5 text-[#6B7280]">Carte en lecture seule. Vous pouvez zoomer et déplacer la carte pour explorer les alentours.</Text>
              <Pressable className="mt-4 h-12 items-center justify-center rounded-full bg-[#1A1A1A]" onPress={() => setMapOpen(false)}>
                <Text className="text-[14px] font-bold text-white">Fermer</Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

function DetailBottomBar({ product }: { product: DetailProduct }) {
  const offerLabel = getPrimaryActionLabel(product);
  const theme = getModeTheme(product);

  return (
    <View className="absolute bottom-0 left-0 right-0 flex-row gap-3 border-t border-[#EDEEEF] bg-white px-4 pb-5 pt-3 shadow-soft">
      <Pressable className="h-12 flex-1 flex-row items-center justify-center rounded-full border-2 px-3" style={{ borderColor: theme.badgeBackground }}>
        <Tag color={theme.badgeBackground} size={20} strokeWidth={2} />
        <Text className="ml-2 text-[13px] font-bold" numberOfLines={1} style={{ color: theme.badgeBackground }}>{offerLabel}</Text>
      </Pressable>
      <Pressable className="h-12 flex-[1.35] flex-row items-center justify-center rounded-full bg-[#1A1A1A] px-4">
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
  const [showMiniHeader, setShowMiniHeader] = React.useState(false);
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextShowMiniHeader = event.nativeEvent.contentOffset.y > 430;

    setShowMiniHeader((current) => (current === nextShowMiniHeader ? current : nextShowMiniHeader));
  };

  return (
    <View className="flex-1 bg-[#F9FAFB]">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 104 }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
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
        </View>
      </ScrollView>
      {showMiniHeader ? <MiniListingHeader product={product} onBack={onBack} /> : null}
      <DetailBottomBar product={product} />
      {galleryOpen ? <FullscreenGallery product={product} onClose={() => setGalleryOpen(false)} /> : null}
    </View>
  );
}
