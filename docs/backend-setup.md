# EdgeBench Backend — Instalação e Configuração

O backend é um servidor **Fastify** (Node.js / TypeScript) que persiste resultados de benchmark, gerencia a fila do LLM-as-Judge e expõe o leaderboard público.

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| HTTP Server | Fastify 4 |
| ORM | Prisma 5 + PostgreSQL 16 |
| Time-series | TimescaleDB extension |
| Queue | BullMQ 5 + Redis 7 |
| Judge AI | Anthropic SDK (Claude Sonnet 4.6) |
| Runtime | Node.js 20 + tsx (dev) |

---

## Pré-requisitos

- Node.js ≥ 20
- Docker + Docker Compose (para PostgreSQL/TimescaleDB + Redis)
- Chave da API Anthropic (para o judge pipeline)

---

## Início rápido

```bash
# 1. Entre na pasta do backend
cd backend

# 2. Suba PostgreSQL (TimescaleDB) + Redis
docker compose up -d

# 3. Configure variáveis de ambiente
cp .env.example .env
# Edite .env com sua ANTHROPIC_API_KEY

# 4. Instale dependências
npm install

# 5. Gere o Prisma client e rode as migrations
npm run db:generate
npm run db:migrate

# 6. Aplique a migration TimescaleDB (hypertable)
docker compose exec db psql -U edgebench -d edgebench \
  -f /dev/stdin < prisma/migrations/001_timescaledb_hypertable.sql

# 7. Inicie o servidor em modo dev
npm run dev
# → Backend disponível em http://localhost:4000
```

---

## Variáveis de Ambiente

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `DATABASE_URL` | — | URL de conexão PostgreSQL |
| `REDIS_URL` | `redis://localhost:6379` | URL Redis |
| `ANTHROPIC_API_KEY` | — | Chave para o judge pipeline |
| `CORS_ORIGIN` | `http://localhost:3000` | Origem permitida pelo CORS |
| `PORT` | `4000` | Porta do servidor |
| `LOG_LEVEL` | `info` | Nível de log do Fastify |

---

## Endpoints

### `POST /api/runs`

Cria um registro de run antes de iniciar o benchmark.

**Request**
```json
{
  "executionMode": "agent",
  "model": "llama3-8b",
  "quantization": "Q4_K_M",
  "benchmarkType": "text-generation",
  "iterations": 10,
  "warmupRuns": 2
}
```

**Response** `201`
```json
{ "runId": "uuid" }
```

---

### `POST /api/runs/:id/results`

Salva métricas após o benchmark concluir. Enfileira o job do LLM-as-Judge se `rawOutputs` for fornecido.

**Request**
```json
{
  "tokensPerSecMean": 38.4,
  "tokensPerSecStddev": 1.2,
  "latencyP50Ms": 26,
  "latencyP95Ms": 34,
  "latencyP99Ms": 41,
  "energyAvgWatts": 9.1,
  "totalTokens": 5120,
  "totalDurationMs": 133333,
  "perplexity": 11.3,
  "mmluScorePct": 68.4,
  "consistencyPct": 94.1,
  "formatFollowingPct": 96.0,
  "timeSeries": [
    { "runIndex": 0, "tokensPerSec": 37.1, "latencyMs": 27, "watts": 9.0 }
  ],
  "rawOutputs": ["output text 1", "output text 2"]
}
```

**Response** `200`
```json
{ "ok": true, "judgeJobId": "bullmq-job-id" }
```

---

### `GET /api/runs`

Lista pública (leaderboard) — apenas runs `COMPLETED` com `publishedToCommunity: true`.

**Query params**: `model`, `hardwareId`, `quantization`, `executionMode`, `limit` (max 100), `offset`

---

### `GET /api/runs/:id`

Run individual completo com result e time-series.

---

### `PATCH /api/runs/:id/publish`

Publica run para a comunidade.

---

### `DELETE /api/runs/:id`

Cancela run em andamento ou deleta run concluído.

---

### `WS /api/runs/:id/judge`

WebSocket para receber scores do LLM-as-Judge (~30s após submissão dos resultados).

```
// Mensagem recebida quando pronto:
{
  "type": "judge_scores",
  "coherence": 8.5,
  "factuality": 7.0,
  "overall": 8.0
}
```

---

## Judge Pipeline

1. `POST /api/runs/:id/results` recebe `rawOutputs[]`
2. Salva no banco + enfileira job BullMQ (`judge` queue)
3. Worker (`src/workers/judge.ts`) processa com concorrência 4
4. Chama Claude Sonnet 4.6 com os outputs brutos
5. Salva `judgeCoherence`, `judgeFactuality`, `judgeOverall` no banco
6. `broadcastJudgeScores()` notifica WebSocket conectados

**Custo estimado**: ~100–300 tokens de input + 20 tokens de output por run = < $0.001 por avaliação com Claude Sonnet.

---

## Estrutura de Arquivos

```
backend/
├── prisma/
│   ├── schema.prisma               # Modelo de dados
│   └── migrations/
│       └── 001_timescaledb_hypertable.sql
├── src/
│   ├── index.ts                    # Entry point Fastify
│   ├── lib/
│   │   ├── prisma.ts               # Singleton PrismaClient
│   │   ├── redis.ts                # Conexão IORedis
│   │   └── queues.ts               # BullMQ queue definitions
│   ├── routes/
│   │   ├── runs.ts                 # CRUD /api/runs
│   │   └── judge.ts                # WebSocket /api/runs/:id/judge
│   └── workers/
│       └── judge.ts                # BullMQ worker + Anthropic SDK
├── docker-compose.yml
├── .env.example
├── package.json
└── tsconfig.json
```
