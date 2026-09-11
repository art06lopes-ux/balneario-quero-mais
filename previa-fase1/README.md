# Balneário Quero Mais — prévia do site

**Isto é uma prévia visual para aprovação do cliente.** Não há backend, banco de
dados, login, painel administrativo, pagamento nem sistema real de reservas.
Toda a "reserva" é simulada no navegador e termina abrindo o WhatsApp com uma
mensagem pré-preenchida.

## Como rodar

Não precisa instalar nada. Duas opções:

1. **Abrir direto:** dê dois cliques em `index.html`.
2. **Servidor local (recomendado, evita bloqueios do navegador com `file://`):**

   ```bash
   python -m http.server 5173
   ```

   e abra <http://localhost:5173>. Qualquer outro servidor estático serve
   (`npx serve .`, extensão Live Server do VS Code, etc.).

Arquivos: `index.html` (estrutura), `styles.css` (visual), `app.js` (comportamento),
`assets/` (logo e fotos).

## Trocar o número de WhatsApp

O número atual é **de teste** (`+55 92 99190-1596`). Ele está definido em um
único lugar, no topo de [`app.js`](app.js):

```js
const WHATSAPP_NUMBER = "5592991901596";
```

Troque por `55` + DDD + número (só dígitos). Todos os botões e links
(hero, formulário, botão flutuante, seção de localização) usam essa constante.

Outros valores no mesmo arquivo: `TICKET_PRICE` (R$ 20) e `GREETING`
(mensagem do botão flutuante).

## Sobre as imagens

Os arquivos originais recebidos estavam em `Downloads/balneario quero mais fotos/`.
Foram renomeados e salvos em `assets/`:

| Arquivo em `assets/` | Original | Situação |
| --- | --- | --- |
| `logo.jpg` | `...15.51.33.jpeg` | Logo oficial (arquivo de imagem, usada sem recriação). |
| `peixe-grelhado.jpg` | `...15.51.31.jpeg` | Foto real, sem interface do Instagram. Único arquivo em resolução maior (934 px). |
| `deck-ponte.jpg` | `...15.51.31 (1).jpeg` | **Print do Instagram** — interface recortada, mas a foto ficou com 591 px de largura. |
| `mesas-sombra.jpg` | `...15.51.31 (2).jpeg` | **Print do Instagram** — idem. |
| `redario.jpg` | `...15.51.31 (3).jpeg` | **Print do Instagram** — idem. |
| `igarape-sol.jpg` | `...15.51.32.jpeg` | **Print do Instagram** — idem. É a foto do Hero. |
| `guarda-sois.jpg` | `...15.51.32 (2).jpeg` | **Print do Instagram** — idem. |
| `mesas-deck.jpg` | `...15.51.32 (3).jpeg` | **Print do Instagram** — idem. |

**Antes da versão final, substituir os seis prints pelos arquivos de foto
originais** (sem interface do Instagram, em resolução alta). Em telas grandes,
o Hero e o CTA final ficam visivelmente pixelados com os 591 px atuais. Basta
sobrescrever o arquivo em `assets/` com o mesmo nome.

Não usadas no site:

- `...15.51.32 (1).jpeg` — print do **perfil** do Instagram (não é foto do local).
- `...15.51.32 (4).jpeg` — marcada pelo Instagram como **"Conteúdo de IA"**.
  Não é uma fotografia real do balneário e **não deve** ser apresentada como
  tal (galeria, "Sobre", estrutura). Optei por não usá-la em lugar nenhum.

## O que está simulado

- Total calculado em tempo real: `quantidade × R$ 20,00`.
- Validação simples de nome, data, quantidade e WhatsApp no navegador.
- Ao enviar, abre `https://wa.me/<número>?text=<mensagem>` em nova aba com:

  ```
  Olá! Gostaria de reservar minha entrada no Balneário Quero Mais.
  Nome: {nome}
  Quantidade de pessoas: {quantidade}
  Data desejada: {dd/mm/aaaa}
  Valor estimado: R$ {total}.
  Gostaria de confirmar a reserva.
  ```

- Mapa: embed do Google Maps buscando pelo nome "Balneário Quero Mais"
  (o local já está cadastrado no Google Maps; nenhuma coordenada foi digitada
  à mão). O endereço textual "Km 19, Estrada de Novo Airão" não resolvia para
  um ponto útil.

## Informações usadas (todas confirmadas)

Nome, localização (Km 19, estrada de Novo Airão), aberto todos os dias,
igarapé de água escura, bar e restaurante com culinária regional (peixe
grelhado), mesas com guarda-sóis, redário dentro d'água, deck azul/branco,
entrada R$ 20,00 por pessoa. Nada além disso foi afirmado no site.
