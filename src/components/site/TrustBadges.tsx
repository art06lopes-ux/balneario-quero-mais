"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { SiteSettings } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Prova social: nota do Google e seguidores do Instagram (só aparecem se preenchidos). */
export function TrustBadges({ s, tone = "dark", className, delay = 0 }: { s: SiteSettings; tone?: "dark" | "light"; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  const hasGoogle = s.googleRating !== null && s.googleRating > 0;
  const hasInsta = s.instagramFollowers.trim() !== "" && s.instagramUrl !== "";
  if (!hasGoogle && !hasInsta) return null;

  const onDark = tone === "dark";
  const pill = cn(
    "inline-flex items-center gap-2.5 rounded-full border px-3.5 py-2 text-sm font-medium backdrop-blur-md transition-colors",
    onDark ? "border-white/25 bg-white/10 text-white hover:bg-white/20" : "border-forest-900/10 bg-white text-forest-800 shadow-soft hover:bg-forest-100",
  );

  return (
    <motion.div
      className={cn("flex flex-wrap gap-2.5", className)}
      initial={reduce ? undefined : "hidden"}
      whileInView="show"
      viewport={{ once: true }}
      transition={{ staggerChildren: 0.12, delayChildren: delay }}
    >
      {hasGoogle && (
        <motion.a
          variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
          href={s.googleReviewsUrl || undefined}
          target="_blank"
          rel="noopener"
          className={pill}
          aria-label={`Nota ${s.googleRating?.toLocaleString("pt-BR")} de 5 no Google${s.googleRatingCount ? `, ${s.googleRatingCount} avaliações` : ""}`}
        >
          <GoogleG />
          <span className="flex items-center gap-1">
            <strong className="font-display text-base">{s.googleRating?.toLocaleString("pt-BR", { minimumFractionDigits: 1 })}</strong>
            <Stars value={s.googleRating ?? 0} />
          </span>
          {s.googleRatingCount ? <span className={onDark ? "text-white/70" : "text-ink-3"}>{s.googleRatingCount} avaliações</span> : null}
        </motion.a>
      )}
      {hasInsta && (
        <motion.a
          variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
          href={s.instagramUrl}
          target="_blank"
          rel="noopener"
          className={pill}
        >
          <InstagramIcon />
          <strong className="font-display text-base">{s.instagramFollowers}</strong>
          <span className={onDark ? "text-white/70" : "text-ink-3"}>seguidores</span>
        </motion.a>
      )}
    </motion.div>
  );
}

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex" aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, value - i));
        return (
          <svg key={i} viewBox="0 0 20 20" className="size-4">
            <defs>
              <linearGradient id={`st${i}-${fill}`} x1="0" x2="1">
                <stop offset={`${fill * 100}%`} stopColor="#f7b500" />
                <stop offset={`${fill * 100}%`} stopColor="rgba(255,255,255,.35)" />
              </linearGradient>
            </defs>
            <path fill={`url(#st${i}-${fill})`} d="M10 1.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.6 7.7l5.8-.8z" />
          </svg>
        );
      })}
    </span>
  );
}

function GoogleG() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
      <path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.4z" />
      <path fill="#34A853" d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22z" />
      <path fill="#FBBC05" d="M6.4 14a6 6 0 0 1 0-3.9V7.5H3.1a10 10 0 0 0 0 9z" />
      <path fill="#EA4335" d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.8-2.8A10 10 0 0 0 3.1 7.5L6.4 10c.8-2.3 3-4.1 5.6-4.1z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="3.8" />
      <circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
