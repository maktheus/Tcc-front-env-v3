# edgebench-agent — Instalação e Configuração

O `edgebench-agent` é um binário leve (~10 MB) escrito em Go que roda em background na máquina do usuário e expõe uma API HTTP+SSE em `localhost:4242`. O browser consome essa API para disparar benchmarks reais e receber métricas em tempo real.

---

## Instalação

### Linux / macOS
```bash
curl -sSL https://get.edgebench.io | sh
```

### Windows (PowerShell)
```powershell
iwr https://get.edgebench.io/win | iex
```

### pip (Python ≥ 3.10)
```bash
pip install edgebench-agent
```

### Homebrew (macOS)
```bash
brew install edgebench/tap/edgebench-agent
```

---

## Primeiros passos

```bash
# 1. Autentique com sua conta EdgeBench
edgebench auth login

# 2. Inicie o agente (fica rodando em background)
edgebench agent start

# 3. Verifique que está online
curl http://localhost:4242/health
```

O browser detecta automaticamente o agente em `localhost:4242` ao abrir `/benchmark`.

---

## API do agente

### `GET /health`

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

### `POST /run` — SSE stream

**Request body:** `BenchmarkRunConfig` (JSON)

**SSE event types:**
```
data: {"type":"log",      "line":"[FASE 1/4] Verificando ambiente... ✓"}
data: {"type":"metrics",  "tokens_per_sec":38,"latency_ms":26,"watts":9.1}
data: {"type":"quality",  "perplexity":11.3,"mmlu":68.4,"consistency":94.1,"format":96.0}
data: {"type":"completed","results":{...BenchmarkRunResults}}
data: {"type":"error",    "message":"model not found at /models/llama3-8b.gguf"}
```

### `DELETE /run/:id` — cancela run em andamento

### `GET /runs` — lista runs locais (cache)

---

## Telemetria de hardware

| Plataforma | Fonte | Métricas |
|------------|-------|----------|
| Linux (CPU) | RAPL (`/sys/class/powercap/`) | Watts CPU + DRAM |
| NVIDIA GPU | NVML | Watts GPU, temp, clock |
| macOS M-series | `powermetrics` subprocess | Watts CPU+GPU+ANE |
| Raspberry Pi / Jetson | INA219 via I²C | Watts totais da placa |
| Fallback | `gopsutil` CPU usage | Estimativa (sem sensor) |

---

## Avaliação de qualidade local

| Métrica | Método | Referência |
|---------|--------|-----------|
| **Perplexidade** | Cross-entropy no WikiText-103 (1k tokens) | GPT-2 (Radford et al., 2019) |
| **MMLU** | 100 perguntas embutidas no binário | Hendrycks et al., 2021 |
| **Consistência** | 5× mesma pergunta → cosine similarity | — |
| **Format Following** | JSON/lista/número → validação com regex | — |

Os outputs brutos sobem para a EdgeBench Cloud para avaliação via **LLM-as-Judge** (Claude Sonnet). Resultado chega via WebSocket em ~30s.

---

## Modelos suportados (Path A)

Sem restrição de tamanho.

| Formato | Runtime | Exemplos |
|---------|---------|---------|
| GGUF | llama.cpp | Llama-3-8B, Mistral-7B, Phi-3 Mini |
| ONNX | ONNX Runtime | Whisper, YOLOv8 |
| TFLite | TFLite | MobileNetV3 |
| Engine | TensorRT-LLM | Llama-3-8B (Jetson GPU) |
| Cube.AI | STM32Cube.AI | modelos tiny em MCU |

---

## Configuração avançada

```bash
edgebench agent start --port 4243              # porta customizada
edgebench agent start --models-dir /data/models
edgebench agent start --no-hw-telemetry        # só performance
edgebench agent start --log-level debug        # verbose
```

---

## Segurança

- Aceita conexões somente de `localhost` — não exposto na rede
- Resultados enviados ao cloud incluem **HMAC** do hardware fingerprint (anti-fraude)
- Token salvo em `~/.edgebench/credentials` (permissão 600)
