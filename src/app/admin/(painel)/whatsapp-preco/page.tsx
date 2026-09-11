import { PageHeader } from "@/components/admin/PageHeader";
import { CommerceForm } from "@/components/admin/SettingsForms";
import { getSettingsRow } from "@/server/repositories/admin";

export default async function CommercePage() {
  const row = await getSettingsRow();
  return (
    <>
      <PageHeader title="WhatsApp e preço" description="O número que recebe as reservas e o valor da entrada por pessoa." />
      <CommerceForm row={row} />
    </>
  );
}
