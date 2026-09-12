-- =====================================================================
-- 0005 — Prova social (editável no painel)
--
-- Nota do Google e seguidores do Instagram aparecem no site como
-- credibilidade. Vazios = a faixa não aparece.
-- =====================================================================

alter table public.site_settings
  add column if not exists google_rating       numeric(2,1) check (google_rating is null or (google_rating >= 0 and google_rating <= 5)),
  add column if not exists google_rating_count int check (google_rating_count is null or google_rating_count >= 0),
  add column if not exists google_reviews_url  text not null default '',
  add column if not exists instagram_followers text not null default '';

-- Valores vistos no Google Maps e no perfil do Instagram em 11/09/2026.
-- O dono atualiza pelo painel (Textos e imagens > Prova social).
update public.site_settings
   set google_rating = coalesce(google_rating, 4.7),
       google_rating_count = coalesce(google_rating_count, 54),
       google_reviews_url = case when google_reviews_url = '' then 'https://www.google.com/maps/search/Balne%C3%A1rio+Quero+Mais+Novo+Air%C3%A3o+Amazonas' else google_reviews_url end,
       instagram_followers = case when instagram_followers = '' then '7,9 mil' else instagram_followers end
 where id = 1;
