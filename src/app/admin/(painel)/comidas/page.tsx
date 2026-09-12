import { FoodManager } from "@/components/admin/FoodManager";
import { PageHeader } from "@/components/admin/PageHeader";
import { getFoodForAdmin } from "@/server/repositories/admin";

export default async function FoodPage() {
  const items = await getFoodForAdmin();
  return (
    <>
      <PageHeader title="Comidas" description="Pratos da seção Comidas do site. Cada prato com foto também aparece automaticamente na aba Comidas da galeria. O preço é opcional." />
      <FoodManager items={items} />
    </>
  );
}
