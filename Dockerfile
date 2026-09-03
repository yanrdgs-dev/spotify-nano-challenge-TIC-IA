FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8000

# Dependências do sistema para áudio e compilação
RUN apt-get update && apt-get install -y --no-install-recommends \
    libsndfile1 \
    ffmpeg \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Binário standalone do uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

# Copiar dependências
COPY README.md pyproject.toml requirements.txt* /app/

# Instalação rápida sem checagem rígida de hashes antigos
RUN if [ -f requirements.txt ]; then \
        uv pip install --system --no-verify-hashes --no-build -r requirements.txt; \
    else \
        uv pip install --system --no-verify-hashes --no-build .; \
    fi

# Copiar código e artefatos
COPY src/ /app/src/
COPY data/ /app/data/
COPY artifacts/ /app/artifacts/

RUN uv pip install --system --no-deps .

EXPOSE 8000

CMD ["uvicorn", "spotify_nano_challenge_tic_ia.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
root@vps-vibelab:~/spotify-nano-challenge-TIC-IA# 