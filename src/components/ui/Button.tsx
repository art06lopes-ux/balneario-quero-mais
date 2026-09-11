"use client";

import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
};

export function Button({ variant = "primary", size = "md", loading, className, children, disabled, ...rest }: Props) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-display font-semibold transition-[background-color,transform,opacity] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-forest-500/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60",
        size === "sm" && "px-3 py-1.5 text-sm",
        size === "md" && "px-4 py-2.5 text-sm",
        size === "lg" && "px-6 py-3.5 text-base",
        variant === "primary" && "bg-forest-700 text-white hover:bg-forest-800",
        variant === "secondary" && "border border-forest-900/15 bg-white text-forest-800 hover:bg-forest-100",
        variant === "danger" && "bg-[#b93232] text-white hover:bg-[#9c2626]",
        variant === "ghost" && "text-forest-800 hover:bg-forest-100",
        className,
      )}
      {...rest}
    >
      {loading && (
        <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
      )}
      {children}
    </button>
  );
}
