import LottieView from "lottie-react-native";
import { useEffect, useRef } from "react";
import { Animated, Easing, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const bizoLogoIntro = require("../../../assets/animations/bizo-logo-intro-vector.json");

function LoadingDot({ delay }: { delay: number }) {
  const opacity = useRef(new Animated.Value(0.25)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 360,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: -4,
            duration: 360,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0.25,
            duration: 360,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 0,
            duration: 360,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [delay, opacity, translateY]);

  return (
    <Animated.View
      className="h-3 w-3 rounded-full bg-[#FF8C42]"
      style={{ opacity, transform: [{ translateY }] }}
    />
  );
}

export function StartupLoadingScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <View className="flex-1 items-center justify-center px-8">
        <LottieView
          autoPlay
          loop
          source={bizoLogoIntro}
          style={{ height: 260, width: 260 }}
        />
        <Text className="mt-5 text-center text-[14px] text-[#7E7E7E]">
          Loading your marketplace
        </Text>
        <View className="mt-8 flex-row items-center gap-3">
          <LoadingDot delay={0} />
          <LoadingDot delay={120} />
          <LoadingDot delay={240} />
        </View>
      </View>
    </SafeAreaView>
  );
}
