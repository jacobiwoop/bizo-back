import "../global.css";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import { Platform, View } from "react-native";
import * as SplashScreen from "expo-splash-screen";

import { StartupLoadingScreen } from "@/src/components/ui/startup-loading-screen";
import { AppProviders } from "@/src/providers/app-providers";
import { useSessionStore } from "@/src/store/session";

const STARTUP_ANIMATION_FALLBACK_MS = 4500;

export default function RootLayout() {
  const hydrated = useSessionStore((state) => state.hydrated);
  const [startupAnimationDone, setStartupAnimationDone] = useState(false);
  const splashPreparedRef = useRef(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setStartupAnimationDone(true);
    }, STARTUP_ANIMATION_FALLBACK_MS);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    if (splashPreparedRef.current) {
      return;
    }

    splashPreparedRef.current = true;
    SplashScreen.preventAutoHideAsync().catch(() => undefined);
  }, []);

  useEffect(() => {
    if (Platform.OS === "android" || hydrated) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [hydrated]);

  const showStartupScreen = Platform.OS !== "android" && (!hydrated || !startupAnimationDone);

  return (
    <AppProviders>
      <StatusBar style="dark" />
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="search" />
          <Stack.Screen name="search-grid" />
          <Stack.Screen name="search-filter" />
          <Stack.Screen name="category" />
          <Stack.Screen name="popular-items" />
          <Stack.Screen name="location" />
          <Stack.Screen name="notification" />
          <Stack.Screen name="publish" />
          <Stack.Screen name="listing/[id]" />
          <Stack.Screen name="seller/[id]" />
          <Stack.Screen name="seller-annonces" />
          <Stack.Screen name="chat/[id]" />
        </Stack>
        {showStartupScreen ? (
          <View
            pointerEvents="auto"
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
            }}
          >
            <StartupLoadingScreen onAnimationFinish={() => setStartupAnimationDone(true)} />
          </View>
        ) : null}
      </View>
    </AppProviders>
  );
}
