/** Tipos do conteúdo público, já com URLs resolvidas (prontos para renderizar). */

export type SiteSettings = {
  whatsappNumber: string;
  ticketPrice: number;
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
