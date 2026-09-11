import "server-only";

import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createAuthenticatedClient } from "@/server/supabase/server";

/**
 * Segunda camada de proteção (a que realmente conta). O proxy protege a
 * navegação, mas uma Server Action pode ser chamada diretamente — por isso
 * TODA action de mutação chama `assertAdmin()` antes de tocar em qualquer
 * coisa. E, por baixo, a RLS confere de novo.
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createAuthenticatedClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export function isAdmin(user: User | null): boolean {
  return user?.app_metadata?.role === "admin";
}

/** Para Server Components do painel: redireciona quando não há admin. */
export async function requireAdmin(): Promise<User> {
  const user = await getCurrentUser();
  if (user === null) redirect("/admin/login");
  if (!isAdmin(user)) redirect("/admin/sem-acesso");
  return user;
}

/** Para Server Actions: lança em vez de redirecionar. */
export async function assertAdmin(): Promise<User> {
  const user = await getCurrentUser();
  if (user === null) throw new Error("Sessão expirada. Entre novamente para continuar.");
  if (!isAdmin(user)) throw new Error("Acesso restrito ao administrador.");
  return user;
}
