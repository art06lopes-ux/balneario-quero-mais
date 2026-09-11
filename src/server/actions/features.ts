"use server";

import { z } from "zod";
import { assertAdmin } from "@/server/auth";
import { createAuthenticatedClient } from "@/server/supabase/server";
import { fileFrom, removeStoredFile, uploadImage } from "@/server/upload";
import { bool, fail, revalidateSite, str, type FormState } from "@/server/actions/shared";

const ADMIN_PATH = "/admin/estrutura";

const schema = z.object({
  title: z.string().min(1, "Informe o título.").max(80),
  description: z.string().max(300),
  is_active: z.boolean(),
});

export async function saveFeature(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    await assertAdmin();
    const id = str(formData, "id") || null;
    const parsed = schema.safeParse({
      title: str(formData, "title"),
      description: str(formData, "description"),
      is_active: id ? bool(formData, "is_active") : true,
    });
    if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos.", success: null };

    const supabase = await createAuthenticatedClient();
    const patch: Record<string, unknown> = { ...parsed.data };

    const file = fileFrom(formData, "image");
    let oldPath: string | null = null;
    if (file) {
      const up = await uploadImage(supabase, "features", file);
      if (!up.ok) return { error: up.error, success: null };
      patch.image_path = up.path;
    }

    if (id) {
      if (file) {
        const { data } = await supabase.from("features").select("image_path").eq("id", id).maybeSingle<{ image_path: string | null }>();
        oldPath = data?.image_path ?? null;
      }
      const { error } = await supabase.from("features").update(patch).eq("id", id);
      if (error) throw new Error(error.message);
    } else {
      const { data: last } = await supabase
        .from("features")
        .select("sort_order")
        .order("sort_order", { ascending: false })
        .limit(1)
        .maybeSingle<{ sort_order: number }>();
      patch.sort_order = (last?.sort_order ?? 0) + 1;
      const { error } = await supabase.from("features").insert(patch);
      if (error) throw new Error(error.message);
    }

    if (oldPath) await removeStoredFile(supabase, oldPath);
    revalidateSite(ADMIN_PATH);
    return { error: null, success: id ? "Item atualizado." : "Item adicionado." };
  } catch (e) {
    return fail(e, "Não foi possível salvar.");
  }
}

export async function deleteFeature(id: string): Promise<FormState> {
  try {
    await assertAdmin();
    const supabase = await createAuthenticatedClient();
    const { data } = await supabase.from("features").select("image_path").eq("id", id).maybeSingle<{ image_path: string | null }>();
    const { error } = await supabase.from("features").delete().eq("id", id);
    if (error) throw new Error(error.message);
    await removeStoredFile(supabase, data?.image_path);
    revalidateSite(ADMIN_PATH);
    return { error: null, success: "Item removido." };
  } catch (e) {
    return fail(e, "Não foi possível remover.");
  }
}

export async function reorderFeatures(ids: string[]): Promise<FormState> {
  try {
    await assertAdmin();
    const supabase = await createAuthenticatedClient();
    for (const [i, id] of ids.entries()) {
      const { error } = await supabase.from("features").update({ sort_order: i + 1 }).eq("id", id);
      if (error) throw new Error(error.message);
    }
    revalidateSite(ADMIN_PATH);
    return { error: null, success: "Ordem salva." };
  } catch (e) {
    return fail(e, "Não foi possível reordenar.");
  }
}
