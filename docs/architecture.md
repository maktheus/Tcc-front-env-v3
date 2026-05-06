# EdgeBench — Arquitetura do Sistema

## Duas paths de execução

O EdgeBench suporta dois modos de execução que convivem na mesma plataforma.
A escolha é automática baseada no device do usuário.

```mermaid
flowchart TB
    U["Usuário abre EdgeBench"] --> D{Device?}

    D -->|Desktop / Servidor| PA["PATH A\nLocal Agent\n(qualquer modelo)"]
    D -->|Mobile / Tablet| PB["PATH B\nWebGPU no Browser\n(modelos ≤ 4B)"]

    PA --> EVAL["Avaliação\nPerformance + Qualidade"]
    PB --> EVAL

    EVAL --> CLOUD["EdgeBench Cloud\nValidação · LLM-as-Judge · Comunidade"]
```

---

## Path A — Desktop / Servidor (Local Agent)

Para engenheiros rodando modelos em hardware dedicado: Jetson, workstations, servidores.
Não há limitação de tamanho de modelo. Requer instalação do `edgebench-agent` (~10 MB).

```mermaid
graph TB
    subgraph USER_A["🖥️  Desktop / Servidor"]
        direction TB
        BROWSER_A["Browser\nEdgeBench Web App"]

        subgraph AGENT["edgebench-agent  (localhost:4242)"]
            direction LR
            HTTP["HTTP + SSE\nServer"]
            RUNNER["Benchmark Runner\nllama.cpp · TensorRT\nONNX · TFLite\nSTM32Cube.AI"]
            HW["HW Telemetry\nRAIL · NVML · INA219\npowermetrics (macOS M)"]
            QUAL_A["Quality Evaluator\nperplexity · MMLU\nconsistency · format"]

            HTTP --> RUNNER
            HTTP --> HW
            HTTP --> QUAL_A
        end

        BROWSER_A <-->|"fetch localhost:4242\nSSE stream"| HTTP
    end

    subgraph RESULTS_A["Resultados (Path A)"]
        direction LR
        PERF_A["Performance\ntok/s · latência\np50/p95/p99 · σ"]
        ENERGY_A["Energia\nwatts · Wh\nper inferência"]
        QUAL_OUT_A["Qualidade\nperplexidade · MMLU\nconsistência · format\nfollowing"]
    end

    USER_A --> RESULTS_A
```

### Modelos suportados (Path A)
Sem restrição — qualquer modelo que o hardware local suportar.

| Categoria | Exemplos |
|-----------|----------|
| SLM (< 4B) | TinyLlama-1.1B, Gemma-2B, Phi-3 Mini |
| LLM (4B–13B) | Llama-3-8B, Mistral-7B |
| LLM grande (> 13B) | Llama-3-70B, Mixtral-8x7B |
| Visão | YOLOv8n, MobileNetV3 |
| Áudio | Whisper-Small, Whisper-Large |

---

## Path B — Mobile / Tablet (WebGPU no Browser)

Para qualquer pessoa com um smartphone moderno. Zero instalação — o modelo roda
dentro do browser usando a GPU/NPU do device via WebGPU + WebAssembly (WebLLM / MLC LLM).

```mermaid
graph TB
    subgraph USER_B["📱  Mobile / Tablet"]
        direction TB

        subgraph BROWSER_B["Browser (Chrome / Safari iOS 17+)"]
            direction LR
            WEBLLM["WebLLM Engine\n(WebGPU + WASM)"]
            GPU_B["GPU / NPU local\nAdreno · Mali\nApple Neural Engine"]
            QUAL_B["Quality Evaluator\n(mesmos testes)"]

            WEBLLM <-->|"WebGPU API"| GPU_B
            WEBLLM --> QUAL_B
        end
    end

    subgraph RESULTS_B["Resultados (Path B)"]
        direction LR
        PERF_B["Performance\ntok/s · latência\nVRAM utilizado"]
        QUAL_OUT_B["Qualidade\nperplexidade · MMLU\nconsistência · format\nfollowing"]
    end

    USER_B --> RESULTS_B
```

### Modelos compatíveis com WebGPU (Path B)
Limitado a modelos pequenos que cabem na VRAM disponível no browser (~2–4 GB).

| Modelo | Tamanho | Quantização | VRAM est. |
|--------|---------|-------------|-----------|
| SmolLM-360M | 360 MB | INT4 | ~0.3 GB |
| TinyLlama-1.1B | 1.1 B | INT4 | ~0.7 GB |
| Gemma-1.1B | 1.1 B | INT4 | ~0.8 GB |
| Gemma-2B | 2 B | INT4 | ~1.5 GB |
| Phi-3 Mini | 3.8 B | INT4 | ~2.4 GB |

> Nota: Path B **não mede consumo de energia** (browsers não têm acesso a sensores de hardware).
> Path A mede energia completo via RAPL / NVML / INA219.

---

## Camada de Qualidade (ambas as paths)

Além das métricas de hardware (tokens/s, watts, latência), o EdgeBench avalia
a **qualidade do output** do modelo — o quanto a quantização degradou a capacidade real.

```mermaid
graph LR
    subgraph LOCAL["No Device (sem cloud)"]
        direction TB
        Q1["Perplexidade\nRoda o modelo em corpus fixo\n(WikiText-103 slice 1k tokens)\nMede surpresa média por token\nLower = better"]
        Q2["MMLU Subset\n100 perguntas múltipla escolha\n(ciências, história, math, CS)\nCompara acerto vs baseline FP32"]
        Q3["Consistência\nMesma pergunta factual 5×\nCosine similarity entre outputs\n< 80% = modelo instável"]
        Q4["Format Following\nInstrui formato específico\n(JSON, número, lista)\nValida se respeitou"]
    end

    subgraph CLOUD_JUDGE["Cloud (LLM-as-Judge)"]
        direction TB
        J1["Outputs brutos sobem\npara EdgeBench Cloud"]
        J2["Judge model\n(GPT-4o / Claude Sonnet)\navalia cada output"]
        J3["Scores:\n· Coerência (1–10)\n· Factualidade (1–10)\n· Qualidade geral (1–10)\n· Delta vs FP32 baseline"]

        J1 --> J2 --> J3
    end

    LOCAL -->|"outputs + scores locais"| CLOUD_JUDGE

    style LOCAL fill:#1c1917,stroke:#44403c,color:#e4e4e7
    style CLOUD_JUDGE fill:#1e1b4b,stroke:#4338ca,color:#c7d2fe
```

### Referências da literatura moderna
| Métrica | Paper / Projeto | Ano |
|---------|----------------|-----|
| Perplexidade | Padrão desde GPT-2 (Radford et al.) | 2019 |
| MMLU | Massive Multitask Language Understanding (Hendrycks et al.) | 2021 |
| LLM-as-Judge / MT-Bench | Judging LLM-as-a-Judge (Zheng et al., LMSYS) | 2023 |
| G-Eval | NLG Evaluation using GPT-4 (Liu et al.) | 2023 |
| AlpacaEval | LLM-as-judge for instruction following | 2024 |
| HELMET | Holistic Evaluation for Long-Context Models | 2024 |

---

## Fluxo de execução unificado

```mermaid
sequenceDiagram
    actor U as Usuário
    participant UI as Browser (Next.js)
    participant ENG as Engine<br/>(Agent ou WebGPU)
    participant API as EdgeBench Cloud

    U->>UI: Abre /benchmark
    UI->>UI: detectDevice() → agent | webgpu
    UI->>ENG: health check / WebGPU probe

    U->>UI: Configura e inicia benchmark
    UI->>API: POST /api/runs {config, mode, device}
    API-->>UI: {run_id}

    UI->>ENG: start(config)

    loop Inferência (warmup + N iterações)
        ENG-->>UI: SSE {tokens_per_sec, latency_ms, watts?}
    end

    Note over ENG: Avaliação de qualidade local
    ENG->>ENG: calcular perplexidade
    ENG->>ENG: rodar MMLU subset (100 q)
    ENG->>ENG: testar consistência (5×)
    ENG->>ENG: testar format following

    ENG-->>UI: SSE {status: completed, results}
    UI->>API: POST /api/runs/:id/results {perf + quality + raw_outputs}

    Note over API: LLM-as-Judge (assíncrono)
    API->>API: enfileira outputs para judge
    API-->>UI: WebSocket {judge_scores} (quando pronto, ~30s)
    UI->>UI: atualiza painel de qualidade com judge scores
```

---

## Modelo de Dados

```mermaid
erDiagram
    BENCHMARK_RUNS {
        uuid id PK
        uuid user_id FK
        string hardware_id FK
        string execution_mode "agent | webgpu"
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
        float tokens_per_sec_stddev
        int latency_p50_ms
        int latency_p95_ms
        int latency_p99_ms
        float energy_avg_watts "null para webgpu"
        float energy_wh_per_inference "null para webgpu"
        float perplexity
        float mmlu_score_pct
        float consistency_pct
        float format_following_pct
        float judge_coherence "null até judge processar"
        float judge_factuality "null até judge processar"
        float judge_overall "null até judge processar"
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
        float watts "null para webgpu"
    }

    BENCHMARK_RUNS ||--|| RUN_RESULTS : "produz"
    BENCHMARK_RUNS ||--o{ TIME_SERIES : "gera"
```

---

## Comparação das duas paths

| | Path A — Local Agent | Path B — WebGPU |
|---|---|---|
| Device | Desktop, servidor, Jetson | Qualquer smartphone/tablet moderno |
| Instalação | `edgebench-agent` (~10 MB) | Zero — só o browser |
| Modelos | Qualquer tamanho | Somente ≤ 4B params (INT4) |
| Performance | tok/s · latência · σ | tok/s · latência · σ |
| Energia | ✅ watts + Wh (RAPL/NVML/INA) | ❌ browser sem acesso a sensores |
| Perplexidade | ✅ | ✅ |
| MMLU | ✅ | ✅ |
| Consistência | ✅ | ✅ |
| Format Following | ✅ | ✅ |
| LLM-as-Judge | ✅ (via cloud) | ✅ (via cloud) |
| Requisitos browser | Qualquer | Chrome 113+ / Safari iOS 17+ (WebGPU) |

---

## Stack

```mermaid
graph LR
    subgraph FRONTEND["Front (web + PWA)"]
        F1["Next.js 14\nReact · TypeScript"]
        F2["WebLLM / MLC LLM\n(Path B — WebGPU)"]
        F3["Tailwind · Recharts"]
    end

    subgraph AGENT["Agente Local (Path A)"]
        A1["Go ou Rust\nbinário único ~10 MB"]
        A2["llama.cpp · TensorRT\nONNX · TFLite"]
        A3["sysinfo · nvml\npowermetrics · RAPL"]
    end

    subgraph BACKEND["Cloud Backend"]
        B1["Fastify (Node.js)\nou FastAPI (Python)"]
        B2["BullMQ + Redis\nfila de jobs"]
        B3["Judge Pipeline\nOpenAI / Anthropic API"]
    end

    subgraph DATA["Data"]
        D1["PostgreSQL 16\n+ TimescaleDB"]
        D2["Redis"]
        D3["Cloudflare R2"]
    end

    FRONTEND --> AGENT
    FRONTEND --> BACKEND
    AGENT --> BACKEND
    BACKEND --> DATA
```
