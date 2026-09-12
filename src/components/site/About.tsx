"use client";

import Image from "next/image";
import { CountUp, MaskReveal, Parallax, Stagger, StaggerItem } from "@/components/site/motion";
import { Reveal } from "@/components/site/Reveal";
import { SectionTitle } from "@/components/site/SectionTitle";
import type { SiteSettings } from "@/lib/types";

export function About({ s }: { s: SiteSettings }) {
  const paragraphs = s.aboutText.split(/\n\s*\n/).filter(Boolean);

  return (
    <section id="sobre" className="relative py-[clamp(4rem,9vw,7.5rem)]">
      <div className="mx-auto grid w-[min(1180px,100%-2.5rem)] items-center gap-[clamp(2.5rem,6vw,5rem)] md:grid-cols-[1.05fr_1fr]">
        <div>
          <SectionTitle index="01" eyebrow="Sobre o balneário" title={s.aboutTitle} className="mb-5" />
          {paragraphs.map((p, i) => (
            <Reveal key={i} delay={0.1 + i * 0.06}>
              <p className="mb-4 text-[1.05rem] leading-relaxed text-ink-2">{p}</p>
            </Reveal>
          ))}
          <Stagger className="mt-8 flex flex-wrap gap-8 border-t border-forest-900/10 pt-6" gap={0.12}>
            <StaggerItem>
              <Stat label="aberto por semana">
                <CountUp to={7} suffix=" dias" />
              </Stat>
            </StaggerItem>
            <StaggerItem>
              <Stat label={s.chargeMode === "sundays_holidays" ? "entrada (dom. e feriados)" : "entrada por pessoa"}>
                <CountUp to={Math.round(s.ticketPrice)} prefix="R$ " />
              </Stat>
            </StaggerItem>
            <StaggerItem>
              <Stat label="estrada de Novo Airão">
                <CountUp to={19} prefix="Km " />
              </Stat>
            </StaggerItem>
          </Stagger>
        </div>

        <div className="relative pb-12 max-md:order-first max-md:pb-10">
          {s.aboutImage && (
            <MaskReveal className="relative aspect-[4/5] overflow-hidden rounded-xl2 shadow-deep">
              <Parallax distance={40} className="h-full w-full">
                <div className="relative h-[115%] w-full -translate-y-[7%]">
                  <Image src={s.aboutImage} alt={s.aboutTitle} fill sizes="(max-width:768px) 100vw, 50vw" className="object-cover" />
                </div>
              </Parallax>
            </MaskReveal>
          )}
          {s.aboutImageSecondary && (
            <MaskReveal
              direction="left"
              delay={0.25}
              className="absolute right-0 bottom-0 aspect-square w-[44%] overflow-hidden rounded-xl2 border-[6px] border-sand shadow-deep md:-right-6"
            >
              <Parallax distance={-30} className="h-full w-full">
                <div className="relative h-[120%] w-full -translate-y-[8%]">
                  <Image src={s.aboutImageSecondary} alt="" fill sizes="25vw" className="object-cover" />
                </div>
              </Parallax>
            </MaskReveal>
          )}
        </div>
      </div>
    </section>
  );
}

function Stat({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col">
      <strong className="font-display text-[1.7rem] leading-[1.1] font-extrabold text-forest-700 tabular-nums">{children}</strong>
      <span className="text-[0.85rem] text-ink-3">{label}</span>
    </div>
  );
}
