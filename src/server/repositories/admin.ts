import "server-only";

import { getSupabaseUrl } from "@/lib/env";
import { imageUrl } from "@/lib/storage";
import { createAuthenticatedClient } from "@/server/supabase/server";
import type { CategoryRow, FeatureRow, FoodRow, PhotoRow, SettingsRow } from "@/server/repositories/content";
import { num } from "@/server/repositories/content";

/** Leituras do painel: usam a sessão do admin e enxergam itens ocultos. */

export async function getSettingsRow(): Promise<SettingsRow> {
  const supabase = await createAuthenticatedClient();
  const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle<SettingsRow>();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("A tabela site_settings está vazia. Rode supabase/seed.sql.");
  return data;
}

export async function getFeaturesForAdmin() {
  const supabase = await createAuthenticatedClient();
  const base = getSupabaseUrl();
  const { data, error } = await supabase.from("features").select("*").order("sort_order");
  if (error) throw new Error(error.message);
  return ((data ?? []) as FeatureRow[]).map((f) => ({
    id: f.id,
    title: f.title,
    description: f.description,
    image: imageUrl(f.image_path, base),
    is_active: f.is_active,
  }));
}

export async function getFoodForAdmin() {
  const supabase = await createAuthenticatedClient();
  const base = getSupabaseUrl();
  const { data, error } = await supabase.from("food_items").select("*").order("sort_order");
  if (error) throw new Error(error.message);
  return ((data ?? []) as FoodRow[]).map((f) => ({
    id: f.id,
    name: f.name,
    description: f.description,
    price: num(f.price),
    image: imageUrl(f.image_path, base),
    show_in_gallery: f.show_in_gallery,
    is_active: f.is_active,
  }));
}

export async function getGalleryForAdmin() {
  const supabase = await createAuthenticatedClient();
  const base = getSupabaseUrl();
  const [cats, photos] = await Promise.all([
    supabase.from("gallery_categories").select("*").order("sort_order"),
    supabase.from("gallery_photos").select("*").order("sort_order"),
  ]);
  if (cats.error) throw new Error(cats.error.message);
  if (photos.error) throw new Error(photos.error.message);
  return {
    categories: ((cats.data ?? []) as CategoryRow[]).map((c) => ({ id: c.id, name: c.name, slug: c.slug })),
    photos: ((photos.data ?? []) as PhotoRow[]).map((p) => ({
      id: p.id,
      category_id: p.category_id,
      src: imageUrl(p.image_path, base) ?? "",
      alt: p.alt,
    })),
  };
}
