#!/usr/bin/env node
/**
 * Cria (ou promove) o usuário administrador do painel.
 *
 *   npm run create-admin -- dono@exemplo.com
 *
 * Pede a senha no terminal (sem exibir). Precisa da SERVICE ROLE KEY do
 * projeto Supabase — ela NÃO fica em arquivo nenhum do projeto: passe
 * pela variável de ambiente SUPABASE_SERVICE_ROLE_KEY só nesta execução.
 *
 *   PowerShell:  $env:SUPABASE_SERVICE_ROLE_KEY="..." ; npm run create-admin -- email
 *   Bash:        SUPABASE_SERVICE_ROLE_KEY="..." npm run create-admin -- email
 *
 * A marca de administrador vai em app_metadata.role = "admin" — é o que a
 * RLS (função is_admin) e o painel conferem. Só a service role grava isso.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import readline from "node:readline";

function loadEnvLocal() {
  try {
    for (const line of readFileSync(".env.local", "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
    }
  } catch {
    /* sem .env.local: usa só o ambiente */
  }
}

function askHidden(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    const onData = (ch) => {
      const c = String(ch);
      if (c === "\n" || c === "\r" || c === "") process.stdout.write("\n");
    };
    process.stdout.write(question);
    rl._writeToOutput = () => {}; // não ecoa a senha
    process.stdin.on("data", onData);
    rl.question("", (answer) => {
      process.stdin.off("data", onData);
      rl.close();
      resolve(answer);
    });
  });
}

async function main() {
  loadEnvLocal();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const email = process.argv[2];

  if (!url) fail("NEXT_PUBLIC_SUPABASE_URL não definida (.env.local).");
  if (!serviceKey) fail("SUPABASE_SERVICE_ROLE_KEY não definida. Pegue em Project Settings > API Keys > service_role e passe só nesta execução.");
  if (!email || !email.includes("@")) fail("Uso: npm run create-admin -- email@dominio.com");

  const password = await askHidden(`Senha para ${email} (mín. 8 caracteres, não será exibida): `);
  if (password.length < 8) fail("Senha muito curta.");

  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

  // Já existe? Então só promove e troca a senha.
  const { data: list, error: listErr } = await admin.auth.admin.listUsers({ perPage: 1000 });
  if (listErr) fail(listErr.message);
  const existing = list.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

  if (existing) {
    const { error } = await admin.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
      app_metadata: { ...existing.app_metadata, role: "admin" },
    });
    if (error) fail(error.message);
    console.log(`✔ Usuário ${email} já existia: senha atualizada e marcado como administrador.`);
  } else {
    const { error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      app_metadata: { role: "admin" },
    });
    if (error) fail(error.message);
    console.log(`✔ Administrador ${email} criado. Entre em /admin/login.`);
  }
}

function fail(msg) {
  console.error(`✖ ${msg}`);
  process.exit(1);
}

main();
