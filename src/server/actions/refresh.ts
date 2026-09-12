"use server";

import { assertAdmin } from "@/server/auth";
import { fail, revalidateSite, type FormState } from "@/server/actions/shared";

/**
 * Força o site a reler o banco agora. Útil quando algo foi cadastrado
 * direto no Supabase (SQL) sem passar pelo painel — o cache de 5 minutos
 * não sabe da mudança.
 */
export async function refreshSite(): Promise<FormState> {
  try {
    await assertAdmin();
    revalidateSite("/admin");
    return { error: null, success: "Site atualizado com o conteúdo atual do banco." };
  } catch (e) {
    return fail(e, "Não foi possível atualizar.");
  }
}
