/** Monta links wa.me a partir do número vindo do banco (só dígitos com DDI). */
export function whatsappLink(number: string, text?: string): string {
  const base = `https://wa.me/${number.replace(/\D/g, "")}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

/** 5592991901596 -> +55 92 99190-1596 */
export function formatWhatsappNumber(number: string): string {
  const n = number.replace(/\D/g, "");
  if (n.length < 12) return `+${n}`;
  const ddi = n.slice(0, n.length - 11);
  const ddd = n.slice(-11, -9);
  const parte1 = n.slice(-9, -4);
  const parte2 = n.slice(-4);
  return `+${ddi} ${ddd} ${parte1}-${parte2}`;
}

export type BookingInput = {
  name: string;
  quantity: number;
  date: string; // dd/mm/aaaa
  total: string; // já formatado em BRL
  businessName: string;
};

export function buildBookingMessage(b: BookingInput): string {
  return [
    `Olá! Gostaria de reservar minha entrada no ${b.businessName}.`,
    `Nome: ${b.name}`,
    `Quantidade de pessoas: ${b.quantity}`,
    `Data desejada: ${b.date}`,
    `Valor estimado: ${b.total}.`,
    "Gostaria de confirmar a reserva.",
  ].join("\n");
}
