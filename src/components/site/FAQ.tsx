"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { SectionTitle } from "@/components/site/SectionTitle";
import { Stagger, StaggerItem } from "@/components/site/motion";
import type { FaqItem } from "@/lib/faq";
import { cn } from "@/lib/utils";

export function FAQ({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="perguntas" className="relative overflow-hidden py-[clamp(4rem,9vw,7.5rem)]">
      <div className="pointer-events-none absolute -right-32 top-10 size-[420px] rounded-full [background:radial-gradient(circle,rgba(247,181,0,0.16)_0%,transparent_70%)]" aria-hidden />
      <div className="mx-auto grid w-[min(1180px,100%-2.5rem)] gap-10 md:grid-cols-[0.8fr_1.2fr]">
        <div>
          <SectionTitle index="06" eyebrow="Dúvidas" title="Perguntas frequentes" className="mb-4" />
          <p className="max-w-[380px] text-ink-2">Não achou o que procurava? Chama no WhatsApp que a gente responde rapidinho.</p>
        </div>

        <Stagger className="grid gap-3" gap={0.06}>
          {items.map((it, i) => {
            const on = open === i;
            return (
              <StaggerItem key={it.q}>
                <div className={cn("rounded-2xl border transition-colors", on ? "border-forest-500/40 bg-white shadow-card" : "border-forest-900/10 bg-white/70 hover:bg-white")}>
                  <button
                    type="button"
                    onClick={() => setOpen(on ? null : i)}
                    aria-expanded={on}
                    aria-controls={`faq-${i}`}
                    className="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left font-display text-[1.05rem] font-bold text-forest-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-forest-500/25 rounded-2xl"
                  >
                    {it.q}
                    <motion.span
                      animate={{ rotate: on ? 45 : 0 }}
                      transition={{ duration: 0.25 }}
                      className={cn("grid size-8 shrink-0 place-items-center rounded-full text-xl font-light", on ? "bg-sun-500 text-forest-900" : "bg-forest-100 text-forest-700")}
                      aria-hidden
                    >
                      +
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {on && (
                      <motion.div
                        id={`faq-${i}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="px-5 pb-5 leading-relaxed text-ink-2">{it.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
