import { router } from "expo-router";
import { useEffect } from "react";

import { useSessionStore } from "@/src/store/session";

export default function IndexRoute() {
  const hydrated = useSessionStore((state) => state.hydrated);
  const onboardingSeen = useSessionStore((state) => state.onboardingSeen);
  const token = useSessionStore((state) => state.token);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (token) {
      router.replace("/(tabs)/home");
      return;
    }

    router.replace(onboardingSeen ? "/(auth)/sign-in" : "/onboarding");
  }, [hydrated, onboardingSeen, token]);

  return null;
}
