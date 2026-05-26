import { Redirect } from "expo-router";

import { useSessionStore } from "@/src/store/session";

export default function IndexRoute() {
  const hydrated = useSessionStore((state) => state.hydrated);
  const onboardingSeen = useSessionStore((state) => state.onboardingSeen);
  const token = useSessionStore((state) => state.token);

  if (!hydrated) {
    return null;
  }

  if (!onboardingSeen) {
    return <Redirect href="/onboarding" />;
  }

  if (!token) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return <Redirect href="/(tabs)/home" />;
}
