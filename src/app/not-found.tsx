import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-svh place-items-center bg-[radial-gradient(900px_500px_at_10%_0%,rgba(31,138,76,.35),transparent_60%),radial-gradient(700px_500px_at_100%_100%,rgba(29,127,214,.35),transparent_60%)] bg-forest-900 px-6 text-center text-white">
      <div className="max-w-md">
        <span className="eyebrow text-sun-500">Erro 404</span>
        <h1 className="mb-3 font-display text-4xl font-extrabold">Essa página não existe</h1>
        <p className="mb-8 text-white/75">
          O endereço pode estar errado ou a página foi removida. O balneário continua aqui, do lado.
        </p>
        <Link href="/" className="btn btn-sun btn-lg">
          Voltar ao início
        </Link>
      </div>
    </main>
  );
}
