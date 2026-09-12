import Image from "next/image";
import { Reveal } from "@/components/site/Reveal";
import { formatBRL } from "@/lib/format";
import type { SiteSettings } from "@/lib/types";

export function About({ s }: { s: SiteSettings }) {
  const paragraphs = s.aboutText.split(/\n\s*\n/).filter(Boolean);

  return (
    <section id="sobre" className="py-[clamp(4rem,9vw,7.5rem)]">
      <div className="mx-auto grid w-[min(1180px,100%-2.5rem)] items-center gap-[clamp(2.5rem,6vw,5rem)] md:grid-cols-[1.05fr_1fr]">
        <div>
          <Reveal>
            <span className="eyebrow text-forest-500">Sobre o balneário</span>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mb-5 font-display text-[clamp(1.9rem,4vw,2.9rem)] leading-[1.1] font-extrabold text-forest-800">{s.aboutTitle}</h2>
          </Reveal>
          {paragraphs.map((p, i) => (
            <Reveal key={i} delay={0.1 + i * 0.05}>
              <p className="mb-4 text-[1.05rem] leading-relaxed text-ink-2">{p}</p>
            </Reveal>
          ))}
          <Reveal delay={0.2}>
            <div className="mt-8 flex flex-wrap gap-6 border-t border-forest-900/10 pt-6">
              <Stat value="7 dias" label="aberto por semana" />
              <Stat value={formatBRL(s.ticketPrice).replace(",00", "")} label={s.chargeMode === "sundays_holidays" ? "entrada (dom. e feriados)" : "entrada por pessoa"} />
              <Stat value="Km 19" label="estrada de Novo Airão" />
            </div>
          </Reveal>
        </div>

        <div className="relative pb-12 max-md:order-first max-md:pb-10">
          {s.aboutImage && (
            <Reveal as="figure" className="relative m-0 aspect-[4/5] overflow-hidden rounded-xl2 shadow-deep">
              <Image src={s.aboutImage} alt={s.aboutTitle} fill sizes="(max-width:768px) 100vw, 50vw" className="object-cover" />
            </Reveal>
          )}
          {s.aboutImageSecondary && (
            <Reveal
              as="figure"
              delay={0.15}
              className="absolute right-0 bottom-0 m-0 aspect-square w-[44%] overflow-hidden rounded-xl2 border-[6px] border-sand shadow-deep md:-right-6"
            >
              <Image src={s.aboutImageSecondary} alt="" fill sizes="25vw" className="object-cover" />
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col">
      <strong className="font-display text-[1.6rem] leading-[1.1] font-extrabold text-forest-700">{value}</strong>
      <span className="text-[0.85rem] text-ink-3">{label}</span>
    </div>
  );
}
