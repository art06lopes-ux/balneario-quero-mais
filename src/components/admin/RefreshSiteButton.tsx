"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";
import { refreshSite } from "@/server/actions/refresh";
import type { FormState } from "@/server/actions/shared";

export function RefreshSiteButton() {
  const [state, setState] = useState<FormState>({ error: null, success: null });
  const [pending, start] = useTransition();
  return (
    <>
      <Button
        variant="secondary"
        loading={pending}
        onClick={() => start(async () => setState(await refreshSite()))}
        title="Use se cadastrou algo direto no banco e o site ainda mostra o conteúdo antigo"
      >
        Atualizar site agora
      </Button>
      <Toast state={state} />
    </>
  );
}
