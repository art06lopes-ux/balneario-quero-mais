import Link from "next/link";
import type { SiteSettings } from "@/lib/types";
import { BUSINESS_NAME } from "@/lib/types";
import { formatWhatsappNumber, whatsappLink } from "@/lib/whatsapp";

const LINKS = [
  ["#sobre", "Sobre"],
  ["#atracoes", "Atrações"],
  ["#galeria", "Galeria"],
  ["#comidas", "Comidas"],
  ["#reservar", "Reservar"],
  ["#perguntas", "Dúvidas"],
  ["#localizacao", "Localização"],
] as const;

export function Footer({ s }: { s: SiteSettings }) {
  return (
    <footer className="relative overflow-hidden bg-forest-950 pt-16 pb-6 text-white/80">
      {/* Onda de entrada + brilho orgânico */}
      <svg className="absolute inset-x-0 top-0 h-[40px] w-full text-sand sm:h-[60px]" viewBox="0 0 1440 60" preserveAspectRatio="none" aria-hidden>
        <path fill="currentColor" d="M0,0 L1440,0 L1440,20 C1200,60 960,60 720,30 C480,0 240,0 0,30 Z" />
      </svg>
      <div className="pointer-events-none absolute -bottom-40 -left-20 size-[420px] rounded-full [background:radial-gradient(circle,rgba(31,138,76,0.32)_0%,transparent_70%)]" aria-hidden />

      <div className="mx-auto w-[min(1180px,100%-2.5rem)] pt-8">
        <div className="grid gap-10 border-b border-white/10 pb-10 md:grid-cols-[1.3fr_0.8fr_1fr]">
          <div>
            <div className="mb-4 flex items-center gap-3.5">
              {s.logo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.logo} alt={`Logo ${BUSINESS_NAME}`} width={56} height={56} className="size-14 rounded-full object-cover ring-2 ring-white/20" />
              )}
              <strong className="font-display text-xl text-white">{BUSINESS_NAME}</strong>
            </div>
            <p className="max-w-[380px] text-[0.95rem] leading-relaxed text-white/65">{s.heroSubtitle}</p>
          </div>

          <nav aria-label="Rodapé" className="grid content-start gap-2.5 text-[0.95rem]">
            <span className="mb-1 font-display text-xs font-semibold tracking-[0.18em] text-sun-500 uppercase">Navegação</span>
            {LINKS.map(([href, label]) => (
              <a key={href} href={href} className="w-fit transition-colors hover:text-sun-500">
                {label}
              </a>
            ))}
          </nav>

          <div className="grid content-start gap-3 text-[0.95rem]">
            <span className="mb-1 font-display text-xs font-semibold tracking-[0.18em] text-sun-500 uppercase">Contato</span>
            <p className="whitespace-pre-line text-white/75">{s.address}</p>
            {s.hours && <p className="text-white/60">{s.hours}</p>}
            <a href={whatsappLink(s.whatsappNumber)} target="_blank" rel="noopener" className="inline-flex w-fit items-center gap-2 font-semibold text-white transition-colors hover:text-wa">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5"><path fill="currentColor" d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-1 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.5-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.3-.6-.4M12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.3 5L2 22l5.2-1.4c1.4.8 3.1 1.2 4.8 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2m0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3.1.8.8-3-.2-.3C4 15 3.7 13.5 3.7 12c0-4.6 3.7-8.3 8.3-8.3s8.3 3.7 8.3 8.3-3.7 8.2-8.3 8.2"/></svg>
              {formatWhatsappNumber(s.whatsappNumber)}
            </a>
            {s.instagramUrl && (
              <a href={s.instagramUrl} target="_blank" rel="noopener" className="inline-flex w-fit items-center gap-2 font-semibold text-white transition-colors hover:text-sun-500">
                <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="3.8" /><circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" /></svg>
                Instagram
              </a>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-5 text-[0.8rem] text-white/45">
          <span>© {new Date().getFullYear()} {BUSINESS_NAME}. Todos os direitos reservados.</span>
          <Link href="/admin" className="transition-colors hover:text-white/80">
            Área do administrador
          </Link>
        </div>
      </div>
    </footer>
  );
}
