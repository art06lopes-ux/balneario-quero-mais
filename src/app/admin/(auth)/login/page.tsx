import { LoginForm } from "@/components/admin/AuthForms";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirecionar?: string }>;
}) {
  const { redirecionar } = await searchParams;
  return (
    <>
      <h1 className="mb-1 font-display text-2xl font-extrabold text-forest-800">
        Entrar no painel
      </h1>
      <p className="mb-7 text-sm text-ink-3">Acesso restrito ao administrador do balneário.</p>
      <LoginForm redirecionar={redirecionar?.startsWith("/admin") ? redirecionar : null} />
    </>
  );
}
