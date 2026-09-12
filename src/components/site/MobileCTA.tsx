"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { formatBRL } from "@/lib/format";
import { priceUnitLabel, type ChargeMode } from "@/lib/pricing";

/**
 * Barra de reserva fixa no celular, na zona do polegar. Aparece depois do
 * hero e some quando o cartão de reserva (ou o rodapé) está na tela.
 */
export function MobileCTA({ price, chargeMode }: { price: number; chargeMode: ChargeMode }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("inicio");
    const ticket = document.getElementById("ticket-card");
    const footer = document.querySelector("footer");
    if (!hero) return;

    let heroVisible = true;
    let ticketVisible = false;
    let footerVisible = false;
    const update = () => {
      const visible = !heroVisible && !ticketVisible && !footerVisible;
      setShow(visible);
      // Avisa o botão flutuante do WhatsApp para subir e não cobrir a barra.
      document.body.toggleAttribute("data-mobile-cta", visible);
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.target === hero) heroVisible = e.isIntersecting;
          if (e.target === ticket) ticketVisible = e.isIntersecting;
          if (e.target === footer) footerVisible = e.isIntersecting;
        }
        update();
      },
      { threshold: 0.05 },
    );
    io.observe(hero);
    if (ticket) io.observe(ticket);
    if (footer) io.observe(footer);
    return () => {
      io.disconnect();
      document.body.removeAttribute("data-mobile-cta");
    };
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 90, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 90, opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 30 }}
          className="fixed inset-x-3 bottom-3 z-[55] flex items-center gap-3 rounded-2xl border border-white/15 bg-forest-950/95 p-2 pl-4 text-white shadow-deep md:hidden"
          style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
        >
          <div className="min-w-0 flex-1 leading-tight">
            <span className="block font-display text-lg font-extrabold">{formatBRL(price)}</span>
            <span className="block truncate text-[11px] text-white/70">{priceUnitLabel(chargeMode)}</span>
          </div>
          <a href="#reservar" className="btn btn-sun shrink-0 px-5 py-3 text-sm">
            Reservar entrada
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
