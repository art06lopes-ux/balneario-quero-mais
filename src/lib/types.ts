/** Tipos do conteúdo público, já com URLs resolvidas (prontos para renderizar). */
import type { ChargeMode } from "@/lib/pricing";


export type SiteSettings = {
  whatsappNumber: string;
  ticketPrice: number;
  chargeMode: ChargeMode;
  extraHolidays: string;
  pricingNote: string;
  heroKicker: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string | null;
  aboutTitle: string;
  aboutText: string;
  aboutImage: string | null;
  aboutImageSecondary: string | null;
  ctaTitle: string;
  ctaText: string;
  ctaImage: string | null;
  address: string;
  hours: string;
  locationNotes: string;
  mapsQuery: string;
  logo: string | null;
  instagramUrl: string;
  googleRating: number | null;
  googleRatingCount: number | null;
  googleReviewsUrl: string;
  instagramFollowers: string;
  petsAllowed: boolean;
  outsideFoodAllowed: boolean;
  houseRules: string;
  liveMusic: string;
};

export type Feature = {
  id: string;
  title: string;
  description: string;
  image: string | null;
};

export type GalleryPhoto = {
  id: string;
  src: string;
  alt: string;
  categorySlug: string;
};

export type GalleryCategory = {
  id: string;
  name: string;
  slug: string;
  photos: GalleryPhoto[];
};

export type FoodItem = {
  id: string;
  name: string;
  description: string;
  price: number | null;
  image: string | null;
};

export type SiteContent = {
  settings: SiteSettings;
  features: Feature[];
  gallery: GalleryCategory[];
  foods: FoodItem[];
};

export const BUSINESS_NAME = "Balneário Quero Mais";
