import { useRouter } from "expo-router";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { DetailProductScreen as DetailProductScreenView } from "@/src/features/detail/components/detail-ui";
import { useListingDetail } from "@/src/features/detail/api/use-listing-detail";
import { getMockDetailProduct } from "@/src/features/detail/mocks/detail-mocks";

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
  const fallbackProduct = getMockDetailProduct(id);
  const { error, isLoading, product: apiProduct } = useListingDetail(id);
  const product = apiProduct ?? fallbackProduct;
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(tabs)/home");
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
      product={product}
      onBack={handleBack}
      onSellerPress={() => router.push(`/seller/${product.seller.id || "marc-antoine"}`)}
    />
  );
}
