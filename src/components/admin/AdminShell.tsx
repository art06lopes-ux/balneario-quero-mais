"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  IconClose,
  IconEdit,
  IconExternal,
  IconFood,
  IconGrid,
  IconHome,
  IconImage,
  IconLogout,
  IconMenu,
  IconPhone,
  IconPin,
} from "@/components/admin/icons";
import { signOut } from "@/server/actions/auth";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Início", Icon: IconHome },
  { href: "/admin/geral", label: "Textos e imagens", Icon: IconEdit },
  { href: "/admin/whatsapp-preco", label: "WhatsApp e preço", Icon: IconPhone },
  { href: "/admin/atracoes", label: "Atrações", Icon: IconGrid },
  { href: "/admin/galeria", label: "Galeria", Icon: IconImage },
  { href: "/admin/comidas", label: "Comidas", Icon: IconFood },
  { href: "/admin/localizacao", label: "Localização", Icon: IconPin },
];

export function AdminShell({
  email,
  logo,
  children,
}: {
  email: string;
  logo: string | null;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="grid gap-1" aria-label="Painel">
      {NAV.map(({ href, label, Icon }) => {
        const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3.5 py-2.5 font-display text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sun-500",
              active
                ? "bg-sun-500 text-forest-900"
                : "text-white/80 hover:bg-white/10 hover:text-white",
            )}
          >
            <Icon className="size-[18px] shrink-0 opacity-90" />
            {label}
          </Link>
        );
      })}
    </nav>
  );

  const account = (
    <div className="grid gap-3 border-t border-white/10 pt-4 text-xs text-white/60">
      <span className="truncate" title={email}>
        {email}
      </span>
      <div className="flex gap-2">
        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 font-semibold text-white hover:bg-white/20"
        >
          Ver site <IconExternal className="size-3.5" />
        </Link>
        <form action={signOut}>
          <button
            type="submit"
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold text-white/80 hover:bg-white/10"
          >
            <IconLogout className="size-3.5" /> Sair
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-svh bg-[#f4f6f4] lg:grid lg:grid-cols-[260px_1fr]">
      {/* Sidebar (desktop) */}
      <aside className="sticky top-0 hidden h-svh flex-col gap-6 overflow-y-auto bg-forest-900 p-5 lg:flex">
        <Brand logo={logo} />
        {nav}
        <div className="mt-auto">{account}</div>
      </aside>

      {/* Topbar (mobile) */}
      <div className="sticky top-0 z-40 flex items-center justify-between bg-forest-900 px-4 py-3 lg:hidden">
        <Brand logo={logo} compact />
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Fechar menu do painel" : "Abrir menu do painel"}
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold text-white"
        >
          {open ? <IconClose className="size-4" /> : <IconMenu className="size-4" />}
          {open ? "Fechar" : "Menu"}
        </button>
      </div>
      {open && (
        <div className="grid gap-4 bg-forest-900 px-4 pb-5 lg:hidden">
          {nav}
          {account}
        </div>
      )}

      <main className="min-w-0 px-4 py-6 sm:px-8 sm:py-8">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}

function Brand({ logo, compact }: { logo: string | null; compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      {logo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logo}
          alt=""
          className={cn(
            "rounded-full object-cover ring-2 ring-white/20",
            compact ? "size-9" : "size-11",
          )}
        />
      )}
      <div className="leading-tight">
        <strong className="block font-display text-white">Quero Mais</strong>
        <span className="text-xs text-white/60">Painel administrativo</span>
      </div>
    </div>
  );
}
