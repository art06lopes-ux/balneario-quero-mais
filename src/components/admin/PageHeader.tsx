import type { ReactNode } from "react";
import { IconExternal } from "@/components/admin/icons";

export function PageHeader({
  title,
  description,
  action,
  siteAnchor,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  siteAnchor?: string;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-forest-800 sm:text-3xl">
          {title}
        </h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-ink-3">{description}</p>}
      </div>
      <div className="flex items-center gap-2">
        {siteAnchor && (
          <a
            href={`/${siteAnchor}`}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-1.5 rounded-xl border border-forest-900/15 bg-white px-3 py-2 font-display text-sm font-semibold text-forest-800 shadow-soft transition-colors hover:bg-forest-100"
          >
            Ver no site <IconExternal className="size-4" />
          </a>
        )}
        {action}
      </div>
    </div>
  );
}

export function Card({
  title,
  children,
  className,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={
        "rounded-2xl border border-forest-900/10 bg-white p-5 shadow-soft sm:p-6 " +
        (className ?? "")
      }
    >
      {title && <h2 className="mb-4 font-display text-lg font-bold text-forest-800">{title}</h2>}
      {children}
    </section>
  );
}
