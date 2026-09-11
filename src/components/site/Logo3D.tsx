"use client";

import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { useCallback, useRef, type PointerEvent } from "react";
import { cn } from "@/lib/utils";

type Props = {
  src: string;
  alt?: string;
  /** Tamanho em px (largura = altura). */
  size?: number;
  /** Intensidade da inclinação em graus. */
  tilt?: number;
  /** Flutuação automática (para o hero). */
  float?: boolean;
  className?: string;
  priority?: boolean;
};

/**
 * Apresentação 3D da logo oficial — o arquivo de imagem é usado intacto.
 *
 * O efeito é um "tilt card": o disco inclina na direção do cursor/dedo,
 * um brilho especular acompanha o ponteiro e camadas de sombra dão
 * profundidade. Sem WebGL: é só transform 3D em CSS, leve para o mobile.
 */
export function Logo3D({ src, alt = "Balneário Quero Mais", size = 64, tilt = 18, float = false, className, priority }: Props) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  // -0.5 .. 0.5 relativo ao centro
  const px = useMotionValue(0);
  const py = useMotionValue(0);

  const spring = { stiffness: 220, damping: 22, mass: 0.6 };
  const rx = useSpring(useTransform(py, [-0.5, 0.5], [tilt, -tilt]), spring);
  const ry = useSpring(useTransform(px, [-0.5, 0.5], [-tilt, tilt]), spring);
  const gx = useSpring(useTransform(px, [-0.5, 0.5], [15, 85]), spring);
  const gy = useSpring(useTransform(py, [-0.5, 0.5], [15, 85]), spring);
  const glare = useMotionTemplate`radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.12) 28%, rgba(255,255,255,0) 60%)`;

  const onMove = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      px.set((e.clientX - r.left) / r.width - 0.5);
      py.set((e.clientY - r.top) / r.height - 0.5);
    },
    [px, py],
  );

  const onLeave = useCallback(() => {
    px.set(0);
    py.set(0);
  }, [px, py]);

  return (
    <motion.div
      ref={ref}
      onPointerMove={reduce ? undefined : onMove}
      onPointerLeave={onLeave}
      onPointerUp={onLeave}
      className={cn("relative select-none [perspective:800px]", className)}
      style={{ width: size, height: size }}
      animate={float && !reduce ? { y: [0, -10, 0] } : undefined}
      transition={float ? { duration: 5, repeat: Infinity, ease: "easeInOut" } : undefined}
    >
      <motion.div
        className="preserve-3d relative h-full w-full rounded-full"
        style={{ rotateX: reduce ? 0 : rx, rotateY: reduce ? 0 : ry }}
      >
        {/* sombra profunda, deslocada para trás */}
        <div
          className="absolute inset-[6%] rounded-full bg-forest-950/50 blur-xl"
          style={{ transform: "translateZ(-40px) translateY(14%)" }}
          aria-hidden
        />
        {/* aro de luz */}
        <div
          className="absolute -inset-[3%] rounded-full bg-[conic-gradient(from_200deg,rgba(247,181,0,.9),rgba(31,138,76,.6),rgba(29,127,214,.7),rgba(247,181,0,.9))] opacity-80 blur-[2px]"
          style={{ transform: "translateZ(-6px)" }}
          aria-hidden
        />
        {/* a logo em si, intacta */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          width={size}
          height={size}
          draggable={false}
          fetchPriority={priority ? "high" : undefined}
          className="relative h-full w-full rounded-full object-cover shadow-deep ring-[3px] ring-white/80"
          style={{ transform: "translateZ(18px)" }}
        />
        {/* brilho especular que segue o ponteiro */}
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-full mix-blend-soft-light"
          style={{ background: glare, transform: "translateZ(30px)" }}
          aria-hidden
        />
      </motion.div>
    </motion.div>
  );
}
