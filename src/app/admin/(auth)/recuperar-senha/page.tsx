import { RecoveryForm } from "@/components/admin/AuthForms";

export default function RecoverPage() {
  return (
    <>
      <h1 className="mb-1 font-display text-2xl font-extrabold text-forest-800">Recuperar senha</h1>
      <p className="mb-7 text-sm text-ink-3">Enviamos um link por e-mail para você criar uma nova senha.</p>
      <RecoveryForm />
    </>
  );
}
