-- =====================================================================
-- 0007 — Destaque de programação (editável no painel)
--
-- Informado pelo dono em 12/09/2026: som ao vivo todos os domingos e
-- feriados. Texto livre; vazio = não aparece.
-- =====================================================================

alter table public.site_settings
  add column if not exists live_music text not null default 'Som ao vivo aos domingos e feriados';
