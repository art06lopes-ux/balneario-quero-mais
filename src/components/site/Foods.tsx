"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useCallback, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Lightbox } from "@/components/site/Lightbox";
import { Reveal } from "@/components/site/Reveal";
import { formatBRL } from "@/lib/format";
import type { FoodItem } from "@/lib/types";

/** Seção de comidas: carrossel com swipe, setas no desktop, toque para ampliar. */
export function Foods({ items }: { items: FoodItem[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const close = useCallback(() => setOpen(null), []);

  if (items.length === 0) return null;

  const withPhoto = items.filter((f) => f.image);
  const photos = withPhoto.map((f) => ({ id: f.id, src: f.image ?? "", alt: f.name, categorySlug: "comidas" }));

  return (
    <section
      id="comidas"
      className="relative overflow-hidden bg-forest-900 py-[clamp(4rem,9vw,7.5rem)] text-white [--swiper-navigation-color:#082f22]"
    >
      <div className="pointer-events-none absolute -top-40 -right-40 size-[520px] rounded-full bg-sun-500/15 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-40 -left-40 size-[520px] rounded-full bg-river-500/20 blur-3xl" aria-hidden />

      <div className="mx-auto w-[min(1180px,100%-2.5rem)]">
        <div className="mb-[clamp(2rem,5vw,3.5rem)] max-w-[640px]">
          <Reveal>
            <span className="eyebrow text-sun-500">Comidas</span>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="font-display text-[clamp(1.9rem,4vw,2.9rem)] leading-[1.1] font-extrabold">Sabor regional à beira do igarapé</h2>
          </Reveal>
        </div>
      </div>

      <Reveal>
        <Swiper
          modules={[Navigation, Pagination, A11y]}
          slidesPerView={1.15}
          spaceBetween={16}
          navigation
          pagination={{ clickable: true }}
          grabCursor
          breakpoints={{
            600: { slidesPerView: 2.2 },
            900: { slidesPerView: 3.2 },
            1180: { slidesPerView: 3.5 },
          }}
          className="!mx-auto !w-[min(1180px,100%-2.5rem)] !overflow-visible !pb-12 max-md:[&_.swiper-button-next]:!hidden max-md:[&_.swiper-button-prev]:!hidden [&_.swiper-button-next]:!-right-2 [&_.swiper-button-next]:!top-[38%] [&_.swiper-button-next]:!size-12 [&_.swiper-button-next]:!rounded-full [&_.swiper-button-next]:!bg-sun-500 [&_.swiper-button-next]:!shadow-sun [&_.swiper-button-next]:after:!text-base [&_.swiper-button-next]:after:!font-black [&_.swiper-button-prev]:!-left-2 [&_.swiper-button-prev]:!top-[38%] [&_.swiper-button-prev]:!size-12 [&_.swiper-button-prev]:!rounded-full [&_.swiper-button-prev]:!bg-sun-500 [&_.swiper-button-prev]:!shadow-sun [&_.swiper-button-prev]:after:!text-base [&_.swiper-button-prev]:after:!font-black"
        >
          {items.map((f) => {
            const photoIndex = withPhoto.findIndex((w) => w.id === f.id);
            return (
              <SwiperSlide key={f.id} className="!h-auto">
                <motion.article
                  whileTap={{ scale: 0.97 }}
                  whileHover={{ y: -6 }}
                  transition={{ type: "spring", stiffness: 300, damping: 24 }}
                  className="flex h-full flex-col overflow-hidden rounded-xl2 bg-white text-ink shadow-deep"
                >
                  <button
                    type="button"
                    disabled={photoIndex < 0}
                    onClick={() => photoIndex >= 0 && setOpen(photoIndex)}
                    aria-label={f.image ? `Ampliar foto de ${f.name}` : undefined}
                    className="group relative aspect-[4/3] w-full overflow-hidden bg-forest-100 focus-visible:outline-none"
                  >
                    {f.image ? (
                      <Image
                        src={f.image}
                        alt={f.name}
                        fill
                        sizes="(max-width:600px) 90vw, (max-width:900px) 45vw, 30vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <span className="grid h-full place-items-center text-ink-3">Sem foto</span>
                    )}
                    {f.price !== null && (
                      <span className="absolute top-3 right-3 rounded-full bg-sun-500 px-3 py-1 font-display text-sm font-extrabold text-forest-900 shadow-sun">
                        {formatBRL(f.price)}
                      </span>
                    )}
                  </button>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="mb-1 font-display text-xl font-bold text-forest-800">{f.name}</h3>
                    {f.description && <p className="text-[0.92rem] leading-relaxed text-ink-2">{f.description}</p>}
                  </div>
                </motion.article>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </Reveal>

      <Lightbox photos={photos} index={open} onClose={close} />
    </section>
  );
}
