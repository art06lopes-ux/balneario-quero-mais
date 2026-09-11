import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { getSupabaseUrl } from "@/lib/env";
import { imageUrl } from "@/lib/storage";
import { requireAdmin } from "@/server/auth";
import { createAuthenticatedClient } from "@/server/supabase/server";

export const metadata: Metadata = { title: "Painel — Balneário Quero Mais", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  const supabase = await createAuthenticatedClient();
  const { data } = await supabase.from("site_settings").select("logo_path").eq("id", 1).maybeSingle<{ logo_path: string | null }>();

  return (
    <AdminShell email={user.email ?? ""} logo={imageUrl(data?.logo_path, getSupabaseUrl())}>
      {children}
    </AdminShell>
  );
}
