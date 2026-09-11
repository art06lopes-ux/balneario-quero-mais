import { FoodManager } from "@/components/admin/FoodManager";
import { PageHeader } from "@/components/admin/PageHeader";
import { getFoodForAdmin } from "@/server/repositories/admin";

export default async function FoodPage() {
  const items = await getFoodForAdmin();
  return (
    <>
      <PageHeader title="Comidas" description="Pratos exibidos na seção de comidas do site. O preço é opcional." />
      <FoodManager items={items} />
    </>
  );
}
