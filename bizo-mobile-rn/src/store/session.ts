import * as SecureStore from "expo-secure-store";
import { create } from "zustand";

import { STORAGE_KEYS } from "@/src/config/env";

type SessionState = {
  hydrated: boolean;
  onboardingSeen: boolean;
  token: string | null;
  setHydrated: (value: boolean) => void;
  setOnboardingSeen: (value: boolean) => Promise<void>;
  setToken: (token: string | null) => Promise<void>;
  clearSession: () => Promise<void>;
  hydrate: () => Promise<void>;
};

export const useSessionStore = create<SessionState>((set) => ({
  hydrated: false,
  onboardingSeen: false,
  token: null,
  setHydrated: (value) => set({ hydrated: value }),
  setOnboardingSeen: async (value) => {
    await SecureStore.setItemAsync(STORAGE_KEYS.onboardingSeen, value ? "1" : "0");
    set({ onboardingSeen: value });
  },
  setToken: async (token) => {
    if (token) {
      await SecureStore.setItemAsync(STORAGE_KEYS.authToken, token);
    } else {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.authToken);
    }
    set({ token });
  },
  clearSession: async () => {
    await SecureStore.deleteItemAsync(STORAGE_KEYS.authToken);
    set({ token: null });
  },
  hydrate: async () => {
    const [token, onboardingSeen] = await Promise.all([
      SecureStore.getItemAsync(STORAGE_KEYS.authToken),
      SecureStore.getItemAsync(STORAGE_KEYS.onboardingSeen),
    ]);

    set({
      hydrated: true,
      token,
      onboardingSeen: onboardingSeen === "1",
    });
  },
}));
