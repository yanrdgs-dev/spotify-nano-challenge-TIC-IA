from contextlib import asynccontextmanager
from pathlib import Path

import joblib
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes.analyze import router as analyze_router

# Localização resiliente do artefato de benchmarks
def _find_artifact_path() -> Path:
    candidates = [
        Path.cwd() / "artifacts" / "genre_benchmarks.joblib",
        Path(__file__).resolve().parents[3] / "artifacts" / "genre_benchmarks.joblib",
        Path(__file__).resolve().parent.parent
        / "artifacts"
        / "genre_benchmarks.joblib",
        Path("/app/artifacts/genre_benchmarks.joblib"),
    ]
    for p in candidates:
        if p.exists():
            return p
    return candidates[0]


ARTIFACT_PATH = _find_artifact_path()


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
    title="Genre Alignment API",
    description="API para diagnóstico técnico de produção musical baseado em benchmarks de gênero.",
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
