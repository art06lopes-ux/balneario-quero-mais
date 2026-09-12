import { GalleryManager } from "@/components/admin/GalleryManager";
import { PageHeader } from "@/components/admin/PageHeader";
import { getGalleryForAdmin } from "@/server/repositories/admin";

export default async function GalleryPage() {
  const { categories, photos } = await getGalleryForAdmin();
  return (
    <>
      <PageHeader
        title="Galeria"
        description="Fotos organizadas por categoria. As imagens são otimizadas automaticamente ao enviar."
        siteAnchor="#galeria"
      />
      <GalleryManager categories={categories} photos={photos} />
    </>
  );
}
