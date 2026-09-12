import { PageHeader } from "@/components/admin/PageHeader";
import { GeneralForm } from "@/components/admin/SettingsForms";
import { getSupabaseUrl } from "@/lib/env";
import { imageUrl } from "@/lib/storage";
import { getSettingsRow } from "@/server/repositories/admin";

export default async function GeralPage() {
  const row = await getSettingsRow();
  const b = getSupabaseUrl();
  return (
    <>
      <PageHeader
        title="Textos e imagens"
        description="Os textos e fotos de destaque do site. Salve uma vez ao final."
        siteAnchor="#inicio"
      />
      <GeneralForm
        row={row}
        urls={{
          hero: imageUrl(row.hero_image_path, b),
          about: imageUrl(row.about_image_path, b),
          aboutSecondary: imageUrl(row.about_image_secondary_path, b),
          cta: imageUrl(row.cta_image_path, b),
          logo: imageUrl(row.logo_path, b),
        }}
      />
    </>
  );
}
