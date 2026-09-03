from typing import Any

from fastapi import APIRouter, File, Form, HTTPException, Request, UploadFile, status

from ..analysis import processar_alinhamento
from ..audio_dsp import extrair_analise_completa_bytes
from ..schemas import AnalyzeResponse, GenresResponse, HealthResponse

router = APIRouter(prefix="/api", tags=["Análise & Diagnóstico"])


@router.get("/health", response_model=HealthResponse, tags=["Status"])
def health_check(request: Request):
    benchmarks: dict[str, Any] | None = getattr(request.app.state, "benchmarks", None)
    return {
        "status": "online",
        "benchmarks_loaded": benchmarks is not None,
        "genres_count": len(benchmarks["genres"]) if benchmarks else 0,
    }


@router.get("/genres", response_model=GenresResponse, tags=["Metadata"])
def get_genres(request: Request):
    """Retorna a lista completa de gêneros disponíveis no benchmark."""
    benchmarks: dict[str, Any] | None = getattr(request.app.state, "benchmarks", None)
    if not benchmarks:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Serviço indisponível: Benchmarks ainda não carregados.",
        )
    return {"genres": sorted(list(benchmarks["genres"].keys()))}


@router.post(
    "/analyze",
    response_model=AnalyzeResponse,
    status_code=status.HTTP_200_OK,
    summary="Analisar faixa de áudio contra benchmark de gênero",
)
async def analyze_track(
    request: Request,
    file: UploadFile = File(
        ..., description="Arquivo de áudio (.mp3, .wav, .flac, .ogg, .m4a)"
    ),
    genre: str = Form("rock", description="Gênero musical de referência"),
):
    """
    Recebe um arquivo de áudio e um gênero alvo:
    - Extrai features psicoacústicas, rítmicas e de masterização (EBU R128) em memória.
    - Segmenta a macroestrutura e tempo até o primeiro refrão (Hook).
    - Calcula o Z-Score multivariado ponderado contra o perfil do gênero.
    - Retorna score percentual, métricas físicas, masterização e sugestões práticas de estúdio.
    """
    benchmarks: dict[str, Any] | None = getattr(request.app.state, "benchmarks", None)
    if not benchmarks:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Benchmarks indisponíveis no servidor.",
        )

    allowed_extensions = (".mp3", ".wav", ".ogg", ".flac", ".m4a")
    filename = file.filename or "audio_track.mp3"

    if not filename.lower().endswith(allowed_extensions):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Formato inválido. Extensões aceitas: {', '.join(allowed_extensions)}",
        )

    try:
        file_bytes = await file.read()
        if len(file_bytes) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="O arquivo enviado está vazio.",
            )

        # 1. Extração DSP em memória (sem salvar arquivo em disco)
        metricas, mastering, macro_structure, spectral_eq = extrair_analise_completa_bytes(file_bytes)

        # 2. Diagnóstico estatístico completo
        resultado = processar_alinhamento(
            metricas=metricas,
            benchmarks=benchmarks,
            genero_alvo=genre,
            mastering=mastering,
            macro_structure=macro_structure,
            spectral_eq=spectral_eq,
        )
        resultado["filename"] = filename

        return resultado

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Falha durante o processamento do sinal de áudio: {exc!s}",
        )
