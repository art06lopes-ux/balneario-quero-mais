"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Keyboard, Navigation, Pagination, Zoom } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/zoom";
import type { GalleryPhoto } from "@/lib/types";

type Props = {
  photos: GalleryPhoto[];
  index: number | null;
  onClose: () => void;
};

/** Visualização ampliada com swipe, setas, teclado e zoom por pinça/duplo toque. */
export function Lightbox({ photos, index, onClose }: Props) {
  const open = index !== null;

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Foto ampliada"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-forest-950/95 [--swiper-navigation-color:#fff] [--swiper-navigation-size:28px]"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="absolute top-4 right-4 z-10 grid size-12 place-items-center rounded-full bg-white/10 text-3xl leading-none text-white transition-colors hover:bg-white/25"
          >
            ×
          </button>

          <Swiper
            modules={[Navigation, Pagination, Keyboard, Zoom, A11y]}
            initialSlide={index}
            navigation
            keyboard={{ enabled: true }}
            zoom={{ maxRatio: 3 }}
            pagination={{ type: "fraction" }}
            spaceBetween={24}
            loop={photos.length > 1}
            className="h-full w-full [&_.swiper-button-next]:max-md:!top-auto [&_.swiper-button-next]:max-md:!bottom-3 [&_.swiper-button-prev]:max-md:!top-auto [&_.swiper-button-prev]:max-md:!bottom-3 [&_.swiper-pagination]:!bottom-5 [&_.swiper-pagination]:text-sm [&_.swiper-pagination]:text-white/80"
          >
            {photos.map((p) => (
              <SwiperSlide key={p.id} className="flex items-center justify-center p-4 pb-16 md:p-14">
                <div className="swiper-zoom-container">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.src}
                    alt={p.alt}
                    className="max-h-[80vh] max-w-full rounded-2xl object-contain shadow-deep"
                    draggable={false}
                  />
                </div>
                {p.alt && (
                  <p className="pointer-events-none absolute inset-x-0 bottom-10 text-center text-sm text-white/80 md:bottom-6">
                    {p.alt}
                  </p>
                )}
              </SwiperSlide>
            ))}
          </Swiper>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
