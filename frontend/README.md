# VIBE_LAB — Frontend

Frontend do VIBE_LAB, ferramenta de análise de faixas de áudio: o usuário envia um `.mp3`, acompanha a análise em tempo real, confirma o gênero detectado e recebe um resultado com popularidade prevista e métricas de vibe.

Projeto do grupo 2 — Front-End-Music-Lab-Livre.

## Stack

- React 19 + TypeScript
- Vite 8
- Tailwind CSS v4
- React Router 7
- Oxlint
- Chart.js (gráfico de radar)

## Rodando localmente

\`\`\`bash
npm install
npm run dev
\`\`\`

Abre em `http://localhost:5173`.

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | Sobe o servidor de desenvolvimento |
| `npm run build` | Type-check + build de produção (saída em `dist/`) |
| `npm run lint` | Roda o Oxlint |
| `npm run preview` | Serve o build de produção localmente |

## Estrutura

\`\`\`
src/
  theme/       # paleta de cores central
  styles/      # Tailwind + tema
  types/       # tipos de domínio e contrato de API
  lib/         # formatação e tradução de jargão
  api/         # cliente mock, cliente HTTP, fixtures
  hooks/       # hooks reutilizáveis (async data, polling, upload)
  components/
    ui/        # componentes genéricos, não conhecem o produto
    domain/    # componentes que conhecem o domínio VIBE_LAB
  pages/       # uma página por rota
  router.tsx   # definição das rotas
  App.tsx      # componente raiz
  main.tsx     # bootstrap


\`\`\`

## Design System

O visual segue o mockup definitivo do produto — tema "deserto psicodélico", baseado em tokens de cor no estilo Material Design 3.

- **Paleta e tipografia**: `src/theme/tokens.ts` (paleta em TS, para uso programático) e `src/styles/index.css` (mesma paleta como variáveis CSS via `@theme`, para as classes Tailwind)
- **Fontes**: Bricolage Grotesque (títulos), Be Vietnam Pro (texto), Space Mono (rótulos) — carregadas via Google Fonts em `index.html`
- **Ícones**: Material Symbols Outlined, via componente `components/ui/Icon.tsx`
- **Navegação**: `components/domain/TopAppBar.tsx` (barra simples, telas de tarefa única), `NavigationDrawer.tsx` (menu lateral desktop, telas de conteúdo), `BottomNavBar.tsx` (barra inferior mobile) — cada página escolhe a combinação adequada
A separação `ui/` vs `domain/` existe para que a estrutura visual (vinda de mockups) possa ser trocada sem reescrever a lógica de domínio.

## Integração com o backend

Hoje o app roda **100% mockado** — veja `src/api/index.ts`:

\`\`\`ts
const USE_MOCK = true
export const api: AnalysisApi = USE_MOCK ? mockClient : httpClient
\`\`\`

Quando o backend estiver disponível:

1. Trocar `USE_MOCK` para `false` em `src/api/index.ts`
2. Definir `VITE_API_BASE_URL` (ver `.env.example`) apontando para a URL do backend
3. Conferir que os endpoints batem com `src/api/client.ts` e o contrato em `docs/api-contract.md`

Nenhuma página, hook ou componente precisa mudar — todos dependem apenas da interface `AnalysisApi` (`src/types/api.ts`), não da implementação.

## Documentação

- [`docs/guia-tecnico.md`](docs/guia-tecnico.md) — como o projeto foi construído, camada por camada
- [`docs/api-contract.md`](docs/api-contract.md) — contrato de API esperado pelo frontend