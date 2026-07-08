import { createClient, type SupabaseClientOptions } from "@supabase/supabase-js";
import WebSocket from "ws";

type SupabaseRealtimeTransport = NonNullable<
  NonNullable<SupabaseClientOptions<"public">["realtime"]>["transport"]
>;

const webSocketTransport = WebSocket as unknown as SupabaseRealtimeTransport;

export function createApiSupabaseClient(input: {
  anonKey: string;
  token?: string;
  url: string;
}) {
  return createClient(input.url, input.anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: input.token
      ? {
          headers: {
            Authorization: `Bearer ${input.token}`,
          },
        }
      : undefined,
    realtime: {
      transport: webSocketTransport,
    },
  });
}
