"use client";

import { useEffect, useId, useState } from "react";
import { optimizeInputFiles } from "@/lib/imageClient";
import { cn } from "@/lib/utils";

type Props = {
  name: string;
  label: string;
  /** URL da imagem atual (já resolvida) */
  current?: string | null;
  /** Permite marcar "remover imagem atual" */
  removable?: boolean;
  hint?: string;
  aspect?: string; // ex.: "aspect-video"
  required?: boolean;
};

/**
 * Campo de imagem com pré-visualização antes de salvar. O arquivo é
 * otimizado no navegador (redimensionado/comprimido) assim que é escolhido.
 */
export function ImageField({ name, label, current, removable, hint, aspect = "aspect-video", required }: Props) {
  const id = useId();
  const [preview, setPreview] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    if (!input.files || input.files.length === 0) {
      setPreview(null);
      setInfo(null);
      return;
    }
    setBusy(true);
    const [file] = await optimizeInputFiles(input);
    setBusy(false);
    if (!file) return;
    setPreview((old) => {
      if (old) URL.revokeObjectURL(old);
      return URL.createObjectURL(file);
    });
    setInfo(`${file.name} · ${(file.size / 1024).toFixed(0)} KB (otimizada)`);
  };

  const shown = preview ?? current ?? null;

  return (
    <div className="grid gap-2">
      <span className="font-display text-sm font-semibold text-ink-2">{label}</span>
      <div className="grid gap-3 sm:grid-cols-[180px_1fr]">
        <div className={cn("relative overflow-hidden rounded-xl border border-forest-900/10 bg-forest-100", aspect)}>
          {shown ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={shown} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="grid h-full place-items-center text-xs text-ink-3">Sem imagem</span>
          )}
          {preview && (
            <span className="absolute top-1.5 left-1.5 rounded-full bg-sun-500 px-2 py-0.5 text-[10px] font-bold text-forest-900">NOVA</span>
          )}
        </div>
        <div className="grid content-start gap-2">
          <input
            id={id}
            name={name}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            onChange={onChange}
            required={required && !current}
            className="block w-full text-sm text-ink-2 file:mr-3 file:rounded-lg file:border-0 file:bg-forest-700 file:px-3 file:py-2 file:font-display file:text-sm file:font-semibold file:text-white hover:file:bg-forest-800"
          />
          {busy && <p className="text-xs text-ink-3">Otimizando imagem…</p>}
          {info && <p className="text-xs text-forest-700">{info}</p>}
          {hint && <p className="text-xs text-ink-3">{hint}</p>}
          {removable && current && !preview && (
            <label className="inline-flex items-center gap-2 text-xs text-[#9c2626]">
              <input type="checkbox" name={`remove_${name}`} className="accent-[#b93232]" />
              Remover a imagem atual
            </label>
          )}
        </div>
      </div>
    </div>
  );
}
