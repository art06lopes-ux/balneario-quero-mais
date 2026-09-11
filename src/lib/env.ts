/**
 * Variáveis de ambiente obrigatórias. A leitura é por função para que o
 * erro apareça em quem realmente precisa do valor, com instrução de onde
 * definir. Referências literais a process.env.X são obrigatórias: o Next
 * substitui em tempo de build.
 */
function readEnv(name: string, value: string | undefined): string {
  if (value === undefined || value.trim() === "") {
    throw new Error(
      `Variável de ambiente ausente: ${name}. Copie .env.example para .env.local e preencha. Ver README.md.`,
    );
  }
  return value.trim();
}

export function getSupabaseUrl(): string {
  return readEnv("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL);
}

export function getSupabaseAnonKey(): string {
  return readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function getSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").trim().replace(/\/+$/, "");
}
