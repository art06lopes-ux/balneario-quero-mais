import { NewPasswordForm } from "@/components/admin/AuthForms";

export default function ResetPage() {
  return (
    <>
      <h1 className="mb-1 font-display text-2xl font-extrabold text-forest-800">Nova senha</h1>
      <p className="mb-7 text-sm text-ink-3">Escolha a nova senha do painel.</p>
      <NewPasswordForm />
    </>
  );
}
