# Integração com o backend (spotify-nano-challenge-TIC-IA)

Registro do que foi feito hoje para conectar o frontend ao backend real,
e do que ainda falta para funcionar em produção.

## O que já está pronto (frontend)

- `src/api/backendMapper.ts` — traduz a resposta do endpoint `POST /api/analyze`
  do backend para os tipos de domínio do frontend (`AnalysisResult`).
- `src/api/client.ts` — implementação de `AnalysisApi` que fala com o backend
  real. Como o backend é **síncrono** (um único POST já devolve o resultado
  completo, sem polling), o client simula localmente o formato de
  `analysisId` + progresso que o resto do app espera.
- `src/api/index.ts` — a troca entre mock e real agora é por variável de
  ambiente (`VITE_USE_MOCK`), não mais fixa no código.
- `src/pages/UploadPage.tsx` — o botão de enviar exige gênero selecionado
  (o backend real recebe o gênero junto com o arquivo, ao contrário do
  fluxo mockado que confirma o gênero depois).

Testado localmente contra `http://137.184.193.178` na noite de
02/09/2026 — funcionou, com dados reais retornando (ex: BPM com casas
decimais reais, não os valores redondos do mock).

## O que falta (backend )

**Bloqueador para produção: o backend precisa de HTTPS.**

Hoje o backend responde em `http://137.184.193.178` (HTTP puro). Quando o
frontend for publicado no Render, ele roda automaticamente em HTTPS. Navegadores
bloqueiam por segurança uma página HTTPS fazendo requisição para uma API HTTP
("mixed content") — funciona em `localhost` (por isso testamos e deu certo
ontem à noite), mas **vai quebrar assim que o frontend for publicado**.

Precisa de uma das opções:
- Configurar um certificado SSL/TLS no servidor onde o backend roda
- Colocar o backend atrás de um proxy/serviço que já ofereça HTTPS (ex:
  publicar em uma plataforma como Render, Railway, Fly.io, que geram HTTPS
  automaticamente)
- Usar um serviço de túnel com HTTPS (ex: ngrok) como solução temporária
  para uma demonstração

## Como o frontend vai usar a URL final

Quando o backend tiver uma URL HTTPS, o time de frontend/deploy precisa:

1. No painel do Render (Static Site do frontend), ir em **Environment**
2. Adicionar duas variáveis:
   - `VITE_USE_MOCK` = `false`
   - `VITE_API_BASE_URL` = `https://url-do-backend-aqui`
3. Fazer um novo deploy (o Render redeploya automaticamente ao salvar
   variáveis de ambiente, ou pode disparar manualmente)

Não precisa mexer em nenhum código para isso — é só configuração.

## Testando localmente com o backend real

Para qualquer pessoa do time testar localmente contra o backend real:

```bash
cp .env.example .env
```

Editar o `.env` (nunca commitar esse arquivo — ele está no `.gitignore`):

```
VITE_USE_MOCK=false
VITE_API_BASE_URL=http://137.184.193.178
```

Depois:

```bash
npm run dev
```

Reiniciar o servidor sempre que mudar o `.env` (variáveis de ambiente só
são lidas na inicialização do Vite).

## Diferenças de contrato entre mock e backend real

| | Mock (`mockClient.ts`) | Backend real (`client.ts`) |
|---|---|---|
| Fluxo | Upload → progresso simulado → confirmar gênero → resultado | Upload com gênero já incluso → resultado direto |
| Gênero | Escolhido depois da análise | Obrigatório antes do envio |
| Progresso | Simulado com `setInterval` | Instantâneo (backend responde tudo de uma vez) |
| Histórico | 3 análises fixas | Não implementado (backend não persiste) |

Ver `docs/api-contract.md` para o contrato completo esperado pelo frontend.