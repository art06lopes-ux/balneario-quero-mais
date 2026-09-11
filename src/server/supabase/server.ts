import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/env";

/**
 * Cliente autenticado do painel. A sessão vive em cookies httpOnly
 * escritos pelo servidor — o token nunca fica acessível ao JavaScript do
 * navegador. A autorização real vem da RLS (`is_admin()`).
 */
export async function createAuthenticatedClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies();

  return createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Component não pode escrever cookie; o proxy já renova a
          // sessão a cada requisição, então ignorar aqui é seguro.
        }
      },
    },
  });
}
