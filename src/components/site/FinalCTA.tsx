"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";
import { Magnetic, SplitWords } from "@/components/site/motion";
import { Reveal } from "@/components/site/Reveal";
import { TrustBadges } from "@/components/site/TrustBadges";
import type { SiteSettings } from "@/lib/types";

export function FinalCTA({ s }: { s: SiteSettings }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-12%", reduce ? "-12%" : "12%"]);

  if (!s.ctaTitle) return null;
  return (
    <section ref={ref} className="relative isolate overflow-hidden py-[clamp(5rem,12vw,9rem)] text-center text-white">
      {s.ctaImage && (
        <motion.div style={{ y }} className="absolute inset-[-15%_0] -z-20 will-change-transform">
          <Image src={s.ctaImage} alt="" fill sizes="100vw" className="object-cover object-[50%_60%] saturate-[1.1]" />
        </motion.div>
      )}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(15,95,168,.6),rgba(8,47,34,.86))]" aria-hidden />
      <div className="grain absolute inset-0 -z-10 hidden opacity-[.05] md:block" aria-hidden />
      <div className="mx-auto w-[min(1180px,100%-2.5rem)]">
        <SplitWords
          as="h2"
          text={s.ctaTitle}
          className="mb-4 font-display text-[clamp(2rem,5vw,3.4rem)] leading-[1.1] font-extrabold [text-shadow:0_6px_30px_rgba(0,0,0,.35)]"
        />
        {s.ctaText && (
          <Reveal delay={0.3}>
            <p className="mb-8 text-[1.1rem] text-white/85">{s.ctaText}</p>
          </Reveal>
        )}
        <Reveal delay={0.4}>
          <Magnetic>
            <a href="#reservar" className="btn btn-sun btn-lg btn-shine">
              Reservar minha entrada
            </a>
          </Magnetic>
        </Reveal>
        <TrustBadges s={s} className="mt-8 justify-center" delay={0.5} />
      </div>
    </section>
  );
}
