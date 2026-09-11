-- =====================================================================
-- 0001 — Esquema do Balneário Quero Mais
--
-- Tudo que o site público exibe vive aqui e é editável pelo painel.
-- Caminhos de imagem são relativos ao bucket "site" do Storage
-- (ex.: "hero/abc.jpg"). Um caminho começando com "/" aponta para
-- public/ do próprio app (acervo inicial), nunca para o Storage.
-- =====================================================================

create extension if not exists pgcrypto;

-- Configurações gerais: uma única linha (id = 1).
create table public.site_settings (
  id                     int primary key default 1 check (id = 1),
  -- Só dígitos, com DDI: 5592991901596
  whatsapp_number        text not null check (whatsapp_number ~ '^[0-9]{10,15}$'),
  ticket_price           numeric(10,2) not null default 20 check (ticket_price >= 0),

  hero_kicker            text not null default '',
  hero_title             text not null default '',
  hero_subtitle          text not null default '',
  hero_image_path        text,

  about_title            text not null default '',
  about_text             text not null default '',
  about_image_path       text,
  about_image_secondary_path text,

  cta_title              text not null default '',
  cta_text               text not null default '',
  cta_image_path         text,

  address                text not null default '',
  hours                  text not null default '',
  location_notes         text not null default '',
  maps_query             text not null default '',

  logo_path              text,
  instagram_url          text not null default '',

  updated_at             timestamptz not null default now()
);

-- Cards da seção "Estrutura".
create table public.features (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text not null default '',
  image_path  text,
  sort_order  int not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- Categorias da galeria. O slug "comidas" é reservado: além das fotos
-- próprias, recebe automaticamente os itens da seção de comidas.
create table public.gallery_categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text not null unique check (slug ~ '^[a-z0-9-]+$'),
  sort_order int not null default 0
);

create table public.gallery_photos (
  id          uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.gallery_categories(id) on delete cascade,
  image_path  text not null,
  alt         text not null default '',
  sort_order  int not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);
create index gallery_photos_category_idx on public.gallery_photos(category_id, sort_order);

create table public.food_items (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  description     text not null default '',
  price           numeric(10,2) check (price is null or price >= 0),
  image_path      text,
  show_in_gallery boolean not null default true,
  sort_order      int not null default 0,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now()
);

-- updated_at automático na configuração.
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger site_settings_touch
  before update on public.site_settings
  for each row execute function public.touch_updated_at();
