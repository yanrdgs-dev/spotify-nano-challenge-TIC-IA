from contextlib import asynccontextmanager
from pathlib import Path

import joblib
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes.analyze import router as analyze_router

# Raiz do repositório: app/ -> spotify_nano_challenge_tic_ia/ -> src/ -> ROOT
PROJECT_ROOT = Path(__file__).resolve().parents[3]
ARTIFACT_PATH = PROJECT_ROOT / "artifacts" / "genre_benchmarks.joblib"


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Carrega os artefatos em memória na inicialização e limpa no encerramento."""
    if not ARTIFACT_PATH.exists():
        raise RuntimeError(
            f"Artefato não encontrado em: {ARTIFACT_PATH.resolve()}.\n"
            "Execute primeiro: uv run python src/spotify_nano_challenge_tic_ia/scripts/02_build_benchmarks.py"
        )
    app.state.benchmarks = joblib.load(ARTIFACT_PATH)
    print(
        f" Artefatos carregados ({len(app.state.benchmarks['genres'])} gêneros prontos)."
    )
    yield
    app.state.benchmarks = None


app = FastAPI(
    title="HitPredictor & A&R Analytics API",
    description="API de inteligência musical para artistas e produtores: extração DSP, calibração Spotify, masterização EBU R128 e diagnóstico prescritivo de gênero.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusão das rotas desacopladas
app.include_router(analyze_router)
