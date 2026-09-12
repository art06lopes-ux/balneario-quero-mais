"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, FreeMode, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { Reveal } from "@/components/site/Reveal";
import { SectionTitle } from "@/components/site/SectionTitle";
import type { Feature } from "@/lib/types";

/**
 * Cards da estrutura. No mobile vira carrossel com swipe; no desktop os
 * quatro cabem lado a lado (mas continua arrastável com o mouse).
 */
export function Features({ items }: { items: Feature[] }) {
  if (items.length === 0) return null;

  return (
    <section id="atracoes" className="relative overflow-hidden bg-gradient-to-b from-sand to-sand-2 py-[clamp(4rem,9vw,7.5rem)]">
      <div className="pointer-events-none absolute -left-32 top-24 size-[460px] rounded-full bg-forest-500/10 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -right-24 bottom-0 size-[380px] rounded-full bg-river-500/10 blur-3xl" aria-hidden />
      <div className="mx-auto w-[min(1180px,100%-2.5rem)]">
        <SectionTitle index="02" eyebrow="Atrações" title="O que você encontra por aqui" className="mb-[clamp(2rem,5vw,3.5rem)]" />
      </div>

      <Reveal>
        <Swiper
          modules={[Pagination, A11y, FreeMode]}
          slidesPerView={1.15}
          spaceBetween={14}
          centeredSlides={false}
          pagination={{ clickable: true }}
          grabCursor
          breakpoints={{
            560: { slidesPerView: 2.2, spaceBetween: 16 },
            900: { slidesPerView: 3.2, spaceBetween: 18 },
            1100: { slidesPerView: 4, spaceBetween: 20 },
          }}
          className="!mx-auto !w-[min(1180px,100%-2.5rem)] !overflow-visible !pb-12"
        >
          {items.map((f, i) => (
            <SwiperSlide key={f.id} className="!h-auto">
              <motion.article
                initial={{ opacity: 0, y: 40, scale: 0.96 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "0px 0px -40px 0px" }}
                whileTap={{ scale: 0.97 }}
                whileHover={{ y: -8 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: Math.min(i, 3) * 0.1 }}
                className="group relative isolate aspect-[3/4] overflow-hidden rounded-xl2 bg-forest-900 text-white shadow-card"
              >
                {f.image && (
                  <Image
                    src={f.image}
                    alt=""
                    fill
                    sizes="(max-width:560px) 90vw, (max-width:1100px) 45vw, 25vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,47,34,0)_30%,rgba(8,47,34,.92)_100%)]" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <h3 className="mb-1 font-display text-xl font-bold">{f.title}</h3>
                  <p className="text-[0.9rem] leading-snug text-white/80">{f.description}</p>
                </div>
              </motion.article>
            </SwiperSlide>
          ))}
        </Swiper>
      </Reveal>
    </section>
  );
}
