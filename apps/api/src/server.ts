import { createApp } from "./app.js";
import { getApiEnv } from "./config/env.js";
import { createApiSupabaseClient } from "./lib/supabase.js";
import { createSupabaseRecipeRepository } from "./modules/recipes/recipes.repository.js";

const env = getApiEnv();
const supabase = createApiSupabaseClient({
  anonKey: env.supabaseAnonKey,
  url: env.supabaseUrl,
});
const app = createApp({
  auth: supabase.auth,
  recipes: createSupabaseRecipeRepository({
    supabaseAnonKey: env.supabaseAnonKey,
    supabaseUrl: env.supabaseUrl,
  }),
});

app.listen(env.port, () => {
  console.log(`Prepper API listening on port ${env.port}`);
});
