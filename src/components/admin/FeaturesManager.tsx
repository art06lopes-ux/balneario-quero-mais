"use client";

import { useActionState, useState, useTransition } from "react";
import { ImageField } from "@/components/admin/ImageField";
import { Card } from "@/components/admin/PageHeader";
import { Sortable } from "@/components/admin/Sortable";
import { Button } from "@/components/ui/Button";
import { Checkbox, Field, Input, Textarea } from "@/components/ui/Field";
import { Toast } from "@/components/ui/Toast";
import { deleteFeature, reorderFeatures, saveFeature } from "@/server/actions/features";
import type { FormState } from "@/server/actions/shared";

export type FeatureView = {
  id: string;
  title: string;
  description: string;
  image: string | null;
  is_active: boolean;
};

const IDLE: FormState = { error: null, success: null };

export function FeaturesManager({ items }: { items: FeatureView[] }) {
  const [toast, setToast] = useState<FormState>(IDLE);
  const [adding, setAdding] = useState(false);

  return (
    <div className="grid gap-6">
      <div className="flex justify-end">
        <Button onClick={() => setAdding((v) => !v)} variant={adding ? "secondary" : "primary"}>
          {adding ? "Cancelar" : "+ Adicionar item"}
        </Button>
      </div>

      {adding && (
        <Card title="Novo item">
          <FeatureForm
            onDone={(s) => {
              setToast(s);
              if (s.success) setAdding(false);
            }}
          />
        </Card>
      )}

      {items.length === 0 ? (
        <p className="text-sm text-ink-3">Nenhum item ainda. Adicione o primeiro.</p>
      ) : (
        <Sortable
          items={items}
          onReorder={reorderFeatures}
          onResult={setToast}
          render={(f) => <FeatureCard f={f} onToast={setToast} />}
        />
      )}
      <Toast state={toast} />
    </div>
  );
}

function FeatureCard({ f, onToast }: { f: FeatureView; onToast: (s: FormState) => void }) {
  const [editing, setEditing] = useState(false);
  const [pending, start] = useTransition();

  const remove = () => {
    if (!window.confirm(`Remover "${f.title}"?`)) return;
    start(async () => onToast(await deleteFeature(f.id)));
  };

  return (
    <div className="p-4">
      <div className="flex gap-4">
        <div className="size-20 shrink-0 overflow-hidden rounded-xl bg-forest-100">
          {f.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={f.image} alt="" className="h-full w-full object-cover" />
          )}
        </div>
        <div className="min-w-0 flex-1 pr-28">
          <h3 className="truncate font-display font-bold text-forest-800">
            {f.title}
            {!f.is_active && (
              <span className="ml-2 rounded-full bg-forest-100 px-2 py-0.5 text-[10px] font-semibold text-ink-3 uppercase">
                oculto
              </span>
            )}
          </h3>
          <p className="line-clamp-2 text-sm text-ink-2">{f.description}</p>
          <div className="mt-2 flex gap-2">
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
        </div>
      </div>
      {editing && (
        <div className="mt-4 border-t border-forest-900/10 pt-4">
          <FeatureForm
            feature={f}
            onDone={(s) => {
              onToast(s);
              if (s.success) setEditing(false);
            }}
          />
        </div>
      )}
    </div>
  );
}

function FeatureForm({
  feature,
  onDone,
}: {
  feature?: FeatureView;
  onDone: (s: FormState) => void;
}) {
  const [state, action, pending] = useActionState(async (_prev: FormState, fd: FormData) => {
    const r = await saveFeature(_prev, fd);
    onDone(r);
    return r;
  }, IDLE);
  return (
    <form action={action} className="grid gap-4">
      {feature && <input type="hidden" name="id" value={feature.id} />}
      <Field label="Título" htmlFor={`title-${feature?.id ?? "new"}`}>
        <Input
          id={`title-${feature?.id ?? "new"}`}
          name="title"
          defaultValue={feature?.title}
          maxLength={80}
          required
        />
      </Field>
      <Field label="Descrição curta" htmlFor={`desc-${feature?.id ?? "new"}`}>
        <Textarea
          id={`desc-${feature?.id ?? "new"}`}
          name="description"
          defaultValue={feature?.description}
          maxLength={300}
          className="min-h-[80px]"
        />
      </Field>
      <ImageField
        name="image"
        label="Foto"
        current={feature?.image}
        aspect="aspect-[3/4]"
        required={!feature}
      />
      {feature && (
        <Checkbox name="is_active" label="Visível no site" defaultChecked={feature.is_active} />
      )}
      {state.error && <p className="text-sm text-[#b93232]">{state.error}</p>}
      <div className="flex justify-end">
        <Button type="submit" loading={pending}>
          {feature ? "Salvar" : "Adicionar"}
        </Button>
      </div>
    </form>
  );
}
