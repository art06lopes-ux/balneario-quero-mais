import Image from "next/image";
import { Logo3D } from "@/components/site/Logo3D";
import { Reveal } from "@/components/site/Reveal";
import { formatBRL } from "@/lib/format";
import { defaultPricingNote, priceUnitLabel } from "@/lib/pricing";
import type { SiteSettings } from "@/lib/types";

export function Hero({ s }: { s: SiteSettings }) {
  return (
    <section id="inicio" className="relative isolate flex min-h-svh items-center overflow-hidden pt-[calc(76px+3rem)] pb-20 text-white">
      {s.heroImage && (
        <Image
          src={s.heroImage}
          alt=""
          fill
          priority
          quality={85}
          sizes="100vw"
          className="-z-20 object-cover object-[50%_55%] saturate-[1.15] contrast-[1.05] motion-safe:animate-[heroZoom_14s_ease-out_forwards] motion-safe:scale-[1.06]"
        />
      )}
      {/* Tratamento "natureza": tinta verde-floresta multiplicada sobre a foto,
          luz quente vinda de cima à direita e vinheta escura nas bordas. */}
      <div className="absolute inset-0 -z-10 bg-forest-700/35 mix-blend-multiply" aria-hidden />
      <div
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_78%_8%,rgba(247,181,0,.28),transparent_70%),radial-gradient(120%_90%_at_50%_50%,transparent_45%,rgba(4,24,15,.75)_100%),linear-gradient(180deg,rgba(8,47,34,.45)_0%,rgba(8,47,34,.15)_40%,rgba(8,47,34,.7)_100%),linear-gradient(90deg,rgba(8,47,34,.6)_0%,rgba(8,47,34,.05)_65%)]"
        aria-hidden
      />

      <div className="mx-auto grid w-[min(1180px,100%-2.5rem)] items-center gap-10 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="max-w-[720px]">
          {s.heroKicker && (
            <Reveal>
              <span className="eyebrow text-sun-500">{s.heroKicker}</span>
            </Reveal>
          )}
          <Reveal delay={0.05}>
            <h1 className="mb-5 font-display text-[clamp(2.9rem,8vw,5.4rem)] leading-[0.98] font-extrabold [text-shadow:0_6px_30px_rgba(0,0,0,.35)]">
              <HeroTitle title={s.heroTitle} />
            </h1>
          </Reveal>
          {s.heroSubtitle && (
            <Reveal delay={0.1}>
              <p className="mb-7 max-w-[560px] text-[clamp(1.05rem,2vw,1.3rem)] leading-relaxed text-white/90">{s.heroSubtitle}</p>
            </Reveal>
          )}

          <Reveal delay={0.15}>
            <div className="mb-7 inline-flex flex-wrap items-baseline gap-x-2.5 gap-y-1 rounded-2xl border border-white/30 bg-white/10 px-5 py-3 backdrop-blur-md">
              <span className="font-display text-xs font-semibold tracking-[0.12em] text-sun-500 uppercase">Entrada</span>
              <span className="font-display text-[clamp(1.7rem,3.5vw,2.3rem)] leading-none font-extrabold">{formatBRL(s.ticketPrice)}</span>
              <span className="text-[0.95rem] text-white/85">{priceUnitLabel(s.chargeMode)}</span>
              {(s.pricingNote || defaultPricingNote(s.chargeMode)) && (
                <span className="basis-full text-[0.82rem] text-white/75">{s.pricingNote || defaultPricingNote(s.chargeMode)}</span>
              )}
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="mb-9 flex flex-wrap gap-3 max-sm:[&>a]:w-full">
              <a href="#reservar" className="btn btn-sun btn-lg">
                Reservar minha entrada
              </a>
              <a href="#galeria" className="btn btn-ghost btn-lg">
                Ver fotos
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.25}>
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-[0.92rem] text-white/85">
              {["Aberto todos os dias", "Bar & restaurante", "Água natural de igarapé"].map((f) => (
                <li key={f} className="flex items-center gap-2 before:size-2 before:rounded-full before:bg-sun-500">
                  {f}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        {s.logo && (
          <Reveal delay={0.2} className="hidden justify-center lg:flex">
            <Logo3D src={s.logo} size={300} tilt={22} float priority />
          </Reveal>
        )}
      </div>

      <a
        href="#sobre"
        aria-label="Rolar para a próxima seção"
        className="absolute bottom-6 left-1/2 hidden h-[42px] w-[26px] -translate-x-1/2 rounded-[14px] border-2 border-white/55 sm:block"
      >
        <span className="absolute top-2 left-1/2 h-2 w-1 -translate-x-1/2 rounded-sm bg-white motion-safe:animate-[scrollHint_1.8s_infinite]" />
      </a>
    </section>
  );
}

/** Destaca a última palavra ("Quero Mais") em amarelo, como na prévia aprovada. */
function HeroTitle({ title }: { title: string }) {
  const parts = title.trim().split(/\s+/);
  if (parts.length < 2) return <>{title}</>;
  const head = parts.slice(0, -2).join(" ");
  const tail = parts.slice(-2).join(" ");
  return (
    <>
      {head && (
        <>
          {head}
          <br />
        </>
      )}
      <span className="text-sun-500">{tail}</span>
    </>
  );
}
