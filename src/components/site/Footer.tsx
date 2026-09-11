import Link from "next/link";
import type { SiteSettings } from "@/lib/types";
import { BUSINESS_NAME } from "@/lib/types";

const LINKS = [
  ["#inicio", "Início"],
  ["#sobre", "Sobre"],
  ["#galeria", "Galeria"],
  ["#comidas", "Comidas"],
  ["#reservar", "Reservar"],
  ["#localizacao", "Localização"],
] as const;

export function Footer({ s }: { s: SiteSettings }) {
  return (
    <footer className="bg-forest-950 pt-12 pb-6 text-white/80">
      <div className="mx-auto w-[min(1180px,100%-2.5rem)]">
        <div className="flex flex-wrap items-center justify-between gap-6 border-b border-white/10 pb-6">
          <div className="flex items-center gap-3.5">
            {s.logo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={s.logo} alt={`Logo ${BUSINESS_NAME}`} width={48} height={48} className="size-12 rounded-full object-cover" />
            )}
            <div>
              <strong className="block font-display text-white">{BUSINESS_NAME}</strong>
              <span className="text-[0.85rem]">{s.address}</span>
            </div>
          </div>
          <nav className="flex flex-wrap gap-5 text-[0.9rem]" aria-label="Rodapé">
            {LINKS.map(([href, label]) => (
              <a key={href} href={href} className="transition-colors hover:text-sun-500">
                {label}
              </a>
            ))}
            {s.instagramUrl && (
              <a href={s.instagramUrl} target="_blank" rel="noopener" className="transition-colors hover:text-sun-500">
                Instagram
              </a>
            )}
          </nav>
        </div>
        <div className="flex flex-wrap justify-between gap-4 pt-5 text-[0.8rem] text-white/50">
          <span>© {new Date().getFullYear()} {BUSINESS_NAME}</span>
          <Link href="/admin" className="transition-colors hover:text-white/80">
            Área do administrador
          </Link>
        </div>
      </div>
    </footer>
  );
}
