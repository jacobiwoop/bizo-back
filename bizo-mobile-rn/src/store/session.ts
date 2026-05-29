import * as SecureStore from "expo-secure-store";
import { create } from "zustand";

import { STORAGE_KEYS } from "@/src/config/env";
import { ApiUser } from "@/src/lib/api/types";

type SessionState = {
  hydrated: boolean;
  onboardingSeen: boolean;
  token: string | null;
  user: ApiUser | null;
  setHydrated: (value: boolean) => void;
  setOnboardingSeen: (value: boolean) => Promise<void>;
  setSession: (token: string, user: ApiUser) => Promise<void>;
  setToken: (token: string | null) => Promise<void>;
  setUser: (user: ApiUser | null) => Promise<void>;
  clearSession: () => Promise<void>;
  hydrate: () => Promise<void>;
};

export const useSessionStore = create<SessionState>((set) => ({
  hydrated: false,
  onboardingSeen: false,
  token: null,
  user: null,
  setHydrated: (value) => set({ hydrated: value }),
  setOnboardingSeen: async (value) => {
    await SecureStore.setItemAsync(STORAGE_KEYS.onboardingSeen, value ? "1" : "0");
    set({ onboardingSeen: value });
  },
  setSession: async (token, user) => {
    await Promise.all([
      SecureStore.setItemAsync(STORAGE_KEYS.authToken, token),
      SecureStore.setItemAsync(STORAGE_KEYS.user, JSON.stringify(user)),
    ]);
    set({ token, user });
  },
  setToken: async (token) => {
    if (token) {
      await SecureStore.setItemAsync(STORAGE_KEYS.authToken, token);
    } else {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.authToken);
    }
    set({ token });
  },
  setUser: async (user) => {
    if (user) {
      await SecureStore.setItemAsync(STORAGE_KEYS.user, JSON.stringify(user));
    } else {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.user);
    }
    set({ user });
  },
  clearSession: async () => {
    await Promise.all([
      SecureStore.deleteItemAsync(STORAGE_KEYS.authToken),
      SecureStore.deleteItemAsync(STORAGE_KEYS.user),
    ]);
    set({ token: null, user: null });
  },
  hydrate: async () => {
    const [token, onboardingSeen, storedUser] = await Promise.all([
      SecureStore.getItemAsync(STORAGE_KEYS.authToken),
      SecureStore.getItemAsync(STORAGE_KEYS.onboardingSeen),
      SecureStore.getItemAsync(STORAGE_KEYS.user),
    ]);

    let user: ApiUser | null = null;

    if (storedUser) {
      try {
        user = JSON.parse(storedUser) as ApiUser;
      } catch {
        await SecureStore.deleteItemAsync(STORAGE_KEYS.user);
      }
    }

    set({
      hydrated: true,
      token,
      user,
      onboardingSeen: onboardingSeen === "1",
    });
  },
}));
