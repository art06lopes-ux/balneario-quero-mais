import Link from "next/link";
import { Card, PageHeader } from "@/components/admin/PageHeader";
import { formatBRL } from "@/lib/format";
import { formatWhatsappNumber } from "@/lib/whatsapp";
import { getFeaturesForAdmin, getFoodForAdmin, getGalleryForAdmin, getSettingsRow } from "@/server/repositories/admin";

const LINKS = [
  { href: "/admin/geral", title: "Textos e imagens", desc: "Hero, Sobre, chamada final, logo e Instagram." },
  { href: "/admin/whatsapp-preco", title: "WhatsApp e preço", desc: "Número que recebe as reservas e valor da entrada." },
  { href: "/admin/atracoes", title: "Atrações", desc: "Cards do que o balneário oferece." },
  { href: "/admin/galeria", title: "Galeria", desc: "Fotos por categoria, ordem e legendas." },
  { href: "/admin/comidas", title: "Comidas", desc: "Pratos com foto, descrição e preço opcional." },
  { href: "/admin/localizacao", title: "Localização", desc: "Endereço, horário, observações e mapa." },
];

export default async function AdminHome() {
  const [s, features, foods, gallery] = await Promise.all([getSettingsRow(), getFeaturesForAdmin(), getFoodForAdmin(), getGalleryForAdmin()]);

  return (
    <>
      <PageHeader title="Painel do Balneário" description="Tudo que você altera aqui aparece no site na hora, sem precisar de ninguém técnico." />
      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="WhatsApp das reservas" value={formatWhatsappNumber(s.whatsapp_number)} href="/admin/whatsapp-preco" />
        <Stat label="Entrada por pessoa" value={formatBRL(Number(s.ticket_price))} href="/admin/whatsapp-preco" />
        <Stat label="Fotos na galeria" value={String(gallery.photos.length)} href="/admin/galeria" />
        <Stat label="Pratos cadastrados" value={String(foods.length)} href="/admin/comidas" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} className="rounded-2xl border border-forest-900/10 bg-white p-5 shadow-soft transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-card">
            <h2 className="font-display font-bold text-forest-800">{l.title}</h2>
            <p className="mt-1 text-sm text-ink-3">{l.desc}</p>
          </Link>
        ))}
      </div>
      <Card className="mt-6">
        <p className="text-sm text-ink-2">
          Atrações: <strong>{features.length}</strong> · Categorias da galeria: <strong>{gallery.categories.length}</strong>
        </p>
      </Card>
    </>
  );
}

function Stat({ label, value, href }: { label: string; value: string; href: string }) {
  return (
    <Link href={href} className="rounded-2xl border border-forest-900/10 bg-white p-4 shadow-soft">
      <span className="block text-xs font-semibold tracking-wide text-ink-3 uppercase">{label}</span>
      <strong className="mt-1 block font-display text-xl text-forest-800">{value}</strong>
    </Link>
  );
}
