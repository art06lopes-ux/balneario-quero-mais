import { PageHeader } from "@/components/admin/PageHeader";
import { LocationForm } from "@/components/admin/SettingsForms";
import { getSettingsRow } from "@/server/repositories/admin";

export default async function LocationPage() {
  const row = await getSettingsRow();
  return (
    <>
      <PageHeader title="Localização e funcionamento" />
      <LocationForm row={row} />
    </>
  );
}
