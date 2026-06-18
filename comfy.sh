#!/bin/bash
DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR/ComfyUI" || { echo "ComfyUI directory not found"; exit 1; }
source venv/bin/activate
python main.py --enable-cors-header "$@"
