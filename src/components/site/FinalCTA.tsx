import Image from "next/image";
import { Reveal } from "@/components/site/Reveal";
import type { SiteSettings } from "@/lib/types";

export function FinalCTA({ s }: { s: SiteSettings }) {
  if (!s.ctaTitle) return null;
  return (
    <section className="relative isolate overflow-hidden py-[clamp(5rem,12vw,9rem)] text-center text-white">
      {s.ctaImage && (
        <Image src={s.ctaImage} alt="" fill sizes="100vw" className="-z-20 object-cover object-[50%_60%]" />
      )}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(15,95,168,.55),rgba(8,47,34,.8))]" aria-hidden />
      <div className="mx-auto w-[min(1180px,100%-2.5rem)]">
        <Reveal>
          <h2 className="mb-4 font-display text-[clamp(2rem,5vw,3.4rem)] leading-[1.1] font-extrabold [text-shadow:0_6px_30px_rgba(0,0,0,.35)]">{s.ctaTitle}</h2>
        </Reveal>
        {s.ctaText && (
          <Reveal delay={0.05}>
            <p className="mb-8 text-[1.1rem] text-white/85">{s.ctaText}</p>
          </Reveal>
        )}
        <Reveal delay={0.1}>
          <a href="#reservar" className="btn btn-sun btn-lg">
            Reservar minha entrada
          </a>
        </Reveal>
      </div>
    </section>
  );
}
