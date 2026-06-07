import PusherModule from "pusher-js/react-native";

import { REALTIME_CONFIG } from "@/src/config/env";

type RealtimeChannel = {
  bind: <TPayload = unknown>(event: string, callback: (payload: TPayload) => void) => void;
  unbind: <TPayload = unknown>(event: string, callback?: (payload: TPayload) => void) => void;
};

type RealtimeConnection = {
  bind: (event: string, callback: (payload: unknown) => void) => void;
};

type RealtimePusher = {
  connection?: RealtimeConnection;
  disconnect: () => void;
  subscribe: (channelName: string) => RealtimeChannel;
  unsubscribe: (channelName: string) => void;
};

type PusherConstructor = new (key: string, options: Record<string, unknown>) => RealtimePusher;

type RealtimeClient = {
  disconnect: () => void;
  subscribePrivate: (channelName: string) => RealtimeChannel;
  unsubscribePrivate: (channelName: string) => void;
};

function resolveConstructor<T>(moduleValue: unknown): T | null {
  const firstDefault = (moduleValue as { default?: unknown })?.default;
  const secondDefault = (firstDefault as { default?: unknown })?.default;
  const namedPusher = (moduleValue as { Pusher?: unknown })?.Pusher;
  const defaultNamedPusher = (firstDefault as { Pusher?: unknown })?.Pusher;
  const candidates = [moduleValue, firstDefault, secondDefault, namedPusher, defaultNamedPusher];
  const constructor = candidates.find((candidate) => typeof candidate === "function");

  return constructor ? (constructor as T) : null;
}

let activePusher: RealtimePusher | null = null;
let activeClient: RealtimeClient | null = null;
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

function toPrivateChannelName(channelName: string): string {
  return channelName.startsWith("private-") ? channelName : `private-${channelName}`;
}

export function getRealtimeClient(token: string | null): RealtimeClient | null {
  if (!REALTIME_CONFIG.enabled || !REALTIME_CONFIG.appKey || !token) {
    logRealtime("disabled or missing token/key");
    return null;
  }

  if (activeClient && activeToken === token) {
    logRealtime("reusing active Pusher connection");
    return activeClient;
  }

  activePusher?.disconnect();
  activeToken = token;

  const PusherClient = resolveConstructor<PusherConstructor>(PusherModule);

  if (!PusherClient) {
    logRealtime("Pusher constructor unavailable", {
      hasPusherConstructor: Boolean(PusherClient),
      pusherModuleType: typeof PusherModule,
    });
    return null;
  }

  logRealtime("creating Pusher connection", {
    host: REALTIME_CONFIG.host,
    port: REALTIME_CONFIG.port,
    scheme: REALTIME_CONFIG.scheme,
  });

  activePusher = new PusherClient(REALTIME_CONFIG.appKey, {
    channelAuthorization: {
      endpoint: REALTIME_CONFIG.authEndpoint,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      transport: "ajax",
    },
    cluster: "mt1",
    disableStats: true,
    enabledTransports: ["ws", "wss"],
    forceTLS: REALTIME_CONFIG.scheme === "https",
    wsHost: REALTIME_CONFIG.host,
    wsPort: REALTIME_CONFIG.port,
    wssPort: REALTIME_CONFIG.port,
  });

  activePusher.connection?.bind("state_change", (payload) => logRealtime("connection state changed", payload));
  activePusher.connection?.bind("error", (payload) => logRealtime("connection error", payload));

  activeClient = {
    disconnect: () => activePusher?.disconnect(),
    subscribePrivate: (channelName) => activePusher!.subscribe(toPrivateChannelName(channelName)),
    unsubscribePrivate: (channelName) => activePusher?.unsubscribe(toPrivateChannelName(channelName)),
  };

  return activeClient;
}

export function disconnectRealtimeClient() {
  logRealtime("disconnecting Pusher connection");
  activePusher?.disconnect();
  activePusher = null;
  activeClient = null;
  activeToken = null;
}
