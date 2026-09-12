import { Reveal } from "@/components/site/Reveal";
import { SectionTitle } from "@/components/site/SectionTitle";
import type { SiteSettings } from "@/lib/types";
import { formatWhatsappNumber, whatsappLink } from "@/lib/whatsapp";

const WA_ICON = (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6"><path fill="currentColor" d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-1 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.5-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.3-.6-.4M12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.3 5L2 22l5.2-1.4c1.4.8 3.1 1.2 4.8 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2m0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3.1.8.8-3-.2-.3C4 15 3.7 13.5 3.7 12c0-4.6 3.7-8.3 8.3-8.3s8.3 3.7 8.3 8.3-3.7 8.2-8.3 8.2"/></svg>
);

export function Location({ s }: { s: SiteSettings }) {
  const mapSrc = s.mapsQuery
    ? `https://www.google.com/maps?q=${encodeURIComponent(s.mapsQuery)}&z=13&output=embed`
    : null;

  return (
    <section id="localizacao" className="py-[clamp(4rem,9vw,7.5rem)]">
      <div className="mx-auto grid w-[min(1180px,100%-2.5rem)] items-start gap-[clamp(2rem,5vw,4rem)] md:grid-cols-[1fr_1.3fr]">
        <div>
          <SectionTitle index="06" eyebrow="Localização" title="Como chegar" className="mb-4" />

          <Reveal delay={0.1}>
            <Info
              icon={<svg viewBox="0 0 24 24" aria-hidden="true" className="size-6"><path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7m0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5"/></svg>}
              title="Endereço"
            >
              {s.address}
            </Info>
          </Reveal>
          {s.hours && (
            <Reveal delay={0.15}>
              <Info
                icon={<svg viewBox="0 0 24 24" aria-hidden="true" className="size-6"><path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20m0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16m.5-13H11v6l5.2 3.1.8-1.2-4.5-2.7z"/></svg>}
                title="Funcionamento"
              >
                {s.hours}
              </Info>
            </Reveal>
          )}
          <Reveal delay={0.2}>
            <Info icon={WA_ICON} title="WhatsApp">
              <a href={whatsappLink(s.whatsappNumber)} target="_blank" rel="noopener" className="font-semibold text-forest-700 underline underline-offset-4">
                {formatWhatsappNumber(s.whatsappNumber)}
              </a>
            </Info>
          </Reveal>
          {s.locationNotes && (
            <Reveal delay={0.25}>
              <p className="mt-4 text-[0.95rem] leading-relaxed whitespace-pre-line text-ink-2">{s.locationNotes}</p>
            </Reveal>
          )}
        </div>

        {mapSrc && (
          <Reveal delay={0.1} className="aspect-[4/3] overflow-hidden rounded-xl2 bg-river-100 shadow-card">
            <iframe
              title={`Mapa — ${s.address}`}
              src={mapSrc}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              className="block h-full w-full border-0"
            />
          </Reveal>
        )}
      </div>
    </section>
  );
}

function Info({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4 border-b border-forest-900/10 py-5 last:border-b-0">
      <div className="grid size-[46px] shrink-0 place-items-center rounded-xl bg-forest-100 text-forest-700">{icon}</div>
      <div>
        <strong className="mb-0.5 block font-display">{title}</strong>
        <p className="whitespace-pre-line text-ink-2">{children}</p>
      </div>
    </div>
  );
}
