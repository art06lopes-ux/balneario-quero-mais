"use client";

import { useActionState } from "react";
import { ImageField } from "@/components/admin/ImageField";
import { Card } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { Toast } from "@/components/ui/Toast";
import { formatWhatsappNumber } from "@/lib/whatsapp";
import { updateCommerce, updateGeneral, updateLocation } from "@/server/actions/settings";
import type { SettingsRow } from "@/server/repositories/content";

const IDLE = { error: null, success: null };

type Urls = { hero: string | null; about: string | null; aboutSecondary: string | null; cta: string | null; logo: string | null };

export function GeneralForm({ row, urls }: { row: SettingsRow; urls: Urls }) {
  const [state, action, pending] = useActionState(updateGeneral, IDLE);
  return (
    <form action={action} className="grid gap-6">
      <Card title="Hero (topo do site)">
        <div className="grid gap-4">
          <Field label="Linha pequena acima do título" htmlFor="hero_kicker">
            <Input id="hero_kicker" name="hero_kicker" defaultValue={row.hero_kicker} maxLength={120} />
          </Field>
          <Field label="Título" htmlFor="hero_title" hint="As duas últimas palavras ficam em amarelo.">
            <Input id="hero_title" name="hero_title" defaultValue={row.hero_title} maxLength={80} required />
          </Field>
          <Field label="Frase de impacto" htmlFor="hero_subtitle">
            <Textarea id="hero_subtitle" name="hero_subtitle" defaultValue={row.hero_subtitle} maxLength={300} />
          </Field>
          <ImageField name="hero_image" label="Foto de fundo do Hero" current={urls.hero} hint="Use a foto mais impactante, na horizontal. Ela também é a imagem de compartilhamento no WhatsApp/Instagram." />
        </div>
      </Card>

      <Card title="Sobre o balneário">
        <div className="grid gap-4">
          <Field label="Título" htmlFor="about_title">
            <Input id="about_title" name="about_title" defaultValue={row.about_title} maxLength={120} />
          </Field>
          <Field label="Texto" htmlFor="about_text" hint="Deixe uma linha em branco para separar parágrafos.">
            <Textarea id="about_text" name="about_text" defaultValue={row.about_text} maxLength={3000} className="min-h-[180px]" />
          </Field>
          <ImageField name="about_image" label="Foto principal (vertical)" current={urls.about} aspect="aspect-[4/5]" />
          <ImageField name="about_image_secondary" label="Foto secundária (quadrada)" current={urls.aboutSecondary} removable aspect="aspect-square" />
        </div>
      </Card>

      <Card title="Chamada final">
        <div className="grid gap-4">
          <Field label="Frase" htmlFor="cta_title">
            <Input id="cta_title" name="cta_title" defaultValue={row.cta_title} maxLength={120} />
          </Field>
          <Field label="Linha de apoio" htmlFor="cta_text">
            <Input id="cta_text" name="cta_text" defaultValue={row.cta_text} maxLength={300} />
          </Field>
          <ImageField name="cta_image" label="Foto de fundo" current={urls.cta} removable />
        </div>
      </Card>

      <Card title="Logo e redes">
        <div className="grid gap-4">
          <ImageField name="logo" label="Logo oficial" current={urls.logo} aspect="aspect-square" hint="Arquivo quadrado (PNG ou JPG). Ela aparece no cabeçalho, no hero e no rodapé." />
          <Field label="Link do Instagram" htmlFor="instagram_url">
            <Input id="instagram_url" name="instagram_url" type="url" defaultValue={row.instagram_url} placeholder="https://www.instagram.com/…" />
          </Field>
        </div>
      </Card>

      <div className="sticky bottom-4 flex justify-end">
        <Button type="submit" size="lg" loading={pending} className="shadow-deep">
          Salvar alterações
        </Button>
      </div>
      <Toast state={state} />
    </form>
  );
}

export function CommerceForm({ row }: { row: SettingsRow }) {
  const [state, action, pending] = useActionState(updateCommerce, IDLE);
  const price = Number(row.ticket_price).toFixed(2).replace(".", ",");
  return (
    <form action={action} className="grid gap-6">
      <Card title="WhatsApp">
        <Field label="Número que recebe as reservas" htmlFor="whatsapp_number" hint={`Só números, com DDI e DDD. Hoje: ${formatWhatsappNumber(row.whatsapp_number)}. Ex.: 5592999999999`}>
          <Input id="whatsapp_number" name="whatsapp_number" inputMode="numeric" defaultValue={row.whatsapp_number} pattern="[0-9]{10,15}" required />
        </Field>
        <p className="mt-3 text-xs text-ink-3">Este número é usado em todos os botões de reserva, no botão flutuante e na seção de localização.</p>
      </Card>
      <Card title="Preço da entrada">
        <Field label="Valor por pessoa (R$)" htmlFor="ticket_price">
          <Input id="ticket_price" name="ticket_price" inputMode="decimal" defaultValue={price} required className="max-w-[200px]" />
        </Field>
        <p className="mt-3 text-xs text-ink-3">O total da reserva é calculado automaticamente: quantidade de pessoas × este valor.</p>
      </Card>
      <div className="flex justify-end">
        <Button type="submit" size="lg" loading={pending}>Salvar</Button>
      </div>
      <Toast state={state} />
    </form>
  );
}

export function LocationForm({ row }: { row: SettingsRow }) {
  const [state, action, pending] = useActionState(updateLocation, IDLE);
  return (
    <form action={action} className="grid gap-6">
      <Card title="Endereço e funcionamento">
        <div className="grid gap-4">
          <Field label="Endereço" htmlFor="address">
            <Input id="address" name="address" defaultValue={row.address} maxLength={200} required />
          </Field>
          <Field label="Horário de funcionamento" htmlFor="hours">
            <Input id="hours" name="hours" defaultValue={row.hours} maxLength={200} />
          </Field>
          <Field label="Observações (opcional)" htmlFor="location_notes" hint="Aparece abaixo das informações. Ex.: como chegar, estacionamento, avisos.">
            <Textarea id="location_notes" name="location_notes" defaultValue={row.location_notes} maxLength={1000} />
          </Field>
        </div>
      </Card>
      <Card title="Mapa">
        <Field label="Busca do Google Maps" htmlFor="maps_query" hint="O que o mapa procura para colocar o pino. O nome do balneário costuma funcionar melhor que o endereço. Deixe vazio para esconder o mapa.">
          <Input id="maps_query" name="maps_query" defaultValue={row.maps_query} maxLength={200} />
        </Field>
      </Card>
      <div className="flex justify-end">
        <Button type="submit" size="lg" loading={pending}>Salvar</Button>
      </div>
      <Toast state={state} />
    </form>
  );
}
