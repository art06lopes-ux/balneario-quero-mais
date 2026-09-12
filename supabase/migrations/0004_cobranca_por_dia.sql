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
