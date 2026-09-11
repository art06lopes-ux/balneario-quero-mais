"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { getSiteUrl } from "@/lib/env";
import { createAuthenticatedClient } from "@/server/supabase/server";

export type ActionState = { error: string | null };

const loginSchema = z.object({
  email: z.string().trim().min(1, "Informe o e-mail.").email("E-mail inválido."),
  password: z.string().min(1, "Informe a senha."),
});

const CREDENCIAIS_INVALIDAS = "E-mail ou senha incorretos.";

export async function signIn(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? CREDENCIAIS_INVALIDAS };
  }

  const supabase = await createAuthenticatedClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error !== null) {
    if (error.status === 429) {
      return { error: "Muitas tentativas. Aguarde alguns minutos e tente novamente." };
    }
    return { error: CREDENCIAIS_INVALIDAS };
  }

  const destino = formData.get("redirecionar");
  redirect(typeof destino === "string" && destino.startsWith("/admin") ? destino : "/admin");
}

export async function signOut(): Promise<void> {
  const supabase = await createAuthenticatedClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export type RecoveryState = { error: string | null; sent: boolean };

export async function requestPasswordReset(
  _prev: RecoveryState,
  formData: FormData,
): Promise<RecoveryState> {
  const parsed = z.string().trim().email("E-mail inválido.").safeParse(formData.get("email"));
  if (!parsed.success) return { error: "E-mail inválido.", sent: false };

  const supabase = await createAuthenticatedClient();
  // Sempre responde "enviado": não revela se o e-mail existe.
  await supabase.auth.resetPasswordForEmail(parsed.data, {
    redirectTo: `${getSiteUrl()}/admin/redefinir-senha`,
  });
  return { error: null, sent: true };
}

const newPasswordSchema = z
  .object({
    password: z.string().min(8, "A senha precisa ter ao menos 8 caracteres."),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { message: "As senhas não coincidem.", path: ["confirm"] });

export async function updatePassword(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = newPasswordSchema.safeParse({
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Senha inválida." };

  const supabase = await createAuthenticatedClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error !== null) {
    return { error: "Não foi possível alterar a senha. Solicite um novo link e tente de novo." };
  }
  redirect("/admin");
}
