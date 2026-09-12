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
  ["#perguntas", "Dúvidas"],
  ["#localizacao", "Localização"],
] as const;

export function Header({ logo }: { logo: string | null }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("#inicio");

  // Scroll spy: destaca no menu a seção que ocupa o meio da tela.
  useEffect(() => {
    const ids = NAV.map(([h]) => h.slice(1));
    const els = ids.map((id) => document.getElementById(id)).filter((e): e is HTMLElement => e !== null);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(`#${e.target.id}`);
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

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
    <>
    <a
      href="#conteudo"
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-lg focus:bg-sun-500 focus:px-4 focus:py-2 focus:font-display focus:font-bold focus:text-forest-900"
    >
      Pular para o conteúdo
    </a>
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 h-[76px] transition-[background-color,box-shadow,backdrop-filter] duration-300",
        scrolled && !open && "bg-sand/95 shadow-[0_4px_24px_rgba(8,47,34,.10)] backdrop-blur-md",
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
          {NAV.map(([href, label]) => {
            const on = active === href;
            return (
              <a
                key={href}
                href={href}
                aria-current={on ? "true" : undefined}
                className={cn(
                  "group relative rounded-md font-display text-[0.95rem] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sun-500",
                  scrolled ? "text-forest-800" : "text-white [text-shadow:0_1px_6px_rgba(0,0,0,.35)]",
                )}
              >
                {label}
                <span
                  className={cn(
                    "absolute -bottom-1.5 left-0 h-0.5 w-full origin-left bg-sun-500 transition-transform duration-300",
                    on ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
                  )}
                />
              </a>
            );
          })}
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
    </>
  );
}
