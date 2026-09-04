import asyncio
import time
from typing import Any
import uuid

from fastapi import APIRouter, File, Form, HTTPException, Query, Request, Response, UploadFile, status

from ..analysis import processar_alinhamento
from ..audio_dsp import extrair_analise_completa_bytes
from ..schemas import (
    AnalysisProgressResponse,
    AnalyzeResponse,
    GenresResponse,
    HealthResponse,
    StartAnalysisResponse,
)

router = APIRouter(prefix="/api", tags=["Análise & Diagnóstico"])

# Armazenamento em memória de tarefas de análise
ANALYSIS_JOBS: dict[str, dict[str, Any]] = {}
MAX_JOBS_STORED = 200
JOB_TTL_SECONDS = 3600  # 1 hora


def _cleanup_old_jobs() -> None:
    now = time.time()
    expired = [
        jid
        for jid, data in ANALYSIS_JOBS.items()
        if now - data.get("created_at", now) > JOB_TTL_SECONDS
    ]
    for jid in expired:
        ANALYSIS_JOBS.pop(jid, None)

    if len(ANALYSIS_JOBS) > MAX_JOBS_STORED:
        sorted_keys = sorted(
            ANALYSIS_JOBS.keys(),
            key=lambda k: ANALYSIS_JOBS[k].get("created_at", 0),
        )
        for k in sorted_keys[: len(ANALYSIS_JOBS) - MAX_JOBS_STORED]:
            ANALYSIS_JOBS.pop(k, None)


async def _run_analysis_job(
    analysis_id: str,
    file_bytes: bytes,
    filename: str,
    genre: str,
    benchmarks: dict[str, Any],
) -> None:
    try:
        def on_dsp_progress(percent: float, message: str) -> None:
            if analysis_id in ANALYSIS_JOBS:
                ANALYSIS_JOBS[analysis_id]["percent"] = percent
                ANALYSIS_JOBS[analysis_id]["message"] = message
                if percent < 75:
                    ANALYSIS_JOBS[analysis_id]["step"] = "extracting-features"
                elif percent < 90:
                    ANALYSIS_JOBS[analysis_id]["step"] = "predicting-popularity"

        ANALYSIS_JOBS[analysis_id]["step"] = "extracting-features"
        ANALYSIS_JOBS[analysis_id]["percent"] = 15.0
        ANALYSIS_JOBS[analysis_id]["message"] = "Carregando sinal de áudio e decodificando..."

        # 1. Extração DSP em threadpool separada com callback de progresso em tempo real
        metricas, mastering, macro_structure, spectral_eq = await asyncio.to_thread(
            extrair_analise_completa_bytes, file_bytes, on_progress=on_dsp_progress
        )

        ANALYSIS_JOBS[analysis_id]["step"] = "comparing-benchmark"
        ANALYSIS_JOBS[analysis_id]["percent"] = 92.0
        ANALYSIS_JOBS[analysis_id]["message"] = f"Comparando métricas acústicas com o benchmark de {genre}..."

        # 2. Diagnóstico estatístico completo em threadpool
        resultado = await asyncio.to_thread(
            processar_alinhamento,
            metricas=metricas,
            benchmarks=benchmarks,
            genero_alvo=genre,
            mastering=mastering,
            macro_structure=macro_structure,
            spectral_eq=spectral_eq,
        )
        resultado["filename"] = filename

        ANALYSIS_JOBS[analysis_id]["result"] = resultado
        ANALYSIS_JOBS[analysis_id]["step"] = "done"
        ANALYSIS_JOBS[analysis_id]["percent"] = 100.0
        ANALYSIS_JOBS[analysis_id]["message"] = "Diagnóstico concluído com sucesso!"

    except Exception as exc:
        ANALYSIS_JOBS[analysis_id]["step"] = "error"
        ANALYSIS_JOBS[analysis_id]["error"] = str(exc)
        ANALYSIS_JOBS[analysis_id]["percent"] = 100.0
        ANALYSIS_JOBS[analysis_id]["message"] = f"Erro no processamento: {exc!s}"


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
    response_model=AnalyzeResponse | StartAnalysisResponse,
    status_code=status.HTTP_202_ACCEPTED,
    summary="Analisar faixa de áudio contra benchmark de gênero",
)
async def analyze_track(
    request: Request,
    response: Response,
    file: UploadFile = File(
        ..., description="Arquivo de áudio (.mp3, .wav, .flac, .ogg, .m4a)"
    ),
    genre: str = Form("rock", description="Gênero musical de referência"),
    sync: bool = Query(
        False,
        description="Se true, aguarda a finalização e retorna o resultado diretamente (200 OK)",
    ),
):
    """
    Recebe um arquivo de áudio e um gênero alvo:
    - Por padrão (modo assíncrono), cria uma tarefa em background e retorna 202 com analysisId.
    - Se sync=True, aguarda o processamento e retorna 200 com o resultado completo.
    - O processamento de áudio é executado em thread pool para liberar o event loop.
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

        # Modo síncrono (opcional)
        if sync:
            response.status_code = status.HTTP_200_OK
            metricas, mastering, macro_structure, spectral_eq = await asyncio.to_thread(
                extrair_analise_completa_bytes, file_bytes
            )
            resultado = await asyncio.to_thread(
                processar_alinhamento,
                metricas=metricas,
                benchmarks=benchmarks,
                genero_alvo=genre,
                mastering=mastering,
                macro_structure=macro_structure,
                spectral_eq=spectral_eq,
            )
            resultado["filename"] = filename
            return resultado

        # Modo assíncrono (padrão com polling)
        _cleanup_old_jobs()
        analysis_id = str(uuid.uuid4())
        ANALYSIS_JOBS[analysis_id] = {
            "analysisId": analysis_id,
            "step": "uploading",
            "percent": 10.0,
            "message": "Recebendo arquivo e preparando processamento...",
            "result": None,
            "error": None,
            "created_at": time.time(),
        }

        asyncio.create_task(
            _run_analysis_job(
                analysis_id=analysis_id,
                file_bytes=file_bytes,
                filename=filename,
                genre=genre,
                benchmarks=benchmarks,
            )
        )

        return {"analysisId": analysis_id, "status": "processing"}

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Falha durante o processamento do sinal de áudio: {exc!s}",
        )


@router.get(
    "/analyze/{analysis_id}/progress",
    response_model=AnalysisProgressResponse,
    tags=["Análise & Diagnóstico"],
    summary="Consultar progresso da análise em segundo plano",
)
def get_analysis_progress(analysis_id: str):
    job = ANALYSIS_JOBS.get(analysis_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Análise '{analysis_id}' não encontrada.",
        )
    return {
        "analysisId": analysis_id,
        "step": job["step"],
        "percent": job["percent"],
        "message": job.get("message"),
        "error": job.get("error"),
    }


@router.get(
    "/analyze/{analysis_id}/result",
    response_model=AnalyzeResponse,
    tags=["Análise & Diagnóstico"],
    summary="Obter o resultado completo de uma análise concluída",
)
def get_analysis_result(analysis_id: str):
    job = ANALYSIS_JOBS.get(analysis_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Análise '{analysis_id}' não encontrada.",
        )

    if job["step"] == "error":
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro durante a análise do áudio: {job.get('error')}",
        )

    if job["step"] != "done" or job.get("result") is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A análise ainda está em andamento. Passo atual: {job['step']} ({job['percent']}%).",
        )

    return job["result"]

