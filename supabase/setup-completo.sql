-- ==============================================================
-- SETUP COMPLETO — cole tudo no SQL Editor do Supabase e execute.
-- Equivale a rodar migrations/0001..0003 + seed.sql, nesta ordem.
-- Idempotente no seed; as tabelas só podem ser criadas uma vez.
-- ==============================================================

-- >>> supabase/migrations/0001_schema.sql
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

-- >>> supabase/migrations/0002_rls.sql
-- =====================================================================
-- 0002 — Row Level Security
--
--   anon          -> lê o que é público (linhas ativas); nunca escreve.
--   administrador -> escreve tudo. "Administrador" é explícito:
--                    app_metadata.role = 'admin', que só a service_role
--                    grava. Uma sessão qualquer NÃO basta para escrever.
-- =====================================================================

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (
      select (u.raw_app_meta_data ->> 'role') = 'admin'
      from auth.users u
      where u.id = auth.uid()
    ),
    false
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

alter table public.site_settings      enable row level security;
alter table public.features           enable row level security;
alter table public.gallery_categories enable row level security;
alter table public.gallery_photos     enable row level security;
alter table public.food_items         enable row level security;

-- site_settings ------------------------------------------------------
create policy "site_settings: leitura publica"
  on public.site_settings for select to anon, authenticated using (true);
create policy "site_settings: escrita admin"
  on public.site_settings for insert to authenticated with check (public.is_admin());
create policy "site_settings: atualizacao admin"
  on public.site_settings for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
-- sem DELETE: a linha única nunca é removida.

-- features -----------------------------------------------------------
create policy "features: leitura publica de ativos"
  on public.features for select to anon using (is_active);
create policy "features: leitura admin"
  on public.features for select to authenticated using (public.is_admin());
create policy "features: escrita admin"
  on public.features for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- gallery_categories -------------------------------------------------
create policy "gallery_categories: leitura publica"
  on public.gallery_categories for select to anon, authenticated using (true);
create policy "gallery_categories: escrita admin"
  on public.gallery_categories for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- gallery_photos -----------------------------------------------------
create policy "gallery_photos: leitura publica de ativas"
  on public.gallery_photos for select to anon using (is_active);
create policy "gallery_photos: leitura admin"
  on public.gallery_photos for select to authenticated using (public.is_admin());
create policy "gallery_photos: escrita admin"
  on public.gallery_photos for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- food_items ---------------------------------------------------------
create policy "food_items: leitura publica de ativos"
  on public.food_items for select to anon using (is_active);
create policy "food_items: leitura admin"
  on public.food_items for select to authenticated using (public.is_admin());
create policy "food_items: escrita admin"
  on public.food_items for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- >>> supabase/migrations/0003_storage.sql
-- =====================================================================
-- 0003 — Bucket "site": leitura pública, escrita só de administrador.
-- Limite de 5 MB por arquivo e apenas tipos de imagem.
-- =====================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site', 'site', true, 5242880, array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "site: leitura publica" on storage.objects;
drop policy if exists "site: envio admin" on storage.objects;
drop policy if exists "site: atualizacao admin" on storage.objects;
drop policy if exists "site: remocao admin" on storage.objects;

create policy "site: leitura publica"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'site');

create policy "site: envio admin"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'site' and public.is_admin());

create policy "site: atualizacao admin"
  on storage.objects for update to authenticated
  using (bucket_id = 'site' and public.is_admin())
  with check (bucket_id = 'site' and public.is_admin());

create policy "site: remocao admin"
  on storage.objects for delete to authenticated
  using (bucket_id = 'site' and public.is_admin());

-- >>> supabase/seed.sql
-- =====================================================================
-- Seed — conteúdo aprovado na prévia (fase 1).
-- Idempotente. Imagens iniciais apontam para public/seed/ do app
-- (caminho começando com "/"); o painel permite trocar cada uma.
-- =====================================================================

insert into public.site_settings (
  id, whatsapp_number, ticket_price,
  hero_kicker, hero_title, hero_subtitle, hero_image_path,
  about_title, about_text, about_image_path, about_image_secondary_path,
  cta_title, cta_text, cta_image_path,
  address, hours, location_notes, maps_query, logo_path, instagram_url
) values (
  1, '5592991901596', 20,
  'Km 19 · Estrada de Novo Airão · Amazonas',
  'Balneário Quero Mais',
  'Um dia inteiro de lazer dentro da floresta: igarapé de água escura, rede dentro d''água e peixe na brasa. Vem viver isso.',
  '/seed/igarape-sol.jpg',
  'Um pedaço da Amazônia feito para descansar',
  'O Balneário Quero Mais é um balneário natural às margens de um igarapé de água escura, típica da Amazônia, cercado por mata. O deck azul e branco acompanha a beira da água, com areia, mesas sob guarda-sóis e redes armadas dentro do próprio igarapé.

O bar e restaurante serve culinária regional — o peixe grelhado é o destaque da casa. Fica no Km 19 da estrada de Novo Airão e abre todos os dias, de segunda a segunda.',
  '/seed/peixe-grelhado.jpg', '/seed/deck-ponte.jpg',
  'Seu próximo dia de lazer começa aqui.',
  'Km 19 da estrada de Novo Airão. Aberto todos os dias.',
  '/seed/mesas-deck.jpg',
  'Km 19, estrada de Novo Airão — Amazonas',
  'Aberto todos os dias, de segunda a segunda',
  '',
  'Balneário Quero Mais Novo Airão Amazonas',
  '/seed/logo.jpg',
  'https://www.instagram.com/queromais_balneario'
)
on conflict (id) do nothing;

insert into public.features (title, description, image_path, sort_order)
select * from (values
  ('Igarapé de água escura', 'Banho em água natural, corrente e fresca, contornada pelo deck azul.', '/seed/igarape-sol.jpg', 1),
  ('Redário dentro d''água', 'Redes armadas sobre o igarapé para ficar de molho sem pressa.', '/seed/redario.jpg', 2),
  ('Mesas com guarda-sóis', 'Área de areia à beira da água, com sombra e mesas para a família.', '/seed/guarda-sois.jpg', 3),
  ('Bar & restaurante', 'Culinária regional com peixe grelhado como destaque da casa.', '/seed/peixe-grelhado.jpg', 4)
) as v(title, description, image_path, sort_order)
where not exists (select 1 from public.features);

insert into public.gallery_categories (name, slug, sort_order) values
  ('Igarapé', 'igarape', 1),
  ('Estrutura', 'estrutura', 2),
  ('Ambiente', 'ambiente', 3),
  ('Comidas', 'comidas', 4)
on conflict (slug) do nothing;

insert into public.gallery_photos (category_id, image_path, alt, sort_order)
select c.id, v.image_path, v.alt, v.sort_order
from (values
  ('igarape',   '/seed/igarape-sol.jpg',  'Igarapé em dia de sol', 1),
  ('igarape',   '/seed/redario.jpg',      'Redário dentro d''água', 2),
  ('igarape',   '/seed/deck-ponte.jpg',   'Deck sobre o igarapé', 3),
  ('estrutura', '/seed/mesas-sombra.jpg', 'Mesas à sombra', 1),
  ('estrutura', '/seed/guarda-sois.jpg',  'Guarda-sóis à beira da água', 2),
  ('estrutura', '/seed/mesas-deck.jpg',   'Mesas e deck de madeira', 3)
) as v(slug, image_path, alt, sort_order)
join public.gallery_categories c on c.slug = v.slug
where not exists (select 1 from public.gallery_photos);

insert into public.food_items (name, description, image_path, sort_order)
select * from (values
  ('Peixe grelhado', 'O prato da casa: peixe na brasa com acompanhamentos regionais.', '/seed/peixe-grelhado.jpg', 1)
) as v(name, description, image_path, sort_order)
where not exists (select 1 from public.food_items);

-- >>> supabase/migrations/0004_cobranca_por_dia.sql
-- =====================================================================
-- 0004 — Cobrança por dia da semana
--
-- O balneário cobra entrada só aos domingos e feriados. O modo de
-- cobrança e os feriados extras (estaduais/municipais) passam a ser
-- configuráveis; os feriados nacionais o site calcula sozinho.
-- =====================================================================

alter table public.site_settings
  add column if not exists charge_mode text not null default 'always'
    check (charge_mode in ('always', 'sundays_holidays')),
  -- Um feriado por linha, no formato dd/mm (todo ano) ou dd/mm/aaaa (só naquele ano).
  add column if not exists extra_holidays text not null default '',
  -- Frase curta mostrada junto do preço. Vazia = texto automático.
  add column if not exists pricing_note text not null default '';

-- Valores informados pelo dono em 2026-09-11.
update public.site_settings
   set ticket_price = 5,
       charge_mode = 'sundays_holidays'
 where id = 1;
