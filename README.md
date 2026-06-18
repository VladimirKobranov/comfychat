# ComfyChat

AI image generation with ComfyUI + Prompt Assistant (Qwen via llama.cpp).

## Prerequisites

- [Vite+](https://viteplus.dev/) (`vp` CLI — included as dev dependency, used for all commands)
- [ComfyUI](https://github.com/comfyanonymous/ComfyUI) (local instance)
- [llama.cpp](https://github.com/ggml-org/llama.cpp) + Qwen 2.5 for prompt enhancement

## Environment

```sh
cp .env.example .env.local
```

Fill in your Supabase project URL and publishable key.

## Project Setup

```sh
vp install
```

### Development

```sh
vp dev
```

### Production Build

```sh
vp build
```

### Lint, Type Check & Format

```sh
vp check
```

## ComfyUI Setup

1. **Clone the repository:**

   ```sh
   git clone https://github.com/comfyanonymous/ComfyUI.git
   cd ComfyUI
   ```

2. **Create and activate a virtual environment:**

   ```sh
   python -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies:**

   ```sh
   pip install -r requirements.txt
   ```

4. **Run ComfyUI:**

   ```sh
   python main.py --enable-cors-header
   ```

5. **(Optional) Use the launch script:**
   ```sh
   ./launch.sh
   ```

## llama.cpp Setup (Prompt Assistant)

The Prompt Assistant chat uses [llama.cpp](https://github.com/ggml-org/llama.cpp) with [Qwen 2.5 7B Instruct](https://huggingface.co/Qwen/Qwen2.5-7B-Instruct-GGUF) to enhance ComfyUI prompts.

`llama-server` downloads the model automatically via the `-hf` flag — no manual download needed.

```sh
# Just run the script — it downloads & starts the server in one go
./llama.sh
```

The dev server proxies `/api/chat` → `http://127.0.0.1:8080/v1/chat/completions`.

## Running Everything

```sh
# Terminal 1: ComfyUI
./comfy.sh

# Terminal 2: llama.cpp
./llama.sh

# Terminal 3: this project
vp dev
```
