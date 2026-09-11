"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { BUSINESS_NAME } from "@/lib/types";
import { whatsappLink } from "@/lib/whatsapp";

const GREETING = `Olá! Vim pelo site do ${BUSINESS_NAME} e gostaria de mais informações.`;

/** Botão fixo. Some enquanto o cartão de reserva está visível no mobile. */
export function FloatingWhatsApp({ number }: { number: string }) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const card = document.getElementById("ticket-card");
    if (!card) return;
    const mq = window.matchMedia("(max-width: 900px)");
    const io = new IntersectionObserver(([e]) => setHidden(mq.matches && (e?.isIntersecting ?? false)), { threshold: 0.15 });
    io.observe(card);
    return () => io.disconnect();
  }, []);

  return (
    <motion.a
      href={whatsappLink(number, GREETING)}
      target="_blank"
      rel="noopener"
      aria-label="Falar no WhatsApp"
      animate={{ opacity: hidden ? 0 : 1, scale: hidden ? 0.6 : 1 }}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.95 }}
      style={{ pointerEvents: hidden ? "none" : "auto" }}
      className="group fixed right-5 bottom-5 z-[60] grid size-[60px] place-items-center rounded-full bg-wa text-white shadow-wa max-md:size-[54px]"
    >
      <span className="absolute inset-0 -z-10 rounded-full bg-wa motion-safe:animate-[waPulse_2.2s_ease-out_infinite]" aria-hidden />
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-8"><path fill="currentColor" d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-1 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.5-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.3-.6-.4M12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.3 5L2 22l5.2-1.4c1.4.8 3.1 1.2 4.8 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2m0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3.1.8.8-3-.2-.3C4 15 3.7 13.5 3.7 12c0-4.6 3.7-8.3 8.3-8.3s8.3 3.7 8.3 8.3-3.7 8.2-8.3 8.2"/></svg>
      <span className="pointer-events-none absolute top-1/2 right-[calc(100%+.8rem)] -translate-y-1/2 rounded-lg bg-forest-900 px-3 py-1.5 text-[0.82rem] font-medium whitespace-nowrap opacity-0 transition-opacity group-hover:opacity-100">
        Fale conosco
      </span>
    </motion.a>
  );
}
