import { useLocalSearchParams } from "expo-router";

import { DetailProductScreen } from "@/src/features/detail/screens/detail-product-screen";

export default function ListingDetailRoute() {
  const params = useLocalSearchParams<{ id?: string }>();

  return <DetailProductScreen id={params.id} />;
}
