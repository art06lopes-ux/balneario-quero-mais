"use client";

import { ReactLenis } from "lenis/react";
import { useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Smooth Scroll (Lenis): rolagem macia e inércia natural no desktop.
 * No toque, o Lenis deixa a rolagem nativa do celular — que já é boa — e
 * só suaviza os saltos de âncora. Desligado para quem pede menos movimento.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  if (reduce) return <>{children}</>;
  return (
    <ReactLenis root options={{ lerp: 0.09, duration: 1.1, smoothWheel: true, anchors: { offset: -76 } }}>
      {children}
    </ReactLenis>
  );
}
