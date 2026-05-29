import "../global.css";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef } from "react";
import { View } from "react-native";
import * as SplashScreen from "expo-splash-screen";

import { StartupLoadingScreen } from "@/src/components/ui/startup-loading-screen";
import { AppProviders } from "@/src/providers/app-providers";
import { useSessionStore } from "@/src/store/session";

export default function RootLayout() {
  const hydrated = useSessionStore((state) => state.hydrated);
  const splashPreparedRef = useRef(false);

  useEffect(() => {
    if (splashPreparedRef.current) {
      return;
    }

    splashPreparedRef.current = true;
    SplashScreen.preventAutoHideAsync().catch(() => undefined);
  }, []);

  useEffect(() => {
    if (hydrated) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [hydrated]);

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
        {!hydrated ? (
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
            <StartupLoadingScreen />
          </View>
        ) : null}
      </View>
    </AppProviders>
  );
}
