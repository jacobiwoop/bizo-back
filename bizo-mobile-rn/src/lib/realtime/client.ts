import EchoModule from "laravel-echo";
import PusherModule from "pusher-js/react-native";

import { REALTIME_CONFIG } from "@/src/config/env";

type EchoConstructor = new (options: Record<string, unknown>) => EchoModule<"reverb">;
type RealtimeEcho = EchoModule<"reverb">;

function resolveConstructor<T>(moduleValue: unknown): T | null {
  const firstDefault = (moduleValue as { default?: unknown })?.default;
  const secondDefault = (firstDefault as { default?: unknown })?.default;
  const candidates = [moduleValue, firstDefault, secondDefault];
  const constructor = candidates.find((candidate) => typeof candidate === "function");

  return constructor ? (constructor as T) : null;
}

let activeEcho: RealtimeEcho | null = null;
let activeToken: string | null = null;

export function logRealtime(message: string, data?: unknown) {
  if (!__DEV__) {
    return;
  }

  if (data === undefined) {
    console.log(`[Realtime] ${message}`);
    return;
  }

  console.log(`[Realtime] ${message}`, data);
}

export function getRealtimeEcho(token: string | null): RealtimeEcho | null {
  if (!REALTIME_CONFIG.enabled || !REALTIME_CONFIG.appKey || !token) {
    logRealtime("disabled or missing token/key");
    return null;
  }

  if (activeEcho && activeToken === token) {
    logRealtime("reusing active Echo connection");
    return activeEcho;
  }

  activeEcho?.disconnect();
  activeToken = token;

  const EchoClient = resolveConstructor<EchoConstructor>(EchoModule);
  const PusherClient = resolveConstructor<unknown>(PusherModule);

  if (!EchoClient || !PusherClient) {
    logRealtime("Echo or Pusher constructor unavailable", {
      echoModuleType: typeof EchoModule,
      hasEchoConstructor: Boolean(EchoClient),
      hasPusherConstructor: Boolean(PusherClient),
      pusherModuleType: typeof PusherModule,
    });
    return null;
  }

  logRealtime("creating Echo connection", {
    host: REALTIME_CONFIG.host,
    port: REALTIME_CONFIG.port,
    scheme: REALTIME_CONFIG.scheme,
  });

  activeEcho = new EchoClient({
    Pusher: PusherClient,
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
  logRealtime("disconnecting Echo connection");
  activeEcho?.disconnect();
  activeEcho = null;
  activeToken = null;
}
