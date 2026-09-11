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
