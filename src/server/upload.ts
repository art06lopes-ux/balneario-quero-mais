import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { SITE_BUCKET } from "@/lib/storage";

export const MAX_BYTES = 5 * 1024 * 1024;

export type UploadFolder = "hero" | "about" | "cta" | "logo" | "features" | "gallery" | "food";

export type UploadResult = { ok: true; path: string } | { ok: false; error: string };

type ImageKind = "jpeg" | "png" | "webp" | "avif";

function eq(bytes: Uint8Array, start: number, expected: number[]): boolean {
  if (bytes.length < start + expected.length) return false;
  return expected.every((v, i) => bytes[start + i] === v);
}
function ascii(bytes: Uint8Array, start: number, len: number): string {
  return String.fromCharCode(...bytes.subarray(start, start + len));
}

/** Detecta o tipo pelos bytes — não confia no nome nem no MIME declarado. */
export function detectImageKind(bytes: Uint8Array): ImageKind | null {
  if (eq(bytes, 0, [0xff, 0xd8, 0xff])) return "jpeg";
  if (eq(bytes, 0, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "png";
  if (ascii(bytes, 0, 4) === "RIFF" && ascii(bytes, 8, 4) === "WEBP") return "webp";
  if (ascii(bytes, 4, 4) === "ftyp" && ascii(bytes, 8, 4).startsWith("avi")) return "avif";
  return null;
}

/**
 * Envia uma imagem ao bucket "site". Um arquivo HTML renomeado para .jpg
 * é recusado aqui, antes de chegar ao Storage.
 */
export async function uploadImage(
  supabase: SupabaseClient,
  folder: UploadFolder,
  file: File,
): Promise<UploadResult> {
  if (file.size === 0) return { ok: false, error: "Arquivo vazio." };
  if (file.size > MAX_BYTES) {
    return { ok: false, error: `"${file.name}" passa de 5 MB. Escolha uma imagem menor.` };
  }

  const buffer = await file.arrayBuffer();
  const kind = detectImageKind(new Uint8Array(buffer));
  if (kind === null) {
    return { ok: false, error: `"${file.name}" não é uma imagem JPEG, PNG, WebP ou AVIF.` };
  }

  const ext = kind === "jpeg" ? "jpg" : kind;
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(SITE_BUCKET).upload(path, buffer, {
    contentType: `image/${kind}`,
    upsert: false,
    cacheControl: "31536000",
  });

  if (error !== null) {
    return { ok: false, error: `Falha ao enviar "${file.name}": ${error.message}` };
  }
  return { ok: true, path };
}

/** Remove do Storage. Caminhos de public/ ("/seed/...") são ignorados. */
export async function removeStoredFile(
  supabase: SupabaseClient,
  path: string | null | undefined,
): Promise<void> {
  if (!path || path.startsWith("/") || path.startsWith("http")) return;
  const { error } = await supabase.storage.from(SITE_BUCKET).remove([path]);
  if (error !== null) console.warn(`Não foi possível remover ${path}: ${error.message}`);
}

/** Extrai o arquivo do FormData, ou null quando o campo veio vazio. */
export function fileFrom(formData: FormData, field: string): File | null {
  const f = formData.get(field);
  if (!(f instanceof File) || f.size === 0) return null;
  return f;
}
