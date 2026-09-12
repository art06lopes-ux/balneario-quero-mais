import "server-only";

import { revalidatePath, revalidateTag } from "next/cache";
import { SITE_CACHE_TAG } from "@/server/repositories/content";

export type FormState = { error: string | null; success: string | null };

export const IDLE: FormState = { error: null, success: null };

/**
 * O site público é estático com revalidação; depois de qualquer mudança
 * no painel, esta chamada faz a home ser gerada de novo na próxima visita —
 * sem redeploy, sem esperar o intervalo.
 */
export function revalidateSite(adminPath?: string): void {
  // Some o cache de dados na hora (expire: 0) e a página em seguida.
  revalidateTag(SITE_CACHE_TAG, { expire: 0 });
  revalidatePath("/");
  if (adminPath) revalidatePath(adminPath);
}

export function str(formData: FormData, field: string): string {
  const v = formData.get(field);
  return typeof v === "string" ? v.trim() : "";
}

export function bool(formData: FormData, field: string): boolean {
  return formData.get(field) === "on" || formData.get(field) === "true";
}

/** Erro amigável para o formulário; nunca vaza stack para o navegador. */
export function fail(e: unknown, fallback: string): FormState {
  const msg = e instanceof Error ? e.message : fallback;
  console.error("[admin]", e);
  return { error: msg, success: null };
}
