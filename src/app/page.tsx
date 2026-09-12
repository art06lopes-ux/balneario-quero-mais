import type { Metadata } from "next";
import { About } from "@/components/site/About";
import { Booking } from "@/components/site/Booking";
import { Features } from "@/components/site/Features";
import { FinalCTA } from "@/components/site/FinalCTA";
import { FloatingWhatsApp } from "@/components/site/FloatingWhatsApp";
import { Foods } from "@/components/site/Foods";
import { Footer } from "@/components/site/Footer";
import { Gallery } from "@/components/site/Gallery";
import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { Location } from "@/components/site/Location";
import { FAQ } from "@/components/site/FAQ";
import { buildFaq } from "@/lib/faq";
import { MobileCTA } from "@/components/site/MobileCTA";
import { Marquee, ScrollProgress } from "@/components/site/motion";
import { SmoothScroll } from "@/components/site/SmoothScroll";
import { getSiteUrl } from "@/lib/env";
import { formatBRL } from "@/lib/format";
import { priceUnitLabel } from "@/lib/pricing";
import { BUSINESS_NAME } from "@/lib/types";
import { getSiteContent } from "@/server/repositories/content";

/**
 * Estático com revalidação: o painel chama revalidatePath("/") a cada
 * mudança, então o site reflete na hora. O intervalo abaixo é só uma
 * rede de segurança.
 */
export const revalidate = 300;

function absolute(url: string | null): string | undefined {
  if (!url) return undefined;
  return url.startsWith("http") ? url : `${getSiteUrl()}${url}`;
}

export async function generateMetadata(): Promise<Metadata> {
  const { settings: s } = await getSiteContent();
  const title = `${BUSINESS_NAME} — ${s.address}`;
  const description = `${s.heroSubtitle} Entrada ${formatBRL(s.ticketPrice)} ${priceUnitLabel(s.chargeMode)}. ${s.hours}.`;
  const image = absolute(s.heroImage);
  return {
    metadataBase: new URL(getSiteUrl()),
    title,
    description,
    alternates: { canonical: "/" },
    icons: s.logo ? { icon: s.logo } : undefined,
    openGraph: {
      type: "website",
      locale: "pt_BR",
      siteName: BUSINESS_NAME,
      title,
      description,
      url: "/",
      images: image ? [{ url: image, width: 1200, height: 630, alt: BUSINESS_NAME }] : [],
    },
    twitter: { card: "summary_large_image", title, description, images: image ? [image] : [] },
  };
}

export default async function HomePage() {
  const { settings, features, gallery, foods } = await getSiteContent();

  const faq = buildFaq(settings);
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    name: BUSINESS_NAME,
    description: settings.heroSubtitle,
    address: settings.address,
    image: absolute(settings.heroImage),
    url: getSiteUrl(),
    openingHours: "Mo-Su",
    sameAs: settings.instagramUrl ? [settings.instagramUrl] : undefined,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <SmoothScroll>
      <ScrollProgress />
      <Header logo={settings.logo} />
      <main id="conteudo">
        <Hero s={settings} />
        <Marquee
          items={["Igarapé de água escura", "Redário dentro d\u2019água", "Bar & restaurante", "Aberto todos os dias", "Km 19 · Estrada de Novo Airão", "Peixe grelhado"]}
          className="border-y border-forest-900/10 bg-sand-2 py-3 text-forest-800"
        />
        <About s={settings} />
        <Features items={features} />
        <Gallery categories={gallery} />
        <Foods items={foods} />
        <Booking
          whatsappNumber={settings.whatsappNumber}
          ticketPrice={settings.ticketPrice}
          chargeMode={settings.chargeMode}
          extraHolidays={settings.extraHolidays}
          pricingNote={settings.pricingNote}
        />
        <FAQ items={faq} />
        <FinalCTA s={settings} />
        <Location s={settings} />
      </main>
      <Footer s={settings} />
      <FloatingWhatsApp number={settings.whatsappNumber} />
      <MobileCTA price={settings.ticketPrice} chargeMode={settings.chargeMode} />
      </SmoothScroll>
    </>
  );
}
