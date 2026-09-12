"use client";

import { motion } from "framer-motion";
import { useEffect, useState, type FormEvent } from "react";
import { Reveal } from "@/components/site/Reveal";
import { SectionTitle } from "@/components/site/SectionTitle";
import { HouseRules } from "@/components/site/HouseRules";
import type { SiteSettings } from "@/lib/types";
import { formatBRL, isoToBR, maskPhone, todayISO } from "@/lib/format";
import { defaultPricingNote, isChargedDate, priceUnitLabel, type ChargeMode } from "@/lib/pricing";
import { BUSINESS_NAME } from "@/lib/types";
import { buildBookingMessage, whatsappLink } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

type Props = {
  whatsappNumber: string;
  ticketPrice: number;
  chargeMode: ChargeMode;
  extraHolidays: string;
  pricingNote: string;
  settings: SiteSettings;
};

/**
 * Reserva via WhatsApp. O número e o preço vêm do painel; o cálculo e a
 * mensagem continuam iguais aos aprovados na prévia.
 */
export function Booking({
  whatsappNumber,
  ticketPrice,
  chargeMode,
  extraHolidays,
  pricingNote,
  settings,
}: Props) {
  const [qty, setQty] = useState(1);
  const [date, setDate] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  // Datas dependem do relógio do visitante (fuso de Manaus), não do servidor:
  // calculadas só no cliente para não divergir da renderização inicial.
  const [quick, setQuick] = useState<{ label: string; iso: string }[]>([]);
  const [minDate, setMinDate] = useState<string | undefined>(undefined);
  useEffect(() => {
    const t = window.setTimeout(() => {
      setQuick(quickDates());
      setMinDate(todayISO());
    }, 0);
    return () => window.clearTimeout(t);
  }, []);

  // Cobra só se a data escolhida for de cobrança (domingo/feriado, conforme o painel).
  const charged = isChargedDate(date, chargeMode, extraHolidays);
  const total = charged ? qty * ticketPrice : 0;
  const freeDay = chargeMode === "sundays_holidays" && date !== "" && !charged;
  const note = pricingNote || defaultPricingNote(chargeMode);
  const phoneDigits = phone.replace(/\D/g, "");
  const invalid = {
    name: touched && name.trim() === "",
    date: touched && date === "",
    phone: touched && phoneDigits.length < 10,
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    const problems: string[] = [];
    if (!name.trim()) problems.push("seu nome");
    if (!date) problems.push("a data desejada");
    if (phoneDigits.length < 10) problems.push("um WhatsApp válido com DDD");
    if (problems.length) {
      setError(`Para continuar, informe ${problems.join(", ")}.`);
      return;
    }
    setError(null);
    const message = buildBookingMessage({
      name: name.trim(),
      quantity: qty,
      date: isoToBR(date),
      total: freeDay
        ? "entrada gratuita neste dia"
        : `${formatBRL(total)} (${qty} × ${formatBRL(ticketPrice)})`,
      businessName: BUSINESS_NAME,
    });
    window.open(whatsappLink(whatsappNumber, message), "_blank", "noopener");
  };

  const inputCls = (bad: boolean) =>
    cn(
      "w-full rounded-xl border-[1.5px] bg-[#fafcfb] px-4 py-3.5 text-ink transition-[border-color,box-shadow] outline-none focus:border-forest-500 focus:ring-4 focus:ring-forest-500/15",
      bad ? "border-[#d64545] ring-4 ring-[#d64545]/12" : "border-[#d8e2dc]",
    );

  return (
    <section
      id="reservar"
      className="bg-[radial-gradient(900px_500px_at_10%_0%,rgba(31,138,76,.35),transparent_60%),radial-gradient(700px_500px_at_100%_100%,rgba(29,127,214,.35),transparent_60%)] bg-forest-900 py-[clamp(4rem,9vw,7.5rem)] text-white"
    >
      <div className="mx-auto grid w-[min(1180px,100%-2.5rem)] items-center gap-[clamp(2.5rem,6vw,5rem)] md:grid-cols-2">
        <div>
          <SectionTitle
            index="05"
            eyebrow="Reserva"
            title="Garanta sua entrada pelo WhatsApp"
            tone="dark"
            className="mb-5"
          />
          <Reveal delay={0.1}>
            <p className="max-w-[460px] text-[1.05rem] leading-relaxed text-white/80">
              Escolha a quantidade de pessoas e a data, informe seu nome e WhatsApp. A gente monta a
              mensagem pra você e abre direto na conversa com o balneário.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <ol className="mt-8 grid gap-3">
              {[
                "Preencha os dados",
                "Veja o total calculado na hora",
                "Confirme pelo WhatsApp",
              ].map((s, i) => (
                <li key={s} className="flex items-center gap-3.5 font-medium">
                  <span className="grid size-[34px] shrink-0 place-items-center rounded-full bg-sun-500 font-display font-extrabold text-forest-900">
                    {i + 1}
                  </span>
                  {s}
                </li>
              ))}
            </ol>
          </Reveal>
          <HouseRules s={settings} tone="dark" className="mt-8 max-w-[460px]" />
        </div>

        <Reveal delay={0.1}>
          <div
            id="ticket-card"
            className="relative overflow-hidden rounded-xl2 bg-white text-ink shadow-deep before:absolute before:top-[92px] before:-left-3.5 before:z-[2] before:size-7 before:rounded-full before:bg-forest-900 after:absolute after:top-[92px] after:-right-3.5 after:z-[2] after:size-7 after:rounded-full after:bg-forest-900"
          >
            <div className="flex items-center justify-between gap-4 border-b-2 border-dashed border-forest-900/25 bg-gradient-to-br from-sun-500 to-ember-500 px-8 py-6 text-forest-900 max-sm:px-5">
              <span className="font-display font-extrabold tracking-[0.2em] uppercase">
                Ingresso
              </span>
              <span className="font-display text-[1.7rem] leading-none font-extrabold max-sm:text-[1.4rem]">
                {formatBRL(ticketPrice)}{" "}
                <small className="text-[0.85rem] font-semibold opacity-80">
                  / {priceUnitLabel(chargeMode).replace("por pessoa", "pessoa")}
                </small>
              </span>
            </div>
            {note && (
              <p className="bg-forest-100 px-8 py-2 text-center text-[0.8rem] font-medium text-forest-800 max-sm:px-5">
                {note}
              </p>
            )}

            <form onSubmit={submit} noValidate className="grid gap-4 px-8 pt-7 pb-6 max-sm:px-5">
              <div className="grid gap-1.5">
                <label htmlFor="qty" className="font-display text-sm font-semibold text-ink-2">
                  Quantidade de pessoas
                </label>
                <div className="grid grid-cols-[52px_1fr_52px] overflow-hidden rounded-xl border-[1.5px] border-[#d8e2dc] bg-[#fafcfb]">
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    aria-label="Diminuir"
                    className="bg-forest-100 text-2xl font-bold text-forest-800 transition-colors hover:bg-[#d5eadd]"
                  >
                    −
                  </button>
                  <input
                    id="qty"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={99}
                    value={qty}
                    onChange={(e) =>
                      setQty(Math.min(99, Math.max(1, parseInt(e.target.value, 10) || 1)))
                    }
                    className="w-full [appearance:textfield] bg-transparent text-center font-display text-xl font-bold outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.min(99, q + 1))}
                    aria-label="Aumentar"
                    className="bg-forest-100 text-2xl font-bold text-forest-800 transition-colors hover:bg-[#d5eadd]"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="grid gap-1.5">
                <label htmlFor="date" className="font-display text-sm font-semibold text-ink-2">
                  Data desejada
                </label>
                <input
                  id="date"
                  type="date"
                  min={minDate}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={inputCls(invalid.date)}
                />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {quick.map((d) => (
                    <button
                      key={d.iso}
                      type="button"
                      onClick={() => setDate(d.iso)}
                      className={cn(
                        "cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                        date === d.iso
                          ? "border-forest-700 bg-forest-700 text-white"
                          : "border-forest-900/15 bg-white text-forest-800 hover:bg-forest-100",
                      )}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-1.5">
                <label htmlFor="name" className="font-display text-sm font-semibold text-ink-2">
                  Seu nome
                </label>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Como devemos te chamar?"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputCls(invalid.name)}
                />
              </div>

              <div className="grid gap-1.5">
                <label htmlFor="phone" className="font-display text-sm font-semibold text-ink-2">
                  Seu WhatsApp
                </label>
                <input
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="(92) 99999-9999"
                  value={phone}
                  onChange={(e) => setPhone(maskPhone(e.target.value))}
                  className={inputCls(invalid.phone)}
                />
              </div>

              <div className="rounded-2xl bg-forest-100 px-5 py-4 font-display font-semibold text-forest-800">
                <div className="flex items-baseline justify-between">
                  <span>Total</span>
                  <motion.strong
                    key={`${total}-${freeDay}`}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    className="text-[1.8rem] font-extrabold text-forest-700"
                  >
                    {freeDay ? "Grátis" : formatBRL(total)}
                  </motion.strong>
                </div>
                {chargeMode === "sundays_holidays" && (
                  <p className="mt-1 text-right text-xs font-normal text-ink-3">
                    {date === ""
                      ? "Escolha a data para calcular"
                      : freeDay
                        ? "Entrada gratuita neste dia"
                        : `${qty} × ${formatBRL(ticketPrice)} · domingo ou feriado`}
                  </p>
                )}
              </div>

              {error && (
                <p role="alert" className="text-sm font-medium text-[#b93232]">
                  {error}
                </p>
              )}

              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="btn btn-wa btn-lg btn-shine w-full"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="size-[22px]">
                  <path
                    fill="currentColor"
                    d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-1 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.5-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.3-.6-.4M12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.3 5L2 22l5.2-1.4c1.4.8 3.1 1.2 4.8 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2m0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3.1.8.8-3-.2-.3C4 15 3.7 13.5 3.7 12c0-4.6 3.7-8.3 8.3-8.3s8.3 3.7 8.3 8.3-3.7 8.2-8.3 8.2"
                  />
                </svg>
                Reservar pelo WhatsApp
              </motion.button>

              <p className="text-center text-[0.8rem] leading-relaxed text-ink-3">
                A confirmação acontece na conversa pelo WhatsApp. Nenhuma cobrança é feita pelo
                site.
              </p>
            </form>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/** Atalhos: hoje, amanhã, próximo sábado e próximo domingo. */
function quickDates(): { label: string; iso: string }[] {
  const pad = (n: number) => String(n).padStart(2, "0");
  const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const today = new Date();
  const next = (dow: number) => {
    const d = new Date(today);
    const diff = (dow - d.getDay() + 7) % 7 || 7;
    d.setDate(d.getDate() + diff);
    return d;
  };
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const out = [
    { label: "Hoje", iso: iso(today) },
    { label: "Amanhã", iso: iso(tomorrow) },
    { label: "Próx. sábado", iso: iso(next(6)) },
    { label: "Próx. domingo", iso: iso(next(0)) },
  ];
  // Evita repetir quando "amanhã" já é sábado/domingo.
  return out.filter((d, i, arr) => arr.findIndex((x) => x.iso === d.iso) === i);
}
