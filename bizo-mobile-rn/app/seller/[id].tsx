import { useRouter } from "expo-router";

import { PublicSellerProfileScreen } from "@/src/features/profile/screens/public-seller-profile-screen";

export default function PublicSellerRoute() {
  const router = useRouter();

  return <PublicSellerProfileScreen onBack={() => router.back()} onOpenListings={() => router.push("/seller-annonces")} />;
}
