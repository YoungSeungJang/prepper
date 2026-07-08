import "dotenv/config";

type ApiEnv = {
  port: number;
  supabaseUrl: string;
  supabaseAnonKey: string;
};

function readRequiredEnv(name: string, fallbackName?: string) {
  const value = process.env[name] ?? (fallbackName ? process.env[fallbackName] : undefined);
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getApiEnv(): ApiEnv {
  return {
    port: Number(process.env.PORT ?? 4000),
    supabaseUrl: readRequiredEnv("SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL"),
    supabaseAnonKey: readRequiredEnv("SUPABASE_ANON_KEY", "NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  };
}
