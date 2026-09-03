from pydantic import BaseModel, Field


class FeedbackItem(BaseModel):
    dimensao: str
    status: str
    mensagem: str


class ChartData(BaseModel):
    labels: list[str]
    user_values: list[float]
    genre_values: list[float]


class AudioMetrics(BaseModel):
    danceability: float
    energy: float
    loudness: float
    acousticness: float
    valence: float
    tempo: float


class MasteringMetrics(BaseModel):
    integrated_lufs: float = Field(..., description="Loudness integrado EBU R128")
    true_peak_dbtp: float = Field(..., description="Pico real inter-amostral em dBTP")
    crest_factor_db: float = Field(..., description="Fator de crista / micro-dinâmica em dB")
    lra_db: float = Field(..., description="Faixa de loudness / Loudness Range")
    spotify_gain_change_db: float = Field(..., description="Ajuste de ganho esperado na normalização Spotify (-14 LUFS)")
    band_energies: dict[str, float] = Field(..., description="Distribuição de energia em 5 bandas espectrais (Match EQ)")


class MacroStructureMetrics(BaseModel):
    duration_s: float = Field(..., description="Duração total em segundos")
    time_to_hook_s: float = Field(..., description="Tempo até o primeiro refrão/hook em segundos")
    dynamic_lift_pct: float = Field(..., description="Salto percentual de dinâmica no refrão")


class AnalyzeResponse(BaseModel):
    filename: str
    genre: str
    genre_alignment_score: float = Field(
        ...,
        ge=0.0,
        le=100.0,
        description="Score percentual de alinhamento com o gênero",
    )
    metrics: AudioMetrics
    benchmark_means: dict[str, float]
    benchmark_weights: dict[str, float] | None = Field(
        default=None,
        description="Pesos personalizados das features para o gênero calculados via SHAP",
    )
    feedbacks: list[FeedbackItem]
    chart_data: ChartData
    mastering: MasteringMetrics | None = None
    macro_structure: MacroStructureMetrics | None = None


class GenresResponse(BaseModel):
    genres: list[str]


class HealthResponse(BaseModel):
    status: str
    benchmarks_loaded: bool
    genres_count: int
