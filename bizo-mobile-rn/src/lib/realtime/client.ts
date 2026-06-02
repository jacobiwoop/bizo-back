import Echo from "laravel-echo";
import Pusher from "pusher-js/react-native";

import { REALTIME_CONFIG } from "@/src/config/env";

type RealtimeEcho = Echo<"reverb">;

let activeEcho: RealtimeEcho | null = null;
let activeToken: string | null = null;

export function getRealtimeEcho(token: string | null): RealtimeEcho | null {
  if (!REALTIME_CONFIG.enabled || !REALTIME_CONFIG.appKey || !token) {
    return null;
  }

  if (activeEcho && activeToken === token) {
    return activeEcho;
  }

  activeEcho?.disconnect();
  activeToken = token;

  activeEcho = new Echo({
    Pusher,
    auth: {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
    authEndpoint: REALTIME_CONFIG.authEndpoint,
    broadcaster: "reverb",
    disableStats: true,
    enabledTransports: ["ws", "wss"],
    forceTLS: REALTIME_CONFIG.scheme === "https",
    key: REALTIME_CONFIG.appKey,
    wsHost: REALTIME_CONFIG.host,
    wsPort: REALTIME_CONFIG.port,
    wssPort: REALTIME_CONFIG.port,
  });

  return activeEcho;
}

export function disconnectRealtimeEcho() {
  activeEcho?.disconnect();
  activeEcho = null;
  activeToken = null;
}
