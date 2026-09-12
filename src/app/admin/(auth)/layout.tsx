import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Painel — Balneário Quero Mais",
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-svh place-items-center bg-[radial-gradient(900px_500px_at_10%_0%,rgba(31,138,76,.35),transparent_60%),radial-gradient(700px_500px_at_100%_100%,rgba(29,127,214,.35),transparent_60%)] bg-forest-900 px-5 py-10">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-deep sm:p-10">{children}</div>
    </main>
  );
}
