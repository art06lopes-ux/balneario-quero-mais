"use client";

/**
 * Primitivas de movimento do site, seguindo o guia Code Makers:
 * Split Text / Word Stagger + Mask Reveal, Parallax suave, Animated Counter,
 * Magnetic Button, Marquee (Loop) e Scroll Progress. Tudo respeita
 * prefers-reduced-motion.
 */

import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

/* ---------- Split Text: palavras sobem de dentro de uma máscara ---------- */

type SplitProps = {
  text: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  className?: string;
  /** Palavras (a partir do fim) que recebem o destaque em gradiente. */
  highlightLast?: number;
  /** Quebra de linha antes das palavras destacadas (ex.: "Balneário" / "Quero Mais"). */
  breakBeforeHighlight?: boolean;
  delay?: number;
  once?: boolean;
};

export function SplitWords({
  text,
  as = "h2",
  className,
  highlightLast = 0,
  breakBeforeHighlight = false,
  delay = 0,
  once = true,
}: SplitProps) {
  const reduce = useReducedMotion();
  const Tag = motion[as];
  const words = text.trim().split(/\s+/);
  const firstHighlight = words.length - highlightLast;

  return (
    <Tag
      className={className}
      initial={reduce ? undefined : "hidden"}
      whileInView="show"
      viewport={{ once, margin: "0px 0px -80px 0px" }}
      transition={{ staggerChildren: 0.07, delayChildren: delay }}
      aria-label={text}
    >
      {words.map((w, i) => (
        <Fragment key={i}>
          {breakBeforeHighlight && highlightLast > 0 && i === firstHighlight && <br />}
          <span
            className="inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] align-bottom"
            aria-hidden
          >
            <motion.span
              className={cn(
                "inline-block will-change-transform",
                i >= firstHighlight && "text-gradient-sun",
              )}
              variants={{
                hidden: { y: "110%", rotate: 3, opacity: 0 },
                show: { y: 0, rotate: 0, opacity: 1, transition: { duration: 0.8, ease: EASE } },
              }}
            >
              {w}
            </motion.span>
            {i < words.length - 1 && " "}
          </span>
        </Fragment>
      ))}
    </Tag>
  );
}

/* ---------- Mask Reveal: cortina que se abre revelando o bloco ---------- */

export function MaskReveal({
  children,
  className,
  delay = 0,
  direction = "up",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left";
}) {
  const reduce = useReducedMotion();
  const clipFrom = direction === "up" ? "inset(100% 0 0 0)" : "inset(0 100% 0 0)";
  return (
    <motion.div
      className={className}
      initial={reduce ? undefined : { clipPath: clipFrom, y: direction === "up" ? 24 : 0 }}
      whileInView={{ clipPath: "inset(0 0 0 0)", y: 0 }}
      viewport={{ once: true, margin: "0px 0px -60px 0px" }}
      transition={{ duration: 0.9, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

/* ---------- Stagger: filhos entram um após o outro ---------- */

export function Stagger({
  children,
  className,
  gap = 0.08,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  gap?: number;
  as?: "div" | "ul";
}) {
  const reduce = useReducedMotion();
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial={reduce ? undefined : "hidden"}
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -60px 0px" }}
      transition={{ staggerChildren: gap }}
    >
      {children}
    </Tag>
  );
}

export function StaggerItem({
  children,
  className,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li";
}) {
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      variants={{
        hidden: { opacity: 0, y: 28, scale: 0.98 },
        show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, ease: EASE } },
      }}
    >
      {children}
    </Tag>
  );
}

/* ---------- Parallax suave ligado à rolagem ---------- */

export function useParallax(distance = 60): {
  ref: React.RefObject<HTMLDivElement | null>;
  y: MotionValue<number>;
} {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [distance, -distance]);
  return { ref, y };
}

export function Parallax({
  children,
  className,
  distance = 60,
}: {
  children: ReactNode;
  className?: string;
  distance?: number;
}) {
  const { ref, y } = useParallax(distance);
  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y }} className="h-full w-full will-change-transform">
        {children}
      </motion.div>
    </div>
  );
}

/* ---------- Animated Counter ---------- */

export function CountUp({
  to,
  prefix = "",
  suffix = "",
  duration = 1.4,
  className,
}: {
  to: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -40px 0px" });
  const reduce = useReducedMotion();
  const [value, setValue] = useState(reduce ? to : 0);

  useEffect(() => {
    if (!inView || reduce) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / (duration * 1000));
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(to * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration, reduce]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {value}
      {suffix}
    </span>
  );
}

/* ---------- Magnetic Button: puxa levemente para o ponteiro (só desktop) ---------- */

export function Magnetic({
  children,
  strength = 0.35,
  className,
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 200, damping: 18, mass: 0.4 });

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduce || e.pointerType !== "mouse") return;
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={reset}
      style={{ x: sx, y: sy }}
      className={cn("inline-block", className)}
    >
      {children}
    </motion.div>
  );
}

/* ---------- Marquee (Loop) ---------- */

export function Marquee({
  items,
  className,
  speed = 40,
}: {
  items: string[];
  className?: string;
  speed?: number;
}) {
  const reduce = useReducedMotion();
  const track = [...items, ...items];
  return (
    <div
      className={cn("relative overflow-hidden whitespace-nowrap", className)}
      aria-label={items.join(", ")}
    >
      <div
        className="inline-flex w-max items-center motion-safe:animate-[marquee_linear_infinite]"
        style={{ animationDuration: reduce ? undefined : `${speed}s` }}
        aria-hidden
      >
        {track.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-5 px-5 font-display text-sm font-semibold tracking-[0.14em] uppercase"
          >
            <span className="size-1.5 rounded-full bg-sun-500" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------- Scroll Progress ---------- */

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.3 });
  return (
    <motion.div
      style={{ scaleX }}
      className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-[3px] origin-left bg-gradient-to-r from-sun-500 via-ember-500 to-sun-500"
      aria-hidden
    />
  );
}
