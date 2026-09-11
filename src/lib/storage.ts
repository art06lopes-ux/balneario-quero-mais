/**
 * Resolve o caminho guardado no banco para uma URL que o navegador abre.
 *
 *  - "/seed/foto.jpg"  -> arquivo em public/ (acervo inicial)
 *  - "hero/abc.jpg"    -> objeto público do bucket "site" no Storage
 */
export const SITE_BUCKET = "site";

export function imageUrl(path: string | null | undefined, supabaseUrl: string): string | null {
  if (!path) return null;
  if (path.startsWith("/") || path.startsWith("http")) return path;
  return `${supabaseUrl}/storage/v1/object/public/${SITE_BUCKET}/${path}`;
}
