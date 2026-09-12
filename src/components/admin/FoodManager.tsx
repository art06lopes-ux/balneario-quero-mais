"use client";

import { useActionState, useState, useTransition } from "react";
import { ImageField } from "@/components/admin/ImageField";
import { Card } from "@/components/admin/PageHeader";
import { Sortable } from "@/components/admin/Sortable";
import { Button } from "@/components/ui/Button";
import { Checkbox, Field, Input, Textarea } from "@/components/ui/Field";
import { Toast } from "@/components/ui/Toast";
import { formatBRL } from "@/lib/format";
import { deleteFood, reorderFood, saveFood } from "@/server/actions/food";
import type { FormState } from "@/server/actions/shared";

export type FoodView = {
  id: string;
  name: string;
  description: string;
  price: number | null;
  image: string | null;
  show_in_gallery: boolean;
  is_active: boolean;
};

const IDLE: FormState = { error: null, success: null };

export function FoodManager({ items }: { items: FoodView[] }) {
  const [toast, setToast] = useState<FormState>(IDLE);
  const [adding, setAdding] = useState(false);

  return (
    <div className="grid gap-6">
      <div className="flex justify-end">
        <Button onClick={() => setAdding((v) => !v)} variant={adding ? "secondary" : "primary"}>
          {adding ? "Cancelar" : "+ Adicionar prato"}
        </Button>
      </div>

      {adding && (
        <Card title="Novo prato">
          <FoodForm
            onDone={(s) => {
              setToast(s);
              if (s.success) setAdding(false);
            }}
          />
        </Card>
      )}

      {items.length === 0 ? (
        <p className="text-sm text-ink-3">Nenhum prato cadastrado ainda.</p>
      ) : (
        <Sortable
          items={items}
          onReorder={reorderFood}
          onResult={setToast}
          layout="grid"
          render={(f) => <FoodCard f={f} onToast={setToast} />}
        />
      )}
      <Toast state={toast} />
    </div>
  );
}

function FoodCard({ f, onToast }: { f: FoodView; onToast: (s: FormState) => void }) {
  const [editing, setEditing] = useState(false);
  const [pending, start] = useTransition();

  const remove = () => {
    if (!window.confirm(`Remover "${f.name}"?`)) return;
    start(async () => onToast(await deleteFood(f.id)));
  };

  return (
    <div className="flex h-full flex-col">
      <div className="relative aspect-[4/3] overflow-hidden rounded-t-2xl bg-forest-100">
        {f.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={f.image} alt="" className="h-full w-full object-cover" />
        )}
        {f.price !== null && (
          <span className="absolute bottom-2 left-2 rounded-full bg-sun-500 px-2.5 py-0.5 font-display text-xs font-extrabold text-forest-900">
            {formatBRL(f.price)}
          </span>
        )}
        {!f.is_active && (
          <span className="absolute top-2 left-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-ink-3 uppercase">
            oculto
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display font-bold text-forest-800">{f.name}</h3>
        {f.description && <p className="line-clamp-2 text-sm text-ink-2">{f.description}</p>}
        <div className="mt-3 flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => setEditing((v) => !v)}>
            {editing ? "Fechar" : "Editar"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={remove}
            loading={pending}
            className="text-[#9c2626]"
          >
            Remover
          </Button>
        </div>
        {editing && (
          <div className="mt-4 border-t border-forest-900/10 pt-4">
            <FoodForm
              food={f}
              onDone={(s) => {
                onToast(s);
                if (s.success) setEditing(false);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function FoodForm({ food, onDone }: { food?: FoodView; onDone: (s: FormState) => void }) {
  const k = food?.id ?? "new";
  const [state, action, pending] = useActionState(async (_prev: FormState, fd: FormData) => {
    const r = await saveFood(_prev, fd);
    onDone(r);
    return r;
  }, IDLE);
  return (
    <form action={action} className="grid gap-4">
      {food && <input type="hidden" name="id" value={food.id} />}
      <Field label="Nome do prato" htmlFor={`name-${k}`}>
        <Input id={`name-${k}`} name="name" defaultValue={food?.name} maxLength={80} required />
      </Field>
      <Field label="Descrição (opcional)" htmlFor={`desc-${k}`}>
        <Textarea
          id={`desc-${k}`}
          name="description"
          defaultValue={food?.description}
          maxLength={400}
          className="min-h-[80px]"
        />
      </Field>
      <Field
        label="Preço (opcional)"
        htmlFor={`price-${k}`}
        hint="Deixe vazio para não exibir preço. Ex.: 45,00"
      >
        <Input
          id={`price-${k}`}
          name="price"
          inputMode="decimal"
          defaultValue={
            food?.price !== null && food?.price !== undefined
              ? food.price.toFixed(2).replace(".", ",")
              : ""
          }
          className="max-w-[160px]"
        />
      </Field>
      <ImageField
        name="image"
        label="Foto do prato"
        current={food?.image}
        aspect="aspect-[4/3]"
        required={!food}
      />
      <div className="flex flex-wrap gap-4">
        <Checkbox
          name="show_in_gallery"
          label="Mostrar na aba Comidas da galeria do site"
          defaultChecked={food?.show_in_gallery ?? true}
        />
        {food && (
          <Checkbox name="is_active" label="Visível no site" defaultChecked={food.is_active} />
        )}
      </div>
      {state.error && <p className="text-sm text-[#b93232]">{state.error}</p>}
      <div className="flex justify-end">
        <Button type="submit" loading={pending}>
          {food ? "Salvar" : "Adicionar"}
        </Button>
      </div>
    </form>
  );
}
