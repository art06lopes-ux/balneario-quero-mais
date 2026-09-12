"use server";

import { z } from "zod";
import { assertAdmin } from "@/server/auth";
import { createAuthenticatedClient } from "@/server/supabase/server";
import { fileFrom, removeStoredFile, uploadImage, type UploadFolder } from "@/server/upload";
import { fail, revalidateSite, str, type FormState } from "@/server/actions/shared";

type ImageField = {
  field: string; // nome do input file
  column: string; // coluna no banco
  folder: UploadFolder;
  removeField: string; // checkbox "remover imagem atual"
};

/**
 * Processa os campos de imagem de um formulário: envia o arquivo novo (se
 * houver), apaga o antigo do Storage e devolve as colunas a atualizar.
 */
async function handleImages(
  supabase: Awaited<ReturnType<typeof createAuthenticatedClient>>,
  formData: FormData,
  fields: ImageField[],
): Promise<{ ok: true; patch: Record<string, string | null> } | { ok: false; error: string }> {
  const { data: current } = await supabase
    .from("site_settings")
    .select(fields.map((f) => f.column).join(","))
    .eq("id", 1)
    .maybeSingle<Record<string, string | null>>();

  const patch: Record<string, string | null> = {};
  const toRemove: string[] = [];

  for (const f of fields) {
    const file = fileFrom(formData, f.field);
    const old = current?.[f.column] ?? null;

    if (file) {
      const up = await uploadImage(supabase, f.folder, file);
      if (!up.ok) return { ok: false, error: up.error };
      patch[f.column] = up.path;
      if (old) toRemove.push(old);
    } else if (formData.get(f.removeField) === "on") {
      patch[f.column] = null;
      if (old) toRemove.push(old);
    }
  }

  // Só apaga os antigos depois que tudo deu certo.
  for (const p of toRemove) await removeStoredFile(supabase, p);
  return { ok: true, patch };
}

const generalSchema = z.object({
  hero_kicker: z.string().max(120),
  hero_title: z.string().min(1, "O título do Hero é obrigatório.").max(80),
  hero_subtitle: z.string().max(300),
  about_title: z.string().max(120),
  about_text: z.string().max(3000),
  cta_title: z.string().max(120),
  cta_text: z.string().max(300),
  instagram_url: z.string().max(200),
});

export async function updateGeneral(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    await assertAdmin();
    const parsed = generalSchema.safeParse({
      hero_kicker: str(formData, "hero_kicker"),
      hero_title: str(formData, "hero_title"),
      hero_subtitle: str(formData, "hero_subtitle"),
      about_title: str(formData, "about_title"),
      about_text: str(formData, "about_text"),
      cta_title: str(formData, "cta_title"),
      cta_text: str(formData, "cta_text"),
      instagram_url: str(formData, "instagram_url"),
    });
    if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos.", success: null };

    const supabase = await createAuthenticatedClient();
    const images = await handleImages(supabase, formData, [
      { field: "hero_image", column: "hero_image_path", folder: "hero", removeField: "remove_hero_image" },
      { field: "about_image", column: "about_image_path", folder: "about", removeField: "remove_about_image" },
      { field: "about_image_secondary", column: "about_image_secondary_path", folder: "about", removeField: "remove_about_image_secondary" },
      { field: "cta_image", column: "cta_image_path", folder: "cta", removeField: "remove_cta_image" },
      { field: "logo", column: "logo_path", folder: "logo", removeField: "remove_logo" },
    ]);
    if (!images.ok) return { error: images.error, success: null };

    const { error } = await supabase
      .from("site_settings")
      .update({ ...parsed.data, ...images.patch })
      .eq("id", 1);
    if (error) throw new Error(error.message);

    revalidateSite("/admin");
    return { error: null, success: "Conteúdo salvo. O site já reflete a alteração." };
  } catch (e) {
    return fail(e, "Não foi possível salvar.");
  }
}

const commerceSchema = z.object({
  whatsapp_number: z
    .string()
    .regex(/^[0-9]{10,15}$/, "Informe o WhatsApp com DDI e DDD, só números (ex.: 5592999999999)."),
  ticket_price: z.number().min(0, "O preço não pode ser negativo.").max(100000),
  charge_mode: z.enum(["always", "sundays_holidays"]),
  extra_holidays: z.string().max(2000),
  pricing_note: z.string().max(160),
});

export async function updateCommerce(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    await assertAdmin();
    const priceRaw = str(formData, "ticket_price").replace(/\./g, "").replace(",", ".");
    const parsed = commerceSchema.safeParse({
      whatsapp_number: str(formData, "whatsapp_number").replace(/\D/g, ""),
      ticket_price: Number(priceRaw),
      charge_mode: str(formData, "charge_mode") === "sundays_holidays" ? "sundays_holidays" : "always",
      extra_holidays: str(formData, "extra_holidays"),
      pricing_note: str(formData, "pricing_note"),
    });
    if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos.", success: null };

    const supabase = await createAuthenticatedClient();
    const { error } = await supabase.from("site_settings").update(parsed.data).eq("id", 1);
    if (error) throw new Error(error.message);

    revalidateSite("/admin/whatsapp-preco");
    return { error: null, success: "WhatsApp e preço atualizados em todo o site." };
  } catch (e) {
    return fail(e, "Não foi possível salvar.");
  }
}

const locationSchema = z.object({
  address: z.string().min(1, "Informe o endereço.").max(200),
  hours: z.string().max(200),
  location_notes: z.string().max(1000),
  maps_query: z.string().max(200),
});

export async function updateLocation(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    await assertAdmin();
    const parsed = locationSchema.safeParse({
      address: str(formData, "address"),
      hours: str(formData, "hours"),
      location_notes: str(formData, "location_notes"),
      maps_query: str(formData, "maps_query"),
    });
    if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos.", success: null };

    const supabase = await createAuthenticatedClient();
    const { error } = await supabase.from("site_settings").update(parsed.data).eq("id", 1);
    if (error) throw new Error(error.message);

    revalidateSite("/admin/localizacao");
    return { error: null, success: "Localização e funcionamento atualizados." };
  } catch (e) {
    return fail(e, "Não foi possível salvar.");
  }
}
