import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import * as ExpoLocation from "expo-location";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";
import { Camera as MapLibreCamera, Map as MapLibreMap, Marker as MapLibreMarker, type PressEvent as MapLibrePressEvent, type StyleSpecification, type ViewStateChangeEvent as MapLibreViewStateChangeEvent } from "@maplibre/maplibre-react-native";
import { useQuery } from "@tanstack/react-query";
import { useCreateListingMutation, useUpdateListingMutation } from "@/src/features/publish/api/use-create-listing";
import { normalizeApiError } from "@/src/lib/api/errors";
import { deleteListingPhoto, getListing, reorderListingPhotos, type ListingPhotoUpload, type UpdateListingPayload, uploadListingPhotos } from "@/src/lib/api/listings";
import { reverseLocation, searchLocations, type LocationResource, type PlaceResource, type ReverseLocationResponse } from "@/src/lib/api/locations";
import { resolveMediaUrl } from "@/src/lib/api/media";
import { ListingAttributes, ListingResource, ListingType } from "@/src/lib/api/types";
import { queryClient } from "@/src/lib/query-client";
import { getListingCategory, listingCategories, type ListingAttributeField, type ListingCategoryDefinition, type ListingCategoryId, type ListingCategoryIcon } from "@/src/lib/categories/listing-categories";
import { useSessionStore } from "@/src/store/session";
import {
  ArrowDownCircle,
  ArrowLeft,
  ArrowRight,
  ArrowUpCircle,
  Armchair,
  BadgeDollarSign,
  Camera,
  CarFront,
  Check,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  CircleX,
  Edit3,
  Handshake,
  Info,
  Lightbulb,
  MapPin,
  Minus,
  Package,
  Plus,
  RotateCcw,
  Save,
  Search,
  Shirt,
  Smartphone,
  Sparkles,
  LocateFixed,
  Truck,
  Wrench,
  X,
} from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Modal, type NativeSyntheticEvent, Pressable, ScrollView, type DimensionValue, Text, TextInput, useWindowDimensions, View } from "react-native";
import { KeyboardAwareScrollView, KeyboardAvoidingView, KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";

type PublishMode = "sale" | "trade" | "trade-cash";
type PublishStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;
type PublishAttributeValue = string | string[];
type PublishAttributes = Record<string, PublishAttributeValue>;
type PublishPhoto = ListingPhotoUpload & { id: string; serverPath?: string };
type PublishCondition = "neuf" | "excellent" | "bon" | "correct";
type DeliveryMode = "main_propre" | "livraison" | "les_deux";

type PublishForm = {
  title: string;
  description: string;
  condition: PublishCondition;
  price: string;
  exchangeFor: string;
  cashComplement: string;
  city: string;
  neighborhood: string;
  country: string;
  locationId: string | null;
  placeId: string | null;
  displayLat: number | null;
  displayLng: number | null;
  locationAccuracy: "exact" | "district" | "city";
  locationLabel: string;
  deliveryMode: DeliveryMode;
};

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

const samplePhotos = [
  "https://lh3.googleusercontent.com/aida/ADBb0uh87IkLFidw7GYFSqWQWd1E3mP2pJ0uTVj2ZF-WThGORhMIw_Pqf2GfCxK-sA9BRkei2b_rNTxhpG4iAt1u1RwC6Puu8w-f4wL7oLzn6Q9g88N4RWAKA9DGz_GM_SLdUHi8D1PjV1ovLjNeUWg8Tibix_rewC0YavAHvD6so9sjMZZKUquHp6nACfOfBGOURCg0qFJdM8KT4RRmCnDtW1LvYOycmvQ_OJrh0cPfB9gPF15q_cq_pzKhMw",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDfelK77Nmuqc5_8eRqRia3m9NuJnAzKfOWZYQbbwGxNZjxMQSFQgmhjnmaB-gS3cbzpDAU_HWPt6J-Gnh6u4lJC6Tf-U7rQiAqQdcPLlfgcP7ISw585oN9oGK9FKPUzQUtcSMzrdzdugVzbPEHoIp-ef_Y0M7XQzTujDFNqvP1fWq1qfErDjejeg5fI0q5brLxgpHF94cG9LHcrTIvcWuLomj0vLCRUdWGc8abm3sS7PByr4SZXSGEZX2FSbcXgNqDmNFZKmQpZWQ",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCl1J2JkQt14uMliAZXeORX3LaqTCyRglI7z5Rm4ZmwY4FECZYPHWl700sZO6pIBpAuQqg7rHqWh9LPhs5MllTleaK2raso3bQt0DI8X4OkZOBqa2loDk6t0Lq2QSHVBZzThM53G1VSQWBsPvMZmxpOJdYIMYjC3Ki7tYdT1y3cPknmyYX1yb9NJ4rbTPFkn4U0dyHgH0XS12M_Wte-X_B_LFiSrjUZNv4oCGhLNClNkjldTLfRj5mRxH6xQ4c4MUq_FYFVqJIZWyk",
];

const conditionOptions: Array<{ label: string; value: PublishCondition }> = [
  { label: "Neuf", value: "neuf" },
  { label: "Très bon état", value: "excellent" },
  { label: "Bon état", value: "bon" },
  { label: "État correct", value: "correct" },
];

const initialForm: PublishForm = {
  cashComplement: "",
  city: "",
  condition: "excellent",
  country: "BJ",
  deliveryMode: "main_propre",
  description: "",
  displayLat: null,
  displayLng: null,
  exchangeFor: "",
  locationAccuracy: "district",
  locationId: null,
  locationLabel: "",
  neighborhood: "",
  placeId: null,
  price: "",
  title: "",
};

const publishDraftStorageKey = "bizo.publish.draft.v1";

type PublishDraft = {
  attributes: PublishAttributes;
  form: PublishForm;
  mode: PublishMode;
  photos: PublishPhoto[];
  selectedCategoryId: ListingCategoryId;
  step: PublishStep;
  updatedAt: string;
};

function getModeFromListingType(type: ListingType): PublishMode {
  if (type === "TROC") return "trade";
  if (type === "TROC_CASH") return "trade-cash";
  return "sale";
}

function mapListingToPublishForm(listing: ListingResource): PublishForm {
  const locationLabel = [listing.neighborhood, listing.city].filter(Boolean).join(", ") || listing.city || "";

  return {
    cashComplement: listing.cash_complement ? String(listing.cash_complement) : "",
    city: listing.city ?? "",
    condition: (["neuf", "excellent", "bon", "correct"].includes(listing.condition) ? listing.condition : "excellent") as PublishCondition,
    country: listing.country ?? "BJ",
    deliveryMode: (["main_propre", "livraison", "les_deux"].includes(listing.delivery_mode) ? listing.delivery_mode : "main_propre") as DeliveryMode,
    description: listing.description,
    displayLat: listing.display_lat,
    displayLng: listing.display_lng,
    exchangeFor: listing.exchange_for ?? "",
    locationAccuracy: listing.location_accuracy ?? "district",
    locationId: listing.location_id,
    locationLabel,
    neighborhood: listing.neighborhood ?? "",
    placeId: listing.place_id,
    price: listing.price ? String(listing.price) : "",
    title: listing.title,
  };
}

function mapListingToPublishPhotos(listing: ListingResource): PublishPhoto[] {
  const photos: PublishPhoto[] = [];

  listing.photos.forEach((photo, index) => {
    const uri = resolveMediaUrl(photo);

    if (!uri) {
      return;
    }

    photos.push({
      id: `existing-${index}-${uri}`,
      name: `photo-${index + 1}.jpg`,
      serverPath: photo,
      type: "image/jpeg",
      uri,
    });
  });

  return photos;
}

function mapListingAttributesToPublish(attributes: ListingAttributes): PublishAttributes {
  const publishAttributes: PublishAttributes = {};

  Object.entries(attributes).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      return;
    }

    publishAttributes[key] = Array.isArray(value) ? value.map(String) : String(value);
  });

  return publishAttributes;
}

const deliveryModeOptions: Array<{
  description: string;
  icon: "handshake" | "truck" | "package";
  label: string;
  value: DeliveryMode;
}> = [
  {
    description: "Rencontre avec l’acheteur dans une zone convenue.",
    icon: "handshake",
    label: "Remise en main propre",
    value: "main_propre",
  },
  {
    description: "Vous pouvez envoyer ou livrer l’article.",
    icon: "truck",
    label: "Livraison",
    value: "livraison",
  },
  {
    description: "L’acheteur choisit entre livraison et rencontre.",
    icon: "package",
    label: "Les deux",
    value: "les_deux",
  },
];

function toListingType(mode: PublishMode) {
  if (mode === "sale") return "VENTE";
  if (mode === "trade") return "TROC";
  return "TROC_CASH";
}

function parseAmount(value: string): number | null {
  const normalized = value.replace(/[^\d]/g, "");
  return normalized ? Number(normalized) : null;
}

function formatAmountInput(value: string) {
  return value.replace(/[^\d]/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function formatPrice(value: string) {
  const amount = parseAmount(value);
  return amount === null ? "Prix à renseigner" : `${formatAmountInput(String(amount))} FCFA`;
}

function getDeliveryModeLabel(value: DeliveryMode) {
  return deliveryModeOptions.find((option) => option.value === value)?.label ?? "Remise en main propre";
}

function getAmountFontSize(value: string) {
  const length = formatAmountInput(value).length;
  if (length > 14) return 30;
  if (length > 10) return 36;
  return 46;
}

function isFilled(value: PublishAttributeValue | undefined) {
  if (Array.isArray(value)) return value.length > 0;
  return Boolean(value?.trim());
}

function getRequiredAttributeMessage(category: ListingCategoryDefinition, attributes: PublishAttributes) {
  const missingField = category.fields.find((field) => field.required && !isFilled(attributes[field.key]));
  return missingField ? `${missingField.label} est requis.` : null;
}

function buildPhotoUpload(asset: ImagePicker.ImagePickerAsset): PublishPhoto {
  const name = asset.fileName ?? `photo-${Date.now()}.jpg`;
  const type = asset.mimeType ?? "image/jpeg";

  return {
    id: `${asset.uri}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    name,
    type,
    uri: asset.uri,
  };
}

type PublishMapCoordinate = { latitude: number; longitude: number };

const defaultPublishMapCoordinate: PublishMapCoordinate = {
  latitude: 6.3676953,
  longitude: 2.4252507,
};

const publishMapStyle: StyleSpecification = {
  glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
  layers: [
    {
      id: "osm-raster",
      source: "osm",
      type: "raster",
    },
  ],
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

type PublishLocationSuggestion =
  | { id: string; kind: "location"; label: string; subtitle: string; location: LocationResource }
  | { id: string; kind: "place"; label: string; subtitle: string; place: PlaceResource };
type PublishLocationSuggestionGroup = {
  items: PublishLocationSuggestion[];
  key: "districts" | "cities" | "places" | "other";
  title: string;
};
type PendingMapPosition = {
  coordinate: PublishMapCoordinate;
  reverseResult: ReverseLocationResponse["data"] | null;
};

function locationSuggestionLabel(location: LocationResource) {
  return [location.name, location.parent?.name].filter(Boolean).join(", ");
}

function placeSuggestionLabel(place: PlaceResource) {
  const locationLabel = place.location ? locationSuggestionLabel(place.location) : null;
  return [place.name, locationLabel].filter(Boolean).join(", ");
}

function buildLocationSuggestions(locations: LocationResource[], places: PlaceResource[]): PublishLocationSuggestion[] {
  const suggestions = [
    ...locations.map((location) => ({
      id: `location-${location.id}`,
      kind: "location" as const,
      label: locationSuggestionLabel(location),
      location,
      subtitle: location.type === "city" ? "Ville" : location.type === "district" ? "Quartier" : "Pays",
    })),
    ...places.map((place) => ({
      id: `place-${place.id}`,
      kind: "place" as const,
      label: placeSuggestionLabel(place),
      place,
      subtitle: "Repère proche",
    })),
  ];

  const seen = new Set<string>();

  return suggestions.filter((suggestion) => {
    const key = suggestion.kind === "location"
      ? `${suggestion.kind}-${suggestion.label.toLowerCase()}`
      : `${suggestion.kind}-${suggestion.label.toLowerCase()}-${suggestion.place.lat ?? ""}-${suggestion.place.lng ?? ""}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function groupLocationSuggestions(suggestions: PublishLocationSuggestion[]): PublishLocationSuggestionGroup[] {
  const districts = suggestions.filter((suggestion) => suggestion.kind === "location" && suggestion.location.type === "district");
  const cities = suggestions.filter((suggestion) => suggestion.kind === "location" && suggestion.location.type === "city");
  const places = suggestions.filter((suggestion) => suggestion.kind === "place");
  const other = suggestions.filter((suggestion) => suggestion.kind === "location" && suggestion.location.type !== "district" && suggestion.location.type !== "city");

  const groups: PublishLocationSuggestionGroup[] = [
    { items: districts, key: "districts", title: "Quartiers" },
    { items: cities, key: "cities", title: "Villes" },
    { items: places, key: "places", title: "Repères" },
    { items: other, key: "other", title: "Autres" },
  ];

  return groups.filter((group) => group.items.length > 0);
}

function Header({
  step,
  onClose,
}: {
  step: PublishStep;
  onClose: () => void;
}) {
  const progress = `${(step / 7) * 100}%` as DimensionValue;

  return (
    <SafeAreaView edges={["top"]} className="bg-[#F8F9FA]">
      <View className="px-5 pb-3 pt-2">
        <View className="h-11 flex-row items-center justify-between">
          <Pressable className="h-10 w-10 items-center justify-center" onPress={onClose}>
            {step === 1 ? <X color={colors.text} size={25} /> : <ChevronLeft color={colors.text} size={27} strokeWidth={2.2} />}
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
  disabled = false,
  label = "Continuer",
  onBack,
  onNext,
  onSecondary,
  secondary,
}: {
  disabled?: boolean;
  label?: string;
  onBack?: () => void;
  onNext: () => void;
  onSecondary?: () => void;
  secondary?: string;
}) {
  return (
    <View className="absolute bottom-0 left-0 right-0 gap-3 border-t border-[#E1E3E4] bg-white px-5 pb-6 pt-4">
      <View className="flex-row gap-3">
        {onBack ? (
          <Pressable
            className="h-14 flex-1 flex-row items-center justify-center rounded-full border border-[#D1C5AC] bg-white"
            disabled={disabled}
            onPress={onBack}
          >
            <ChevronLeft color="#191C1D" size={20} strokeWidth={2.4} />
            <Text className="ml-1 text-[16px] font-bold text-[#191C1D]">Précédent</Text>
          </Pressable>
        ) : null}
        <Pressable className={`h-14 flex-1 flex-row items-center justify-center rounded-full shadow-soft ${disabled ? "bg-[#9A9A9A]" : "bg-[#191C1D]"}`} disabled={disabled} onPress={onNext}>
          <Text className="text-[16px] font-bold text-white">{label}</Text>
          {disabled ? null : <ArrowRight color="#FFFFFF" size={20} strokeWidth={2.4} style={{ marginLeft: 8 }} />}
        </Pressable>
      </View>
      {secondary ? (
        <Pressable disabled={disabled || !onSecondary} onPress={onSecondary}>
          <Text className="text-center text-[14px] font-bold text-[#5F5E5E]">{secondary}</Text>
        </Pressable>
      ) : null}
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
    <KeyboardAwareScrollView
      bottomOffset={96}
      extraKeyboardSpace={24}
      keyboardShouldPersistTaps="handled"
      mode="insets"
      showsVerticalScrollIndicator={false}
      style={{ backgroundColor: "#F8F9FA", flex: 1 }}
      contentContainerStyle={{ paddingBottom: 180 }}
    >
      <View className="px-5 pt-6">{children}</View>
    </KeyboardAwareScrollView>
  );
}

function InlineMessage({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <View className="mb-5 rounded-2xl border border-[#F5C518] bg-[#FFFBEB] p-4">
      <Text className="text-[13px] font-semibold leading-5 text-[#745B00]">{message}</Text>
    </View>
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

function CategoryIcon({ icon, selected = false, size = 24 }: { icon: ListingCategoryIcon; selected?: boolean; size?: number }) {
  const color = selected ? "#191C1D" : "#5F5E5E";

  if (icon === "phone") return <Smartphone color={color} size={size} />;
  if (icon === "electronics") return <Package color={color} size={size} />;
  if (icon === "vehicle") return <CarFront color={color} size={size} />;
  if (icon === "fashion") return <Shirt color={color} size={size} />;
  if (icon === "home") return <Armchair color={color} size={size} />;
  return <Wrench color={color} size={size} />;
}

function StepTwo({
  selectedCategory,
  setSelectedCategory,
}: {
  selectedCategory: ListingCategoryDefinition;
  setSelectedCategory: (category: ListingCategoryId) => void;
}) {
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
        {listingCategories.map((category) => {
          const selected = category.id === selectedCategory.id;
          return (
            <Pressable
              key={category.id}
              className={`flex-row items-center border-b border-[#EDEEEF] px-5 py-5 ${selected ? "border-l-4 border-l-[#F5C518] bg-[#FFFBEB]" : ""}`}
              onPress={() => setSelectedCategory(category.id)}
            >
              <CategoryIcon icon={category.icon} selected={selected} />
              <Text className={`ml-4 flex-1 text-[16px] ${selected ? "font-black text-[#191C1D]" : "font-semibold text-[#5F5E5E]"}`}>{category.label}</Text>
              {selected ? <CheckCircle color="#F5C518" fill="#F5C518" size={20} /> : <ChevronRight color="#5F5E5E" size={20} />}
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

function PhotoTile({
  canMoveLeft,
  canMoveRight,
  index,
  onAdd,
  onMakeMain,
  onMoveLeft,
  onMoveRight,
  onRemove,
  disabled = false,
  url,
}: {
  canMoveLeft?: boolean;
  canMoveRight?: boolean;
  index: number;
  onAdd: () => void;
  onMakeMain?: () => void;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
  onRemove?: () => void;
  disabled?: boolean;
  url?: string;
}) {
  if (!url) {
    if (disabled) {
      return <View className="aspect-square rounded-xl border border-[#E1E3E4] bg-[#F3F4F5]" />;
    }

    return (
      <Pressable className="aspect-square items-center justify-center rounded-xl border-2 border-dashed border-[#D1C5AC] bg-white" disabled={disabled} onPress={onAdd}>
        {index === 0 ? <Camera color="#807660" size={26} /> : <Plus color="#D1C5AC" size={24} />}
        {index === 0 ? <Text className="mt-1 text-[11px] font-bold text-[#807660]">Ajouter</Text> : null}
      </Pressable>
    );
  }

  return (
    <View className="aspect-square overflow-hidden rounded-xl bg-white">
      <Image source={url} style={{ width: "100%", height: "100%" }} contentFit="cover" />
      <Pressable className="absolute right-1 top-1 h-7 w-7 items-center justify-center rounded-full bg-black/60" disabled={disabled} onPress={onRemove}>
          <CircleX color="#FFFFFF" size={18} />
      </Pressable>
      {index === 0 ? (
        <View className="absolute bottom-1 left-1 rounded bg-black/65 px-2 py-[2px]">
          <Text className="text-[10px] font-bold text-white">Photo principale</Text>
        </View>
      ) : (
        <Pressable className="absolute bottom-1 left-1 rounded bg-black/65 px-2 py-[2px]" disabled={disabled} onPress={onMakeMain}>
          <Text className="text-[10px] font-bold text-white">Principal</Text>
        </Pressable>
      )}
      <View className="absolute bottom-1 right-1 flex-row gap-1">
        {canMoveLeft ? (
          <Pressable className="h-7 w-7 items-center justify-center rounded-full bg-white/90" disabled={disabled} onPress={onMoveLeft}>
            <ArrowLeft color="#191C1D" size={15} strokeWidth={2.4} />
          </Pressable>
        ) : null}
        {canMoveRight ? (
          <Pressable className="h-7 w-7 items-center justify-center rounded-full bg-white/90" disabled={disabled} onPress={onMoveRight}>
            <ArrowRight color="#191C1D" size={15} strokeWidth={2.4} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function StepThree({
  disabled = false,
  errorMessage,
  onMakeMainPhoto,
  onMovePhoto,
  onPickPhotos,
  onRemovePhoto,
  photos,
}: {
  disabled?: boolean;
  errorMessage: string | null;
  onMakeMainPhoto: (index: number) => void | Promise<void>;
  onMovePhoto: (fromIndex: number, toIndex: number) => void | Promise<void>;
  onPickPhotos: () => void;
  onRemovePhoto: (id: string) => void | Promise<void>;
  photos: PublishPhoto[];
}) {
  return (
    <StepShell>
      <InlineMessage message={errorMessage} />
      <Text className="text-[24px] font-black text-[#191C1D]">Ajoutez vos photos</Text>
      <Text className="mt-2 text-[14px] leading-5 text-[#5F5E5E]">La première photo sera utilisée comme couverture de l’annonce.</Text>
      <View className="mt-6 flex-row flex-wrap justify-between gap-y-3">
        {Array.from({ length: 6 }).map((_, index) => {
          const photo = photos[index];
          return (
          <View key={photo?.id ?? index} className="w-[31%]">
            <PhotoTile
              canMoveLeft={Boolean(photo && index > 0)}
              canMoveRight={Boolean(photo && index < photos.length - 1)}
              index={index}
              onAdd={onPickPhotos}
              onMakeMain={photo ? () => onMakeMainPhoto(index) : undefined}
              onMoveLeft={photo ? () => onMovePhoto(index, index - 1) : undefined}
              onMoveRight={photo ? () => onMovePhoto(index, index + 1) : undefined}
              onRemove={photo ? () => onRemovePhoto(photo.id) : undefined}
              disabled={disabled}
              url={photo?.uri}
            />
          </View>
          );
        })}
      </View>
      <View className="mt-6 flex-row items-center rounded-2xl bg-[#EEF0FF] p-4">
        <Info color="#5B5BD6" size={22} fill="#5B5BD6" />
        <Text className="ml-3 flex-1 text-[13px] leading-5 text-[#5B5BD6]">{disabled ? "Mise à jour des photos en cours..." : "Déplacez les photos avec les flèches. La première photo sera la couverture."}</Text>
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

function InputBox({
  keyboardType = "default",
  multiline = false,
  onChangeText,
  placeholder,
  value,
}: {
  keyboardType?: "default" | "number-pad";
  multiline?: boolean;
  onChangeText?: (text: string) => void;
  placeholder: string;
  value?: string;
}) {
  return (
    <TextInput
      className={`rounded-xl border border-[#E1E3E4] bg-white px-4 text-[15px] text-[#191C1D] ${multiline ? "h-[120px] py-3" : "h-12"}`}
      keyboardType={keyboardType}
      multiline={multiline}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#9A9A9A"
      textAlignVertical={multiline ? "top" : "center"}
      value={value}
    />
  );
}

function DynamicAttributeField({
  field,
  onChange,
  value,
}: {
  field: ListingAttributeField;
  onChange: (key: string, value: PublishAttributeValue) => void;
  value?: PublishAttributeValue;
}) {
  if ((field.type === "select" || field.type === "multiselect") && field.options?.length) {
    const selectedValues = Array.isArray(value) ? value : value ? [value] : [];

    return (
      <Field label={`${field.label}${field.required ? " *" : ""}`}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {field.options.map((option) => {
            const selected = selectedValues.includes(option);

            return (
              <Pressable
                key={option}
                className={`rounded-full border px-4 py-2 ${selected ? "border-[#745B00] bg-[#745B00]/5" : "border-[#E1E3E4] bg-white"}`}
                onPress={() => {
                  if (field.type === "multiselect") {
                    const nextValue = selected ? selectedValues.filter((item) => item !== option) : [...selectedValues, option];
                    onChange(field.key, nextValue);
                    return;
                  }

                  onChange(field.key, option);
                }}
              >
                <Text className={`text-[12px] font-bold ${selected ? "text-[#745B00]" : "text-[#191C1D]"}`}>{option}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </Field>
    );
  }

  return (
    <Field label={`${field.label}${field.required ? " *" : ""}`}>
      <InputBox
        keyboardType={field.type === "number" ? "number-pad" : "default"}
        onChangeText={(text) => onChange(field.key, text)}
        placeholder={field.placeholder ?? field.label}
        value={typeof value === "string" ? value : ""}
      />
    </Field>
  );
}

function StepFour({
  attributes,
  category,
  errorMessage,
  form,
  setAttribute,
  setForm,
}: {
  attributes: PublishAttributes;
  category: ListingCategoryDefinition;
  errorMessage: string | null;
  form: PublishForm;
  setAttribute: (key: string, value: PublishAttributeValue) => void;
  setForm: (patch: Partial<PublishForm>) => void;
}) {
  return (
    <StepShell>
      <InlineMessage message={errorMessage} />
      <Text className="mb-4 text-[30px] font-black leading-9 text-[#191C1D]">Décrivez votre article</Text>
      <View className="mb-6 self-start flex-row items-center rounded-full bg-[#F3F4F5] px-4 py-2">
        <CategoryIcon icon={category.icon} selected size={18} />
        <Text className="ml-2 text-[13px] font-bold text-[#191C1D]">{category.label}</Text>
        <Edit3 color="#5F5E5E" size={16} style={{ marginLeft: 6 }} />
      </View>
      <View className="gap-5">
        <Field label="Titre de l’annonce">
          <InputBox onChangeText={(title) => setForm({ title })} placeholder="Ex: iPhone 13 Pro 256Go Bleu" value={form.title} />
        </Field>
        <Field label="Description">
          <InputBox multiline onChangeText={(description) => setForm({ description })} placeholder="Décrivez l'état, les accessoires inclus..." value={form.description} />
        </Field>
        <Field label="État">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {conditionOptions.map((state) => {
              const selected = state.value === form.condition;
              return (
                <Pressable key={state.value} className={`rounded-full border px-4 py-2 ${selected ? "border-[#745B00] bg-[#745B00]/5" : "border-[#E1E3E4] bg-white"}`} onPress={() => setForm({ condition: state.value })}>
                  <Text className={`text-[12px] font-bold ${selected ? "text-[#745B00]" : "text-[#191C1D]"}`}>{state.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </Field>
        {category.fields.map((field) => (
          <DynamicAttributeField key={field.key} field={field} onChange={setAttribute} value={attributes[field.key]} />
        ))}
      </View>
    </StepShell>
  );
}

function StepFiveSale({
  errorMessage,
  form,
  setForm,
}: {
  errorMessage: string | null;
  form: PublishForm;
  setForm: (patch: Partial<PublishForm>) => void;
}) {
  return (
    <StepShell>
      <InlineMessage message={errorMessage} />
      <Text className="text-[32px] font-black text-[#191C1D]">Quel est votre prix ?</Text>
      <View className="mt-8 rounded-3xl border border-[#F5C518] bg-white px-5 py-5 shadow-soft">
        <Text className="text-center text-[12px] font-bold uppercase tracking-[1px] text-[#745B00]">Prix de vente</Text>
        <View className="mt-2 flex-row items-end">
          <TextInput
            className="min-w-0 flex-1 text-center font-black text-[#191C1D]"
            keyboardType="number-pad"
            onChangeText={(price) => setForm({ price: price.replace(/[^\d]/g, "") })}
            placeholder="0"
            placeholderTextColor="#B4B4B4"
            selectionColor="#F5C518"
            style={{ fontSize: getAmountFontSize(form.price), lineHeight: getAmountFontSize(form.price) + 8 }}
            value={formatAmountInput(form.price)}
          />
          <Text className="mb-2 ml-2 text-[18px] font-black text-[#745B00]">FCFA</Text>
        </View>
        <Text className="mt-2 text-center text-[12px] text-[#5F5E5E]">Exemple : 150 000 FCFA</Text>
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

function StepFiveTrade({
  errorMessage,
  form,
  setForm,
}: {
  errorMessage: string | null;
  form: PublishForm;
  setForm: (patch: Partial<PublishForm>) => void;
}) {
  return (
    <StepShell>
      <InlineMessage message={errorMessage} />
      <Text className="text-[30px] font-black leading-9 text-[#191C1D]">Que souhaitez-vous en échange?</Text>
      <Text className="mt-2 text-[15px] leading-6 text-[#5F5E5E]">Décrivez les objets que vous acceptez pour cet échange.</Text>
      <View className="mt-8 rounded-2xl bg-white p-4 shadow-soft">
        <TextInput
          className="h-[140px] text-[16px] text-[#191C1D]"
          maxLength={255}
          multiline
          onChangeText={(exchangeFor) => setForm({ exchangeFor })}
          placeholder="Ex: Cherche vélo de ville, trottinette électrique ou console PS5..."
          placeholderTextColor="#999999"
          textAlignVertical="top"
          value={form.exchangeFor}
        />
        <Text className="text-right text-[12px] text-[#5F5E5E]">{form.exchangeFor.length}/255</Text>
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

function DeliveryIcon({ icon, selected }: { icon: "handshake" | "truck" | "package"; selected: boolean }) {
  const color = selected ? "#745B00" : "#5F5E5E";

  if (icon === "handshake") {
    return <Handshake color={color} size={22} strokeWidth={2.3} />;
  }

  if (icon === "truck") {
    return <Truck color={color} size={22} strokeWidth={2.3} />;
  }

  return <Package color={color} size={22} strokeWidth={2.3} />;
}

function StepFiveTradeCash({
  errorMessage,
  form,
  setForm,
}: {
  errorMessage: string | null;
  form: PublishForm;
  setForm: (patch: Partial<PublishForm>) => void;
}) {
  return (
    <StepShell>
      <InlineMessage message={errorMessage} />
      <Text className="text-[24px] font-black text-[#191C1D]">Troc avec complément</Text>
      <Text className="mt-2 text-[15px] leading-6 text-[#5F5E5E]">Précisez l’échange souhaité et le complément cash.</Text>
      <View className="mt-6 rounded-xl border border-[#E5E7EB] bg-white p-4">
        <TextInput
          className="h-[140px] text-[15px] text-[#191C1D]"
          maxLength={255}
          multiline
          onChangeText={(exchangeFor) => setForm({ exchangeFor })}
          placeholder="Ex: Cherche vélo de ville, trottinette électrique ou console PS5..."
          placeholderTextColor="#999999"
          textAlignVertical="top"
          value={form.exchangeFor}
        />
      </View>
      <View className="mt-8 items-center">
        <Text className="text-[13px] font-bold uppercase tracking-[1px] text-[#5F5E5E]">Complément cash</Text>
        <View className="mt-3 w-full rounded-3xl border border-[#F5C518] bg-white px-5 py-4 shadow-soft">
          <View className="flex-row items-end">
            <TextInput
              className="min-w-0 flex-1 text-center font-black text-[#191C1D]"
              keyboardType="number-pad"
              onChangeText={(cashComplement) => setForm({ cashComplement: cashComplement.replace(/[^\d]/g, "") })}
              placeholder="0"
              placeholderTextColor="#B4B4B4"
              selectionColor="#F5C518"
              style={{ fontSize: getAmountFontSize(form.cashComplement), lineHeight: getAmountFontSize(form.cashComplement) + 8 }}
              value={formatAmountInput(form.cashComplement)}
            />
            <Text className="mb-2 ml-2 text-[18px] font-black text-[#745B00]">FCFA</Text>
          </View>
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

function StepSix({
  errorMessage,
  form,
  setForm,
}: {
  errorMessage: string | null;
  form: PublishForm;
  setForm: (patch: Partial<PublishForm>) => void;
}) {
  const [query, setQuery] = useState(form.locationLabel);
  const [suggestions, setSuggestions] = useState<PublishLocationSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [pendingMapPosition, setPendingMapPosition] = useState<PendingMapPosition | null>(null);
  const [isReverseSearching, setIsReverseSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const [reverseError, setReverseError] = useState<string | null>(null);
  const selectedFormCoordinate = form.displayLat !== null && form.displayLng !== null
    ? { latitude: form.displayLat, longitude: form.displayLng }
    : null;
  const selectedCoordinate = pendingMapPosition?.coordinate ?? selectedFormCoordinate;
  const [mapCenterCoordinate, setMapCenterCoordinate] = useState<PublishMapCoordinate>(selectedCoordinate ?? defaultPublishMapCoordinate);
  const suggestionGroups = groupLocationSuggestions(suggestions).map((group) => ({
    ...group,
    items: group.items.slice(0, 4),
  }));
  const mapZoom = form.locationAccuracy === "city" ? 12 : 14;

  useEffect(() => {
    setQuery(form.locationLabel);
  }, [form.locationLabel]);

  useEffect(() => {
    if (selectedCoordinate) {
      setMapCenterCoordinate(selectedCoordinate);
    }
  }, [selectedCoordinate?.latitude, selectedCoordinate?.longitude]);

  useEffect(() => {
    const trimmedQuery = query.trim();
    const selectedCurrentValue = (form.locationId || form.placeId) && trimmedQuery === form.locationLabel.trim();

    if (trimmedQuery.length < 2 || selectedCurrentValue) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    let cancelled = false;
    setIsSearching(true);

    const timeout = setTimeout(async () => {
      try {
        const results = await searchLocations(trimmedQuery);
        if (!cancelled) {
          setSuggestions(buildLocationSuggestions(results.locations, results.places));
        }
      } catch {
        if (!cancelled) {
          setSuggestions([]);
        }
      } finally {
        if (!cancelled) {
          setIsSearching(false);
        }
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [form.locationLabel, query]);

  const selectSuggestion = (suggestion: PublishLocationSuggestion) => {
    if (suggestion.kind === "location") {
      const location = suggestion.location;
      const isCity = location.type === "city";

      setForm({
        city: isCity ? location.name : location.parent?.name ?? location.name,
        country: location.country_code,
        displayLat: location.lat,
        displayLng: location.lng,
        locationAccuracy: isCity ? "city" : "district",
        locationId: location.id,
        locationLabel: suggestion.label,
        neighborhood: isCity ? "" : location.name,
        placeId: null,
      });
    } else {
      const place = suggestion.place;
      const location = place.location;
      const parent = location?.parent;

      setForm({
        city: parent?.name ?? location?.name ?? place.name,
        country: place.country_code,
        displayLat: place.lat,
        displayLng: place.lng,
        locationAccuracy: location?.type === "city" ? "city" : "district",
        locationId: location?.id ?? null,
        locationLabel: suggestion.label,
        neighborhood: location?.type === "district" ? location.name : "",
        placeId: place.id,
      });
    }

    setSuggestions([]);
    setPendingMapPosition(null);
    setReverseError(null);
  };

  const resolveMapPosition = async (coordinate: PublishMapCoordinate) => {
    setPendingMapPosition({ coordinate, reverseResult: null });
    setReverseError(null);
    setIsReverseSearching(true);

    try {
      const reverseResult = await reverseLocation(coordinate.latitude, coordinate.longitude);
      setPendingMapPosition({ coordinate, reverseResult });
    } catch {
      setReverseError("Adresse non reconnue à ce point.");
      setPendingMapPosition({ coordinate, reverseResult: null });
    } finally {
      setIsReverseSearching(false);
    }
  };

  const handleMapPress = (event: NativeSyntheticEvent<MapLibrePressEvent>) => {
    const [longitude, latitude] = event.nativeEvent.lngLat;
    setMapCenterCoordinate({ latitude, longitude });
    resolveMapPosition({ latitude, longitude });
  };

  const handleMapRegionDidChange = (event: NativeSyntheticEvent<MapLibreViewStateChangeEvent>) => {
    const [longitude, latitude] = event.nativeEvent.center;
    setMapCenterCoordinate({ latitude, longitude });

    if (
      pendingMapPosition
      && (Math.abs(pendingMapPosition.coordinate.latitude - latitude) > 0.00001
        || Math.abs(pendingMapPosition.coordinate.longitude - longitude) > 0.00001)
    ) {
      setPendingMapPosition(null);
      setReverseError(null);
    }
  };

  const handleUseMapCenter = () => {
    resolveMapPosition(mapCenterCoordinate);
  };

  const openFullscreenMap = () => {
    if (selectedCoordinate) {
      setMapCenterCoordinate(selectedCoordinate);
    }
    setIsMapFullscreen(true);
  };

  const handleUseCurrentPosition = async () => {
    setIsLocating(true);
    setReverseError(null);

    try {
      const permission = await ExpoLocation.requestForegroundPermissionsAsync();

      if (permission.status !== "granted") {
        setReverseError("Autorisez la localisation pour utiliser votre position actuelle.");
        return;
      }

      const position = await ExpoLocation.getCurrentPositionAsync({
        accuracy: ExpoLocation.Accuracy.Balanced,
      });

      await resolveMapPosition({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    } catch {
      setReverseError("Impossible de récupérer votre position actuelle.");
    } finally {
      setIsLocating(false);
    }
  };

  const handleCenterOnCurrentPosition = async () => {
    setIsLocating(true);
    setReverseError(null);

    try {
      const permission = await ExpoLocation.requestForegroundPermissionsAsync();

      if (permission.status !== "granted") {
        setReverseError("Autorisez la localisation pour revenir à votre position actuelle.");
        return;
      }

      const position = await ExpoLocation.getCurrentPositionAsync({
        accuracy: ExpoLocation.Accuracy.Balanced,
      });
      const coordinate = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      setMapCenterCoordinate(coordinate);
      await resolveMapPosition(coordinate);
    } catch {
      setReverseError("Impossible de récupérer votre position actuelle.");
    } finally {
      setIsLocating(false);
    }
  };

  const cancelPendingMapPosition = () => {
    setPendingMapPosition(null);
    setReverseError(null);
    setIsReverseSearching(false);
    setIsLocating(false);
  };

  const confirmPendingMapPosition = () => {
    if (!pendingMapPosition) {
      return;
    }

    const reverseResult = pendingMapPosition.reverseResult;
    const coordinate = pendingMapPosition.coordinate;
    const location = reverseResult?.location ?? null;
    const place = reverseResult?.place ?? null;
    const parent = location?.parent ?? place?.location?.parent ?? null;
    const baseLocation = location ?? place?.location ?? null;
    const fallbackLabel = `${coordinate.latitude.toFixed(5)}, ${coordinate.longitude.toFixed(5)}`;
    const label = reverseResult?.label ?? fallbackLabel;

    setQuery(label);
    setForm({
      city: parent?.name ?? (baseLocation?.type === "city" ? baseLocation.name : ""),
      country: baseLocation?.country_code ?? place?.country_code ?? "BJ",
      displayLat: reverseResult?.display_lat ?? coordinate.latitude,
      displayLng: reverseResult?.display_lng ?? coordinate.longitude,
      locationAccuracy: "exact",
      locationId: baseLocation?.id ?? null,
      locationLabel: label,
      neighborhood: baseLocation?.type === "district" ? baseLocation.name : "",
      placeId: place?.id ?? null,
    });
    setPendingMapPosition(null);
    setReverseError(null);
    setIsMapFullscreen(false);
  };

  return (
    <>
    <StepShell>
      <InlineMessage message={errorMessage} />
      <Text className="text-[24px] font-black leading-8 text-[#191C1D]">Où se trouve votre article?</Text>
      <Text className="mt-2 text-[15px] leading-6 text-[#5F5E5E]">Cherchez une ville, un quartier ou un repère proche.</Text>
      <View className="relative mt-6">
        <MapPin color="#5B5BD6" size={22} style={{ left: 16, position: "absolute", top: 13, zIndex: 1 }} />
        <TextInput
          className="h-12 rounded-2xl border border-[#8283FF] bg-white px-12 pr-12 text-[15px] text-[#191C1D]"
          onChangeText={(value) => {
            setQuery(value);
            setForm({
              city: "",
              displayLat: null,
              displayLng: null,
              locationAccuracy: "district",
              locationId: null,
              locationLabel: value,
              neighborhood: "",
              placeId: null,
            });
            setPendingMapPosition(null);
            setReverseError(null);
          }}
          placeholder="Ex: Cadjéhoun, Cotonou"
          value={query}
        />
        {isSearching ? (
          <ActivityIndicator color="#5B5BD6" size="small" style={{ position: "absolute", right: 16, top: 14 }} />
        ) : (
          <Search color="#5F5E5E" size={20} style={{ position: "absolute", right: 16, top: 14 }} />
        )}
      </View>

      <Pressable
        className="mt-3 flex-row items-center rounded-2xl border border-[#D1C5AC] bg-white px-4 py-3"
        disabled={isLocating || isReverseSearching}
        onPress={handleUseCurrentPosition}
      >
        <View className="h-9 w-9 items-center justify-center rounded-full bg-[#F3F7FF]">
          {isLocating ? <ActivityIndicator color="#5B5BD6" size="small" /> : <MapPin color="#5B5BD6" size={19} />}
        </View>
        <View className="ml-3 flex-1">
          <Text className="text-[14px] font-black text-[#191C1D]">Utiliser ma position actuelle</Text>
          <Text className="mt-0.5 text-[12px] text-[#5F5E5E]">L’app identifiera le quartier avant confirmation.</Text>
        </View>
        <ChevronRight color="#C8C6C5" size={18} />
      </Pressable>

      {suggestions.length > 0 ? (
        <View className="mt-3 overflow-hidden rounded-2xl border border-[#E1E3E4] bg-white">
          {suggestionGroups.map((group) => (
            <View key={group.key}>
              <View className="border-b border-[#F3F4F5] bg-[#F8F9FA] px-4 py-2">
                <Text className="text-[11px] font-black uppercase tracking-[1px] text-[#5F5E5E]">{group.title}</Text>
              </View>
              {group.items.map((suggestion) => (
                <Pressable key={suggestion.id} className="flex-row items-center border-b border-[#F3F4F5] px-4 py-3" onPress={() => selectSuggestion(suggestion)}>
                  <View className={`h-9 w-9 items-center justify-center rounded-full ${suggestion.kind === "place" ? "bg-[#FFFBEB]" : suggestion.location.type === "city" ? "bg-[#F3F7FF]" : "bg-[#F8F9FA]"}`}>
                    <MapPin color={suggestion.kind === "place" ? "#745B00" : "#5B5BD6"} size={18} />
                  </View>
                  <View className="ml-3 flex-1">
                    <Text className="text-[14px] font-bold text-[#191C1D]">{suggestion.label}</Text>
                    <Text className="mt-1 text-[12px] text-[#5F5E5E]">{suggestion.subtitle}</Text>
                  </View>
                  <ChevronRight color="#C8C6C5" size={18} />
                </Pressable>
              ))}
            </View>
          ))}
        </View>
      ) : form.locationId || form.placeId ? (
        <View className="mt-3 flex-row items-center rounded-2xl bg-[#F3F7FF] px-4 py-3">
          <CheckCircle color="#5B5BD6" fill="#5B5BD6" size={20} />
          <Text className="ml-3 flex-1 text-[14px] font-bold text-[#191C1D]">{form.locationLabel}</Text>
        </View>
      ) : null}

      {query.trim().length >= 2 && !isSearching && suggestions.length === 0 && !form.locationId && !form.placeId ? (
        <View className="mt-3 rounded-2xl border border-[#E1E3E4] bg-white px-4 py-3">
          <Text className="text-[13px] font-semibold text-[#5F5E5E]">Aucun résultat sélectionné pour le moment.</Text>
          <Pressable
            className="mt-3 flex-row items-center"
            onPress={() =>
              setForm({
                city: query.trim(),
                country: "BJ",
                locationAccuracy: "city",
                locationLabel: query.trim(),
                neighborhood: "",
              })
            }
          >
            <Plus color="#5B5BD6" size={18} />
            <Text className="ml-2 text-[13px] font-bold text-[#5B5BD6]">Utiliser “{query.trim()}”</Text>
          </Pressable>
        </View>
      ) : null}

      <View className="mt-5 h-[220px] overflow-hidden rounded-3xl bg-white shadow-soft">
        <MapLibreMap
          attribution
          compass={false}
          doubleTapZoom={false}
          dragPan={false}
          logo={false}
          mapStyle={publishMapStyle}
          scaleBar={false}
          style={{ height: "100%", width: "100%" }}
          touchPitch={false}
          touchRotate={false}
          touchZoom={false}
        >
          <MapLibreCamera
            center={[mapCenterCoordinate.longitude, mapCenterCoordinate.latitude]}
            duration={250}
            zoom={mapZoom}
          />
          {selectedCoordinate ? (
            <MapLibreMarker anchor="bottom" lngLat={[selectedCoordinate.longitude, selectedCoordinate.latitude]}>
              <View className="items-center">
                <View className="h-11 w-11 items-center justify-center rounded-full bg-[#F5C518] shadow-soft">
                  <MapPin color="#191C1D" fill="#191C1D" size={24} />
                </View>
                <View className="-mt-1 h-3 w-3 rotate-45 bg-[#F5C518]" />
              </View>
            </MapLibreMarker>
          ) : null}
        </MapLibreMap>
        {selectedCoordinate ? null : (
          <View className="absolute inset-0 items-center justify-center bg-white/55">
            <View className="h-12 w-12 items-center justify-center rounded-full bg-white shadow-soft">
              <MapPin color="#5B5BD6" size={24} />
            </View>
          </View>
        )}
        <Pressable className="absolute inset-0" onPress={openFullscreenMap} />
        <Pressable className="absolute bottom-3 left-3 right-3 flex-row items-center justify-center rounded-2xl bg-white/95 px-4 py-3 shadow-soft" onPress={openFullscreenMap}>
          <MapPin color="#191C1D" size={17} />
          <Text className="ml-2 text-[13px] font-black text-[#191C1D]">Agrandir la carte</Text>
        </Pressable>
      </View>
      {isReverseSearching ? (
        <View className="mt-3 flex-row items-center rounded-2xl border border-[#E1E3E4] bg-white px-4 py-3">
          <ActivityIndicator color="#5B5BD6" size="small" />
          <Text className="ml-3 flex-1 text-[13px] font-semibold text-[#5F5E5E]">Identification de la position...</Text>
        </View>
      ) : pendingMapPosition?.reverseResult ? (
        <View className="mt-3 rounded-2xl border border-[#F5C518] bg-[#FFFBEB] p-4">
          <View className="flex-row items-start">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-[#F5C518]">
              <MapPin color="#191C1D" fill="#191C1D" size={20} />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-[12px] font-bold uppercase tracking-[1px] text-[#745B00]">Position trouvée</Text>
              <Text className="mt-1 text-[15px] font-black text-[#191C1D]">{pendingMapPosition.reverseResult.label}</Text>
              <Text className="mt-1 text-[12px] leading-4 text-[#5F5E5E]">Voulez-vous utiliser ce point comme position de l’article ?</Text>
            </View>
          </View>
          <View className="mt-4 flex-row gap-3">
            <Pressable className="flex-1 items-center rounded-xl border border-[#D1C5AC] bg-white px-4 py-3" onPress={cancelPendingMapPosition}>
              <Text className="text-[14px] font-bold text-[#5F5E5E]">Annuler</Text>
            </Pressable>
            <Pressable className="flex-1 items-center rounded-xl bg-[#191C1D] px-4 py-3" onPress={confirmPendingMapPosition}>
              <Text className="text-[14px] font-bold text-white">Utiliser</Text>
            </Pressable>
          </View>
        </View>
      ) : reverseError ? (
        <View className="mt-3 rounded-2xl border border-[#F5C518] bg-[#FFFBEB] p-4">
          <View className="flex-row items-start">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-[#F5C518]">
              <MapPin color="#191C1D" fill="#191C1D" size={20} />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-[12px] font-bold uppercase tracking-[1px] text-[#745B00]">Position GPS sélectionnée</Text>
              <Text className="mt-1 text-[14px] font-bold text-[#191C1D]">{reverseError}</Text>
              <Text className="mt-1 text-[12px] leading-4 text-[#5F5E5E]">Vous pouvez quand même utiliser ce point exact; l’annonce affichera une localisation approximative.</Text>
            </View>
          </View>
          <View className="mt-4 flex-row gap-3">
            <Pressable className="flex-1 items-center rounded-xl border border-[#D1C5AC] bg-white px-4 py-3" onPress={cancelPendingMapPosition}>
              <Text className="text-[14px] font-bold text-[#5F5E5E]">Annuler</Text>
            </Pressable>
            <Pressable className="flex-1 items-center rounded-xl bg-[#191C1D] px-4 py-3" onPress={confirmPendingMapPosition}>
              <Text className="text-[14px] font-bold text-white">Utiliser GPS</Text>
            </Pressable>
          </View>
        </View>
      ) : null}
      <View className="mt-5 flex-row gap-2">
        {["Masquer rue", "Quartier", "Adresse exacte"].map((label, index) => (
          <View key={label} className={`flex-1 rounded-full border px-2 py-3 ${index === 1 ? "border-[#191C1D] bg-[#191C1D]" : "border-[#D1C5AC] bg-white"}`}>
            <Text className={`text-center text-[12px] font-bold ${index === 1 ? "text-white" : "text-[#5F5E5E]"}`}>{label}</Text>
          </View>
        ))}
      </View>
      <View className="mt-7">
        <Text className="text-[16px] font-black text-[#191C1D]">Comment l’article peut être récupéré ?</Text>
        <View className="mt-3 gap-3">
          {deliveryModeOptions.map((option) => {
            const selected = option.value === form.deliveryMode;

            return (
              <Pressable
                key={option.value}
                className={`flex-row items-center rounded-2xl border p-4 ${selected ? "border-[#F5C518] bg-[#FFFBEB]" : "border-[#E1E3E4] bg-white"}`}
                onPress={() => setForm({ deliveryMode: option.value })}
              >
                <View className={`h-11 w-11 items-center justify-center rounded-2xl ${selected ? "bg-[#F5C518]/20" : "bg-[#F3F4F5]"}`}>
                  <DeliveryIcon icon={option.icon} selected={selected} />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="text-[15px] font-bold text-[#191C1D]">{option.label}</Text>
                  <Text className="mt-1 text-[12px] leading-4 text-[#5F5E5E]">{option.description}</Text>
                </View>
                {selected ? <CheckCircle color="#F5C518" fill="#F5C518" size={22} /> : <View className="h-6 w-6 rounded-full border border-[#D1C5AC]" />}
              </Pressable>
            );
          })}
        </View>
      </View>
    </StepShell>
    <Modal animationType="slide" onRequestClose={() => setIsMapFullscreen(false)} visible={isMapFullscreen}>
      <SafeAreaView className="flex-1 bg-[#F8F9FA]">
        <View className="flex-1">
          <MapLibreMap
            attribution
            compass
            doubleTapZoom
            dragPan
            logo={false}
            mapStyle={publishMapStyle}
            onPress={handleMapPress}
            onRegionDidChange={handleMapRegionDidChange}
            scaleBar={false}
            style={{ height: "100%", width: "100%" }}
            touchPitch={false}
            touchRotate={false}
            touchZoom
          >
            <MapLibreCamera
              center={[mapCenterCoordinate.longitude, mapCenterCoordinate.latitude]}
              duration={250}
              zoom={15}
            />
          </MapLibreMap>
          <View pointerEvents="none" style={{ left: "50%", marginLeft: -22, marginTop: -44, position: "absolute", top: "50%" }}>
            <View className="items-center">
              <View className="h-11 w-11 items-center justify-center rounded-full bg-[#F5C518] shadow-soft">
                <MapPin color="#191C1D" fill="#191C1D" size={24} />
              </View>
              <View className="-mt-1 h-3 w-3 rotate-45 bg-[#F5C518]" />
            </View>
          </View>
          <View className="absolute left-4 right-4 top-4 flex-row items-center justify-between">
            <Pressable className="h-12 w-12 items-center justify-center rounded-full bg-white shadow-soft" onPress={() => setIsMapFullscreen(false)}>
              <ChevronLeft color="#191C1D" size={26} />
            </Pressable>
            <View className="rounded-full bg-white/95 px-4 py-3 shadow-soft">
              <Text className="text-[13px] font-black text-[#191C1D]">Choisir la position</Text>
            </View>
          </View>
          <Pressable
            className="absolute right-4 top-20 h-12 w-12 items-center justify-center rounded-full bg-white shadow-soft"
            disabled={isLocating || isReverseSearching}
            onPress={handleCenterOnCurrentPosition}
          >
            {isLocating ? <ActivityIndicator color="#5B5BD6" size="small" /> : <LocateFixed color="#191C1D" size={22} />}
          </Pressable>
          <View className="absolute bottom-0 left-0 right-0 rounded-t-3xl bg-white px-5 pb-6 pt-5 shadow-soft">
            {isReverseSearching ? (
              <View className="flex-row items-center">
                <ActivityIndicator color="#5B5BD6" size="small" />
                <Text className="ml-3 flex-1 text-[14px] font-semibold text-[#5F5E5E]">Identification de la position...</Text>
              </View>
            ) : pendingMapPosition?.reverseResult ? (
              <View>
                <Text className="text-[12px] font-bold uppercase tracking-[1px] text-[#745B00]">Position trouvée</Text>
                <Text className="mt-1 text-[17px] font-black text-[#191C1D]">{pendingMapPosition.reverseResult.label}</Text>
                <Text className="mt-1 text-[12px] leading-4 text-[#5F5E5E]">Confirmez pour utiliser ce point dans l’annonce.</Text>
              </View>
            ) : reverseError ? (
              <View>
                <Text className="text-[14px] font-bold text-[#9B1C1C]">{reverseError}</Text>
                <Text className="mt-1 text-[12px] leading-4 text-[#5F5E5E]">Vous pouvez quand même utiliser les coordonnées GPS exactes.</Text>
              </View>
            ) : (
              <View>
                <Text className="text-[17px] font-black text-[#191C1D]">Placez le repère sur l’article</Text>
                <Text className="mt-1 text-[12px] leading-4 text-[#5F5E5E]">Déplacez la carte, puis confirmez le point sélectionné.</Text>
              </View>
            )}
            <View className="mt-4 flex-row gap-3">
              <Pressable className="flex-1 items-center rounded-xl border border-[#D1C5AC] bg-white px-4 py-4" onPress={() => setIsMapFullscreen(false)}>
                <Text className="text-[14px] font-bold text-[#5F5E5E]">Retour</Text>
              </Pressable>
              {pendingMapPosition?.reverseResult || reverseError ? (
                <Pressable className="flex-1 items-center rounded-xl bg-[#191C1D] px-4 py-4" disabled={isReverseSearching} onPress={confirmPendingMapPosition}>
                  <Text className="text-[14px] font-bold text-white">{reverseError ? "Utiliser GPS" : "Confirmer"}</Text>
                </Pressable>
              ) : (
                <Pressable className="flex-1 items-center rounded-xl bg-[#191C1D] px-4 py-4" disabled={isReverseSearching} onPress={handleUseMapCenter}>
                  <Text className="text-[14px] font-bold text-white">Utiliser cette position</Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
    </>
  );
}

function SummaryRow({ label, onPress, value }: { label: string; onPress: () => void; value: string }) {
  return (
    <Pressable className="flex-row items-center justify-between border-b border-[#EDEEEF] py-4" onPress={onPress}>
      <View>
        <Text className="text-[12px] font-bold uppercase tracking-[1px] text-[#5F5E5E]">{label}</Text>
        <Text className="mt-1 text-[15px] font-semibold text-[#191C1D]">{value}</Text>
      </View>
      <Edit3 color="#5F5E5E" size={18} />
    </Pressable>
  );
}

function StepSeven({
  category,
  errorMessage,
  form,
  mode,
  onEditStep,
  photos,
}: {
  category: ListingCategoryDefinition;
  errorMessage: string | null;
  form: PublishForm;
  mode: PublishMode;
  onEditStep: (step: PublishStep) => void;
  photos: PublishPhoto[];
}) {
  const modeLabel = mode === "sale" ? "Vente" : mode === "trade" ? "Troc" : "Troc + Cash";
  const conditionLabel = conditionOptions.find((option) => option.value === form.condition)?.label ?? "Très bon état";
  const carouselImages = photos.length > 0 ? photos.map((photo) => photo.uri) : [samplePhotos[0]];
  const { width } = useWindowDimensions();
  const carouselWidth = width - 40;
  const title = form.title.trim() || "Titre à renseigner";
  const location = form.locationLabel || [form.neighborhood, form.city].filter(Boolean).join(", ") || "Localisation à renseigner";
  const deliveryModeLabel = getDeliveryModeLabel(form.deliveryMode);

  return (
    <StepShell>
      <InlineMessage message={errorMessage} />
      <View className="items-center">
        <View className="h-10 w-10 items-center justify-center rounded-full bg-[#D7F3FA]">
          <Check color="#00687C" size={20} strokeWidth={3} />
        </View>
        <Text className="mt-5 text-center text-[24px] font-black text-[#191C1D]">Vérifiez votre annonce</Text>
        <Text className="mt-2 text-center text-[14px] leading-5 text-[#5F5E5E]">Dernière étape avant publication.</Text>
      </View>
      <View className="mt-6 overflow-hidden rounded-3xl bg-white shadow-soft">
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
          {carouselImages.map((imageUri, index) => (
            <Image key={`${imageUri}-${index}`} source={imageUri} style={{ width: carouselWidth, height: 190 }} contentFit="cover" />
          ))}
        </ScrollView>
        {carouselImages.length > 1 ? (
          <View className="absolute bottom-[86px] left-0 right-0 flex-row justify-center gap-1">
            {carouselImages.map((imageUri, index) => (
              <View key={`${imageUri}-dot-${index}`} className={`h-1.5 rounded-full ${index === 0 ? "w-5 bg-white" : "w-1.5 bg-white/60"}`} />
            ))}
          </View>
        ) : null}
        <View className="p-4">
          <View className="flex-row items-start justify-between">
            <Text className="max-w-[70%] text-[20px] font-black leading-6 text-[#191C1D]">{title}</Text>
            <Text className="text-[18px] font-black text-[#F5C518]">{mode === "sale" ? formatPrice(form.price) : modeLabel}</Text>
          </View>
          <View className="mt-3 flex-row items-center">
            <MapPin color="#5F5E5E" size={14} />
            <Text className="ml-1 text-[12px] text-[#5F5E5E]">{location}</Text>
            <Text className="mx-3 text-[#D1C5AC]">•</Text>
            <Text className="text-[12px] text-[#5F5E5E]">Maintenant</Text>
          </View>
        </View>
      </View>
      <View className="mt-6 rounded-2xl bg-white px-4 shadow-soft">
        <SummaryRow label="Mode" onPress={() => onEditStep(1)} value={modeLabel} />
        <SummaryRow label="Catégorie" onPress={() => onEditStep(2)} value={category.label} />
        <SummaryRow label="Photos" onPress={() => onEditStep(3)} value={`${photos.length} photo${photos.length > 1 ? "s" : ""} ajoutée${photos.length > 1 ? "s" : ""}`} />
        <SummaryRow label="Description" onPress={() => onEditStep(4)} value={`${title} • ${conditionLabel}`} />
        <SummaryRow label={mode === "sale" ? "Prix" : "Échange"} onPress={() => onEditStep(5)} value={mode === "sale" ? formatPrice(form.price) : form.exchangeFor.trim() || modeLabel} />
        <SummaryRow label="Localisation" onPress={() => onEditStep(6)} value={location} />
        <SummaryRow label="Livraison" onPress={() => onEditStep(6)} value={deliveryModeLabel} />
      </View>
    </StepShell>
  );
}

export function PublishFlowScreen({ editId }: { editId?: string }) {
  const [step, setStep] = useState<PublishStep>(1);
  const [mode, setMode] = useState<PublishMode>("sale");
  const [selectedCategoryId, setSelectedCategoryId] = useState<ListingCategoryId>("telephones");
  const [attributes, setAttributes] = useState<PublishAttributes>({});
  const [form, setFormState] = useState<PublishForm>(initialForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [pickedPhotos, setPickedPhotos] = useState<PublishPhoto[]>([]);
  const [isPhotoUpdating, setIsPhotoUpdating] = useState(false);
  const [draftPrompt, setDraftPrompt] = useState<PublishDraft | null>(null);
  const [draftLoaded, setDraftLoaded] = useState(Boolean(editId));
  const token = useSessionStore((state) => state.token);
  const createListingMutation = useCreateListingMutation();
  const updateListingMutation = useUpdateListingMutation(editId ?? "");
  const editListingQuery = useQuery({
    enabled: Boolean(editId && token),
    queryFn: () => getListing(editId as string),
    queryKey: ["listing-detail", editId],
    staleTime: 30_000,
  });
  const selectedCategory = getListingCategory(selectedCategoryId);
  const isEditing = Boolean(editId);
  const isSubmitting = createListingMutation.isPending || updateListingMutation.isPending;

  const setForm = (patch: Partial<PublishForm>) => {
    setFormError(null);
    setFormState((current) => ({ ...current, ...patch }));
  };

  const selectCategory = (category: ListingCategoryId) => {
    setFormError(null);
    setSelectedCategoryId(category);
    setAttributes({});
  };

  const setAttribute = (key: string, value: PublishAttributeValue) => {
    setFormError(null);
    setAttributes((current) => ({ ...current, [key]: value }));
  };

  useEffect(() => {
    if (isEditing) {
      return;
    }

    let cancelled = false;

    SecureStore.getItemAsync(publishDraftStorageKey)
      .then((storedDraft) => {
        if (cancelled || !storedDraft) {
          setDraftLoaded(true);
          return;
        }

        try {
          const draft = JSON.parse(storedDraft) as PublishDraft;
          setDraftPrompt(draft);
        } catch {
          SecureStore.deleteItemAsync(publishDraftStorageKey).catch(() => undefined);
          setDraftLoaded(true);
        }
      })
      .catch(() => setDraftLoaded(true));

    return () => {
      cancelled = true;
    };
  }, [isEditing]);

  useEffect(() => {
    if (!isEditing || !editListingQuery.data) {
      return;
    }

    const listing = editListingQuery.data;
    const normalizedCategory = getListingCategory(listing.category as ListingCategoryId)?.id ?? "telephones";
    setMode(getModeFromListingType(listing.type));
    setSelectedCategoryId(normalizedCategory);
    setAttributes(mapListingAttributesToPublish(listing.attributes ?? {}));
    setFormState(mapListingToPublishForm(listing));
    setPickedPhotos(mapListingToPublishPhotos(listing));
    setDraftLoaded(true);
  }, [editListingQuery.data, isEditing]);

  useEffect(() => {
    if (isEditing || !draftLoaded || draftPrompt) {
      return;
    }

    const timeout = setTimeout(() => {
      const draft: PublishDraft = {
        attributes,
        form,
        mode,
        photos: pickedPhotos,
        selectedCategoryId,
        step,
        updatedAt: new Date().toISOString(),
      };

      SecureStore.setItemAsync(publishDraftStorageKey, JSON.stringify(draft)).catch(() => undefined);
    }, 500);

    return () => clearTimeout(timeout);
  }, [attributes, draftLoaded, draftPrompt, form, isEditing, mode, pickedPhotos, selectedCategoryId, step]);

  const resumeDraft = () => {
    if (!draftPrompt) {
      return;
    }

    setMode(draftPrompt.mode);
    setSelectedCategoryId(draftPrompt.selectedCategoryId);
    setAttributes(draftPrompt.attributes);
    setFormState(draftPrompt.form);
    setPickedPhotos(draftPrompt.photos);
    setStep(draftPrompt.step);
    setDraftPrompt(null);
    setDraftLoaded(true);
  };

  const startFreshDraft = async () => {
    await SecureStore.deleteItemAsync(publishDraftStorageKey);
    setDraftPrompt(null);
    setDraftLoaded(true);
  };

  const saveDraftNow = async () => {
    const draft: PublishDraft = {
      attributes,
      form,
      mode,
      photos: pickedPhotos,
      selectedCategoryId,
      step,
      updatedAt: new Date().toISOString(),
    };

    await SecureStore.setItemAsync(publishDraftStorageKey, JSON.stringify(draft));
    router.replace("/(tabs)/home");
  };

  const refreshEditedPhotos = async (listing: ListingResource) => {
    setPickedPhotos(mapListingToPublishPhotos(listing));
    await queryClient.setQueryData(["listing-detail", listing.id], listing);
    await queryClient.invalidateQueries({ queryKey: ["my-listings"] });
  };

  const pickPhotos = async () => {
    setFormError(null);

    const remainingSlots = Math.max(10 - pickedPhotos.length, 0);
    if (remainingSlots === 0) {
      setFormError("Maximum 10 photos autorisées.");
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setFormError("Autorisez l'accès aux photos pour continuer.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      mediaTypes: ["images"],
      quality: 0.85,
      selectionLimit: remainingSlots,
    });

    if (result.canceled) {
      return;
    }

    const nextPhotos = result.assets.slice(0, remainingSlots).map(buildPhotoUpload);

    if (isEditing && editId) {
      setIsPhotoUpdating(true);
      try {
        const listing = await uploadListingPhotos(editId, nextPhotos);
        await refreshEditedPhotos(listing);
      } catch (error) {
        const normalizedError = normalizeApiError(error);
        setFormError(normalizedError.message);
      } finally {
        setIsPhotoUpdating(false);
      }
      return;
    }

    setPickedPhotos((current) => [...current, ...nextPhotos]);
  };

  const removePhoto = async (id: string) => {
    setFormError(null);

    if (isEditing && editId) {
      const index = pickedPhotos.findIndex((photo) => photo.id === id);

      if (index < 0) {
        return;
      }

      if (pickedPhotos.length <= 1) {
        setFormError("Gardez au moins une photo sur l’annonce.");
        return;
      }

      setIsPhotoUpdating(true);
      try {
        const listing = await deleteListingPhoto(editId, index);
        await refreshEditedPhotos(listing);
      } catch (error) {
        const normalizedError = normalizeApiError(error);
        setFormError(normalizedError.message);
      } finally {
        setIsPhotoUpdating(false);
      }
      return;
    }

    setPickedPhotos((current) => current.filter((photo) => photo.id !== id));
  };

  const movePhoto = async (fromIndex: number, toIndex: number) => {
    setFormError(null);

    const reorder = (current: PublishPhoto[]) => {
      if (toIndex < 0 || toIndex >= current.length) return current;
      const next = [...current];
      const [photo] = next.splice(fromIndex, 1);
      if (!photo) return current;
      next.splice(toIndex, 0, photo);
      return next;
    };

    if (isEditing && editId) {
      const nextPhotos = reorder(pickedPhotos);
      const serverPhotos = nextPhotos.map((photo) => photo.serverPath).filter((photo): photo is string => Boolean(photo));

      if (serverPhotos.length !== nextPhotos.length) {
        setFormError("Impossible de réordonner les photos pour le moment.");
        return;
      }

      setPickedPhotos(nextPhotos);
      setIsPhotoUpdating(true);
      try {
        const listing = await reorderListingPhotos(editId, serverPhotos);
        await refreshEditedPhotos(listing);
      } catch (error) {
        const normalizedError = normalizeApiError(error);
        setFormError(normalizedError.message);
        setPickedPhotos(pickedPhotos);
      } finally {
        setIsPhotoUpdating(false);
      }
      return;
    }

    setPickedPhotos(reorder);
  };

  const makeMainPhoto = async (index: number) => {
    await movePhoto(index, 0);
  };

  const validateCurrentStep = () => {
    if (step === 3 && pickedPhotos.length === 0) {
      return "Ajoutez au moins une photo.";
    }

    if (step === 4) {
      if (form.title.trim().length < 5) {
        return "Le titre doit faire au moins 5 caractères.";
      }

      if (form.description.trim().length < 20) {
        return "La description doit faire au moins 20 caractères.";
      }

      return getRequiredAttributeMessage(selectedCategory, attributes);
    }

    if (step === 5) {
      if (mode === "sale" && parseAmount(form.price) === null) {
        return "Le prix est requis pour une vente.";
      }

      if (mode !== "sale" && form.exchangeFor.trim().length === 0) {
        return "Précisez ce que vous souhaitez en échange.";
      }
    }

    if (step === 6 && form.locationLabel.trim().length === 0) {
      return "La localisation est requise.";
    }

    return null;
  };

  const submit = async () => {
    const stepError = validateCurrentStep();
    if (stepError) {
      setFormError(stepError);
      return;
    }

    if (!token) {
      setFormError("Connectez-vous pour publier une annonce.");
      router.push("/(auth)/sign-in");
      return;
    }

    try {
      const listingPayload: UpdateListingPayload = {
        attributes,
        cash_complement: mode === "trade-cash" ? parseAmount(form.cashComplement) : null,
        category: selectedCategory.id,
        city: form.city.trim(),
        condition: form.condition,
        country: form.country,
        delivery_mode: form.deliveryMode,
        description: form.description.trim(),
        display_lat: form.displayLat,
        display_lng: form.displayLng,
        exchange_for: mode === "sale" ? null : form.exchangeFor.trim(),
        location_accuracy: form.locationAccuracy,
        location_id: form.locationId,
        neighborhood: form.neighborhood.trim() || null,
        place_id: form.placeId,
        price: mode === "sale" ? parseAmount(form.price) : null,
        tags: [],
        title: form.title.trim(),
        type: toListingType(mode),
      };
      const listing = isEditing && editId
        ? await updateListingMutation.mutateAsync(listingPayload)
        : await createListingMutation.mutateAsync({
            ...listingPayload,
            photos: pickedPhotos,
          });

      if (!isEditing) {
        await SecureStore.deleteItemAsync(publishDraftStorageKey);
      }
      router.replace(`/listing/${listing.id}`);
    } catch (error) {
      const normalizedError = normalizeApiError(error);
      setFormError(normalizedError.message);
    }
  };

  const goToStep = (targetStep: PublishStep) => {
    setFormError(null);
    setStep(targetStep);
  };

  const content = useMemo(() => {
    if (step === 1) return <StepOne mode={mode} setMode={setMode} />;
    if (step === 2) return <StepTwo selectedCategory={selectedCategory} setSelectedCategory={selectCategory} />;
    if (step === 3) return <StepThree disabled={isPhotoUpdating} errorMessage={formError} onMakeMainPhoto={makeMainPhoto} onMovePhoto={movePhoto} onPickPhotos={pickPhotos} onRemovePhoto={removePhoto} photos={pickedPhotos} />;
    if (step === 4) return <StepFour attributes={attributes} category={selectedCategory} errorMessage={formError} form={form} setAttribute={setAttribute} setForm={setForm} />;
    if (step === 5 && mode === "sale") return <StepFiveSale errorMessage={formError} form={form} setForm={setForm} />;
    if (step === 5 && mode === "trade") return <StepFiveTrade errorMessage={formError} form={form} setForm={setForm} />;
    if (step === 5) return <StepFiveTradeCash errorMessage={formError} form={form} setForm={setForm} />;
    if (step === 6) return <StepSix errorMessage={formError} form={form} setForm={setForm} />;
    return <StepSeven category={selectedCategory} errorMessage={formError} form={form} mode={mode} onEditStep={goToStep} photos={pickedPhotos} />;
  }, [attributes, form, formError, isPhotoUpdating, mode, pickedPhotos, selectedCategory, step]);

  const next = async () => {
    setFormError(null);

    const stepError = validateCurrentStep();
    if (stepError) {
      setFormError(stepError);
      return;
    }

    if (step === 7) {
      await submit();
      return;
    }

    setStep((current) => (Math.min(current + 1, 7) as PublishStep));
  };

  const back = () => {
    setFormError(null);
    setStep((current) => (Math.max(current - 1, 1) as PublishStep));
  };
  const close = () => router.replace("/(tabs)/home");
  const footerLabel = isSubmitting ? (isEditing ? "Mise à jour..." : "Publication...") : step === 7 ? (isEditing ? "Mettre à jour" : "Publier maintenant") : "Continuer";

  if (!draftLoaded || (isEditing && editListingQuery.isLoading)) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#F8F9FA] px-6">
        <ActivityIndicator color="#F5C518" size="large" />
        <Text className="mt-4 text-center text-[14px] font-semibold text-[#5F5E5E]">{isEditing ? "Chargement de l’annonce..." : "Préparation du brouillon..."}</Text>
      </SafeAreaView>
    );
  }

  if (draftPrompt) {
    return (
      <SafeAreaView className="flex-1 bg-[#F8F9FA]">
        <View className="flex-1 justify-center px-5">
          <View className="rounded-3xl bg-white p-5 shadow-soft">
            <View className="h-12 w-12 items-center justify-center rounded-full bg-[#FFFBEB]">
              <Save color="#745B00" size={22} />
            </View>
            <Text className="mt-5 text-[24px] font-black text-[#191C1D]">Reprendre votre brouillon ?</Text>
            <Text className="mt-2 text-[14px] leading-6 text-[#5F5E5E]">Une annonce non publiée est disponible. Vous pouvez continuer où vous vous êtes arrêté ou repartir de zéro.</Text>
            <Pressable className="mt-6 h-14 items-center justify-center rounded-full bg-[#191C1D]" onPress={resumeDraft}>
              <Text className="text-[16px] font-bold text-white">Continuer le brouillon</Text>
            </Pressable>
            <Pressable className="mt-3 h-14 items-center justify-center rounded-full border border-[#D1C5AC] bg-white" onPress={startFreshDraft}>
              <Text className="text-[16px] font-bold text-[#191C1D]">Nouvelle annonce</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <KeyboardProvider>
      <KeyboardAvoidingView automaticOffset behavior="translate-with-padding" style={{ backgroundColor: "#F8F9FA", flex: 1 }}>
        <Header step={step} onClose={close} />
        {content}
        <Footer
          disabled={isSubmitting}
          label={footerLabel}
          onBack={step > 1 ? back : undefined}
          onNext={next}
          onSecondary={!isEditing ? saveDraftNow : undefined}
          secondary={step === 7 && !isEditing ? "Enregistrer comme brouillon" : undefined}
        />
      </KeyboardAvoidingView>
    </KeyboardProvider>
  );
}
