"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Avisa antes de sair da página com alterações não salvas.
 *
 * Envolve o <form>: marca "sujo" ao digitar/escolher arquivo e limpa quando
 * a action devolve sucesso (o `savedKey` muda). Sem servidor, sem estado
 * global — só o beforeunload do navegador.
 */
export function UnsavedGuard({
  savedKey,
  children,
}: {
  savedKey: string | null;
  children: ReactNode;
}) {
  const dirty = useRef(false);

  // Salvou com sucesso: o formulário volta a estar "limpo".
  useEffect(() => {
    if (savedKey !== null) dirty.current = false;
  }, [savedKey]);

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!dirty.current) return;
      e.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  const markDirty = () => {
    dirty.current = true;
  };

  return (
    <div onInput={markDirty} onChange={markDirty}>
      {children}
    </div>
  );
}
