import { useRouter } from "expo-router";

import { PublicSellerAnnoncesScreen } from "@/src/features/profile/screens/public-seller-annonces-screen";

export default function SellerAnnoncesRoute() {
  const router = useRouter();

  return <PublicSellerAnnoncesScreen onBack={() => router.back()} />;
}
