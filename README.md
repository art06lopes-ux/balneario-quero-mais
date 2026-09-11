# Balneário Quero Mais — site + painel administrativo

Site público do balneário com reserva via WhatsApp, e painel (`/admin`) onde o
dono edita tudo: textos, fotos, preço, número de WhatsApp, galeria, comidas,
localização e logo. Toda alteração no painel aparece no site na hora, sem
redeploy.

**Stack:** Next.js 16 (App Router) · React 19 · Tailwind 4 · Framer Motion ·
Swiper · Supabase (Postgres + Auth + Storage).

A prévia estática aprovada na fase 1 ficou em [`previa-fase1/`](previa-fase1/)
só como referência; não é usada pelo app.

---

## 1. Configurar o Supabase

1. Crie um projeto em <https://supabase.com> (plano gratuito serve). Região
   recomendada: São Paulo (`sa-east-1`).
2. No **SQL Editor** do projeto, rode, nesta ordem, o conteúdo de:
   - `supabase/migrations/0001_schema.sql` — tabelas
   - `supabase/migrations/0002_rls.sql` — segurança (RLS) e função `is_admin()`
   - `supabase/migrations/0003_storage.sql` — bucket `site` de fotos
   - `supabase/seed.sql` — conteúdo inicial (textos e fotos da prévia)
3. Em **Authentication → Providers → Email**, deixe *Confirm email* desligado
   (o admin é criado por script, já confirmado) e **desative o cadastro
   público** (*Allow new users to sign up* = off). Só o administrador entra.
4. Em **Authentication → URL Configuration**, coloque a URL do site em
   *Site URL* e adicione `https://SEU-SITE/admin/redefinir-senha` em
   *Redirect URLs* (é para o "esqueci minha senha").

## 2. Variáveis de ambiente

```bash
cp .env.example .env.local
```

Preencha em `.env.local` (valores em *Project Settings → API*):

| Variável | O que é |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto (`https://xxxx.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | chave *anon / publishable* (pública; a proteção é a RLS) |
| `NEXT_PUBLIC_SITE_URL` | origem do site sem barra final (`http://localhost:3000` em dev) |

A **service_role** nunca entra em arquivo. Ela é usada uma única vez, no
próximo passo, via variável temporária.

## 3. Criar o administrador

```bash
# PowerShell
$env:SUPABASE_SERVICE_ROLE_KEY="cole-a-service-role-aqui"; npm run create-admin -- dono@email.com

# Bash / macOS
SUPABASE_SERVICE_ROLE_KEY="cole-a-service-role-aqui" npm run create-admin -- dono@email.com
```

O script pede a senha no terminal (não aparece na tela), cria o usuário já
confirmado e grava `app_metadata.role = "admin"` — que é o que a RLS e o
painel exigem. Rodar de novo com o mesmo e-mail só troca a senha. Para trocar
de administrador depois, rode com o novo e-mail (e apague o antigo em
*Authentication → Users*).

Quem entrar sem essa marca vê "Sem permissão" e não consegue escrever nada,
mesmo com sessão válida.

## 4. Rodar

```bash
npm install
npm run dev
```

- Site: <http://localhost:3000>
- Painel: <http://localhost:3000/admin> (redireciona para o login)

Outros comandos: `npm run build`, `npm run start`, `npm run lint`,
`npm run typecheck`.

## 5. O painel (`/admin`)

| Seção | Controla |
| --- | --- |
| **Início** | Resumo e atalhos. |
| **Textos e imagens** | Hero (linha pequena, título, frase, foto de fundo), Sobre (título, texto, duas fotos), chamada final (frase, apoio, foto), **logo** e link do Instagram. |
| **WhatsApp e preço** | O número que recebe as reservas (usado em todos os botões, no flutuante e na localização) e o valor da entrada por pessoa. |
| **Estrutura** | Cards de "O que você encontra por aqui": título, descrição, foto, visível/oculto, ordem. |
| **Galeria** | Categorias (criar, renomear, apagar, reordenar), envio de várias fotos de uma vez, legenda, mover de categoria, ordem. A categoria **Comidas** é fixa e recebe automaticamente as fotos dos pratos. |
| **Comidas** | Pratos com foto, nome, descrição opcional, **preço opcional**, "mostrar na galeria", visível/oculto, ordem. |
| **Localização** | Endereço, horário, observações livres e a busca que posiciona o pino no mapa. |

Reordenar: arraste pela alça `⠿` (mouse ou dedo) ou use as setas `↑ ↓`. A
ordem é salva ao soltar.

Fotos: qualquer JPG/PNG/WebP/AVIF. O navegador redimensiona para no máximo
2000 px e comprime antes de enviar, então fotos de celular de 10 MB viram
~400 KB. Limite no Storage: 5 MB por arquivo. Há pré-visualização antes de
salvar.

Senha: link "Esqueci minha senha" no login envia e-mail com link para
`/admin/redefinir-senha` (fluxo nativo do Supabase).

## 6. Como funciona por dentro

- **Conteúdo**: `site_settings` (linha única), `features`, `gallery_categories`,
  `gallery_photos`, `food_items`. Caminhos de imagem começando com `/` apontam
  para `public/` (acervo inicial); os demais são objetos do bucket `site`.
- **Atualização instantânea**: a home é estática com revalidação de 5 min, e
  cada Server Action do painel chama `revalidatePath("/")`, então a próxima
  visita já vê a mudança.
- **Segurança em três camadas**: `src/proxy.ts` redireciona `/admin` sem
  sessão; toda Server Action chama `assertAdmin()`; e a RLS do banco exige
  `is_admin()` para qualquer escrita (leitura anônima só de linhas ativas).
  Sessão em cookie httpOnly. CSP e cabeçalhos de segurança em `proxy.ts` e
  `next.config.ts`. Uploads validados pelos bytes (magic numbers).
- **Imagens iniciais**: ficaram em `public/seed/`. Seis delas são recortes de
  prints do Instagram com 591 px de largura — em telas grandes o Hero fica
  pixelado. Basta o dono enviar as fotos originais pelo painel.

## 7. Publicar

Qualquer host de Next.js (Vercel é o caminho mais curto). Configure as três
variáveis de ambiente do passo 2 com os valores de produção e aponte
`NEXT_PUBLIC_SITE_URL` para o domínio final (ele entra no Open Graph — a foto
do Hero é a imagem de compartilhamento no WhatsApp/Instagram).
