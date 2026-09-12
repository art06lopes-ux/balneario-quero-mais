"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo3D } from "@/components/site/Logo3D";
import { cn } from "@/lib/utils";

const NAV = [
  ["#inicio", "Início"],
  ["#sobre", "Sobre"],
  ["#atracoes", "Atrações"],
  ["#galeria", "Galeria"],
  ["#comidas", "Comidas"],
  ["#reservar", "Reservar"],
  ["#localizacao", "Localização"],
] as const;

export function Header({ logo }: { logo: string | null }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const dark = scrolled || open;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 h-[76px] transition-[background-color,box-shadow,backdrop-filter] duration-300",
        scrolled && !open && "bg-sand/90 shadow-[0_4px_24px_rgba(8,47,34,.10)] backdrop-blur-xl",
        open && "bg-forest-950",
      )}
    >
      <div className="mx-auto flex h-full w-[min(1180px,100%-2.5rem)] items-center justify-between gap-4">
        <Link href="#inicio" aria-label="Balneário Quero Mais — início" className="shrink-0">
          {logo ? (
            <Logo3D src={logo} size={scrolled ? 46 : 54} tilt={14} className="transition-[width,height] duration-300" />
          ) : (
            <span className="font-display text-lg font-extrabold text-white">Quero Mais</span>
          )}
        </Link>

        {/* Desktop */}
        <nav className="hidden items-center gap-6 lg:flex" aria-label="Navegação principal">
          {NAV.map(([href, label]) => (
            <a
              key={href}
              href={href}
              className={cn(
                "group relative font-display text-[0.95rem] font-semibold transition-colors",
                scrolled ? "text-forest-800" : "text-white [text-shadow:0_1px_6px_rgba(0,0,0,.35)]",
              )}
            >
              {label}
              <span className="absolute -bottom-1.5 left-0 h-0.5 w-full origin-left scale-x-0 bg-sun-500 transition-transform duration-250 group-hover:scale-x-100" />
            </a>
          ))}
          <a href="#reservar" className="btn btn-sun ml-1">
            Reservar Entrada
          </a>
        </nav>

        {/* Mobile */}
        <div className="flex items-center gap-2 lg:hidden">
          <a href="#reservar" className="btn btn-sun hidden px-4 py-2.5 text-sm sm:inline-flex">
            Reservar
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
            className={cn(
              "flex size-11 flex-col items-center justify-center gap-[5px] rounded-xl backdrop-blur-md transition-colors",
              dark ? "bg-forest-100" : "bg-white/15",
              open && "bg-white/15",
            )}
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={cn(
                  "h-0.5 w-5 rounded-full transition-all duration-300",
                  dark && !open ? "bg-forest-800" : "bg-white",
                  open && i === 0 && "translate-y-[7px] rotate-45",
                  open && i === 1 && "opacity-0",
                  open && i === 2 && "-translate-y-[7px] -rotate-45",
                )}
              />
            ))}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            key="mobile-nav"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-x-0 top-[76px] bottom-0 flex flex-col overflow-y-auto bg-forest-950 px-6 pt-2 pb-8 lg:hidden"
            aria-label="Menu"
          >
            {NAV.map(([href, label], i) => (
              <motion.a
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 + i * 0.04 }}
                className="border-b border-white/10 py-4 font-display text-lg font-semibold text-white"
              >
                {label}
              </motion.a>
            ))}
            <a href="#reservar" onClick={() => setOpen(false)} className="btn btn-sun btn-lg mt-6">
              Reservar Entrada
            </a>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
