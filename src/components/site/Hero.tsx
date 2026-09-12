"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";
import { Logo3D } from "@/components/site/Logo3D";
import { Magnetic, SplitWords } from "@/components/site/motion";
import { TrustBadges } from "@/components/site/TrustBadges";
import { formatBRL } from "@/lib/format";
import { defaultPricingNote, priceUnitLabel } from "@/lib/pricing";
import type { SiteSettings } from "@/lib/types";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Luzes suaves flutuando (Loop) — lembram sol entre as folhas.
 * Sem `filter: blur` (caro de animar): o desfoque é o próprio gradiente
 * radial, que a GPU só move. Aparecem só em telas grandes.
 */
const BOKEH = [
  { x: "10%", y: "18%", s: 420, d: 13, delay: 0, c: "247,181,0", a: 0.28 },
  { x: "62%", y: "8%", s: 560, d: 16, delay: 3, c: "247,181,0", a: 0.2 },
  { x: "78%", y: "62%", s: 460, d: 14, delay: 6, c: "31,138,76", a: 0.32 },
];

export function Hero({ s }: { s: SiteSettings }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  // Parallax: a foto desce mais devagar que o conteúdo e o texto some antes.
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "22%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -80]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const note = s.pricingNote || defaultPricingNote(s.chargeMode);

  return (
    <section
      ref={ref}
      id="inicio"
      className="relative isolate flex min-h-svh items-center overflow-hidden pt-[calc(76px+3rem)] pb-28 text-white"
    >
      {/* Foto com parallax + tratamento verde-floresta */}
      <motion.div
        style={{ y: bgY }}
        className="absolute inset-[-12%_0_0_0] -z-20 will-change-transform"
      >
        {s.heroImage && (
          <Image
            src={s.heroImage}
            alt=""
            fill
            priority
            quality={85}
            sizes="100vw"
            className="object-cover object-[50%_55%] saturate-[1.15] contrast-[1.05] motion-safe:animate-[heroZoom_14s_ease-out_forwards] motion-safe:scale-[1.06]"
          />
        )}
      </motion.div>
      {/* Tinta verde-floresta + luz quente + vinheta, tudo em uma camada sem blend (barata de compor) */}
      <div
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_78%_8%,rgba(247,181,0,.26),transparent_70%),radial-gradient(120%_90%_at_50%_50%,transparent_40%,rgba(4,24,15,.78)_100%),linear-gradient(180deg,rgba(8,47,34,.55)_0%,rgba(15,90,60,.28)_40%,rgba(8,47,34,.75)_100%),linear-gradient(90deg,rgba(8,47,34,.6)_0%,rgba(8,47,34,.08)_65%)]"
        aria-hidden
      />
      {/* Grão fino: só em telas grandes, sem blend */}
      <div className="grain absolute inset-0 -z-10 hidden opacity-[.05] md:block" aria-hidden />

      {/* Bokeh flutuante (desktop) */}
      {!reduce &&
        BOKEH.map((b, i) => (
          <motion.span
            key={i}
            aria-hidden
            className="pointer-events-none absolute -z-10 hidden rounded-full will-change-transform md:block"
            style={{
              left: b.x,
              top: b.y,
              width: b.s,
              height: b.s,
              background: `radial-gradient(circle, rgba(${b.c},${b.a}) 0%, rgba(${b.c},${b.a * 0.5}) 30%, rgba(${b.c},0) 70%)`,
            }}
            animate={{ y: [0, -30, 0], x: [0, 18, 0] }}
            transition={{ duration: b.d, delay: b.delay, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="mx-auto grid w-[min(1180px,100%-2.5rem)] items-center gap-10 lg:grid-cols-[1.25fr_0.75fr]"
      >
        <div className="max-w-[720px]">
          {s.heroKicker && (
            <motion.span
              className="eyebrow text-sun-500"
              initial={reduce ? undefined : { opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
            >
              {s.heroKicker}
            </motion.span>
          )}

          <SplitWords
            as="h1"
            text={s.heroTitle}
            highlightLast={2}
            breakBeforeHighlight
            delay={0.25}
            className="mb-5 font-display text-[clamp(2.9rem,8vw,5.4rem)] leading-[0.98] font-extrabold [text-shadow:0_6px_30px_rgba(0,0,0,.35)]"
          />

          {s.heroSubtitle && (
            <motion.p
              className="mb-7 max-w-[560px] text-[clamp(1.05rem,2vw,1.3rem)] leading-relaxed text-white/90"
              initial={reduce ? undefined : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.7 }}
            >
              {s.heroSubtitle}
            </motion.p>
          )}

          <motion.div
            initial={reduce ? undefined : { opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.85 }}
            className="mb-7 inline-flex flex-wrap items-baseline gap-x-2.5 gap-y-1 rounded-2xl border border-white/30 bg-white/10 px-5 py-3 shadow-[0_10px_40px_rgba(0,0,0,.25)] backdrop-blur-md"
          >
            <span className="font-display text-xs font-semibold tracking-[0.12em] text-sun-500 uppercase">
              Entrada
            </span>
            <span className="font-display text-[clamp(1.7rem,3.5vw,2.3rem)] leading-none font-extrabold">
              {formatBRL(s.ticketPrice)}
            </span>
            <span className="text-[0.95rem] text-white/85">{priceUnitLabel(s.chargeMode)}</span>
            {note && <span className="basis-full text-[0.82rem] text-white/75">{note}</span>}
          </motion.div>

          <motion.div
            initial={reduce ? undefined : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 1 }}
            className="mb-9 flex flex-wrap gap-3 max-sm:[&_a]:w-full max-sm:[&>div]:w-full"
          >
            <Magnetic>
              <a href="#reservar" className="btn btn-sun btn-lg btn-shine">
                Reservar minha entrada
              </a>
            </Magnetic>
            <Magnetic strength={0.2}>
              <a href="#galeria" className="btn btn-ghost btn-lg">
                Ver fotos
              </a>
            </Magnetic>
          </motion.div>

          <motion.ul
            className="flex flex-wrap gap-x-6 gap-y-2 text-[0.92rem] text-white/85"
            initial={reduce ? undefined : "hidden"}
            animate="show"
            transition={{ staggerChildren: 0.1, delayChildren: 1.15 }}
          >
            {[
              "Aberto todos os dias",
              ...(s.liveMusic ? [s.liveMusic] : []),
              "Bar & restaurante",
              ...(s.petsAllowed ? ["Aceita pets"] : []),
              ...(s.outsideFoodAllowed ? [] : ["Sem comida e bebida de fora"]),
            ].map((f) => (
              <motion.li
                key={f}
                variants={{ hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0 } }}
                className="flex items-center gap-2 before:size-2 before:rounded-full before:bg-sun-500"
              >
                {f}
              </motion.li>
            ))}
          </motion.ul>

          <TrustBadges s={s} className="mt-6" delay={1.3} />
        </div>

        {s.logo && (
          <motion.div
            className="hidden justify-center lg:flex"
            initial={reduce ? undefined : { opacity: 0, scale: 0.8, rotate: -6 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1.1, ease: EASE, delay: 0.5 }}
          >
            <Logo3D src={s.logo} size={300} tilt={22} float priority />
          </motion.div>
        )}
      </motion.div>

      <a
        href="#sobre"
        aria-label="Rolar para a próxima seção"
        className="absolute bottom-16 left-1/2 hidden h-[42px] w-[26px] -translate-x-1/2 rounded-[14px] border-2 border-white/55 sm:block"
      >
        <span className="absolute top-2 left-1/2 h-2 w-1 -translate-x-1/2 rounded-sm bg-white motion-safe:animate-[scrollHint_1.8s_infinite]" />
      </a>

      {/* Section Transition: onda orgânica para a próxima seção */}
      <svg
        className="absolute inset-x-0 bottom-0 z-10 h-[60px] w-full text-sand sm:h-[90px]"
        viewBox="0 0 1440 90"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          fill="currentColor"
          d="M0,50 C240,95 480,95 720,55 C960,15 1200,15 1440,55 L1440,90 L0,90 Z"
        />
      </svg>
    </section>
  );
}
