"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Detalhe técnico vai para o console (e para os logs da Vercel), não para o visitante.
    console.error(error);
  }, [error]);

  return (
    <main className="grid min-h-svh place-items-center bg-sand px-6 text-center">
      <div className="max-w-md">
        <span className="eyebrow text-forest-500">Ops</span>
        <h1 className="mb-3 font-display text-3xl font-extrabold text-forest-800">Não conseguimos carregar o site agora</h1>
        <p className="mb-6 text-ink-2">
          Deve ser algo passageiro. Tente de novo em alguns segundos — ou fale direto com o balneário pelo WhatsApp.
        </p>
        <button type="button" onClick={reset} className="btn btn-sun btn-lg">
          Tentar de novo
        </button>
        {error.digest && <p className="mt-6 text-xs text-ink-3">Código: {error.digest}</p>}
      </div>
    </main>
  );
}
