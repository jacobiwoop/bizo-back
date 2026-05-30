import { Image } from "expo-image";
import { router } from "expo-router";
import { ArrowRight } from "lucide-react-native";
import { useState } from "react";
import { PanResponder, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useSessionStore } from "@/src/store/session";

const slides = [
  {
    id: "welcome",
    image: require("../../../../design/bizo/bizo_onboarding_slide_1_welcome/illustration.png"),
    title: "Achetez et vendez\nfacilement",
    description: "Des milliers d'annonces près de chez vous. Trouver la bonne affaire en quelques secondes.",
  },
  {
    id: "barter",
    image: require("../../../../design/bizo/bizo_onboarding_slide_2_reinvented_barter/illustration.png"),
    title: "Le troc\nréinventé",
    description: "Échangez vos objets, proposez un complément cash. Troc simple, troc + cash, à vous de choisir.",
  },
  {
    id: "local",
    image: require("../../../../design/bizo/bizo_onboarding_slide_3_local_discovery/illustration.png"),
    title: "Près de\nchez vous",
    description: "Trouvez des annonces dans votre quartier. Rencontrez des vendeurs à proximité.",
  },
];

export function OnboardingScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const setOnboardingSeen = useSessionStore((state) => state.setOnboardingSeen);
  const slide = slides[activeIndex] ?? slides[0];
  const isLastSlide = activeIndex === slides.length - 1;
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesture) =>
      Math.abs(gesture.dx) > 18 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.2,
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dx < -42 && activeIndex < slides.length - 1) {
        setActiveIndex((current) => current + 1);
      }

      if (gesture.dx > 42 && activeIndex > 0) {
        setActiveIndex((current) => current - 1);
      }
    },
  });

  const continueToAuth = async () => {
    await setOnboardingSeen(true);
    router.replace("/(auth)/sign-in");
  };

  const handleNext = () => {
    if (!isLastSlide) {
      setActiveIndex((current) => current + 1);
      return;
    }

    continueToAuth();
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <View className="flex-1 bg-white">
        <View className="h-16 flex-row items-center justify-end px-5">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Passer"
            className="px-3 py-2"
            onPress={continueToAuth}
          >
            <Text className="text-[14px] text-[#5F5E5E]">Passer</Text>
          </Pressable>
        </View>

        <View
          className="h-[356px] items-center justify-center bg-white px-8"
          {...panResponder.panHandlers}
        >
          <Image source={slide.image} style={{ width: 308, height: 308 }} contentFit="contain" />
        </View>

        <View className="-mt-3 flex-1 rounded-t-[24px] bg-white px-8 pb-10 pt-8 shadow-soft">
          <View className="flex-row items-center gap-2">
            {slides.map((item, index) => (
              <View
                key={item.id}
                className={`h-2 rounded-full ${
                  index === activeIndex ? "w-6 bg-[#F5C518]" : "w-2 bg-[#E2E8F0]"
                }`}
              />
            ))}
          </View>

          <Text className="mt-8 text-[30px] font-bold leading-[34px] text-[#151C27]">
            {slide.title}
          </Text>
          <Text className="mt-4 text-[15px] leading-[23px] text-[#6B7280]">
            {slide.description}
          </Text>

          <View className="mt-auto pt-8">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Suivant"
              className="h-[56px] flex-row items-center justify-center rounded-full bg-[#151C27] shadow-soft"
              onPress={handleNext}
            >
              <Text className="text-[19px] font-semibold text-white">
                {isLastSlide ? "Ouvrir" : "Suivant"}
              </Text>
              <ArrowRight color="#FFFFFF" size={24} strokeWidth={2.4} style={{ marginLeft: 12 }} />
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
