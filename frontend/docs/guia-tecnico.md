# Guia técnico — VIBE_LAB Frontend

Registro de como este projeto foi construído, camada por camada, para quem for dar manutenção ou continuar a partir daqui.

## Ordem de construção

O projeto foi montado sempre do que **não depende de nada** para o que depende de tudo — assim dava pra rodar `npm run build` a cada passo e o erro mostrado era sempre do arquivo mais recente, nunca de dez arquivos atrás.

1. **Fundação** — `theme/tokens.ts`, `styles/index.css`, `types/domain.ts`, `types/api.ts`, `lib/format.ts`, `lib/labels.ts`
2. **Dados de mentira** — fixtures em `api/fixtures/`
3. **Camada de API** — `api/mockClient.ts`, `api/client.ts`, `api/index.ts`
4. **Hooks** — `useAsyncData`, `useAnalysisPolling`, `useUploadFlow`
5. **Componentes `ui/`** — genéricos, não conhecem o produto
6. **Componentes `domain/`** — conhecem o domínio VIBE_LAB
7. **Páginas e ligação final** — `pages/`, `router.tsx`, `App.tsx`, `main.tsx`

## Decisões importantes

**Separação `ui/` vs `domain/`**: os componentes em `ui/` (Card, PrimaryButton, Spinner, etc.) não sabem nada sobre análise de áudio — só recebem props genéricas. Os componentes em `domain/` (TrackHeroCard, VibeMetricsPanel, etc.) conhecem os tipos do domínio. Isso permite trocar o visual (quando o HTML definitivo do mockup chegar) sem tocar na lógica.

**`AnalysisApi` como contrato único**: nenhuma página ou hook chama `fetch` diretamente. Tudo passa pela interface `AnalysisApi` (`types/api.ts`), implementada hoje por `mockClient.ts` e, no futuro, por `client.ts`. A troca é uma linha só em `api/index.ts` (`USE_MOCK`).

**Formato dos números**: campos como `vibeScore` e `genreAlignment` são frações (0 a 1) e usam `formatPercent`. Campos como `bassPressure` já vêm na escala final (ex: 87.4) e usam `formatScore`. Ver `lib/format.ts`.

**Rotas**: definidas em `router.tsx`, na ordem da mais específica para a coringa (`*`, página 404), que fica sempre por último.

## Rotas da aplicação

| Rota | Página | Como se chega |
|---|---|---|
| `/` | SummaryPage | Abrindo o site |
| `/upload` | UploadPage | Botão "Analisar nova faixa" |
| `/analyzing/:analysisId` | AnalyzingPage | Após o upload |
| `/confirm-genre/:analysisId` | ConfirmGenrePage | Automático, quando a análise termina |
| `/results/:analysisId` | ResultsPage | Botão "Confirmar" |
| `*` | NotFoundPage | Qualquer URL desconhecida |

## Verificação manual recomendada

- Fluxo completo: home → upload → análise → confirmar gênero → resultado
- URL de análise inexistente (`/analyzing/id-que-nao-existe`) → deve mostrar erro com botão, nunca spinner infinito
- Rota desconhecida (`/rota/qualquer`) → deve cair na página 404
- F5 na tela de resultado → não pode travar
- Redimensionar para largura de celular

## Comandos úteis

```bash
npm run build   # type-check + build — roda com frequência durante o desenvolvimento
npm run lint    # oxlint
npm run dev     # servidor local
```
## Redesign com o mockup definitivo

Depois da primeira versão funcional (paleta estimada, sem mockup), o design final chegou e a paleta/estrutura visual foram substituídas por completo — mas a lógica (hooks, API, tipos, roteamento) não precisou mudar, exatamente pelo motivo da separação `ui/` vs `domain/`.

O que mudou:
- Paleta, fontes e espaçamentos inteiramente reconstruídos a partir dos tokens do mockup (`theme/tokens.ts`, `styles/index.css`)
- Novos componentes de navegação (`TopAppBar`, `NavigationDrawer`, `BottomNavBar`, `Icon`)
- Todas as páginas reescritas visualmente
- Contrato de `uploadTrack` expandido para aceitar metadados opcionais (nome da faixa, gênero sugerido, BPM) — ver `types/api.ts`

O que **não** mudou: hooks, fixtures, tipos de domínio principais, roteamento, e o contrato geral da API (só foi estendido, não quebrado).