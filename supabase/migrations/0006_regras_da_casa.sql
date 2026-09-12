-- =====================================================================
-- 0006 — Regras da casa (editáveis no painel)
--
-- Informadas pelo dono em 12/09/2026: aceita pets; proibida a entrada
-- com comidas e bebidas de fora.
-- =====================================================================

alter table public.site_settings
  add column if not exists pets_allowed         boolean not null default true,
  add column if not exists outside_food_allowed boolean not null default false,
  -- Observações extras, uma por linha (opcional).
  add column if not exists house_rules          text not null default '';
