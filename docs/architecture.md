# EdgeBench — Arquitetura do Sistema

## Visão Geral

O EdgeBench segue o padrão **Local Agent**: um binário leve instalado uma vez pelo usuário
que permite ao front web (rodando no browser) disparar benchmarks reais no hardware local.
Não é necessário instalar um desktop app — o front é uma web app normal.

```mermaid
graph TB
    subgraph USER["🖥️  Hardware do Usuário"]
        direction TB
        BROWSER["Browser\nEdgeBench Web App\n(Next.js)"]

        subgraph AGENT["edgebench-agent  ~10MB"]
            direction LR
            HTTP["HTTP Server\nlocalhost:4242"]
            RUNNER["Benchmark Runner\nllama.cpp · TensorRT\nONNX · TFLite"]
            TELEMETRY["HW Telemetry\nRAIL · NVML\nINA219 · powermetrics"]

            HTTP -->|"spawn"| RUNNER
            HTTP -->|"read"| TELEMETRY
            RUNNER -->|"stdout metrics"| HTTP
            TELEMETRY -->|"watts · temp · clock"| HTTP
        end

        BROWSER <-->|"fetch localhost:4242\n(SSE para progresso)"| HTTP
    end

    subgraph CLOUD["☁️  EdgeBench Cloud"]
        direction TB
        GW["API Gateway\nFastify / FastAPI"]
        WS["WebSocket Gateway\nreal-time streaming"]
        QUEUE["Job Queue\nBullMQ / Temporal"]

        subgraph PIPELINE["Validation Pipeline"]
            direction LR
            SCH["Schema\nValidator"]
            FP["Hardware\nFingerprint"]
            ANOM["Anomaly\nDetector"]
            HASH["Reproducibility\nHash"]
            SCH --> FP --> ANOM --> HASH
        end

        subgraph STORAGE["Storage Layer"]
            direction LR
            PG["PostgreSQL 16\nusers · runs\nhardware · community"]
            TS["TimescaleDB\ntime_series_tps\nlatency · power"]
            RD["Redis\nsessions · queue\ncache"]
            S3["Cloudflare R2\nresult artifacts\nexecution logs"]
        end

        GW --> QUEUE
        QUEUE --> PIPELINE
        PIPELINE --> STORAGE
        WS <--> STORAGE
    end

    AGENT -->|"POST /api/runs/:id/results\n+ hardware_fingerprint (HMAC)"| GW
    BROWSER <-->|"WebSocket\nresultados validados · community"| WS

    style USER fill:#18181b,stroke:#52525b,color:#e4e4e7
    style AGENT fill:#27272a,stroke:#3f3f46,color:#e4e4e7
    style CLOUD fill:#18181b,stroke:#52525b,color:#e4e4e7
    style PIPELINE fill:#1c1917,stroke:#44403c,color:#e4e4e7
    style STORAGE fill:#1c1917,stroke:#44403c,color:#e4e4e7
```

---

## Instalação e Onboarding do Agente

```mermaid
flowchart LR
    A["Usuário acessa\n/benchmark"] --> B{localhost:4242\nresponde?}

    B -->|não| C["Banner: Agente offline\n+ instruções de instalação"]
    C --> D["curl install.sh\nou brew / pip / scoop"]
    D --> E["edgebench auth login\n→ token da conta web"]
    E --> F["edgebench agent start\n→ localhost:4242 online"]
    F --> B

    B -->|sim| G["Banner: Agente online ✓\nHardware detectado"]
    G --> H["Benchmark flow\nnormal"]

    style C fill:#1c1917,stroke:#b45309,color:#fbbf24
    style G fill:#14532d,stroke:#16a34a,color:#86efac
```

---

## Fluxo de Execução

```mermaid
sequenceDiagram
    actor U as Usuário
    participant BR as Browser (Next.js)
    participant AG as edgebench-agent<br/>localhost:4242
    participant CLI as llama.cpp / Runtime
    participant HW as HW Sensors
    participant API as EdgeBench Cloud API

    U->>BR: Clica "Iniciar Benchmark"
    BR->>AG: POST /run {config}
    AG->>API: POST /api/runs {config, hardware_fingerprint}
    API-->>AG: {run_id}

    AG->>CLI: spawn_process(llama.cpp, args)
    AG->>HW: start_telemetry_loop()

    loop A cada token gerado
        CLI-->>AG: tokens/s · latency_ms
        HW-->>AG: watts · temp
        AG-->>BR: SSE: {progress, metrics}
        BR->>BR: atualiza terminal + barra
    end

    CLI-->>AG: processo finalizado
    AG->>AG: aggregate_results()<br/>calc p50/p95/p99/σ<br/>sign(HMAC)
    AG->>API: POST /api/runs/:id/results {payload}
    AG-->>BR: SSE: {status: "completed", results}

    BR->>BR: exibe resultados + gráficos
    U->>BR: Clica "Publicar na Comunidade"
    BR->>API: POST /api/community/posts {run_id}
```

---

## Modelo de Dados

```mermaid
erDiagram
    USERS {
        uuid id PK
        string email
        string username
        string plan
        int simulations_used
        timestamp created_at
    }

    HARDWARE_PROFILES {
        string id PK
        string name
        string category
        string chip
        string ram
        string tdp
    }

    BENCHMARK_RUNS {
        uuid id PK
        uuid user_id FK
        string hardware_id FK
        string model
        string quantization
        string runtime
        string benchmark_type
        int iterations
        int warmup_runs
        int threads
        int gpu_layers
        string status
        string reproducibility_hash
        string hardware_fingerprint
        boolean peer_reviewed
        timestamp started_at
        timestamp completed_at
    }

    RUN_RESULTS {
        uuid id PK
        uuid run_id FK
        float tokens_per_sec_mean
        float tokens_per_sec_min
        float tokens_per_sec_max
        float tokens_per_sec_stddev
        int latency_p50_ms
        int latency_p95_ms
        int latency_p99_ms
        float energy_avg_watts
        float energy_wh_per_inference
        float accuracy_pct
        int total_tokens
        int total_duration_ms
    }

    TIME_SERIES {
        bigint id PK
        uuid run_id FK
        timestamp time
        int run_index
        float tokens_per_sec
        int latency_ms
        float watts
    }

    COMMUNITY_POSTS {
        uuid id PK
        uuid run_id FK
        uuid user_id FK
        string title
        text body
        int upvotes
        boolean validated
        timestamp created_at
    }

    USERS ||--o{ BENCHMARK_RUNS : "executa"
    HARDWARE_PROFILES ||--o{ BENCHMARK_RUNS : "alvo"
    BENCHMARK_RUNS ||--|| RUN_RESULTS : "produz"
    BENCHMARK_RUNS ||--o{ TIME_SERIES : "gera"
    BENCHMARK_RUNS ||--o| COMMUNITY_POSTS : "pode gerar"
    USERS ||--o{ COMMUNITY_POSTS : "publica"
```

---

## Pipeline de Validação (Anti-Fraude)

```mermaid
flowchart LR
    R["Resultado recebido\ndo agente local"] --> S1

    subgraph VALIDATION["Validation Pipeline"]
        S1["Schema\nValidator\n✓ campos obrigatórios\n✓ tipos corretos\n✓ schema_version"] -->
        S2["Hardware\nFingerprint\n✓ HMAC signature\n✓ device identity"] -->
        S3["Anomaly\nDetector\n✓ tokens/s dentro do\n  range esperado\n  para hw + modelo"] -->
        S4["Reproducibility\nHash\nSHA256(model_sha256\n+ config + hw_id\n+ runtime_version)"]
    end

    S4 --> D{Passou?}
    D -->|sim| V["status: validated\nbadge: ✓ Validado"]
    D -->|não| F["status: flagged\nbadge: ⚠ Em revisão"]

    V --> P["Dashboard público"]
    F --> PR["Peer Review\n3 runs independentes\n± 15% para aprovar"]
    PR -->|aprovado| P
    PR -->|reprovado| X["Descartado"]

    style VALIDATION fill:#1c1917,stroke:#44403c,color:#e4e4e7
```

---

## Stack Completa

```mermaid
graph LR
    subgraph LOCAL["Local (usuário)"]
        L1["edgebench-agent\nbinário único ~10MB\nGo ou Rust"]
        L2["Runtimes de inferência\nllama.cpp · TensorRT\nONNX · TFLite · STM32Cube.AI"]
        L3["Browser\nEdgeBench web app"]
    end

    subgraph BACKEND["Backend (Cloud)"]
        B1["Fastify (Node.js)\nou FastAPI (Python)"]
        B2["BullMQ + Redis\nfila de jobs"]
        B3["WebSocket / SSE\nreal-time"]
    end

    subgraph DATA["Data"]
        D1["PostgreSQL 16\n+ TimescaleDB"]
        D2["Redis 7"]
        D3["Cloudflare R2\nartifacts · logs"]
    end

    subgraph INFRA["Infra"]
        I1["Railway / Render\nMVP"]
        I2["Kubernetes\nescala"]
        I3["OpenTelemetry\n→ Grafana"]
    end

    LOCAL --> BACKEND
    BACKEND --> DATA
    BACKEND --> INFRA
```

---

## Contrato da API do Agente Local

O agente expõe um servidor HTTP em `localhost:4242` consumido exclusivamente pelo browser.

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/health` | Status do agente + hardware detectado |
| `POST` | `/run` | Inicia benchmark (retorna SSE stream) |
| `DELETE` | `/run/:id` | Cancela run em andamento |
| `GET` | `/runs` | Lista runs locais (cache do agente) |

### GET /health — resposta esperada
```json
{
  "status": "online",
  "version": "0.1.0",
  "hardware": {
    "id": "jetson-orin-nano",
    "name": "Jetson Orin Nano",
    "chip": "Ampere 1024-core",
    "ram": "8 GB",
    "tdp": "10W"
  },
  "runtimes_available": ["llama.cpp", "onnxruntime"]
}
```

### SSE stream de progresso (POST /run)
```
data: {"type":"log","line":"[FASE 1/3] Verificando ambiente... ✓"}
data: {"type":"log","line":"  Run 1/10 → 38 tok/s | 26ms"}
data: {"type":"metrics","tokens_per_sec":38,"latency_ms":26,"watts":9.1}
data: {"type":"completed","results":{...}}
```
