"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { FormState } from "@/server/actions/shared";

/**
 * Aviso de sucesso/erro. Recebe o estado da action; a cada novo objeto de
 * estado aparece de novo. Sucesso some sozinho; erro fica até fechar.
 */
export function Toast({ state }: { state: FormState }) {
  const [last, setLast] = useState<FormState | null>(null);
  const [visible, setVisible] = useState(false);

  if (state !== last) {
    setLast(state);
    setVisible(state.error !== null || state.success !== null);
  }

  const isError = state.error !== null;
  const message = state.error ?? state.success;

  useEffect(() => {
    if (!visible || isError) return;
    const t = window.setTimeout(() => setVisible(false), 4000);
    return () => window.clearTimeout(t);
  }, [visible, isError, state]);

  return (
    <AnimatePresence>
      {visible && message && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          aria-live={isError ? "assertive" : "polite"}
          className="pointer-events-none fixed inset-x-0 bottom-0 z-[80] flex justify-center px-5 pb-6"
        >
          <div
            className={
              "pointer-events-auto flex max-w-lg items-start gap-3 rounded-2xl border px-5 py-3.5 shadow-deep " +
              (isError ? "border-[#e2b4b4] bg-[#fff3f3] text-[#9c2626]" : "border-forest-500/40 bg-white text-forest-800")
            }
          >
            <span className="mt-0.5 text-lg leading-none" aria-hidden>
              {isError ? "⚠" : "✓"}
            </span>
            <p className="text-sm leading-relaxed">{message}</p>
            <button type="button" onClick={() => setVisible(false)} aria-label="Fechar aviso" className="ml-2 text-ink-3 hover:text-ink">
              ×
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
