import { useRouter } from "expo-router";

import { DetailProductScreen as DetailProductScreenView } from "@/src/features/detail/components/detail-ui";
import { useListingDetail } from "@/src/features/detail/api/use-listing-detail";
import { getDetailProduct } from "@/src/features/detail/mocks/detail-mocks";

export function DetailProductScreen({ id }: { id?: string }) {
  const router = useRouter();
  const fallbackProduct = getDetailProduct(id);
  const { product: apiProduct } = useListingDetail(id);
  const product = apiProduct ?? fallbackProduct;

  return (
    <DetailProductScreenView
      product={product}
      onBack={() => router.back()}
      onSellerPress={() => router.push(`/seller/${product.seller.id || "marc-antoine"}`)}
    />
  );
}
