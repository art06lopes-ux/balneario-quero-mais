/**
 * Regra de cobrança da entrada.
 *
 *  - "always":            cobra todo dia.
 *  - "sundays_holidays":  cobra só aos domingos e feriados.
 *
 * Feriados nacionais são calculados aqui (fixos + os móveis a partir da
 * Páscoa). Feriados estaduais/municipais vêm do painel (`extraHolidays`),
 * um por linha: "dd/mm" (todo ano) ou "dd/mm/aaaa" (só naquele ano).
 */
export type ChargeMode = "always" | "sundays_holidays";

const FIXED_NATIONAL = ["01/01", "21/04", "01/05", "07/09", "12/10", "02/11", "15/11", "20/11", "25/12"];

/** Domingo de Páscoa (algoritmo de Meeus/Jones/Butcher). */
function easter(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

const pad = (n: number) => String(n).padStart(2, "0");
const ddmm = (d: Date) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;

/** Feriados nacionais do ano, em "dd/mm". */
export function nationalHolidays(year: number): string[] {
  const p = easter(year);
  const movable = [addDays(p, -48), addDays(p, -47), addDays(p, -2), addDays(p, 60)]; // Carnaval (2ª e 3ª), Sexta Santa, Corpus Christi
  return [...FIXED_NATIONAL, ...movable.map(ddmm)];
}

export function parseExtraHolidays(text: string): string[] {
  return text
    .split(/\r?\n|,|;/)
    .map((s) => s.trim())
    .filter((s) => /^\d{2}\/\d{2}(\/\d{4})?$/.test(s));
}

/** Data "aaaa-mm-dd" (do input date) -> Date local, sem fuso. */
function fromISO(iso: string): Date | null {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

export function isHoliday(iso: string, extraHolidays: string): boolean {
  const d = fromISO(iso);
  if (!d) return false;
  const key = ddmm(d);
  const keyYear = `${key}/${d.getFullYear()}`;
  if (nationalHolidays(d.getFullYear()).includes(key)) return true;
  return parseExtraHolidays(extraHolidays).some((h) => h === key || h === keyYear);
}

export function isSunday(iso: string): boolean {
  const d = fromISO(iso);
  return d !== null && d.getDay() === 0;
}

/** A entrada é cobrada nessa data? Sem data válida, assume que sim. */
export function isChargedDate(iso: string, mode: ChargeMode, extraHolidays: string): boolean {
  if (mode === "always") return true;
  if (!fromISO(iso)) return true;
  return isSunday(iso) || isHoliday(iso, extraHolidays);
}

/** Frase padrão exibida junto do preço quando o painel não define outra. */
export function defaultPricingNote(mode: ChargeMode): string {
  return mode === "sundays_holidays" ? "Cobrada aos domingos e feriados. Nos demais dias, entrada gratuita." : "";
}

/** Rótulo curto: "por pessoa" ou "por pessoa · domingos e feriados". */
export function priceUnitLabel(mode: ChargeMode): string {
  return mode === "sundays_holidays" ? "por pessoa · domingos e feriados" : "por pessoa";
}
