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
