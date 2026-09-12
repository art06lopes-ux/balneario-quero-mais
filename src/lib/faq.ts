import { formatBRL } from "@/lib/format";
import type { SiteSettings } from "@/lib/types";
import { formatWhatsappNumber } from "@/lib/whatsapp";

export type FaqItem = { q: string; a: string };

/**
 * Perguntas frequentes geradas só a partir do que está no painel — nada
 * inventado. Se o dono muda o preço ou o horário, a resposta muda junto.
 */
export function buildFaq(s: SiteSettings): FaqItem[] {
  const price = formatBRL(s.ticketPrice);
  const priceAnswer =
    s.chargeMode === "sundays_holidays"
      ? `${price} por pessoa aos domingos e feriados. Nos demais dias a entrada é gratuita.`
      : `${price} por pessoa, todos os dias.`;

  return [
    { q: "Quanto custa a entrada?", a: priceAnswer },
    {
      q: "Preciso reservar?",
      a: `Não é obrigatório, mas ajuda a gente a te receber melhor. Preencha a reserva aqui no site — ela abre uma conversa no WhatsApp (${formatWhatsappNumber(s.whatsappNumber)}) com seus dados já preenchidos, e a confirmação acontece por lá.`,
    },
    { q: "Que dias o balneário abre?", a: s.hours || "Consulte o horário pelo WhatsApp." },
    {
      q: "Tem comida no local?",
      a: "Sim. O bar e restaurante serve culinária regional, com o peixe grelhado como prato da casa. Veja os pratos na seção Comidas.",
    },
    {
      q: "Posso levar meu pet?",
      a: s.petsAllowed ? "Sim! Pets são bem-vindos no balneário." : "Não, a entrada de animais não é permitida.",
    },
    {
      q: "Posso levar comida e bebida?",
      a: s.outsideFoodAllowed
        ? "Sim, pode trazer."
        : "Não. É proibida a entrada com comidas e bebidas de fora — o bar e restaurante do balneário atende você no local.",
    },
    { q: "Onde fica?", a: `${s.address}. O mapa na seção Localização abre a rota no Google Maps.` },
  ];
}

