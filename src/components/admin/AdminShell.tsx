"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { signOut } from "@/server/actions/auth";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Início", icon: "⌂" },
  { href: "/admin/geral", label: "Textos e imagens", icon: "✎" },
  { href: "/admin/whatsapp-preco", label: "WhatsApp e preço", icon: "☏" },
  { href: "/admin/estrutura", label: "Estrutura", icon: "▦" },
  { href: "/admin/galeria", label: "Galeria", icon: "▣" },
  { href: "/admin/comidas", label: "Comidas", icon: "♨" },
  { href: "/admin/localizacao", label: "Localização", icon: "◎" },
];

export function AdminShell({ email, logo, children }: { email: string; logo: string | null; children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="grid gap-1" aria-label="Painel">
      {NAV.map((n) => {
        const active = n.href === "/admin" ? pathname === "/admin" : pathname.startsWith(n.href);
        return (
          <Link
            key={n.href}
            href={n.href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3.5 py-2.5 font-display text-sm font-semibold transition-colors",
              active ? "bg-sun-500 text-forest-900" : "text-white/80 hover:bg-white/10 hover:text-white",
            )}
          >
            <span className="w-5 text-center text-base opacity-80" aria-hidden>
              {n.icon}
            </span>
            {n.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-svh bg-[#f4f6f4] lg:grid lg:grid-cols-[260px_1fr]">
      {/* Sidebar (desktop) */}
      <aside className="hidden flex-col gap-6 bg-forest-900 p-5 lg:flex">
        <Brand logo={logo} />
        {nav}
        <div className="mt-auto grid gap-3 border-t border-white/10 pt-4 text-xs text-white/60">
          <span className="truncate" title={email}>{email}</span>
          <div className="flex gap-2">
            <Link href="/" target="_blank" className="rounded-lg bg-white/10 px-3 py-1.5 font-semibold text-white hover:bg-white/20">
              Ver site ↗
            </Link>
            <form action={signOut}>
              <button type="submit" className="rounded-lg px-3 py-1.5 font-semibold text-white/80 hover:bg-white/10">
                Sair
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Topbar (mobile) */}
      <div className="flex items-center justify-between bg-forest-900 px-4 py-3 lg:hidden">
        <Brand logo={logo} compact />
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Menu do painel"
          className="rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold text-white"
        >
          {open ? "Fechar" : "Menu"}
        </button>
      </div>
      {open && (
        <div className="grid gap-4 bg-forest-900 px-4 pb-5 lg:hidden">
          {nav}
          <div className="flex items-center justify-between border-t border-white/10 pt-3 text-xs text-white/60">
            <span className="truncate">{email}</span>
            <form action={signOut}>
              <button type="submit" className="font-semibold text-white">Sair</button>
            </form>
          </div>
        </div>
      )}

      <main className="min-w-0 px-4 py-6 sm:px-8 sm:py-8">{children}</main>
    </div>
  );
}

function Brand({ logo, compact }: { logo: string | null; compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      {logo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logo} alt="" className={cn("rounded-full object-cover", compact ? "size-9" : "size-11")} />
      )}
      <div className="leading-tight">
        <strong className="block font-display text-white">Quero Mais</strong>
        <span className="text-xs text-white/60">Painel administrativo</span>
      </div>
    </div>
  );
}
