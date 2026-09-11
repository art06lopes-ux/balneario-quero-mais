import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/env";

/**
 * Cliente de leitura pública (sem sessão). Enxerga só o que a RLS libera
 * ao papel `anon`. A service_role não aparece em lugar nenhum do app.
 */
let cached: SupabaseClient | null = null;

export function getPublicSupabaseClient(): SupabaseClient {
  if (cached !== null) return cached;
  cached = createClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
