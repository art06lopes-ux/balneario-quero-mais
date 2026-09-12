"use client";

import { useActionState, useState, useTransition } from "react";
import { Card } from "@/components/admin/PageHeader";
import { Sortable } from "@/components/admin/Sortable";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { Toast } from "@/components/ui/Toast";
import { optimizeInputFiles } from "@/lib/imageClient";
import { cn } from "@/lib/utils";
import { addPhotos, deleteCategory, deletePhoto, reorderCategories, reorderPhotos, saveCategory, updatePhoto } from "@/server/actions/gallery";
import type { FormState } from "@/server/actions/shared";

export type CategoryView = { id: string; name: string; slug: string };
export type PhotoView = { id: string; category_id: string; src: string; alt: string };

const IDLE: FormState = { error: null, success: null };
const FOOD_SLUG = "comidas";

export function GalleryManager({ categories: all, photos }: { categories: CategoryView[]; photos: PhotoView[] }) {
  // A categoria "Comidas" não é gerida aqui: ela é alimentada automaticamente
  // pelos pratos cadastrados na aba Comidas.
  const categories = all.filter((c) => c.slug !== FOOD_SLUG);
  const [toast, setToast] = useState<FormState>(IDLE);
  const [active, setActive] = useState<string>(categories[0]?.id ?? "");
  const current = categories.find((c) => c.id === active) ?? categories[0];
  const currentPhotos = photos.filter((p) => p.category_id === current?.id);

  return (
    <div className="grid gap-6">
      <Card title="Categorias">
        <p className="mb-4 text-sm text-ink-3">O visitante filtra a galeria por estas abas. Arraste para mudar a ordem. As fotos dos pratos cadastrados em <strong>Comidas</strong> entram sozinhas na aba &ldquo;Comidas&rdquo; da galeria do site — não precisa enviar aqui.</p>
        <Sortable
          items={categories}
          onReorder={reorderCategories}
          onResult={setToast}
          className="mb-4"
          render={(c) => <CategoryRow c={c} activeId={current?.id} onSelect={() => setActive(c.id)} onToast={setToast} />}
        />
        <NewCategoryForm onDone={setToast} />
      </Card>

      {current && (
        <Card title={`Fotos — ${current.name}`}>
          <UploadForm categoryId={current.id} onDone={setToast} />
          {currentPhotos.length === 0 ? (
            <p className="mt-4 text-sm text-ink-3">Nenhuma foto nesta categoria ainda.</p>
          ) : (
            <Sortable
              key={current.id}
              items={currentPhotos}
              onReorder={reorderPhotos}
              onResult={setToast}
              layout="grid"
              className="mt-5"
              render={(p) => <PhotoCard p={p} categories={categories} onToast={setToast} />}
            />
          )}
        </Card>
      )}
      <Toast state={toast} />
    </div>
  );
}

function CategoryRow({ c, activeId, onSelect, onToast }: { c: CategoryView; activeId?: string; onSelect: () => void; onToast: (s: FormState) => void }) {
  const [renaming, setRenaming] = useState(false);
  const [pending, start] = useTransition();
  const on = c.id === activeId;

  const remove = () => {
    if (!window.confirm(`Apagar a categoria "${c.name}" e TODAS as fotos dela?`)) return;
    start(async () => onToast(await deleteCategory(c.id)));
  };

  return (
    <div className="flex items-center gap-3 p-3 pr-32">
      <button type="button" onClick={onSelect} className={cn("flex-1 rounded-lg px-3 py-2 text-left font-display font-semibold transition-colors", on ? "bg-sun-500 text-forest-900" : "text-forest-800 hover:bg-forest-100")}>
        {c.name}
      </button>
      {renaming ? (
        <RenameForm c={c} onDone={(s) => { onToast(s); if (s.success) setRenaming(false); }} onCancel={() => setRenaming(false)} />
      ) : (
        <>
          <Button size="sm" variant="ghost" onClick={() => setRenaming(true)}>Renomear</Button>
          <Button size="sm" variant="ghost" onClick={remove} loading={pending} className="text-[#9c2626]">Apagar</Button>
        </>
      )}
    </div>
  );
}

function RenameForm({ c, onDone, onCancel }: { c: CategoryView; onDone: (s: FormState) => void; onCancel: () => void }) {
  const [, action, pending] = useActionState(
    async (_p: FormState, fd: FormData) => {
      const r = await saveCategory(_p, fd);
      onDone(r);
      return r;
    },
    IDLE,
  );
  return (
    <form action={action} className="flex items-center gap-2">
      <input type="hidden" name="id" value={c.id} />
      <Input name="name" defaultValue={c.name} maxLength={40} required autoFocus className="max-w-[180px] py-1.5" />
      <Button size="sm" type="submit" loading={pending}>OK</Button>
      <Button size="sm" variant="ghost" type="button" onClick={onCancel}>Cancelar</Button>
    </form>
  );
}

function NewCategoryForm({ onDone }: { onDone: (s: FormState) => void }) {
  const [state, action, pending] = useActionState(
    async (_p: FormState, fd: FormData) => {
      const r = await saveCategory(_p, fd);
      onDone(r);
      return r;
    },
    IDLE,
  );
  return (
    <form action={action} key={state.success ?? "x"} className="flex flex-wrap items-end gap-2">
      <Field label="Nova categoria" htmlFor="new-cat" className="flex-1">
        <Input id="new-cat" name="name" maxLength={40} placeholder="Ex.: Eventos" required />
      </Field>
      <Button type="submit" variant="secondary" loading={pending}>+ Criar</Button>
    </form>
  );
}

function UploadForm({ categoryId, onDone }: { categoryId: string; onDone: (s: FormState) => void }) {
  const [previews, setPreviews] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [state, action, pending] = useActionState(
    async (_p: FormState, fd: FormData) => {
      const r = await addPhotos(_p, fd);
      onDone(r);
      if (r.success) setPreviews([]);
      return r;
    },
    IDLE,
  );

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    setBusy(true);
    const files = await optimizeInputFiles(input);
    setBusy(false);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  return (
    <form action={action} key={state.success ?? "form"} className="grid gap-3 rounded-xl border border-dashed border-forest-500/40 bg-forest-100/40 p-4">
      <input type="hidden" name="category_id" value={categoryId} />
      <label className="font-display text-sm font-semibold text-ink-2">Adicionar fotos (pode selecionar várias)</label>
      <input
        name="images"
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/avif"
        onChange={onChange}
        required
        className="block w-full text-sm text-ink-2 file:mr-3 file:rounded-lg file:border-0 file:bg-forest-700 file:px-3 file:py-2 file:font-display file:text-sm file:font-semibold file:text-white hover:file:bg-forest-800"
      />
      {busy && <p className="text-xs text-ink-3">Otimizando imagens…</p>}
      {previews.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {previews.map((src) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={src} src={src} alt="" className="size-16 rounded-lg object-cover" />
          ))}
        </div>
      )}
      <div className="flex justify-end">
        <Button type="submit" loading={pending} disabled={busy || previews.length === 0}>
          Enviar {previews.length > 0 ? `${previews.length} foto(s)` : ""}
        </Button>
      </div>
    </form>
  );
}

function PhotoCard({ p, categories, onToast }: { p: PhotoView; categories: CategoryView[]; onToast: (s: FormState) => void }) {
  const [pending, start] = useTransition();
  const [alt, setAlt] = useState(p.alt);

  const remove = () => {
    if (!window.confirm("Remover esta foto?")) return;
    start(async () => onToast(await deletePhoto(p.id)));
  };

  return (
    <div className="flex h-full flex-col">
      <div className="aspect-[4/3] overflow-hidden rounded-t-2xl bg-forest-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.src} alt={p.alt} className="h-full w-full object-cover" loading="lazy" />
      </div>
      <div className="grid gap-2 p-3">
        <input
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
          onBlur={() => alt !== p.alt && start(async () => onToast(await updatePhoto(p.id, { alt })))}
          placeholder="Legenda (opcional)"
          maxLength={120}
          aria-label="Legenda da foto"
          className="w-full rounded-lg border border-forest-900/15 px-2.5 py-1.5 text-sm outline-none focus:border-forest-500"
        />
        <div className="flex items-center gap-2">
          <select
            value={p.category_id}
            onChange={(e) => start(async () => onToast(await updatePhoto(p.id, { category_id: e.target.value })))}
            aria-label="Mover para categoria"
            className="flex-1 rounded-lg border border-forest-900/15 bg-white px-2 py-1.5 text-sm"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <Button size="sm" variant="ghost" onClick={remove} loading={pending} className="text-[#9c2626]">Remover</Button>
        </div>
      </div>
    </div>
  );
}
