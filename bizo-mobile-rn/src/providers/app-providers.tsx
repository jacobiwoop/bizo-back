import { QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren, useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { queryClient } from "@/src/lib/query-client";
import { getProfile } from "@/src/lib/api/auth";
import { useSessionStore } from "@/src/store/session";

function SessionBootstrap() {
  const hydrated = useSessionStore((state) => state.hydrated);
  const token = useSessionStore((state) => state.token);
  const setUser = useSessionStore((state) => state.setUser);

  useEffect(() => {
    if (!hydrated || !token) {
      return;
    }

    let active = true;

    getProfile()
      .then((user) => {
        if (active) {
          void setUser(user);
        }
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, [hydrated, setUser, token]);

  return null;
}

export function AppProviders({ children }: PropsWithChildren) {
  const hydrate = useSessionStore((state) => state.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <SessionBootstrap />
          {children}
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
