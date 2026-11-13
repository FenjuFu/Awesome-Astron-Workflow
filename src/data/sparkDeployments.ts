export type Localized = { en: string; zh: string };
export type DeploymentCategory = 'cloud' | 'desktop' | 'developer' | 'server' | 'edge' | 'advanced';
export interface SparkDeployment {
  id: string;
  name: string;
  category: DeploymentCategory;
  kind: 'official' | 'community';
  environment: string;
  description: Localized;
  steps: Localized[];
  note: Localized;
  links: { label: Localized; href: string }[];
  code?: string;
  codeLabel?: string;
}

const l = (en: string, zh: string): Localized => ({ en, zh });
const link = (en: string, zh: string, href: string) => ({ label: l(en, zh), href });
const readme = 'https://github.com/XHToken/Spark-X2.6/blob/X2.6/README.md';
const gguf = 'https://huggingface.co/XHToken/Spark-X2.6-4B-GGUF';
export const sparkDeploymentChecked = '2026-11-13';

export const sparkDeployments: SparkDeployment[] = [
  {
    id: 'maas', name: 'Astron MaaS · 星辰', category: 'cloud', kind: 'official', environment: 'Hosted API · OpenAI / Responses / Anthropic',
    description: l('Call Spark-X2.6-4B without downloading weights. Start with the community API sponsorship guide, or use your own official MaaS account.', '无需下载权重，在线调用 Spark-X2.6-4B。可从本站 API 赞助指南开始，也可使用自己的星辰 MaaS 账号。'),
    steps: [l('Open the sponsorship page and follow its key and local .env instructions.', '打开 API 赞助页，按说明领取 Key 并配置本地 .env。'), l('Use model ID spark-x2.6-4b and the protocol-specific base URL shown in the guide.', '选择 spark-x2.6-4b，并使用指南中对应协议的地址。')],
    note: l('spark-x2.6 and spark-x2.6-4b are different model IDs. Account access, quotas and pricing follow the provider; sponsorship requires an organizer code.', 'spark-x2.6 与 spark-x2.6-4b 是不同模型 ID；权限、额度与价格以平台为准。本站赞助需组织者提供的兑换口令。'),
    links: [link('API sponsorship & examples', 'API 赞助与调用示例', '/api-sponsorship'), link('Official MaaS', '星辰 MaaS 官网', 'https://maas.xfyun.cn/'), link('Chat API reference', 'Chat 接口文档', 'https://maas.xfyun.cn/doc/guide/3%E3%80%81API%20%E6%8E%A5%E5%8F%A3/3.1%20%E6%98%9F%E7%81%AB%E6%A8%A1%E5%9E%8B%20API/3.1.1%20Chat.html')],
    codeLabel: 'Python · pip install openai python-dotenv',
    code: `import os\nfrom dotenv import load_dotenv\nfrom openai import OpenAI\n\nload_dotenv()\nclient = OpenAI(\n    api_key=os.environ["SPARK_API_KEY"],\n    base_url="https://maas-api.cn-huabei-1.xf-yun.com/v2",\n)\nresponse = client.chat.completions.create(\n    model="spark-x2.6-4b",\n    messages=[{"role": "user", "content": "Hello, Spark!"}],\n)\nprint(response.choices[0].message.content)`,
  },
  {
    id: 'flashhub', name: 'FlashHub / FlashRT', category: 'cloud', kind: 'community', environment: 'Model distribution → local API · RTX / CoreX MR-V100',
    description: l('FlashHub is FlashRT’s model and hardware distribution community. Spark-X2.6-4B has a dedicated listing, with runtime and hardware information supplied by the publisher.', 'FlashHub 是 FlashRT 的模型与硬件分发社区，已提供 Spark-X2.6-4B 专属上架页，可查看发布者提供的运行时与硬件适配信息。'),
    steps: [l('Open repository 37, or search the homepage for Spark-X2.6-4B or spark_x26_4b. The checked listing recommends xym/spark_x26_4b:1.0.7 (pre-release).', '打开仓库 37，或在首页搜索 Spark-X2.6-4B / spark_x26_4b。本轮上架页推荐 xym/spark_x26_4b:1.0.7，版本标记为预发布。'), l('For the NVIDIA recipe: Linux x86_64, CUDA 13 driver 580+, RTX 3060 / 4060 Ti / 5060 Ti; flashcli creates Python 3.12 and downloads 7.7 GB weights on first run. MR-V100 uses the separate CoreX 4.4 / Python 3.11 recipe on the listing.', 'NVIDIA 路径需 Linux x86_64、CUDA 13 驱动 580+ 与 RTX 3060／4060 Ti／5060 Ti；flashcli 创建 Python 3.12 环境，首次另下 7.7 GB 权重。MR-V100 请按上架页独立的 CoreX 4.4／Python 3.11 步骤操作。')],
    note: l('FlashHub distributes the bundle; flashcli serve runs your own OpenAI/Anthropic-compatible service, not a FlashHub-hosted public endpoint. Batch=1 requests queue; MR-V100 streaming is delivered after generation. Publisher results were read, not independently rerun.', 'FlashHub 提供模型包分发，flashcli serve 在你的机器上运行 OpenAI／Anthropic 兼容服务，并非 FlashHub 托管公共端点。batch=1 请求排队，MR-V100 流式结果在生成完后送出；作者结果已阅读，未独立复测。'),
    links: [link('Spark listing', 'Spark 上架页', 'https://flashhub.top/repositories/37'), link('Search FlashHub', 'FlashHub 首页搜索', 'https://flashhub.top/')],
    codeLabel: 'Linux Bash · NVIDIA recipe · inspect installer before running',
    code: `curl -fsSLo flashcli-install.sh https://cli.flashhub.top/flashcli/auto_install.sh\n# Read flashcli-install.sh before running it.\nsh flashcli-install.sh\nflashcli pull xym/spark_x26_4b:1.0.7\nflashcli run xym/spark_x26_4b:1.0.7 --prompt "Hello, Spark!" --max-tokens 256\nflashcli serve xym/spark_x26_4b:1.0.7 --host 127.0.0.1 --port 8080`,
  },
  {
    id: 'hf-space', name: 'Hugging Face · ZeroGPU demo', category: 'cloud', kind: 'community', environment: 'Browser UI → hosted GPU · 云端推理',
    description: l('mrfakename’s Gradio Space offers an online 4B chat demo with none / low / high thinking controls.', 'mrfakename 的 Gradio Space 提供在线 4B 对话演示，含 none / low / high 三档思考控制。'),
    steps: [l('Open the Space, wait for a GPU slot if requested, then submit a text prompt.', '打开 Space，如需 GPU 排队请等待，再输入文本提问。'), l('For a self-hosted copy, inspect app.py, requirements.txt and the bundled Spark model code before duplicating.', '自建时先阅读 app.py、requirements.txt 与随附 Spark 模型代码，再复制 Space。')],
    note: l('Shared GPU availability and quotas may change. This Space adapts model code to Transformers 5; do not mix its requirements with the official 4.57.1 example.', '共享 GPU 可用性与额度可能变化。该 Space 将模型代码适配至 Transformers 5，不要混用官方 4.57.1 示例的依赖。'),
    links: [link('Open online demo', '打开在线演示', 'https://huggingface.co/spaces/mrfakename/spark-x2.6-4b'), link('App source & dependencies', '应用源码与依赖', 'https://huggingface.co/spaces/mrfakename/spark-x2.6-4b/tree/main')],
  },
  {
    id: 'ollama', name: 'Ollama', category: 'desktop', kind: 'official', environment: 'Windows · macOS · Linux / GGUF',
    description: l('Download and chat from one command, then connect scripts to Ollama’s local API. An explicit quantization tag avoids an unexpectedly large default download.', '一条命令下载并聊天，也可让脚本连接 Ollama 本地 API。显式选择量化标签，避免默认下载较大的权重。'),
    steps: [l('Install a current Ollama release with Spark support; the model README specifies 0.34.2 or later.', '安装支持 Spark 的新版 Ollama；模型 README 标注 0.34.2 起。'), l('Run the official q4_k_m tag below. Use q8_0 or the default BF16 tag when your memory budget allows.', '运行下方官方 q4_k_m 标签；内存充足时可改为 q8_0 或默认 BF16 标签。')],
    note: l('The official listing shows Q4_K_M 3.5 GB, Q8_0 4.4 GB and default BF16 8.2 GB. These are download sizes, not total runtime memory.', '官方列表的 Q4_K_M 为 3.5 GB、Q8_0 为 4.4 GB、默认 BF16 为 8.2 GB；这是下载大小，不是运行总内存。'),
    links: [link('Install Ollama', '安装 Ollama', 'https://ollama.com/download'), link('Official model & API examples', '官方模型与 API 示例', 'https://ollama.com/SparkLLM/Spark-X2.6-4B'), link('Q4 tag', 'Q4 标签', 'https://ollama.com/SparkLLM/Spark-X2.6-4B:q4_k_m')],
    codeLabel: 'Terminal', code: `ollama run SparkLLM/Spark-X2.6-4B:q4_k_m`,
  },
  {
    id: 'lm-studio', name: 'LM Studio', category: 'desktop', kind: 'official', environment: 'Desktop GUI · GGUF · local API',
    description: l('Use a graphical model library and chat interface, then optionally start a local API server for other apps.', '通过图形界面搜索、下载并对话，也可开启本地 API 服务供其他应用连接。'),
    steps: [l('Install LM Studio 0.4.0 or later and update its inference runtime.', '安装 LM Studio 0.4.0 或更新版本，并更新推理运行时。'), l('Search Spark-X2.6-4B; select the XHToken GGUF and a quantization that fits. Load it before opening chat or the Developer server.', '搜索 Spark-X2.6-4B，选择 XHToken GGUF 与适合的量化；加载后打开聊天或 Developer 服务。')],
    note: l('A generic app download alone does not establish Spark support: the bundled runtime must recognize spark2_5. Use lms ls to check the downloaded identifier.', '只安装客户端不代表运行时已支持 Spark；内置引擎须识别 spark2_5。用 lms ls 核对实际下载的模型标识。'),
    links: [link('Download LM Studio', '下载 LM Studio', 'https://lmstudio.ai/download'), link('Spark setup example', 'Spark 官方示例', `${readme}#lm-studio`), link('Official GGUF files', '官方 GGUF 权重', gguf)],
    codeLabel: 'LM Studio CLI', code: `lms ls\nlms chat spark-x2.6`,
  },
  {
    id: 'llama-cpp', name: 'llama.cpp', category: 'desktop', kind: 'official', environment: 'CPU · CUDA · Metal · Vulkan / GGUF',
    description: l('Build a small local command-line runner or an OpenAI-compatible server with direct control over GGUF, GPU offload and context.', '可搭建轻量命令行或 OpenAI 兼容服务，直接控制 GGUF、GPU 卸载与上下文长度。'),
    steps: [l('Install a recent llama.cpp build. Native Spark architecture support starts at b10828; use a current build for current CLI syntax.', '安装新版 llama.cpp；Spark 架构原生支持始于 b10828，当前命令语法请使用新版。'), l('Download an official 4B GGUF file and pass its file path, not the containing directory, to -m.', '下载官方 4B GGUF，将具体文件路径传给 -m，而不是传文件夹。')],
    note: l('The example uses CPU and 8K context as a starting configuration. Enable the backend for your GPU separately. Ordinary Spark support does not imply DSpark support.', '示例以 CPU 和 8K 上下文起步，GPU 加速需另配对应后端。普通 Spark 支持不代表支持 DSpark。'),
    links: [link('Install / build', '安装／编译', 'https://github.com/ggml-org/llama.cpp'), link('Official GGUF files', '官方 GGUF 权重', gguf), link('Community quant example', '社区量化示例', 'https://huggingface.co/bartowski/Spark-X2.6-4B-GGUF')],
    codeLabel: 'Terminal · replace /path/to/', code: `llama cli -m /path/to/Spark-X2.6-4B-Q4_K_M.gguf -c 8192\nllama serve -m /path/to/Spark-X2.6-4B-Q4_K_M.gguf -c 8192 --host 127.0.0.1 --port 8080`,
  },
  {
    id: 'unsloth', name: 'Unsloth Studio', category: 'desktop', kind: 'official', environment: 'Local Studio · native GGUF inference',
    description: l('The Spark model README lists current Unsloth Studio as a native GGUF inference option.', 'Spark 模型 README 已将新版 Unsloth Studio 列为原生 GGUF 推理方式。'),
    steps: [l('Install the current Studio using Unsloth’s platform-specific instructions.', '按 Unsloth 对应系统的安装说明配置新版 Studio。'), l('Use the Studio inference interface to load Spark-X2.6-4B GGUF; select a quantization for your device.', '在 Studio 推理界面加载 Spark-X2.6-4B GGUF，并选择适配设备的量化。')],
    note: l('This entry is about GGUF inference. It does not establish support for every fine-tuning method; no Spark-specific independent Studio walkthrough was confirmed in this search.', '本项指 GGUF 推理，不代表所有微调方法均受支持；本轮未确认独立的 Spark 专项 Studio 实操教程。'),
    links: [link('Unsloth Studio', 'Unsloth Studio', 'https://unsloth.ai/docs/new/studio'), link('Spark support note', 'Spark 支持说明', `${readme}#unsloth`), link('GGUF download', '下载 GGUF', gguf)],
  },
  {
    id: 'transformers', name: 'Transformers / Python', category: 'developer', kind: 'official', environment: 'Python · PyTorch · HF checkpoint',
    description: l('Load the original checkpoint in Python for application development, notebooks and controlled generation experiments.', '在 Python 中加载原始权重，适合应用开发、Notebook 与可控的生成实验。'),
    steps: [l('Create a Python environment, install PyTorch for your device, then transformers==4.57.1 and accelerate.', '创建 Python 环境，安装适配设备的 PyTorch，再安装 transformers==4.57.1 与 accelerate。'), l('Use the model tokenizer’s chat template and decode only tokens generated after the input.', '使用模型 tokenizer 的聊天模板，仅解码输入之后新生成的 token。')],
    note: l('trust_remote_code=True executes the model repository’s Python code; inspect and pin a revision before adopting it. Start with a short output budget and increase when thinking needs it.', 'trust_remote_code=True 会执行模型仓库中的 Python 代码，使用前检查并固定 revision。先用短输出预算，思考模式需要时再增加。'),
    links: [link('Official Python quickstart', '官方 Python 快速开始', `${readme}#transformers`), link('Model files & code', '模型文件与代码', 'https://huggingface.co/XHToken/Spark-X2.6-4B/tree/main')],
    codeLabel: 'Python · pip install transformers==4.57.1 accelerate',
    code: `from transformers import AutoTokenizer, AutoModelForCausalLM\n\nmodel_id = "XHToken/Spark-X2.6-4B"\ntokenizer = AutoTokenizer.from_pretrained(model_id)\nmodel = AutoModelForCausalLM.from_pretrained(\n    model_id, trust_remote_code=True,\n    torch_dtype="auto", device_map="auto",\n)\ninputs = tokenizer.apply_chat_template(\n    [{"role": "user", "content": "Explain local inference."}],\n    tokenize=True, add_generation_prompt=True,\n    enable_thinking=False, return_dict=True, return_tensors="pt",\n).to(model.device)\noutput = model.generate(**inputs, max_new_tokens=512,\n    do_sample=True, temperature=1.0, top_p=0.95, top_k=0)\nprint(tokenizer.decode(output[0][inputs["input_ids"].shape[-1]:],\n    skip_special_tokens=True))`,
  },
  {
    id: 'spark-mlx', name: 'Spark-MLX-LLM', category: 'developer', kind: 'official', environment: 'Apple Silicon · Metal / Linux CUDA guide',
    description: l('Spark’s dedicated MLX runtime provides conversion, chat and HTTP serving. Follow its current repository instead of older direct-load snippets.', 'Spark 专用 MLX 运行时提供转换、聊天与 HTTP 服务；请按最新仓库操作，不照搬旧版直接加载片段。'),
    steps: [l('Prepare native arm64 Python 3.12, macOS 26.2+ and Xcode with Metal 4 tools; clone and run uv sync --locked.', '准备原生 arm64 Python 3.12、macOS 26.2+ 及含 Metal 4 工具的 Xcode，克隆后运行 uv sync --locked。'), l('Download the official INT4 checkpoint, convert it into a new MLX directory, then serve the converted output.', '下载官方 INT4 权重，转换至新的 MLX 目录，再加载转换产物开启服务。')],
    note: l('W8A8 acceleration additionally needs M5 or newer; other paths have separate requirements. Current docs require Metal/CUDA for inference; CPU conversion is not CPU inference.', 'W8A8 加速另需 M5 或更新芯片，其他路径按各自要求配置。当前文档要求 Metal／CUDA 推理，CPU 转换不等于 CPU 推理。'),
    links: [link('Current install & examples', '最新安装与示例', 'https://github.com/XHToken/Spark-MLX-LLM'), link('Linux / CUDA & troubleshooting', 'Linux／CUDA 与排错', 'https://github.com/XHToken/Spark-MLX-LLM/blob/main/docs/en/environment.md'), link('INT4 checkpoint', 'INT4 权重', 'https://huggingface.co/XHToken/Spark-X2.6-4B-INT4')],
    codeLabel: 'macOS · uv installed; replace /path/to/',
    code: `git clone https://github.com/XHToken/Spark-MLX-LLM.git\ncd Spark-MLX-LLM\nuv python install 3.12\nuv sync --locked\n.venv/bin/spark-mlx-convert --source /path/to/Spark-X2.6-4B-INT4 --output /path/to/Spark-X2.6-4B-MLX\n.venv/bin/spark-mlx-server --model /path/to/Spark-X2.6-4B-MLX --host 127.0.0.1 --port 8080 --no-thinking`,
  },
  {
    id: 'sglang', name: 'SGLang · NVIDIA', category: 'server', kind: 'official', environment: 'Linux · Docker · NVIDIA CUDA 13 image',
    description: l('Serve the 4B checkpoint behind an OpenAI-compatible API with the documented Spark tool-call and reasoning parsers.', '通过 OpenAI 兼容 API 部署 4B 权重，使用官方给出的 Spark 工具调用与思考解析器。'),
    steps: [l('Prepare the NVIDIA container runtime and download the full checkpoint, including chat_template.jinja.', '准备 NVIDIA 容器运行环境，下载含 chat_template.jinja 的完整权重。'), l('Set MODEL_PATH to an absolute local directory. Start the pinned image below, then call /v1/chat/completions with model spark2.6.', '将 MODEL_PATH 设为本地绝对路径，启动下方固定镜像，再以 spark2.6 调用 /v1/chat/completions。')],
    note: l('This starter reduces the official 1M context example to 8K. Match CUDA/driver requirements and measure actual memory before increasing context or concurrency.', '此起步示例将官方 1M 上下文下调为 8K；须匹配 CUDA／驱动，增加上下文或并发前先测实际内存。'),
    links: [link('Official server & client example', '官方服务端与客户端示例', `${readme}#sglang`), link('SGLang installation', 'SGLang 安装', 'https://docs.sglang.ai/get_started/install.html')],
    codeLabel: 'Linux Bash · local checkpoint required',
    code: `export MODEL_PATH=/absolute/path/to/Spark-X2.6-4B\ndocker run --rm --gpus all --ipc=host -p 127.0.0.1:30000:30000 \\\n  -v "$MODEL_PATH:/models/Spark-X2.6-4B:ro" \\\n  lmsysorg/sglang:nightly-dev-cu13-20260827-20621aa1 \\\n  python -m sglang.launch_server \\\n  --model-path /models/Spark-X2.6-4B --served-model-name spark2.6 \\\n  --tool-call-parser spark25 --reasoning-parser qwen3 \\\n  --tp-size 1 --mem-fraction-static 0.8 --context-length 8192 \\\n  --chat-template /models/Spark-X2.6-4B/chat_template.jinja \\\n  --host 0.0.0.0 --port 30000`,
  },
  {
    id: 'vllm', name: 'vLLM · NVIDIA', category: 'server', kind: 'official', environment: 'Linux · Docker · NVIDIA / OpenAI API',
    description: l('Use vLLM’s official container to expose the checkpoint as a local API service.', '使用 vLLM 官方容器，将本地权重发布为 API 服务。'),
    steps: [l('Install Docker with NVIDIA GPU access, then download the complete Spark-X2.6-4B checkpoint.', '安装可访问 NVIDIA GPU 的 Docker，再下载完整 Spark-X2.6-4B 权重。'), l('Mount the checkpoint and use its chat template. The official example serves the model under alias spark25.', '挂载权重并使用随附聊天模板；官方示例的服务别名为 spark25。')],
    note: l('The upstream example uses a moving latest image; record or pin the working image digest for reproduction. This starter sets an 8K model limit.', '上游示例使用滚动 latest 镜像，复现时需记录或固定已验证的镜像摘要；本起步示例设为 8K 上限。'),
    links: [link('Official Docker & client example', '官方 Docker 与客户端示例', `${readme}#vllm`), link('Spark plugin', 'Spark 插件', 'https://github.com/XHToken/Spark-plugin')],
    codeLabel: 'Linux Bash · local checkpoint required',
    code: `export MODEL_PATH=/absolute/path/to/Spark-X2.6-4B\ndocker run --rm --gpus all --ipc=host -p 127.0.0.1:30000:30000 \\\n  -v "$MODEL_PATH:/models/Spark-X2.6-4B:ro" \\\n  vllm/vllm-openai:latest \\\n  --model /models/Spark-X2.6-4B --trust-remote-code \\\n  --served-model-name spark25 --port 30000 --max-model-len 8192 \\\n  --tensor-parallel-size 1 --gpu-memory-utilization 0.7 \\\n  --enable-prefix-caching --chat-template /models/Spark-X2.6-4B/chat_template.jinja`,
  },
  {
    id: 'ascend', name: 'Ascend · 昇腾 SGLang / vLLM', category: 'server', kind: 'official', environment: 'Linux · Ascend A2 / A3 / 950DT',
    description: l('The official guide provides separate NPU container paths: SGLang for A2/A3 and vLLM-Ascend for A2/A3/950DT.', '官方指南提供独立 NPU 容器路径：SGLang 的 A2／A3 镜像，以及 vLLM-Ascend 的 A2／A3／950DT 配置。'),
    steps: [l('Match the image to your NPU and CANN/driver stack. Pass the documented davinci device nodes and Ascend driver mounts.', '按 NPU 型号与 CANN／驱动选择镜像，映射文档规定的 davinci 设备和昇腾驱动目录。'), l('For vLLM-Ascend, install XHToken/Spark-plugin inside the container before starting vllm serve with the local chat template.', 'vLLM-Ascend 路径须先在容器内安装 XHToken/Spark-plugin，再用本地聊天模板启动 vllm serve。')],
    note: l('The image pull below is only the first step. Use the complete official device/mount commands; the NVIDIA Docker command is not an Ascend recipe. No NPU test was run here.', '下方拉镜像只是第一步，须使用官方完整设备映射与挂载命令；不能将 NVIDIA Docker 命令直接当作昇腾部署。本轮未进行 NPU 实测。'),
    links: [link('SGLang A2 / A3 full recipe', 'SGLang A2／A3 完整步骤', `${readme}#sglang`), link('vLLM A2 / A3 / 950DT full recipe', 'vLLM A2／A3／950DT 完整步骤', `${readme}#vllm`), link('Spark plugin installation', 'Spark 插件安装', 'https://github.com/XHToken/Spark-plugin')],
    codeLabel: 'Linux Bash · choose the matching hardware image',
    code: `# SGLang A2\ndocker pull quay.io/ascend/sglang:main-cann9.0.0-910b\n# SGLang A3\ndocker pull quay.io/ascend/sglang:main-cann9.0.0-a3\n# vLLM-Ascend A2 (follow the full container recipe)\ndocker pull quay.io/ascend/vllm-ascend:nightly-main`,
  },
  {
    id: 'webgpu', name: 'WebGPU · 4B in your browser', category: 'edge', kind: 'community', environment: 'Desktop Chrome / Edge · local GPU · ONNX INT4',
    description: l('Mohd Mahmodi’s 4B ONNX conversion runs on your browser’s GPU after downloading the weights. It is distinct from the 1.7B demo and from a hosted API.', 'Mohd Mahmodi 的 4B ONNX 转换版下载权重后在浏览器本机 GPU 上运行；与 1.7B 演示、云端 API 是不同入口。'),
    steps: [l('Open the 4B Space in desktop Chrome/Edge and let it download about 2.77 GB once.', '用桌面 Chrome／Edge 打开 4B Space，首次等待约 2.77 GB 权重下载。'), l('For local hosting, clone the source, install dependencies, run npm run serve, then open localhost:8000.', '本地托管可克隆源码、安装依赖，运行 npm run serve 后打开 localhost:8000。')],
    note: l('Author test: Windows 11 / RTX 3090 Ti; about 3.5 GB GPU memory at 4K context. Browser CPU/WASM is unsupported. Other GPUs and phones were not validated by that report.', '作者测试条件为 Windows 11／RTX 3090 Ti，4K 上下文约需 3.5 GB 显存；浏览器 CPU／WASM 不支持，报告未验证其他 GPU 与手机。'),
    links: [link('Open 4B local browser demo', '打开 4B 本地浏览器演示', 'https://huggingface.co/spaces/mohdmahmodi/Spark-X2.6-WebGPU'), link('Source & validation report', '源码与验证报告', 'https://github.com/mohdmahmodi/Spark-X2.6-4B-onnx-webgpu'), link('ONNX weights', 'ONNX 权重', 'https://huggingface.co/mohdmahmodi/Spark-X2.6-4B-ONNX-WebGPU')],
    codeLabel: 'Node.js · local web app', code: `git clone https://github.com/mohdmahmodi/Spark-X2.6-4B-onnx-webgpu\ncd Spark-X2.6-4B-onnx-webgpu\nnpm install\nnpm run serve`,
  },
  {
    id: 'android', name: 'Android · Local-LLM', category: 'edge', kind: 'community', environment: 'Android 11+ · arm64 · GGUF',
    description: l('Leo00703’s open-source Android app explicitly lists Spark-X2.6 4B and 1.7B in its supported-model catalog.', 'Leo00703 的开源 Android 应用在支持列表中明确列出了 Spark-X2.6 4B 与 1.7B。'),
    steps: [l('Get the arm64 sideload APK from the project’s Releases and install it on Android 11+.', '在项目 Releases 获取 arm64 sideload APK，安装到 Android 11+ 设备。'), l('Select Spark-X2.6 4B in the local model catalog and download it before chatting.', '在本地模型目录选择 Spark-X2.6 4B，下载完成后再聊天。')],
    note: l('On-device mode and remote LM Studio/Ollama connections are separate. This app’s compatibility list was read; its APK, phone latency and heat were not independently tested.', '本机推理与远程连接 LM Studio／Ollama 是两种模式。本轮读取了支持列表，未独立安装 APK 或测试手机延迟与发热。'),
    links: [link('APK releases', 'APK 下载', 'https://github.com/Leo00703/Local-LLM/releases'), link('Supported models & source build', '支持模型与源码编译', 'https://github.com/Leo00703/Local-LLM#supported-models')],
  },
  {
    id: 'ios', name: 'iPhone / iPad · local apps', category: 'edge', kind: 'community', environment: 'Local LLM: On-Device · AIでチャット',
    description: l('Tony’s Local LLM has a public iPhone Canvas demo for Spark-X2.6-4B. AIでチャット also documents the 4B model and optional draft-model support.', 'Tony 的 Local LLM 已公开 Spark-X2.6-4B 的 iPhone Canvas 演示；AIでチャット 也有 4B 模型与可选草稿模型的公开说明。'),
    steps: [l('Install from the relevant App Store entry and check device compatibility and the current in-app model list.', '从对应 App Store 安装，核对设备兼容性与当前应用内模型目录。'), l('Download the exact X2.6 4B model; keep any experimental draft model matched to its target.', '下载准确的 X2.6 4B 版本；实验性草稿模型须与目标模型匹配。')],
    note: l('Local LLM requires iOS 17+. Its latest notes highlight 1.7B, while the 4B evidence is the earlier developer demo. No phone speedup or current catalog was independently verified.', 'Local LLM 要求 iOS 17+；最新说明重点为 1.7B，4B 依据为此前开发者演示。本轮未独立验证手机加速或当前应用内目录。'),
    links: [link('Local LLM App Store', 'Local LLM 商店', 'https://apps.apple.com/us/app/local-llm-on-device/id6804004948'), link('4B iPhone Canvas demo', '4B iPhone Canvas 演示', 'https://x.com/TonyZ278264/status/2114415748257022091'), link('AIでチャット App Store', 'AIでチャット 商店', 'https://apps.apple.com/jp/app/id6756705802'), link('Version-specific mobile guide', '分版本手机应用指南', 'https://github.com/XHToken/Spark-X2.6/wiki/Mobile-Apps')],
  },
  {
    id: 'raspberry-pi', name: 'Raspberry Pi / ARM CPU', category: 'edge', kind: 'community', environment: '64-bit Linux · llama.cpp CPU · GGUF',
    description: l('Run quantized 4B GGUF on a Linux ARM board using llama.cpp’s CPU backend. ai-tier publishes a Pi 5 16 GB example for this exact model.', '可用 llama.cpp CPU 后端在 Linux ARM 开发板上运行量化 4B GGUF；ai-tier 有该模型在 Pi 5 16 GB 上的公开测试。'),
    steps: [l('Install Git, CMake and a C++ compiler on a 64-bit Linux system; build llama.cpp without a GPU backend.', '在 64 位 Linux 安装 Git、CMake 与 C++ 编译器，编译不启用 GPU 的 llama.cpp。'), l('Download the 4B Q4_K_M GGUF, start at 4096 context and one request, then measure memory and latency.', '下载 4B Q4_K_M GGUF，以 4096 上下文、单请求起步，再测内存与延迟。')],
    note: l('Author’s 2026-10-27 Pi 5 / 16 GB test: Q4_K_M, 4096 context, reasoning off, 2.5 output tok/s and 5,938 MiB peak memory. Not a speed guarantee or an RK3588/NPU test.', '作者 2026-10-27 的 Pi 5／16 GB 测试：Q4_K_M、4096 上下文、关闭思考，输出 2.5 tok/s、峰值内存 5,938 MiB；不代表其他设备速度，也不是 RK3588／NPU 测试。'),
    links: [link('Pi 5 original test & setup', 'Pi 5 原始测试与配置', 'https://ai-tier.com/results/raspberry-pi-5/spark-x2-6-4b/'), link('llama.cpp build guide', 'llama.cpp 编译指南', 'https://github.com/ggml-org/llama.cpp/blob/master/docs/build.md'), link('4B GGUF', '4B GGUF 权重', gguf)],
    codeLabel: 'Linux Bash · CPU · after downloading the GGUF', code: `git clone https://github.com/ggml-org/llama.cpp.git\ncd llama.cpp\ncmake -B build -DCMAKE_BUILD_TYPE=Release\ncmake --build build --config Release -j 4 --target llama-cli\n./build/bin/llama-cli -m /path/to/Spark-X2.6-4B-Q4_K_M.gguf -c 4096 -t 4 -p "Hello, Spark!"`,
  },
  {
    id: 'dspark', name: 'DSpark · speculative decoding', category: 'advanced', kind: 'official', environment: '4B target + 624M draft · CUDA / MLX',
    description: l('Add a separate BF16 draft model to a matching 4B target. DSpark proposes tokens and the target verifies them; it is an acceleration path, not a standalone chatbot.', '在匹配的 4B 目标模型旁增加独立 BF16 草稿模型；DSpark 提议 token，由目标模型验证，是加速路径而非独立聊天模型。'),
    steps: [l('For Linux/NVIDIA, build the XHToken llama.cpp revision documented on the DSpark card.', 'Linux／NVIDIA 路径须按 DSpark 模型卡构建指定 XHToken llama.cpp revision。'), l('Download both target and draft GGUF; use the full server flags on the model card. MLX instead requires a merged target/draft checkpoint.', '下载目标与草稿两个 GGUF，按模型卡完整参数启服；MLX 路径则需合并目标／草稿的 checkpoint。')],
    note: l('Do not assume upstream llama.cpp or every phone backend supports this path. The card pins 22c0ae1; Windows ARM has a reported draft-loading issue. Compare speed at the same target precision, task and context.', '不要假定上游 llama.cpp 或手机后端均支持此路径。模型卡固定 22c0ae1；Windows ARM 有草稿加载问题报告。测速须固定目标精度、任务与上下文。'),
    links: [link('Full DSpark build, server & request', 'DSpark 完整编译、服务与请求', 'https://huggingface.co/XHToken/Spark-X2.6-4B-DSpark-GGUF'), link('MLX merged-checkpoint path', 'MLX 合并权重路径', 'https://github.com/XHToken/Spark-MLX-LLM#dspark-models'), link('Windows ARM issue', 'Windows ARM 问题记录', 'https://github.com/ggml-org/llama.cpp/issues/31985')],
    codeLabel: 'Linux Bash · build stage; use the linked full server recipe', code: `git clone https://github.com/XHToken/llama.cpp.git spark-dspark\ncd spark-dspark\ngit checkout 22c0ae1871b60123c5afc008a78fe9c6fffa2858\ncmake -S . -B build-cuda -DCMAKE_BUILD_TYPE=Release -DGGML_CUDA=ON\ncmake --build build-cuda --target llama-server -j8`,
  },
  {
    id: 'rapid-mlx', name: 'Rapid-MLX', category: 'advanced', kind: 'community', environment: 'Apple Silicon · community MLX alias · HTTP',
    description: l('A community API-serving alternative with a pinned spark-x2.6-4b-4bit alias and a public qualification report.', '社区 API 服务方案，提供固定的 spark-x2.6-4b-4bit 别名与公开验证报告。'),
    steps: [l('Install Rapid-MLX according to its current setup guide, then select spark-x2.6-4b-4bit.', '按项目最新指南安装 Rapid-MLX，再选择 spark-x2.6-4b-4bit。'), l('Use the report’s pinned conversion and launch settings when reproducing its chat/tool probes.', '复现聊天与工具测试时，使用报告固定的转换权重与启动参数。')],
    note: l('Reported M4 Pro / 48 GiB probes cover English/Chinese chat, tools and thinking switches. Short SSE replies coalesced into one content delta; token-by-token streaming and 1M context were not established.', '报告在 M4 Pro／48 GiB 上检查了中英对话、工具与思考开关；短 SSE 回答合并为一个 content delta，未证明逐 token 流式输出或 1M 上下文。'),
    links: [link('Install Rapid-MLX', '安装 Rapid-MLX', 'https://github.com/raullenchai/Rapid-MLX'), link('Spark alias catalog', 'Spark 别名目录', 'https://rapidmlx.com/docs/models/alias-catalog'), link('Pinned reproduction report', '固定版本复现报告', 'https://github.com/raullenchai/Rapid-MLX/blob/4d5ac49d9a5f82574db78df48d6965f05b2d1c51/docs/engineering/performance/2026-10-25-trending-models.md')],
  },
  {
    id: 'cortiq', name: 'cortiq / CMF · CUDA Turbo', category: 'advanced', kind: 'community', environment: 'Rust · CPU / Metal / Vulkan / experimental CUDA',
    description: l('A single-file community conversion with local chat and API serving. The newer experimental CUDA path also has a Spark 4B Turbo bundle and public reproduction commands.', '社区单文件转换格式，提供本地聊天和 API 服务；新增实验性 CUDA 路径也有 Spark 4B Turbo 包与公开复现命令。'),
    steps: [l('For standard CMF, install cortiq-cli and download infosave/Spark-X2.6-4B-cmf. Use the separate Turbo-CUDA bundle for the command below.', '普通 CMF 安装 cortiq-cli 并下载 infosave/Spark-X2.6-4B-cmf；下方命令使用独立 Turbo-CUDA 包。'), l('CUDA additionally needs the NVIDIA driver and CUDA 12.x runtime libraries; install the CUDA feature and select CMF_GPU=cuda.', 'CUDA 另需 NVIDIA 驱动与 CUDA 12.x 运行库；安装 CUDA feature，并设置 CMF_GPU=cuda。')],
    note: l('Turbo changes long-context attention behavior; treat its quality and memory reports as author-specific results, not output equivalence to standard GGUF/BF16. CUDA is experimental and was measured on one A40.', 'Turbo 改变长上下文注意力行为，质量与内存是作者特定测试结果，不等于标准 GGUF／BF16 输出一致；CUDA 为实验路径，报告仅测一张 A40。'),
    links: [link('Standard CMF & examples', '普通 CMF 与示例', 'https://huggingface.co/infosave/Spark-X2.6-4B-cmf'), link('CUDA Turbo model & limits', 'CUDA Turbo 模型与限制', 'https://huggingface.co/infosave/Spark-X2.6-4B-turbo-CUDA-cmf'), link('Original CUDA report #34', 'CUDA 原始报告 #34', 'https://huggingface.co/XHToken/Spark-X2.6-4B/discussions/34')],
    codeLabel: 'Linux Bash · Rust + HF CLI + CUDA runtime required', code: `cargo install cortiq-cli --features cuda\nhf download infosave/Spark-X2.6-4B-turbo-CUDA-cmf spark-x2.6-4b-q4tp-turbo.cmf --local-dir .\nCMF_GPU=cuda CMF_MAX_SEQ=131072 cortiq serve spark-x2.6-4b-q4tp-turbo.cmf --port 8080 --host 127.0.0.1`,
  },
];
