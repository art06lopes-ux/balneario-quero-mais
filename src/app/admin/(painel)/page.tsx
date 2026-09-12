import Link from "next/link";
import { IconAlert, IconCheck } from "@/components/admin/icons";
import { Card, PageHeader } from "@/components/admin/PageHeader";
import { RefreshSiteButton } from "@/components/admin/RefreshSiteButton";
import { getSupabaseUrl } from "@/lib/env";
import { formatBRL } from "@/lib/format";
import { imageUrl } from "@/lib/storage";
import { formatWhatsappNumber } from "@/lib/whatsapp";
import {
  getFeaturesForAdmin,
  getFoodForAdmin,
  getGalleryForAdmin,
  getSettingsRow,
} from "@/server/repositories/admin";

const LINKS = [
  {
    href: "/admin/geral",
    title: "Textos e imagens",
    desc: "Hero, Sobre, chamada final, logo, Instagram e prova social.",
  },
  {
    href: "/admin/whatsapp-preco",
    title: "WhatsApp e preço",
    desc: "Número que recebe as reservas, valor e dias de cobrança.",
  },
  { href: "/admin/atracoes", title: "Atrações", desc: "Cards do que o balneário oferece." },
  { href: "/admin/galeria", title: "Galeria", desc: "Fotos por categoria, ordem e legendas." },
  {
    href: "/admin/comidas",
    title: "Comidas",
    desc: "Pratos com foto, descrição e preço opcional.",
  },
  {
    href: "/admin/localizacao",
    title: "Localização",
    desc: "Endereço, horário, observações e mapa.",
  },
];

type Todo = { ok: boolean; text: string; href: string };

export default async function AdminHome() {
  const [s, features, foods, gallery] = await Promise.all([
    getSettingsRow(),
    getFeaturesForAdmin(),
    getFoodForAdmin(),
    getGalleryForAdmin(),
  ]);
  const base = getSupabaseUrl();

  const holidaysOk = (s.extra_holidays ?? "").trim() !== "" || s.charge_mode !== "sundays_holidays";
  const todos: Todo[] = [
    {
      ok: holidaysOk,
      text: holidaysOk
        ? "Feriados do Amazonas e de Novo Airão cadastrados."
        : "Cadastre os feriados do Amazonas e de Novo Airão (os nacionais já são automáticos).",
      href: "/admin/whatsapp-preco",
    },
  ];
  const pending = todos.filter((t) => !t.ok).length;
  const hero = imageUrl(s.hero_image_path, base);
  const updated = s.updated_at
    ? new Date(s.updated_at).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })
    : null;

  return (
    <>
      <PageHeader
        title="Painel do Balneário"
        description="Tudo que você altera aqui aparece no site na hora."
        siteAnchor=""
        action={<RefreshSiteButton />}
      />

      <div className="mb-6 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <Card
          title={
            pending === 0
              ? "Tudo em dia"
              : `${pending} pendência${pending > 1 ? "s" : ""} para o site ficar 100%`
          }
        >
          <ul className="grid gap-2.5">
            {todos.map((t) => (
              <li key={t.text} className="flex items-start gap-3 text-sm">
                <span
                  className={
                    "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full " +
                    (t.ok ? "bg-forest-100 text-forest-700" : "bg-sun-500/20 text-ember-500")
                  }
                >
                  {t.ok ? <IconCheck className="size-3.5" /> : <IconAlert className="size-3.5" />}
                </span>
                <span className={t.ok ? "text-ink-3" : "text-ink"}>
                  {t.text}{" "}
                  {!t.ok && (
                    <Link
                      href={t.href}
                      className="font-semibold text-forest-700 underline underline-offset-2"
                    >
                      Resolver
                    </Link>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Como o site está agora">
          <div className="grid gap-3">
            <div className="relative aspect-video overflow-hidden rounded-xl bg-forest-100">
              {hero && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={hero}
                  alt="Foto atual do topo do site"
                  className="h-full w-full object-cover"
                />
              )}
              <span className="absolute bottom-2 left-2 rounded-full bg-forest-950/80 px-2.5 py-1 text-[11px] font-semibold text-white">
                Foto do topo
              </span>
            </div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
              <dt className="text-ink-3">WhatsApp</dt>
              <dd className="font-semibold text-forest-800">
                {formatWhatsappNumber(s.whatsapp_number)}
              </dd>
              <dt className="text-ink-3">Entrada</dt>
              <dd className="font-semibold text-forest-800">
                {formatBRL(Number(s.ticket_price))}
                {s.charge_mode === "sundays_holidays" ? " · dom. e feriados" : ""}
              </dd>
              <dt className="text-ink-3">Galeria</dt>
              <dd className="font-semibold text-forest-800">
                {gallery.photos.length} fotos · {gallery.categories.length} categorias
              </dd>
              <dt className="text-ink-3">Atrações / pratos</dt>
              <dd className="font-semibold text-forest-800">
                {features.length} / {foods.length}
              </dd>
              {updated && (
                <>
                  <dt className="text-ink-3">Última alteração</dt>
                  <dd className="font-semibold text-forest-800">{updated}</dd>
                </>
              )}
            </dl>
          </div>
        </Card>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="rounded-2xl border border-forest-900/10 bg-white p-5 shadow-soft transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-card"
          >
            <h2 className="font-display font-bold text-forest-800">{l.title}</h2>
            <p className="mt-1 text-sm text-ink-3">{l.desc}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
