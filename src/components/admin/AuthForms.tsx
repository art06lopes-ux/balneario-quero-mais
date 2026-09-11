"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { requestPasswordReset, signIn, updatePassword, type ActionState, type RecoveryState } from "@/server/actions/auth";

const IDLE: ActionState = { error: null };

export function LoginForm({ redirecionar }: { redirecionar: string | null }) {
  const [state, action, pending] = useActionState(signIn, IDLE);
  return (
    <form action={action} className="grid gap-5">
      {redirecionar && <input type="hidden" name="redirecionar" value={redirecionar} />}
      <Field label="E-mail" htmlFor="email">
        <Input id="email" name="email" type="email" autoComplete="username" autoFocus required />
      </Field>
      <Field label="Senha" htmlFor="password">
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </Field>
      {state.error && (
        <p role="alert" className="text-sm text-[#b93232]">{state.error}</p>
      )}
      <Button type="submit" size="lg" loading={pending}>
        Entrar
      </Button>
      <Link href="/admin/recuperar-senha" className="text-center text-sm text-forest-700 underline underline-offset-4">
        Esqueci minha senha
      </Link>
    </form>
  );
}

export function RecoveryForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, { error: null, sent: false } as RecoveryState);
  if (state.sent) {
    return (
      <p className="rounded-xl bg-forest-100 p-4 text-sm text-forest-800">
        Se esse e-mail estiver cadastrado, você vai receber um link para criar uma nova senha. Confira também a caixa de spam.
      </p>
    );
  }
  return (
    <form action={action} className="grid gap-5">
      <Field label="E-mail do administrador" htmlFor="email">
        <Input id="email" name="email" type="email" autoComplete="username" autoFocus required />
      </Field>
      {state.error && <p role="alert" className="text-sm text-[#b93232]">{state.error}</p>}
      <Button type="submit" size="lg" loading={pending}>
        Enviar link
      </Button>
      <Link href="/admin/login" className="text-center text-sm text-forest-700 underline underline-offset-4">
        Voltar ao login
      </Link>
    </form>
  );
}

export function NewPasswordForm() {
  const [state, action, pending] = useActionState(updatePassword, IDLE);
  return (
    <form action={action} className="grid gap-5">
      <Field label="Nova senha" htmlFor="password" hint="Mínimo de 8 caracteres.">
        <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required autoFocus />
      </Field>
      <Field label="Confirmar nova senha" htmlFor="confirm">
        <Input id="confirm" name="confirm" type="password" autoComplete="new-password" minLength={8} required />
      </Field>
      {state.error && <p role="alert" className="text-sm text-[#b93232]">{state.error}</p>}
      <Button type="submit" size="lg" loading={pending}>
        Salvar nova senha
      </Button>
    </form>
  );
}
