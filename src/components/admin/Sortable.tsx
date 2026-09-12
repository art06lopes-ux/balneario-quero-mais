"use client";

import { Reorder, useDragControls } from "framer-motion";
import { useState, useTransition, type ReactNode } from "react";
import type { FormState } from "@/server/actions/shared";
import { cn } from "@/lib/utils";

type Item = { id: string };

type Props<T extends Item> = {
  items: T[];
  onReorder: (ids: string[]) => Promise<FormState>;
  onResult?: (state: FormState) => void;
  render: (item: T, index: number) => ReactNode;
  className?: string;
  /** "list" empilha; "grid" usa cards em grade. */
  layout?: "list" | "grid";
};

/**
 * Lista reordenável: arrastar pela alça (mouse ou toque) ou usar as setas.
 * Ao soltar, salva a ordem no servidor.
 */
export function Sortable<T extends Item>({
  items,
  onReorder,
  onResult,
  render,
  className,
  layout = "list",
}: Props<T>) {
  const [order, setOrder] = useState(items);
  const [lastItems, setLastItems] = useState(items);
  const [pending, start] = useTransition();

  // Sincroniza quando o servidor manda uma lista nova (após salvar/apagar).
  if (items !== lastItems) {
    setLastItems(items);
    setOrder(items);
  }

  const commit = (next: T[]) => {
    setOrder(next);
    start(async () => {
      const r = await onReorder(next.map((i) => i.id));
      onResult?.(r);
    });
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= order.length) return;
    const next = [...order];
    const [it] = next.splice(from, 1);
    if (!it) return;
    next.splice(to, 0, it);
    commit(next);
  };

  return (
    <Reorder.Group
      axis={layout === "grid" ? undefined : "y"}
      values={order}
      onReorder={setOrder}
      className={cn(
        layout === "grid" ? "grid gap-3 sm:grid-cols-2 xl:grid-cols-3" : "grid gap-3",
        pending && "opacity-70",
        className,
      )}
    >
      {order.map((item, i) => (
        <SortableItem
          key={item.id}
          item={item}
          onDrop={() => commit(order)}
          onUp={() => move(i, i - 1)}
          onDown={() => move(i, i + 1)}
          first={i === 0}
          last={i === order.length - 1}
        >
          {render(item, i)}
        </SortableItem>
      ))}
    </Reorder.Group>
  );
}

function SortableItem<T extends Item>({
  item,
  children,
  onDrop,
  onUp,
  onDown,
  first,
  last,
}: {
  item: T;
  children: ReactNode;
  onDrop: () => void;
  onUp: () => void;
  onDown: () => void;
  first: boolean;
  last: boolean;
}) {
  const controls = useDragControls();
  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={controls}
      onDragEnd={onDrop}
      className="relative rounded-2xl border border-forest-900/10 bg-white shadow-soft"
      whileDrag={{ scale: 1.02, boxShadow: "0 18px 40px rgba(8,47,34,.2)", zIndex: 10 }}
    >
      <div className="absolute top-2 right-2 z-10 flex items-center gap-1 rounded-lg bg-white/90 p-1 shadow-soft backdrop-blur">
        <button
          type="button"
          onClick={onUp}
          disabled={first}
          aria-label="Mover para cima"
          className="grid size-7 place-items-center rounded-md text-ink-2 hover:bg-forest-100 disabled:opacity-30"
        >
          ↑
        </button>
        <button
          type="button"
          onClick={onDown}
          disabled={last}
          aria-label="Mover para baixo"
          className="grid size-7 place-items-center rounded-md text-ink-2 hover:bg-forest-100 disabled:opacity-30"
        >
          ↓
        </button>
        <button
          type="button"
          onPointerDown={(e) => controls.start(e)}
          aria-label="Arrastar para reordenar"
          className="grid size-7 cursor-grab touch-none place-items-center rounded-md text-ink-2 hover:bg-forest-100 active:cursor-grabbing"
        >
          ⠿
        </button>
      </div>
      {children}
    </Reorder.Item>
  );
}
