import type { BenchmarkResult, HardwareProfile, PricingTier } from "@/types";

export const BENCHMARKS: BenchmarkResult[] = [
  {
    id: "b1",
    model: "Llama-3-8B",
    modelSize: "8B",
    hardware: "Jetson Orin Nano",
    tokensPerSec: 38,
    latencyMs: 26,
    energyW: 9.2,
    accuracyPct: 98.8,
    technique: "INT4 + TensorRT",
    runtime: "llama.cpp",
    validated: true,
    peerReviewed: true,
    publishedAt: "2024-11-14",
    author: "rafael.lima",
    upvotes: 412,
    tags: ["int4", "tensorrt", "jetson", "llm"],
  },
  {
    id: "b2",
    model: "Phi-3 Mini",
    modelSize: "3.8B",
    hardware: "Raspberry Pi 5",
    tokensPerSec: 14,
    latencyMs: 71,
    energyW: 4.8,
    accuracyPct: 97.1,
    technique: "GGUF Q4_K_M",
    runtime: "llama.cpp",
    validated: true,
    peerReviewed: false,
    publishedAt: "2024-12-01",
    author: "ana.souza",
    upvotes: 289,
    tags: ["gguf", "raspberry", "slm", "offline"],
  },
  {
    id: "b3",
    model: "Gemma-2B",
    modelSize: "2B",
    hardware: "Raspberry Pi 5",
    tokensPerSec: 22,
    latencyMs: 45,
    energyW: 3.9,
    accuracyPct: 95.4,
    technique: "INT8 + XNNPACK",
    runtime: "TFLite",
    validated: true,
    peerReviewed: true,
    publishedAt: "2024-10-20",
    author: "pedro.alves",
    upvotes: 198,
    tags: ["int8", "tflite", "raspberry", "slm"],
  },
  {
    id: "b4",
    model: "Mistral-7B",
    modelSize: "7B",
    hardware: "Jetson AGX Orin",
    tokensPerSec: 62,
    latencyMs: 16,
    energyW: 22.1,
    accuracyPct: 99.2,
    technique: "FP16 + TensorRT",
    runtime: "TensorRT-LLM",
    validated: true,
    peerReviewed: true,
    publishedAt: "2024-09-30",
    author: "juliana.costa",
    upvotes: 531,
    tags: ["fp16", "tensorrt", "jetson", "llm"],
  },
  {
    id: "b5",
    model: "TinyLlama-1.1B",
    modelSize: "1.1B",
    hardware: "ESP32-S3",
    tokensPerSec: 2,
    latencyMs: 500,
    energyW: 0.24,
    accuracyPct: 81.3,
    technique: "INT4 + Custom SIMD",
    runtime: "llama.cpp (bare metal)",
    validated: false,
    peerReviewed: false,
    publishedAt: "2024-12-10",
    author: "marcos.vieira",
    upvotes: 87,
    tags: ["int4", "mcu", "esp32", "ultra-low-power"],
  },
  {
    id: "b6",
    model: "YOLOv8n",
    modelSize: "3.2MB",
    hardware: "STM32H7",
    tokensPerSec: 0,
    latencyMs: 12,
    energyW: 0.045,
    accuracyPct: 89.3,
    technique: "INT8 + CMS-NN",
    runtime: "STM32Cube.AI",
    validated: true,
    peerReviewed: true,
    publishedAt: "2024-08-15",
    author: "camila.rocha",
    upvotes: 673,
    tags: ["vision", "mcu", "object-detection", "cms-nn"],
  },
  {
    id: "b7",
    model: "Llama-3-70B",
    modelSize: "70B",
    hardware: "Jetson AGX Orin (x2)",
    tokensPerSec: 18,
    latencyMs: 55,
    energyW: 58.0,
    accuracyPct: 99.9,
    technique: "INT4 + Pipeline Parallel",
    runtime: "vLLM + TensorRT",
    validated: true,
    peerReviewed: true,
    publishedAt: "2024-11-28",
    author: "thiago.mendes",
    upvotes: 944,
    tags: ["int4", "multi-device", "jetson", "llm", "large"],
  },
  {
    id: "b8",
    model: "Whisper-Small",
    modelSize: "244MB",
    hardware: "Raspberry Pi 5",
    tokensPerSec: 0,
    latencyMs: 320,
    energyW: 5.1,
    accuracyPct: 96.8,
    technique: "INT8 + ONNX",
    runtime: "ONNX Runtime",
    validated: true,
    peerReviewed: false,
    publishedAt: "2024-10-05",
    author: "beatriz.santos",
    upvotes: 154,
    tags: ["audio", "asr", "raspberry", "onnx"],
  },
];

export const HARDWARE_PROFILES: HardwareProfile[] = [
  { id: "jetson-orin-nano", name: "Jetson Orin Nano", category: "jetson", ram: "8 GB", tdp: "10W", chip: "Ampere 1024-core" },
  { id: "jetson-agx-orin", name: "Jetson AGX Orin", category: "jetson", ram: "64 GB", tdp: "60W", chip: "Ampere 2048-core" },
  { id: "rpi5", name: "Raspberry Pi 5", category: "raspberry", ram: "8 GB", tdp: "5W", chip: "Cortex-A76" },
  { id: "esp32s3", name: "ESP32-S3", category: "mcu", ram: "512 KB", tdp: "0.3W", chip: "Xtensa LX7" },
  { id: "stm32h7", name: "STM32H7", category: "mcu", ram: "1 MB", tdp: "0.05W", chip: "Cortex-M7" },
  { id: "m2-macbook", name: "MacBook Pro M2", category: "pc", ram: "32 GB", tdp: "20W", chip: "Apple M2 Pro" },
];

export const PRICING_TIERS: PricingTier[] = [
  {
    id: "free",
    name: "Free",
    price: { monthly: 0, annual: 0 },
    description: "Para explorar e validar a plataforma",
    cta: "Começar grátis",
    highlighted: false,
    features: [
      { label: "3 simulações/mês", included: true },
      { label: "Benchmarks públicos", included: true },
      { label: "Comparador (até 2 modelos)", included: true },
      { label: "Comunidade básica", included: true },
      { label: "Analytics pessoal básico", included: true },
      { label: "Simulações ilimitadas", included: false },
      { label: "Exportação de configs (CI/CD)", included: false },
      { label: "Benchmarks privados", included: false },
      { label: "Telemetria avançada", included: false },
      { label: "Suporte prioritário", included: false },
      { label: "API de benchmarking", included: false },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: { monthly: 29, annual: 23 },
    description: "Para engenheiros e pesquisadores sérios",
    cta: "Iniciar teste grátis 14 dias",
    highlighted: true,
    features: [
      { label: "Simulações ilimitadas", included: true },
      { label: "Benchmarks públicos + privados", included: true },
      { label: "Comparador (até 5 modelos)", included: true },
      { label: "Comunidade completa", included: true },
      { label: "Analytics avançado + relatórios PDF", included: true },
      { label: "Exportação de configs (CI/CD)", included: true },
      { label: "Telemetria avançada de deploy", included: true },
      { label: "Suporte prioritário (24h)", included: true },
      { label: "Benchmarks privados (até 10)", included: true },
      { label: "API de benchmarking", included: false, note: "Team+" },
      { label: "SLA dedicado", included: false, note: "Enterprise" },
    ],
  },
  {
    id: "team",
    name: "Team",
    price: { monthly: 79, annual: 63 },
    description: "Para equipes e pequenas empresas",
    cta: "Teste grátis 14 dias",
    highlighted: false,
    features: [
      { label: "Tudo do Pro", included: true },
      { label: "Até 20 usuários", included: true },
      { label: "Benchmarks privados ilimitados", included: true },
      { label: "API de benchmarking (10k req/mês)", included: true },
      { label: "CI/CD integration (GitHub Actions)", included: true },
      { label: "Dashboard de equipe unificado", included: true },
      { label: "Relatórios comparativos de equipe", included: true },
      { label: "Suporte dedicado (4h)", included: true },
      { label: "Data Marketplace (leitura)", included: true },
      { label: "Data Marketplace (publicação)", included: false, note: "Enterprise" },
      { label: "Onboarding dedicado", included: false, note: "Enterprise" },
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: { monthly: 0, annual: 0 },
    description: "Para organizações com requisitos avançados",
    cta: "Falar com vendas",
    highlighted: false,
    features: [
      { label: "Tudo do Team", included: true },
      { label: "Usuários ilimitados", included: true },
      { label: "API ilimitada + SLA 99.9%", included: true },
      { label: "Data Marketplace (publicação)", included: true },
      { label: "Datasets anonimizados de telemetria", included: true },
      { label: "Consultoria de otimização", included: true },
      { label: "Onboarding dedicado", included: true },
      { label: "SSO / SAML", included: true },
      { label: "Deploy on-premise", included: true },
      { label: "Contrato anual customizado", included: true },
      { label: "Suporte 24/7 + gerente de conta", included: true },
    ],
  },
];

export const PLAN_LIMITS: Record<string, number> = {
  free: 3,
  pro: Infinity,
  team: Infinity,
  enterprise: Infinity,
};

/* ── COMENTÁRIOS DE BENCHMARK ────────────────────────────── */
export const BENCHMARK_COMMENTS: Record<string, { author: string; text: string; date: string; upvotes: number }[]> = {
  b1: [
    { author: "pedro.alves", text: "Reproduzi com TensorRT 8.6.1 no Orin Nano 8GB. Obtive 36 tok/s — dentro dos ±15%. O throttling térmico começa após ~8 min contínuos, recomendo monitorar com `tegrastats`.", date: "há 3 dias", upvotes: 28 },
    { author: "ana.souza", text: "Alguém testou com batch_size > 1? Estou vendo ganho de ~1.8x com batch=4 em sequências curtas.", date: "há 2 dias", upvotes: 14 },
    { author: "rafael.lima", text: "@ana.souza Sim, batch=4 funciona mas a latência de primeira token sobe para ~120ms. Depende do caso de uso — se for inferência síncrona não compensa.", date: "há 1 dia", upvotes: 19 },
    { author: "juliana.costa", text: "Adicionamos esse modelo ao nosso pipeline de CI/CD com o script do EdgeBench. Economizamos ~6h de configuração manual.", date: "há 18h", upvotes: 31 },
  ],
  b2: [
    { author: "marcos.vieira", text: "Testei no Pi 5 com heatsink ativo e consumo caiu para 4.2W. Passivo bate 5.1W facilmente após 5min.", date: "há 5 dias", upvotes: 22 },
    { author: "beatriz.santos", text: "Phi-3 Mini é surpreendente para NLU offline. Testei com dataset em português e acurácia ficou em 94.8% — melhor que esperava para Q4_K_M.", date: "há 4 dias", upvotes: 17 },
  ],
  b6: [
    { author: "thiago.mendes", text: "Reproduzido no STM32H743 com CubeAI 8.1. Latência foi 11.8ms — ligeiramente melhor que o benchmark. Arquivo de calibração disponível no GitHub.", date: "há 1 semana", upvotes: 45 },
    { author: "camila.rocha", text: "@thiago.mendes Obrigada! Atualizei o badge para 'Reproduzível'. O PR com os arquivos de calibração foi aceito.", date: "há 6 dias", upvotes: 38 },
  ],
  b7: [
    { author: "rafael.lima", text: "Pipeline parallel entre dois AGX Orin é complexo de configurar. Criei um guide no fórum com os passos exatos — link na thread #t1.", date: "há 3 dias", upvotes: 67 },
  ],
};

/* ── TELEMETRIAS REAIS (exemplos) ───────────────────────── */
export interface TelemetryEntry {
  id: string;
  benchmarkId: string;
  author: string;
  estimatedTps: number;
  realTps: number;
  estimatedW: number;
  realW: number;
  estimatedAccuracy: number;
  realAccuracy: number;
  notes: string;
  date: string;
}

export const TELEMETRY_DATA: TelemetryEntry[] = [
  { id: "t1", benchmarkId: "b1", author: "pedro.alves", estimatedTps: 38, realTps: 36, estimatedW: 9.2, realW: 9.8, estimatedAccuracy: 98.8, realAccuracy: 98.4, notes: "Throttling térmico após 8min de carga contínua. Dissipador ativo recomendado.", date: "2024-12-01" },
  { id: "t2", benchmarkId: "b1", author: "juliana.costa", estimatedTps: 38, realTps: 40, estimatedW: 9.2, realW: 8.9, estimatedAccuracy: 98.8, realAccuracy: 99.0, notes: "TensorRT 8.6.2 — ligeiramente melhor que a estimativa.", date: "2024-12-10" },
  { id: "t3", benchmarkId: "b2", author: "marcos.vieira", estimatedTps: 14, realTps: 13, estimatedW: 4.8, realW: 5.1, estimatedAccuracy: 97.1, realAccuracy: 96.9, notes: "Heatsink passivo. Recomendo ativo para ambientes >30°C.", date: "2024-11-20" },
];

/* ── PASSOS DE DEPLOY ───────────────────────────────────── */
export interface DeployStep {
  id: number;
  title: string;
  description: string;
  command?: string;
  warning?: string;
  tip?: string;
}

export const DEPLOY_STEPS: Record<string, DeployStep[]> = {
  "jetson-tensorrt": [
    { id: 1, title: "Instalar dependências", description: "Instale o JetPack SDK e verifique a versão do TensorRT.", command: "sudo apt-get install tensorrt && python3 -c \"import tensorrt as trt; print(trt.__version__)\"", tip: "JetPack 6.0 inclui TensorRT 8.6. Versões anteriores podem ter performance inferior." },
    { id: 2, title: "Baixar e quantizar o modelo", description: "Faça download dos pesos e aplique quantização INT4 com llama.cpp.", command: "git clone https://github.com/ggerganov/llama.cpp && cd llama.cpp\nmake -j$(nproc) LLAMA_CUDA=1\npython3 convert_hf_to_gguf.py /path/to/model --outtype q4_k_m", tip: "Use `LLAMA_CUDA=1` para habilitar inferência na GPU do Jetson." },
    { id: 3, title: "Compilar perfil TensorRT", description: "Gere o engine TensorRT otimizado para o hardware específico.", command: "trtexec --onnx=model.onnx \\\n  --saveEngine=model_int4.engine \\\n  --int8 --fp16 \\\n  --workspace=4096", warning: "A compilação pode levar 10–30 minutos. Não interrompa o processo.", tip: "O engine gerado é específico para a versão do TensorRT e do hardware. Não é portável entre dispositivos." },
    { id: 4, title: "Executar e validar", description: "Execute a inferência e compare as métricas com as estimativas.", command: "./llama.cpp/main \\\n  -m models/llama-3-8b-q4_k_m.gguf \\\n  -n 256 --temp 0.7 \\\n  --n-gpu-layers 32 \\\n  --log-disable", tip: "Use `tegrastats` em paralelo para monitorar consumo de energia e temperatura." },
    { id: 5, title: "Enviar telemetria", description: "Registre os resultados reais e compare com as estimativas do EdgeBench.", warning: "A telemetria é opcional mas ajuda a melhorar as estimativas para todos os usuários." },
  ],
  "rpi-llamacpp": [
    { id: 1, title: "Instalar dependências", description: "Compile o llama.cpp com suporte ao Cortex-A76 do Pi 5.", command: "sudo apt-get install -y build-essential cmake\ngit clone https://github.com/ggerganov/llama.cpp && cd llama.cpp\nmake -j4 LLAMA_NATIVE=1" },
    { id: 2, title: "Baixar modelo quantizado", description: "Baixe o GGUF Q4_K_M direto do HuggingFace.", command: "pip install huggingface_hub\npython3 -c \"\nfrom huggingface_hub import hf_hub_download\nhf_hub_download('microsoft/Phi-3-mini-4k-instruct-gguf', 'Phi-3-mini-4k-instruct-q4.gguf', local_dir='./models')\"" },
    { id: 3, title: "Executar e validar", description: "Execute com threads otimizados para os 4 cores do Pi 5.", command: "./llama.cpp/main \\\n  -m models/Phi-3-mini-4k-instruct-q4.gguf \\\n  -n 128 --threads 4 \\\n  --ctx-size 2048", tip: "4 threads é o ideal para o Cortex-A76. Mais threads não melhoram a latência." },
    { id: 4, title: "Enviar telemetria", description: "Registre os resultados reais para validação.", warning: "Telemetria opcional — contribui com a comunidade." },
  ],
};

/* ── THREADS DE COMUNIDADE ──────────────────────────────── */
export interface CommunityThread {
  id: string;
  title: string;
  author: string;
  hardware: string;
  upvotes: number;
  replies: { author: string; text: string; date: string; upvotes: number; isOp?: boolean }[];
  views: number;
  tags: string[];
  isPinned: boolean;
  isValidated: boolean;
  date: string;
  body: string;
}

export const COMMUNITY_THREADS: CommunityThread[] = [
  {
    id: "t1",
    title: "Llama-3-8B no Jetson Orin Nano: comparação INT4 vs INT8 no mundo real",
    author: "rafael.lima",
    hardware: "Jetson Orin Nano",
    upvotes: 127,
    views: 1840,
    tags: ["llm", "quantização", "jetson"],
    isPinned: true,
    isValidated: true,
    date: "há 2 dias",
    body: `Testei as duas quantizações por 72h em produção em um sistema de resposta a perguntas embarcado num robô industrial.

**Setup:**
- Jetson Orin Nano 8GB, JetPack 6.0
- llama.cpp commit a1b2c3d
- TensorRT 8.6.1

**Resultados INT4 (Q4_K_M):**
- Throughput: 38 tok/s
- Consumo: 9.2W
- Acurácia (MMLU): 98.8%
- Temperatura máx: 62°C (com heatsink ativo)

**Resultados INT8 (Q8_0):**
- Throughput: 29 tok/s
- Consumo: 12.1W
- Acurácia (MMLU): 99.4%
- Temperatura máx: 71°C

**Conclusão:** INT4 é 31% mais rápido e 24% mais eficiente. A perda de 0.6% em acurácia é imperceptível no nosso caso de uso. Para aplicações onde a precisão é crítica (diagnóstico médico, etc.) INT8 vale o trade-off.

O script completo de setup está no repositório linkado abaixo.`,
    replies: [
      { author: "pedro.alves", text: "Reproduzi com TensorRT 8.6.1. Obtive 36 tok/s — dentro dos ±15%. O throttling térmico começa após ~8 min contínuos. `tegrastats` é essencial.", date: "há 3 dias", upvotes: 28 },
      { author: "ana.souza", text: "Alguém testou com batch_size > 1? Vejo ganho de ~1.8x com batch=4 em sequências curtas.", date: "há 2 dias", upvotes: 14 },
      { author: "rafael.lima", text: "@ana.souza Sim, batch=4 funciona mas a latência de primeira token sobe para ~120ms. Para inferência síncrona não compensa.", date: "há 1 dia", upvotes: 19, isOp: true },
      { author: "juliana.costa", text: "Adicionamos ao nosso CI/CD com o script do EdgeBench. Economizamos ~6h de configuração manual.", date: "há 18h", upvotes: 31 },
    ],
  },
  {
    id: "t2",
    title: "TinyLlama no ESP32-S3: consegui 2 tokens/s com 240mW",
    author: "marcos.vieira",
    hardware: "ESP32-S3",
    upvotes: 89,
    views: 1230,
    tags: ["mcu", "ultra-low-power", "slm"],
    isPinned: false,
    isValidated: false,
    date: "há 3 dias",
    body: `Depois de 3 semanas de otimização manual, consegui rodar TinyLlama bare metal no ESP32-S3.

**Modificações necessárias no llama.cpp:**
1. Desabilitar threading (ESP32 é single-core para inferência)
2. Reduzir ctx_size para 256 tokens máximo
3. Implementar quantização manual para 4-bit com tabelas de lookup em flash

**Limitações:**
- Máximo 256 tokens de contexto
- Sem suporte a sequências longas
- RAM pública: apenas 320KB disponível para ativações

Ainda assim, para aplicações ultra-simples (comandos de voz, classificação básica) é viável.`,
    replies: [
      { author: "beatriz.santos", text: "Incrível! Você pode compartilhar o diff do llama.cpp? Estou tentando algo similar no STM32.", date: "há 2 dias", upvotes: 12 },
      { author: "marcos.vieira", text: "@beatriz.santos Sim, vou abrir um PR no repo público esta semana.", date: "há 1 dia", upvotes: 8, isOp: true },
    ],
  },
  {
    id: "t3",
    title: "YOLOv8n STM32H7: 12ms de inferência é o limite real?",
    author: "camila.rocha",
    hardware: "STM32H7",
    upvotes: 204,
    views: 3100,
    tags: ["vision", "mcu", "cms-nn"],
    isPinned: false,
    isValidated: true,
    date: "há 5 dias",
    body: `Publicamos o benchmark 12ms/89.3% mAP para YOLOv8n no STM32H743 com CMS-NN.

Vários membros questionaram se é reproduzível — adicionamos o código completo e os arquivos de calibração.

**Pipeline de otimização:**
1. Exportar YOLOv8n para ONNX
2. Quantizar para INT8 com calibração (500 imagens COCO)
3. Converter com STM32Cube.AI 8.1
4. Deploy com FreeRTOS + DMA para input de câmera

O limite físico do STM32H7 para redes desta complexidade parece ser ~10–14ms. Para latências menores, considere hardware com NPU dedicada (ex: MAX78000).`,
    replies: [
      { author: "thiago.mendes", text: "Reproduzido no STM32H743. Latência: 11.8ms. Arquivo de calibração disponível no GitHub.", date: "há 1 semana", upvotes: 45 },
      { author: "camila.rocha", text: "@thiago.mendes Obrigada! Badge atualizado para 'Reproduzível'.", date: "há 6 dias", upvotes: 38, isOp: true },
    ],
  },
  {
    id: "t4",
    title: "[Discussão] Qual o melhor SLM para detecção de intenção offline em Pi 5?",
    author: "ana.souza",
    hardware: "Raspberry Pi 5",
    upvotes: 56,
    views: 780,
    tags: ["slm", "raspberry", "nlp"],
    isPinned: false,
    isValidated: false,
    date: "há 1 semana",
    body: `Preciso de NLU offline com <100ms, <5W e >92% accuracy em português.

Testei:
- **Phi-3 Mini (Q4_K_M):** 71ms, 4.8W, 94.8% — melhor opção até agora
- **Gemma-2B (INT8):** 45ms, 3.9W, 92.1% — mais rápido, menor acurácia em PT-BR

Alguém tem experiência com Qwen2-0.5B ou algum modelo fine-tunado para português?`,
    replies: [
      { author: "pedro.alves", text: "Qwen2-0.5B no Pi 5 fica em ~35ms mas a acurácia em PT-BR é ~88% sem fine-tuning. Com LoRA + dataset PT-BR chega em 93%.", date: "há 5 dias", upvotes: 21 },
    ],
  },
];

