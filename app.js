/* =========================================================
   Balneário Quero Mais — prévia visual
   Tudo aqui roda só no navegador. Não há backend, banco,
   pagamento nem reserva real: é uma simulação da experiência.
   ========================================================= */

// ⚠️ NÚMERO DE TESTE. Trocar pelo número oficial do balneário antes da
// entrega final. Formato: código do país + DDD + número, só dígitos.
// Este é o ÚNICO lugar onde o número está definido — todos os links
// (hero, formulário, botão flutuante, seção de localização) usam esta constante.
const WHATSAPP_NUMBER = "5592991901596";

const TICKET_PRICE = 20; // R$ por pessoa
const GREETING = "Olá! Vim pelo site do Balneário Quero Mais e gostaria de mais informações.";

const brl = (v) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const waLink = (text) =>
  `https://wa.me/${WHATSAPP_NUMBER}` + (text ? `?text=${encodeURIComponent(text)}` : "");

/* ---------- Links de WhatsApp (fonte única: WHATSAPP_NUMBER) ---------- */
document.querySelectorAll("[data-wa]").forEach((el) => {
  el.href = waLink(el.hasAttribute("data-wa-greeting") ? GREETING : "");
  el.target = "_blank";
  el.rel = "noopener";
  if (el.hasAttribute("data-wa-display")) {
    // +55 92 99190-1596
    const n = WHATSAPP_NUMBER;
    el.textContent = `+${n.slice(0, 2)} ${n.slice(2, 4)} ${n.slice(4, 9)}-${n.slice(9)}`;
  }
});

/* ---------- Header: sólido ao rolar ---------- */
const header = document.getElementById("header");
const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 40);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

/* ---------- Menu mobile ---------- */
const hamburger = document.getElementById("hamburger");
const nav = document.getElementById("nav");
const closeMenu = () => {
  nav.classList.remove("is-open");
  hamburger.classList.remove("is-open");
  hamburger.setAttribute("aria-expanded", "false");
};
hamburger.addEventListener("click", () => {
  const open = nav.classList.toggle("is-open");
  hamburger.classList.toggle("is-open", open);
  hamburger.setAttribute("aria-expanded", String(open));
});
nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));

/* ---------- Animações ao rolar ---------- */
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
);
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

/* ---------- Formulário de reserva (simulado) ---------- */
const form = document.getElementById("booking-form");
const qtyInput = document.getElementById("qty");
const dateInput = document.getElementById("date");
const nameInput = document.getElementById("name");
const phoneInput = document.getElementById("phone");
const totalEl = document.getElementById("total");
const errorEl = document.getElementById("form-error");

// Data mínima = hoje (fuso local)
const today = new Date();
const pad = (n) => String(n).padStart(2, "0");
dateInput.min = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

const getQty = () => {
  const n = parseInt(qtyInput.value, 10);
  return Number.isFinite(n) && n >= 1 ? Math.min(n, 99) : 1;
};

const updateTotal = () => {
  const qty = getQty();
  qtyInput.value = qty;
  totalEl.textContent = brl(qty * TICKET_PRICE);
  totalEl.classList.remove("bump");
  void totalEl.offsetWidth; // reinicia a animação
  totalEl.classList.add("bump");
};

document.getElementById("qty-minus").addEventListener("click", () => {
  qtyInput.value = Math.max(1, getQty() - 1);
  updateTotal();
});
document.getElementById("qty-plus").addEventListener("click", () => {
  qtyInput.value = Math.min(99, getQty() + 1);
  updateTotal();
});
qtyInput.addEventListener("input", updateTotal);
qtyInput.addEventListener("blur", updateTotal);
updateTotal();

// Máscara simples de telefone: (92) 99999-9999
phoneInput.addEventListener("input", () => {
  let d = phoneInput.value.replace(/\D/g, "").slice(0, 11);
  let out = d;
  if (d.length > 2) out = `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length > 7) out = `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  phoneInput.value = out;
});

const formatDateBR = (iso) => {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};

const setInvalid = (el, invalid) => el.classList.toggle("is-invalid", invalid);

form.addEventListener("submit", (ev) => {
  ev.preventDefault();

  const name = nameInput.value.trim();
  const date = dateInput.value;
  const phoneDigits = phoneInput.value.replace(/\D/g, "");
  const qty = getQty();

  const problems = [];
  setInvalid(nameInput, !name);
  setInvalid(dateInput, !date);
  setInvalid(phoneInput, phoneDigits.length < 10);
  if (!name) problems.push("seu nome");
  if (!date) problems.push("a data desejada");
  if (phoneDigits.length < 10) problems.push("um WhatsApp válido com DDD");

  if (problems.length) {
    errorEl.textContent = `Para continuar, informe ${problems.join(", ")}.`;
    errorEl.hidden = false;
    return;
  }
  errorEl.hidden = true;

  const total = qty * TICKET_PRICE;
  const message = [
    "Olá! Gostaria de reservar minha entrada no Balneário Quero Mais.",
    `Nome: ${name}`,
    `Quantidade de pessoas: ${qty}`,
    `Data desejada: ${formatDateBR(date)}`,
    `Valor estimado: ${brl(total)}.`,
    "Gostaria de confirmar a reserva.",
  ].join("\n");

  window.open(waLink(message), "_blank", "noopener");
});

[nameInput, dateInput, phoneInput].forEach((el) =>
  el.addEventListener("input", () => setInvalid(el, false))
);

/* ---------- Lightbox da galeria ---------- */
const items = Array.from(document.querySelectorAll(".bento__item"));
const lightbox = document.getElementById("lightbox");
const lbImg = document.getElementById("lightbox-img");
const lbCaption = document.getElementById("lightbox-caption");
let current = 0;

const showLightbox = (i) => {
  current = (i + items.length) % items.length;
  const item = items[current];
  lbImg.src = item.href;
  lbImg.alt = item.dataset.caption || "";
  lbCaption.textContent = item.dataset.caption || "";
  lightbox.hidden = false;
  document.body.style.overflow = "hidden";
};
const hideLightbox = () => {
  lightbox.hidden = true;
  document.body.style.overflow = "";
};

items.forEach((item, i) =>
  item.addEventListener("click", (ev) => {
    ev.preventDefault();
    showLightbox(i);
  })
);
document.getElementById("lightbox-close").addEventListener("click", hideLightbox);
document.getElementById("lightbox-prev").addEventListener("click", () => showLightbox(current - 1));
document.getElementById("lightbox-next").addEventListener("click", () => showLightbox(current + 1));
lightbox.addEventListener("click", (ev) => {
  if (ev.target === lightbox) hideLightbox();
});
document.addEventListener("keydown", (ev) => {
  if (lightbox.hidden) return;
  if (ev.key === "Escape") hideLightbox();
  if (ev.key === "ArrowLeft") showLightbox(current - 1);
  if (ev.key === "ArrowRight") showLightbox(current + 1);
});

/* ---------- Rodapé ---------- */
document.getElementById("year").textContent = new Date().getFullYear();

/* ---------- Botão flutuante: some enquanto o cartão de reserva está visível
   (no mobile ele cobria o botão "Reservar pelo WhatsApp" do formulário) ---------- */
const waFloat = document.querySelector(".wa-float");
new IntersectionObserver(
  ([entry]) => waFloat.classList.toggle("is-hidden", entry.isIntersecting),
  { threshold: 0.15 }
).observe(document.querySelector(".ticket"));
