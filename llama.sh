#!/usr/bin/env bash
set -euo pipefail

echo "Starting llama-server with model: qwen2.5-7b-q4_k_m.gguf on port 8080"
llama-server -hf bartowski/Qwen2.5-7B-Instruct-GGUF:Q4_K_M \
	--port 8080 \
	-ngl 99 \
	-c 8192 \
	--temp 0.7
