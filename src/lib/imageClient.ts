/**
 * Otimização de imagem no navegador, antes do upload.
 *
 * Fotos de celular chegam com 4–12 MB; aqui viram JPEG de no máximo
 * 2000 px no maior lado, o que costuma ficar entre 300 e 600 KB. Roda só
 * no cliente (canvas), então não depende de biblioteca nativa no servidor.
 * PNG com transparência (logo) é preservado como PNG.
 */
const MAX_SIDE = 2000;
const JPEG_QUALITY = 0.85;

export async function optimizeImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;

  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;

  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);

  // Já é pequena e leve: não mexe.
  if (scale === 1 && file.size < 900 * 1024) {
    bitmap.close();
    return file;
  }

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return file;
  }
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  const keepPng = file.type === "image/png";
  const type = keepPng ? "image/png" : "image/jpeg";
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, type, keepPng ? undefined : JPEG_QUALITY),
  );
  if (!blob) return file;

  const name = file.name.replace(/\.[^.]+$/, "") + (keepPng ? ".png" : ".jpg");
  return new File([blob], name, { type, lastModified: Date.now() });
}

/** Substitui os arquivos de um <input type="file"> pelos otimizados. */
export async function optimizeInputFiles(input: HTMLInputElement): Promise<File[]> {
  const files = Array.from(input.files ?? []);
  const optimized = await Promise.all(files.map(optimizeImage));
  const dt = new DataTransfer();
  for (const f of optimized) dt.items.add(f);
  input.files = dt.files;
  return optimized;
}
