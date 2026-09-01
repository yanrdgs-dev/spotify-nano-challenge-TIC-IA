# Imagem base estável e compatível com librosa/numpy
FROM python:3.12-slim

# Evitar buffer de logs e geração de bytecode
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8000

# Dependências de sistema para DSP e decodificação de áudio
RUN apt-get update && apt-get install -y --no-install-recommends \
    libsndfile1 \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Binário standalone do uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

# Copiar arquivos de configuração de dependências
COPY README.md pyproject.toml uv.lock* requirements.txt* /app/

# Instalar dependências no ambiente global
RUN if [ -f requirements.txt ]; then \
        uv pip install --system -r requirements.txt; \
    else \
        uv pip install --system .; \
    fi

# Copiar código-fonte, dados e artefatos treinados
COPY src/ /app/src/
COPY data/ /app/data/
COPY artifacts/ /app/artifacts/

# Instalar o pacote do projeto em modo no-deps
RUN uv pip install --system --no-deps .

EXPOSE 8000

CMD ["uvicorn", "spotify_nano_challenge_tic_ia.app.main:app", "--host", "0.0.0.0", "--port", "8000"]