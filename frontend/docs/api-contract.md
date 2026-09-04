# Contrato de API — VIBE_LAB

Este documento descreve os endpoints que o frontend espera do backend. A fonte da verdade em código está em `src/types/api.ts` e `src/types/domain.ts` — este arquivo é a versão legível dessa interface.

Hoje o frontend usa `src/api/mockClient.ts`, que implementa este mesmo contrato em memória, sem servidor real. Basta o backend seguir os formatos abaixo para a troca ser transparente (ver `src/api/index.ts`, flag `USE_MOCK`).

## Endpoints esperados

### 1. Enviar faixa para análise

```
POST /analyses
Content-Type: multipart/form-data

campo: file (arquivo .mp3, obrigatório)
campo: trackName (string, opcional)
campo: genreHint (string, opcional — um dos valores de gênero listados abaixo)
campo: bpm (number, opcional)
```

Os campos `trackName`, `genreHint` e `bpm` são preenchidos pelo usuário no formulário de upload e servem como contexto opcional para a análise — o backend pode usá-los ou ignorá-los.

Resposta:

```json
{ "analysisId": "string" }
```

### 2. Consultar progresso da análise

```
GET /analyses/:analysisId/progress
```

Resposta:

```json
{
  "analysisId": "string",
  "step": "uploading | extracting-features | predicting-popularity | comparing-benchmark | done",
  "percent": 0,
  "currentTarget": 20
}
```

`currentTarget` é opcional. O frontend faz polling deste endpoint a cada 300ms até `step` chegar em `"done"`.

Se o `analysisId` não existir, o backend deve responder com status de erro (ex: 404) — o frontend trata isso mostrando uma tela de erro, não fica esperando infinitamente.

### 3. Confirmar gênero da faixa

```
POST /analyses/:analysisId/genre
Content-Type: application/json

{ "genre": "pop | rock | hip-hop | eletronica | sertanejo | mpb | funk | jazz | classica | outro" }
```

Resposta: `204 No Content` ou corpo vazio.

### 4. Obter resultado final

```
GET /analyses/:analysisId/result
```

Resposta:

```json
{
  "analysisId": "string",
  "trackName": "string",
  "genre": "pop | rock | hip-hop | eletronica | sertanejo | mpb | funk | jazz | classica | outro",
  "predictedPopularity": 87,
  "benchmarkPopularity": 74,
  "audioFeatures": {
    "danceability": 0.68,
    "energy": 0.72,
    "valence": 0.61,
    "tempo": 118,
    "loudness": -6.4,
    "acousticness": 0.34,
    "instrumentalness": 0.02
  },
  "vibeMetrics": {
    "vibeScore": 0.87,
    "bassPressure": 87.4,
    "genreAlignment": 0.79
  },
  "createdAt": "2026-09-02T12:00:00.000Z"
}
```

Este endpoint só deve retornar dados válidos depois que `step` do progresso chegar em `"done"`.

### 5. Listar análises recentes

```
GET /analyses/recent
```

Resposta:

```json
[
  {
    "analysisId": "string",
    "trackName": "string",
    "genre": "pop | rock | hip-hop | eletronica | sertanejo | mpb | funk | jazz | classica | outro",
    "vibeScore": 0.87,
    "createdAt": "2026-08-28T14:32:00.000Z"
  }
]
```

## Pontos de atenção

- **Escala dos números**: `vibeScore`, `genreAlignment`, e os campos de `audioFeatures` (exceto `tempo` e `loudness`) são frações entre 0 e 1. `bassPressure`, `predictedPopularity`, `benchmarkPopularity` e `tempo` já vêm na escala final (não são frações).
- **Datas**: sempre em formato ISO 8601 (`new Date().toISOString()`).
- **`analysisId`**: o frontend trata como string opaca — não assume formato específico (UUID, número, etc.).
- **CORS**: o frontend roda em `http://localhost:5173` durante o desenvolvimento. Configurar `VITE_API_BASE_URL` no `.env` local apontando para a URL do backend (ver `.env.example`).