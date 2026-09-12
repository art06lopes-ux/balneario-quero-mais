import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";
import { getSupabaseUrl } from "@/lib/env";
import { imageUrl } from "@/lib/storage";
import type { Feature, FoodItem, GalleryCategory, SiteContent, SiteSettings } from "@/lib/types";
import { getPublicSupabaseClient } from "@/server/supabase/client";

/** Linhas cruas do banco (snake_case), usadas também pelo painel. */
export type SettingsRow = {
  whatsapp_number: string;
  ticket_price: number | string;
  charge_mode: "always" | "sundays_holidays";
  extra_holidays: string;
  pricing_note: string;
  hero_kicker: string;
  hero_title: string;
  hero_subtitle: string;
  hero_image_path: string | null;
  about_title: string;
  about_text: string;
  about_image_path: string | null;
  about_image_secondary_path: string | null;
  cta_title: string;
  cta_text: string;
  cta_image_path: string | null;
  address: string;
  hours: string;
  location_notes: string;
  maps_query: string;
  logo_path: string | null;
  instagram_url: string;
  google_rating: number | string | null;
  google_rating_count: number | null;
  google_reviews_url: string;
  instagram_followers: string;
  pets_allowed?: boolean;
  outside_food_allowed?: boolean;
  house_rules?: string;
  live_music?: string;
  updated_at?: string;
};

export type FeatureRow = {
  id: string;
  title: string;
  description: string;
  image_path: string | null;
  sort_order: number;
  is_active: boolean;
};

export type CategoryRow = { id: string; name: string; slug: string; sort_order: number };

export type PhotoRow = {
  id: string;
  category_id: string;
  image_path: string;
  alt: string;
  sort_order: number;
  is_active: boolean;
};

export type FoodRow = {
  id: string;
  name: string;
  description: string;
  price: number | string | null;
  image_path: string | null;
  show_in_gallery: boolean;
  sort_order: number;
  is_active: boolean;
};

export const FOOD_CATEGORY_SLUG = "comidas";

export function num(v: number | string | null | undefined): number | null {
  if (v === null || v === undefined) return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

export function mapSettings(row: SettingsRow, base: string): SiteSettings {
  return {
    whatsappNumber: row.whatsapp_number,
    ticketPrice: num(row.ticket_price) ?? 0,
    chargeMode: row.charge_mode ?? "always",
    extraHolidays: row.extra_holidays ?? "",
    pricingNote: row.pricing_note ?? "",
    heroKicker: row.hero_kicker,
    heroTitle: row.hero_title,
    heroSubtitle: row.hero_subtitle,
    heroImage: imageUrl(row.hero_image_path, base),
    aboutTitle: row.about_title,
    aboutText: row.about_text,
    aboutImage: imageUrl(row.about_image_path, base),
    aboutImageSecondary: imageUrl(row.about_image_secondary_path, base),
    ctaTitle: row.cta_title,
    ctaText: row.cta_text,
    ctaImage: imageUrl(row.cta_image_path, base),
    address: row.address,
    hours: row.hours,
    locationNotes: row.location_notes,
    mapsQuery: row.maps_query,
    logo: imageUrl(row.logo_path, base),
    instagramUrl: row.instagram_url,
    googleRating: num(row.google_rating),
    googleRatingCount: row.google_rating_count ?? null,
    googleReviewsUrl: row.google_reviews_url ?? "",
    instagramFollowers: row.instagram_followers ?? "",
    petsAllowed: row.pets_allowed ?? true,
    outsideFoodAllowed: row.outside_food_allowed ?? false,
    houseRules: row.house_rules ?? "",
    liveMusic: row.live_music ?? "Som ao vivo aos domingos e feriados",
  };
}

export const SITE_CACHE_TAG = "site";

/**
 * Conteúdo do site guardado no cache de dados (Vercel Data Cache).
 *
 * A home é renderizada sob demanda, mas o banco só é consultado quando o
 * cache expira (5 min) ou quando o painel salva algo e invalida a tag —
 * assim o deploy não depende do Supabase responder durante o build, e o
 * visitante recebe a página em milissegundos.
 */
export const getCachedSiteContent = unstable_cache(() => getSiteContent(), ["site-content"], {
  tags: [SITE_CACHE_TAG],
  revalidate: 300,
});

/**
 * Conteúdo completo do site público, com URLs resolvidas.
 *
 * Com tentativas: o build da Vercel prerrenderiza a home e um projeto
 * Supabase "frio" às vezes responde Gateway Timeout na primeira chamada.
 * Sem isso, um soluço de 2 segundos derruba o deploy inteiro.
 */
export async function getSiteContent(client?: SupabaseClient): Promise<SiteContent> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      return await loadSiteContent(client);
    } catch (e) {
      lastError = e;
      if (attempt < 3) await new Promise((r) => setTimeout(r, attempt * 2500));
    }
  }
  throw lastError;
}

async function loadSiteContent(client?: SupabaseClient): Promise<SiteContent> {
  const supabase = client ?? getPublicSupabaseClient();
  const base = getSupabaseUrl();

  const [settingsRes, featuresRes, categoriesRes, photosRes, foodsRes] = await Promise.all([
    supabase.from("site_settings").select("*").eq("id", 1).maybeSingle<SettingsRow>(),
    supabase.from("features").select("*").eq("is_active", true).order("sort_order"),
    supabase.from("gallery_categories").select("*").order("sort_order"),
    supabase.from("gallery_photos").select("*").eq("is_active", true).order("sort_order"),
    supabase.from("food_items").select("*").eq("is_active", true).order("sort_order"),
  ]);

  const firstError =
    settingsRes.error ??
    featuresRes.error ??
    categoriesRes.error ??
    photosRes.error ??
    foodsRes.error;
  if (firstError) throw new Error(`Falha ao carregar conteúdo do site: ${firstError.message}`);
  if (!settingsRes.data) {
    throw new Error("A tabela site_settings está vazia. Rode supabase/seed.sql (ver README.md).");
  }

  const settings = mapSettings(settingsRes.data, base);

  const features: Feature[] = ((featuresRes.data ?? []) as FeatureRow[]).map((f) => ({
    id: f.id,
    title: f.title,
    description: f.description,
    image: imageUrl(f.image_path, base),
  }));

  const foodRows = (foodsRes.data ?? []) as FoodRow[];
  const foods: FoodItem[] = foodRows.map((f) => ({
    id: f.id,
    name: f.name,
    description: f.description,
    price: num(f.price),
    image: imageUrl(f.image_path, base),
  }));

  const photos = (photosRes.data ?? []) as PhotoRow[];

  const gallery: GalleryCategory[] = ((categoriesRes.data ?? []) as CategoryRow[])
    .map((c) => {
      const own = photos
        .filter((p) => p.category_id === c.id)
        .map((p) => ({
          id: p.id,
          src: imageUrl(p.image_path, base) ?? "",
          alt: p.alt,
          categorySlug: c.slug,
        }));

      // A categoria "comidas" recebe também as fotos dos pratos.
      const fromFood =
        c.slug === FOOD_CATEGORY_SLUG
          ? foodRows
              .filter((f) => f.show_in_gallery && f.image_path)
              .map((f) => ({
                id: `food-${f.id}`,
                src: imageUrl(f.image_path, base) ?? "",
                alt: f.name,
                categorySlug: c.slug,
              }))
          : [];

      return { id: c.id, name: c.name, slug: c.slug, photos: [...own, ...fromFood] };
    })
    .filter((c) => c.photos.length > 0);

  return { settings, features, gallery, foods };
}
