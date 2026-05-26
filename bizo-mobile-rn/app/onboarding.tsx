import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { PlaceholderScreen } from "@/src/components/ui/placeholder-screen";
import { useSessionStore } from "@/src/store/session";

export default function OnboardingRoute() {
  const setOnboardingSeen = useSessionStore((state) => state.setOnboardingSeen);

  return (
    <PlaceholderScreen
      title="Onboarding"
      subtitle="Les ecrans vont etre refaits a partir de Classified AI. Cette route existe deja pour brancher le flux de navigation proprement."
      footer={
        <Pressable
          className="rounded-full bg-ink px-6 py-4"
          onPress={async () => {
            await setOnboardingSeen(true);
            router.replace("/(auth)/sign-in");
          }}
        >
          <Text className="text-center text-base font-semibold text-white">Continuer</Text>
        </Pressable>
      }
    />
  );
}
