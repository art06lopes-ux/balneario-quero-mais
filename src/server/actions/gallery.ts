"use server";

import { z } from "zod";
import { assertAdmin } from "@/server/auth";
import { FOOD_CATEGORY_SLUG } from "@/server/repositories/content";
import { createAuthenticatedClient } from "@/server/supabase/server";
import { removeStoredFile, uploadImage } from "@/server/upload";
import { fail, revalidateSite, str, type FormState } from "@/server/actions/shared";

const ADMIN_PATH = "/admin/galeria";

function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/* ---------- Categorias ---------- */

export async function saveCategory(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    await assertAdmin();
    const id = str(formData, "id") || null;
    const name = z.string().min(1, "Informe o nome da categoria.").max(40).safeParse(str(formData, "name"));
    if (!name.success) return { error: name.error.issues[0]?.message ?? "Nome inválido.", success: null };

    const supabase = await createAuthenticatedClient();
    if (id) {
      const { error } = await supabase.from("gallery_categories").update({ name: name.data }).eq("id", id);
      if (error) throw new Error(error.message);
    } else {
      const slug = slugify(name.data) || `categoria-${Date.now()}`;
      const { data: last } = await supabase
        .from("gallery_categories")
        .select("sort_order")
        .order("sort_order", { ascending: false })
        .limit(1)
        .maybeSingle<{ sort_order: number }>();
      const { error } = await supabase
        .from("gallery_categories")
        .insert({ name: name.data, slug, sort_order: (last?.sort_order ?? 0) + 1 });
      if (error) {
        if (error.code === "23505") return { error: "Já existe uma categoria com esse nome.", success: null };
        throw new Error(error.message);
      }
    }
    revalidateSite(ADMIN_PATH);
    return { error: null, success: id ? "Categoria renomeada." : "Categoria criada." };
  } catch (e) {
    return fail(e, "Não foi possível salvar a categoria.");
  }
}

export async function deleteCategory(id: string): Promise<FormState> {
  try {
    await assertAdmin();
    const supabase = await createAuthenticatedClient();
    const { data: cat } = await supabase
      .from("gallery_categories")
      .select("slug")
      .eq("id", id)
      .maybeSingle<{ slug: string }>();
    if (cat?.slug === FOOD_CATEGORY_SLUG) {
      return { error: 'A categoria "Comidas" é fixa: ela recebe as fotos dos pratos automaticamente.', success: null };
    }
    const { data: photos } = await supabase
      .from("gallery_photos")
      .select("image_path")
      .eq("category_id", id);
    const { error } = await supabase.from("gallery_categories").delete().eq("id", id);
    if (error) throw new Error(error.message);
    for (const p of (photos ?? []) as { image_path: string }[]) await removeStoredFile(supabase, p.image_path);
    revalidateSite(ADMIN_PATH);
    return { error: null, success: "Categoria e suas fotos removidas." };
  } catch (e) {
    return fail(e, "Não foi possível remover a categoria.");
  }
}

export async function reorderCategories(ids: string[]): Promise<FormState> {
  try {
    await assertAdmin();
    const supabase = await createAuthenticatedClient();
    for (const [i, id] of ids.entries()) {
      const { error } = await supabase.from("gallery_categories").update({ sort_order: i + 1 }).eq("id", id);
      if (error) throw new Error(error.message);
    }
    revalidateSite(ADMIN_PATH);
    return { error: null, success: "Ordem das categorias salva." };
  } catch (e) {
    return fail(e, "Não foi possível reordenar.");
  }
}

/* ---------- Fotos ---------- */

/** Envia várias fotos de uma vez para uma categoria. */
export async function addPhotos(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    await assertAdmin();
    const categoryId = str(formData, "category_id");
    if (!categoryId) return { error: "Escolha a categoria.", success: null };
    const files = formData.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
    if (files.length === 0) return { error: "Escolha ao menos uma foto.", success: null };
    if (files.length > 20) return { error: "Envie no máximo 20 fotos por vez.", success: null };

    const supabase = await createAuthenticatedClient();
    const { data: last } = await supabase
      .from("gallery_photos")
      .select("sort_order")
      .eq("category_id", categoryId)
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle<{ sort_order: number }>();
    let order = last?.sort_order ?? 0;

    const errors: string[] = [];
    let sent = 0;
    for (const file of files) {
      const up = await uploadImage(supabase, "gallery", file);
      if (!up.ok) {
        errors.push(up.error);
        continue;
      }
      order += 1;
      const { error } = await supabase.from("gallery_photos").insert({
        category_id: categoryId,
        image_path: up.path,
        alt: file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "),
        sort_order: order,
      });
      if (error) {
        await removeStoredFile(supabase, up.path);
        errors.push(error.message);
        continue;
      }
      sent += 1;
    }

    revalidateSite(ADMIN_PATH);
    if (errors.length > 0) {
      return { error: `${sent} enviada(s); falhas: ${errors.join(" · ")}`, success: null };
    }
    return { error: null, success: `${sent} foto(s) adicionada(s).` };
  } catch (e) {
    return fail(e, "Não foi possível enviar as fotos.");
  }
}

export async function updatePhoto(id: string, patch: { alt?: string; category_id?: string }): Promise<FormState> {
  try {
    await assertAdmin();
    const supabase = await createAuthenticatedClient();
    const clean: Record<string, string> = {};
    if (patch.alt !== undefined) clean.alt = patch.alt.slice(0, 120);
    if (patch.category_id) clean.category_id = patch.category_id;
    const { error } = await supabase.from("gallery_photos").update(clean).eq("id", id);
    if (error) throw new Error(error.message);
    revalidateSite(ADMIN_PATH);
    return { error: null, success: "Foto atualizada." };
  } catch (e) {
    return fail(e, "Não foi possível atualizar a foto.");
  }
}

export async function deletePhoto(id: string): Promise<FormState> {
  try {
    await assertAdmin();
    const supabase = await createAuthenticatedClient();
    const { data } = await supabase.from("gallery_photos").select("image_path").eq("id", id).maybeSingle<{ image_path: string }>();
    const { error } = await supabase.from("gallery_photos").delete().eq("id", id);
    if (error) throw new Error(error.message);
    await removeStoredFile(supabase, data?.image_path);
    revalidateSite(ADMIN_PATH);
    return { error: null, success: "Foto removida." };
  } catch (e) {
    return fail(e, "Não foi possível remover a foto.");
  }
}

export async function reorderPhotos(ids: string[]): Promise<FormState> {
  try {
    await assertAdmin();
    const supabase = await createAuthenticatedClient();
    for (const [i, id] of ids.entries()) {
      const { error } = await supabase.from("gallery_photos").update({ sort_order: i + 1 }).eq("id", id);
      if (error) throw new Error(error.message);
    }
    revalidateSite(ADMIN_PATH);
    return { error: null, success: "Ordem das fotos salva." };
  } catch (e) {
    return fail(e, "Não foi possível reordenar.");
  }
}
