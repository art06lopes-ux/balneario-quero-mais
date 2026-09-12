"use client";

import { motion, useReducedMotion } from "framer-motion";
import { SplitWords } from "@/components/site/motion";
import { cn } from "@/lib/utils";

type Props = {
  eyebrow: string;
  /** Numeração da seção ("01", "02"…) — dá ritmo editorial à página. */
  index?: string;
  title: string;
  tone?: "light" | "dark";
  className?: string;
};

/** Cabeçalho padrão de seção: numeração + rótulo com linha, título com word stagger. */
export function SectionTitle({ eyebrow, index, title, tone = "light", className }: Props) {
  const reduce = useReducedMotion();
  const dark = tone === "dark";
  return (
    <div className={cn("max-w-[680px]", className)}>
      <motion.div
        className={cn("mb-4 flex items-center gap-3 font-display text-[0.78rem] font-semibold tracking-[0.18em] uppercase", dark ? "text-sun-500" : "text-forest-500")}
        initial={reduce ? undefined : { opacity: 0, x: -14 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "0px 0px -60px 0px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {index && <span className={cn("tabular-nums", dark ? "text-white/50" : "text-ink-3")}>{index}</span>}
        <motion.span
          className={cn("h-px w-8 origin-left", dark ? "bg-sun-500" : "bg-forest-500")}
          initial={reduce ? undefined : { scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        />
        {eyebrow}
      </motion.div>
      <SplitWords
        as="h2"
        text={title}
        className={cn("font-display text-[clamp(1.9rem,4vw,2.9rem)] leading-[1.1] font-extrabold", dark ? "text-white" : "text-forest-800")}
      />
    </div>
  );
}
