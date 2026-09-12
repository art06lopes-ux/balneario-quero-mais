import { Reveal } from "@/components/site/Reveal";
import type { SiteSettings } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Regras da casa em formato de lista curta — usadas no bloco "Bom saber". */
export function houseRuleItems(s: SiteSettings): { ok: boolean; text: string }[] {
  const items = [
    ...(s.liveMusic ? [{ ok: true, text: s.liveMusic }] : []),
    s.petsAllowed
      ? { ok: true, text: "Pets são bem-vindos" }
      : { ok: false, text: "Não é permitida a entrada de animais" },
    s.outsideFoodAllowed
      ? { ok: true, text: "Pode trazer comida e bebida" }
      : { ok: false, text: "Proibida a entrada com comidas e bebidas de fora" },
    ...s.houseRules
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)
      .map((text) => ({ ok: !/^(não|nao|proibid)/i.test(text), text })),
  ];
  return items;
}

export function HouseRules({
  s,
  tone = "light",
  className,
}: {
  s: SiteSettings;
  tone?: "light" | "dark";
  className?: string;
}) {
  const items = houseRuleItems(s);
  const dark = tone === "dark";
  return (
    <Reveal className={className}>
      <div
        className={cn(
          "rounded-2xl border p-5",
          dark ? "border-white/15 bg-white/5" : "border-forest-900/10 bg-white shadow-soft",
        )}
      >
        <h3
          className={cn(
            "mb-3 font-display text-sm font-semibold tracking-[0.14em] uppercase",
            dark ? "text-sun-500" : "text-forest-500",
          )}
        >
          Bom saber
        </h3>
        <ul className="grid gap-2.5">
          {items.map((it) => (
            <li
              key={it.text}
              className={cn(
                "flex items-start gap-3 text-[0.95rem]",
                dark ? "text-white/90" : "text-ink",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full",
                  it.ok ? "bg-forest-500/15 text-forest-500" : "bg-[#d64545]/15 text-[#c33d3d]",
                )}
                aria-hidden
              >
                {it.ok ? (
                  <svg
                    viewBox="0 0 24 24"
                    className="size-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    className="size-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  >
                    <path d="M18 6L6 18" />
                    <path d="M6 6l12 12" />
                  </svg>
                )}
              </span>
              {it.text}
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}
