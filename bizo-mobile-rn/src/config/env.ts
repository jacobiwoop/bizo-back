export const API_BASE_URL = "https://bizo.aiko.qzz.io/api/v1";
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/v1\/?$/, "");
export const APP_SCHEME = "bizo";

export const REALTIME_CONFIG = {
  enabled: true,
  appKey: "eert8x7wnwzya7scgtan",
  authEndpoint: `${API_ORIGIN}/broadcasting/auth`,
  host: "bizo.aiko.qzz.io",
  port: 443,
  scheme: "https",
} as const;

export const STORAGE_KEYS = {
  authToken: "bizo.auth.token",
  user: "bizo.auth.user",
  onboardingSeen: "bizo.onboarding.seen",
} as const;
