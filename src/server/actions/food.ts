"use server";

import { z } from "zod";
import { assertAdmin } from "@/server/auth";
import { createAuthenticatedClient } from "@/server/supabase/server";
import { fileFrom, removeStoredFile, uploadImage } from "@/server/upload";
import { bool, fail, revalidateSite, str, type FormState } from "@/server/actions/shared";

const ADMIN_PATH = "/admin/comidas";

const schema = z.object({
  name: z.string().min(1, "Informe o nome do prato.").max(80),
  description: z.string().max(400),
  price: z.number().min(0).max(100000).nullable(),
  show_in_gallery: z.boolean(),
  is_active: z.boolean(),
});

function parsePrice(raw: string): number | null {
  if (raw.trim() === "") return null;
  const n = Number(raw.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : NaN;
}

export async function saveFood(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    await assertAdmin();
    const id = str(formData, "id") || null;
    const price = parsePrice(str(formData, "price"));
    if (Number.isNaN(price)) return { error: "Preço inválido. Use só números, ex.: 45,00.", success: null };

    const parsed = schema.safeParse({
      name: str(formData, "name"),
      description: str(formData, "description"),
      price,
      show_in_gallery: bool(formData, "show_in_gallery"),
      is_active: id ? bool(formData, "is_active") : true,
    });
    if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos.", success: null };

    const supabase = await createAuthenticatedClient();
    const patch: Record<string, unknown> = { ...parsed.data };

    const file = fileFrom(formData, "image");
    let oldPath: string | null = null;
    if (file) {
      const up = await uploadImage(supabase, "food", file);
      if (!up.ok) return { error: up.error, success: null };
      patch.image_path = up.path;
    } else if (!id) {
      return { error: "Escolha uma foto do prato.", success: null };
    }

    if (id) {
      if (file) {
        const { data } = await supabase.from("food_items").select("image_path").eq("id", id).maybeSingle<{ image_path: string | null }>();
        oldPath = data?.image_path ?? null;
      }
      const { error } = await supabase.from("food_items").update(patch).eq("id", id);
      if (error) throw new Error(error.message);
    } else {
      const { data: last } = await supabase
        .from("food_items")
        .select("sort_order")
        .order("sort_order", { ascending: false })
        .limit(1)
        .maybeSingle<{ sort_order: number }>();
      patch.sort_order = (last?.sort_order ?? 0) + 1;
      const { error } = await supabase.from("food_items").insert(patch);
      if (error) throw new Error(error.message);
    }

    if (oldPath) await removeStoredFile(supabase, oldPath);
    revalidateSite(ADMIN_PATH);
    return { error: null, success: id ? "Prato atualizado." : "Prato adicionado." };
  } catch (e) {
    return fail(e, "Não foi possível salvar.");
  }
}

export async function deleteFood(id: string): Promise<FormState> {
  try {
    await assertAdmin();
    const supabase = await createAuthenticatedClient();
    const { data } = await supabase.from("food_items").select("image_path").eq("id", id).maybeSingle<{ image_path: string | null }>();
    const { error } = await supabase.from("food_items").delete().eq("id", id);
    if (error) throw new Error(error.message);
    await removeStoredFile(supabase, data?.image_path);
    revalidateSite(ADMIN_PATH);
    return { error: null, success: "Prato removido." };
  } catch (e) {
    return fail(e, "Não foi possível remover.");
  }
}

export async function reorderFood(ids: string[]): Promise<FormState> {
  try {
    await assertAdmin();
    const supabase = await createAuthenticatedClient();
    for (const [i, id] of ids.entries()) {
      const { error } = await supabase.from("food_items").update({ sort_order: i + 1 }).eq("id", id);
      if (error) throw new Error(error.message);
    }
    revalidateSite(ADMIN_PATH);
    return { error: null, success: "Ordem salva." };
  } catch (e) {
    return fail(e, "Não foi possível reordenar.");
  }
}
