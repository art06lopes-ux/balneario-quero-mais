import { signOut } from "@/server/actions/auth";

export default function NoAccessPage() {
  return (
    <>
      <h1 className="mb-2 font-display text-2xl font-extrabold text-forest-800">Sem permissão</h1>
      <p className="mb-6 text-sm text-ink-2">
        Esta conta existe, mas não está marcada como administradora. Peça a quem configurou o
        sistema para promover o usuário (ver README, seção &ldquo;Criar o administrador&rdquo;).
      </p>
      <form action={signOut}>
        <button type="submit" className="btn btn-sun w-full">
          Sair
        </button>
      </form>
    </>
  );
}
