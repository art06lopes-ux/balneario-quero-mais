import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Briefing 12.1: proibido `any` e `console.log` em producao.
      // `warn` e `error` seguem permitidos para falhas que precisam ser observadas no servidor.
      "@typescript-eslint/no-explicit-any": "error",
      "no-console": ["error", { allow: ["warn", "error"] }],
    },
  },
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Assets e originais fora do build.
    "assets-originais/**",
    "public/**",
    // Ferramentas de linha de comando, nao codigo da aplicacao: usam
    // `console` como saida legitima e nao vao para o bundle.
    "scripts/**",
  ]),
]);

export default eslintConfig;
