import { useRouter } from "expo-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { DetailProductScreen as DetailProductScreenView } from "@/src/features/detail/components/detail-ui";
import { useListingDetail } from "@/src/features/detail/api/use-listing-detail";
import { getMockDetailProduct } from "@/src/features/detail/mocks/detail-mocks";
import { normalizeApiError } from "@/src/lib/api/errors";
import { addFavorite, createConversation, getFavorites, removeFavorite } from "@/src/lib/api/interactions";
import { deleteListing } from "@/src/lib/api/listings";
import { queryClient } from "@/src/lib/query-client";
import { useSessionStore } from "@/src/store/session";

function DetailStateScreen({
  actionLabel,
  message,
  onAction,
  title,
}: {
  actionLabel?: string;
  message: string;
  onAction?: () => void;
  title: string;
}) {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-center text-[22px] font-black text-[#191C1D]">{title}</Text>
        <Text className="mt-3 text-center text-[14px] leading-6 text-[#5F5E5E]">{message}</Text>
        {onAction && actionLabel ? (
          <Pressable className="mt-6 h-12 items-center justify-center rounded-full bg-[#191C1D] px-6" onPress={onAction}>
            <Text className="text-[14px] font-bold text-white">{actionLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

export function DetailProductScreen({ id }: { id?: string }) {
  const router = useRouter();
  const token = useSessionStore((state) => state.token);
  const user = useSessionStore((state) => state.user);
  const fallbackProduct = getMockDetailProduct(id);
  const { error, isLoading, product: apiProduct } = useListingDetail(id);
  const product = apiProduct ?? fallbackProduct;
  const isOwner = Boolean(product?.seller.id && user?.id && product.seller.id === user.id);
  const favoritesQuery = useQuery({
    enabled: Boolean(token && product?.id && !isOwner),
    queryFn: getFavorites,
    queryKey: ["favorites"],
    staleTime: 30_000,
  });
  const isFavorite = Boolean(favoritesQuery.data?.some((favorite) => favorite.listing_id === product?.id));
  const favoriteMutation = useMutation({
    mutationFn: async () => {
      if (!product) {
        return;
      }

      if (isFavorite) {
        await removeFavorite(product.id);
      } else {
        await addFavorite(product.id);
      }
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["favorites"] }),
        product?.id ? queryClient.invalidateQueries({ queryKey: ["listing-detail", product.id] }) : Promise.resolve(),
      ]);
    },
  });
  const contactMutation = useMutation({
    mutationFn: (message: string) => {
      if (!product) {
        throw new Error("Annonce indisponible.");
      }

      return createConversation(product.id, message);
    },
    onSuccess: (conversation) => {
      router.push(`/chat/${conversation.id}`);
    },
    onError: (mutationError) => {
      const normalizedError = normalizeApiError(mutationError);
      Alert.alert("Action impossible", normalizedError.message);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!product) {
        return;
      }

      await deleteListing(product.id);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["home-listings"] }),
        queryClient.invalidateQueries({ queryKey: ["my-listings"] }),
      ]);
      router.replace("/(tabs)/home");
    },
    onError: (mutationError) => {
      const normalizedError = normalizeApiError(mutationError);
      Alert.alert("Suppression impossible", normalizedError.message);
    },
  });
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(tabs)/home");
  };
  const requireSession = () => {
    if (token) {
      return true;
    }

    router.push("/(auth)/sign-in");
    return false;
  };
  const handleFavorite = () => {
    if (!product || isOwner || !requireSession() || favoriteMutation.isPending) {
      return;
    }

    favoriteMutation.mutate();
  };
  const handleContact = () => {
    if (!product || isOwner || !requireSession() || contactMutation.isPending) {
      return;
    }

    contactMutation.mutate(`Bonjour, votre annonce "${product.title}" est-elle toujours disponible ?`);
  };
  const handleOffer = () => {
    if (!product || isOwner || !requireSession() || contactMutation.isPending) {
      return;
    }

    const message = product.type === "VENTE"
      ? `Bonjour, je souhaite faire une offre pour "${product.title}".`
      : `Bonjour, je souhaite proposer un échange pour "${product.title}".`;

    contactMutation.mutate(message);
  };
  const handleDelete = () => {
    if (!product || !isOwner || deleteMutation.isPending) {
      return;
    }

    Alert.alert("Supprimer l’annonce", "Cette action retirera l’annonce de Bizo.", [
      { style: "cancel", text: "Annuler" },
      { style: "destructive", text: "Supprimer", onPress: () => deleteMutation.mutate() },
    ]);
  };
  const handleEdit = () => {
    if (!product || !isOwner) {
      return;
    }

    router.push(`/publish?edit=${product.id}`);
  };

  if (!product && isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#F5C518" size="large" />
          <Text className="mt-4 text-[14px] font-semibold text-[#5F5E5E]">Chargement de l’annonce...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!product && error) {
    return (
      <DetailStateScreen
        actionLabel="Retour à l’accueil"
        message="Cette annonce n’est pas disponible ou la connexion a échoué."
        onAction={() => router.replace("/(tabs)/home")}
        title="Annonce introuvable"
      />
    );
  }

  if (!product) {
    return (
      <DetailStateScreen
        actionLabel="Retour à l’accueil"
        message="Impossible d’afficher cette annonce pour le moment."
        onAction={() => router.replace("/(tabs)/home")}
        title="Annonce indisponible"
      />
    );
  }

  return (
    <DetailProductScreenView
      isFavorite={isFavorite}
      isOwner={isOwner}
      product={product}
      onBack={handleBack}
      onContactPress={handleContact}
      onDeletePress={handleDelete}
      onEditPress={handleEdit}
      onFavoritePress={handleFavorite}
      onOfferPress={handleOffer}
      onSellerPress={() => router.push(`/seller/${product.seller.id || "marc-antoine"}`)}
    />
  );
}
