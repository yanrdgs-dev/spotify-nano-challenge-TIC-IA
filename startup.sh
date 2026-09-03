#!/bin/bash
set -e

echo "=== Instalando o UV ==="
curl -LsSf https://astral.sh/uv/install.sh | sh
export PATH="$HOME/.local/bin:$PATH"

echo "=== Sincronizando dependências com UV ==="
# Se você usa pyproject.toml / uv.lock:
if [ -f "pyproject.toml" ]; then
    uv pip install --system -r <(uv pip compile pyproject.toml 2>/dev/null || cat requirements.txt)
elif [ -f "requirements.txt" ]; then
    uv pip install --system -r requirements.txt
fi

echo "=== Iniciando Uvicorn ==="
uv run uvicorn spotify_nano_challenge_tic_ia.app.main:app --host 0.0.0.0 --port 8000
