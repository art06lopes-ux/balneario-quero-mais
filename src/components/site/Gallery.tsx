"use client";

import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import Image from "next/image";
import { useCallback, useMemo, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { Lightbox } from "@/components/site/Lightbox";
import { Reveal } from "@/components/site/Reveal";
import type { GalleryCategory, GalleryPhoto } from "@/lib/types";
import { cn } from "@/lib/utils";

const ALL = "__todas";

/** Padrão do mosaico: a cada 7 fotos, uma alta e duas largas. */
function bentoClass(i: number): string {
  const k = i % 7;
  if (k === 0) return "row-span-2";
  if (k === 1 || k === 6) return "col-span-2";
  return "";
}

export function Gallery({ categories }: { categories: GalleryCategory[] }) {
  const [active, setActive] = useState<string>(ALL);
  const [lightbox, setLightbox] = useState<number | null>(null);

  const photos: GalleryPhoto[] = useMemo(() => {
    if (active === ALL) return categories.flatMap((c) => c.photos);
    return categories.find((c) => c.slug === active)?.photos ?? [];
  }, [categories, active]);

  const close = useCallback(() => setLightbox(null), []);

  if (categories.length === 0) return null;

  const tabs = [{ slug: ALL, name: "Todas" }, ...categories.map((c) => ({ slug: c.slug, name: c.name }))];

  return (
    <section id="galeria" className="overflow-hidden py-[clamp(4rem,9vw,7.5rem)]">
      <div className="mx-auto w-[min(1180px,100%-2.5rem)]">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-[640px]">
            <Reveal>
              <span className="eyebrow text-forest-500">Galeria</span>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="font-display text-[clamp(1.9rem,4vw,2.9rem)] leading-[1.1] font-extrabold text-forest-800">Fotos do balneário</h2>
            </Reveal>
          </div>
        </div>

        {/* Abas de categoria */}
        <Reveal>
          <LayoutGroup id="gallery-tabs">
            <div role="tablist" aria-label="Categorias da galeria" className="mb-7 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {tabs.map((t) => {
                const on = t.slug === active;
                return (
                  <button
                    key={t.slug}
                    role="tab"
                    aria-selected={on}
                    onClick={() => setActive(t.slug)}
                    className={cn(
                      "relative shrink-0 rounded-full px-4 py-2 font-display text-sm font-semibold transition-colors",
                      on ? "text-forest-900" : "text-ink-2 hover:text-forest-800",
                    )}
                  >
                    {on && (
                      <motion.span
                        layoutId="tab-pill"
                        className="absolute inset-0 rounded-full bg-sun-500 shadow-sun"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative">{t.name}</span>
                  </button>
                );
              })}
            </div>
          </LayoutGroup>
        </Reveal>

        {/* Desktop: bento grid */}
        <div className="hidden md:block">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="grid auto-rows-[230px] grid-flow-dense grid-cols-4 gap-3.5"
            >
              {photos.map((p, i) => (
                <Tile key={p.id} photo={p} className={bentoClass(i)} onOpen={() => setLightbox(i)} />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Mobile: carrossel com swipe */}
        <div className="md:hidden">
          <Swiper
            key={active}
            modules={[Pagination, A11y]}
            slidesPerView={1.12}
            spaceBetween={12}
            pagination={{ clickable: true, dynamicBullets: true }}
            grabCursor
            className="!overflow-visible !pb-10"
          >
            {photos.map((p, i) => (
              <SwiperSlide key={p.id}>
                <Tile photo={p} className="aspect-[4/5]" onOpen={() => setLightbox(i)} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      <Lightbox photos={photos} index={lightbox} onClose={close} />
    </section>
  );
}

function Tile({ photo, className, onOpen }: { photo: GalleryPhoto; className?: string; onOpen: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onOpen}
      whileTap={{ scale: 0.97 }}
      aria-label={`Ampliar: ${photo.alt || "foto"}`}
      className={cn("group relative block w-full overflow-hidden rounded-[18px] bg-forest-100 shadow-soft focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sun-500/50", className)}
    >
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        sizes="(max-width:768px) 90vw, 30vw"
        className="object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <span className="absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgba(8,47,34,.55))] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <span className="absolute right-4 bottom-4 grid size-9 translate-y-2 place-items-center rounded-full bg-sun-500 font-display text-xl font-extrabold text-forest-900 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
        +
      </span>
    </motion.button>
  );
}
