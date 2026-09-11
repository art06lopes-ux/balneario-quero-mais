import { FeaturesManager } from "@/components/admin/FeaturesManager";
import { PageHeader } from "@/components/admin/PageHeader";
import { getFeaturesForAdmin } from "@/server/repositories/admin";

export default async function FeaturesPage() {
  const items = await getFeaturesForAdmin();
  return (
    <>
      <PageHeader title="Estrutura" description="Os cards de 'O que você encontra por aqui'. Arraste para reordenar." />
      <FeaturesManager items={items} />
    </>
  );
}
