"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="grid min-h-svh place-items-center bg-sand px-6 text-center">
      <div>
        <h1 className="mb-3 font-display text-3xl font-extrabold text-forest-800">Algo deu errado</h1>
        <p className="mb-6 max-w-md text-ink-2">{error.message}</p>
        <button type="button" onClick={reset} className="btn btn-sun">
          Tentar de novo
        </button>
      </div>
    </main>
  );
}
