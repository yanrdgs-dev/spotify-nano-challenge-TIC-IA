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


class SpectralEQCurve(BaseModel):
    frequencies_hz: list[float] = Field(..., description="Frequências centrais ISO de 1/3 de oitava (25 Hz a 16 kHz)")
    user_spectrum_db: list[float] = Field(..., description="Curva de magnitude RTA normalizada do áudio do usuário (dB)")
    target_curve_db: list[float] = Field(..., description="Curva espectral de referência recomendada para o gênero (dB)")
    suggested_eq_gain_db: list[float] = Field(..., description="Ajuste paramétrico de ganho sugerido para Match EQ (Delta dB)")
    mudness_detected: bool = Field(False, description="Alerta de acúmulo de médios-graves / embolamento (200-500 Hz)")
    harshness_detected: bool = Field(False, description="Alerta de aspereza tímbrica / fadiga auditiva (3-6 kHz)")
    air_boost_recommended: bool = Field(False, description="Sugestão de abertura em frequências ultra-altas (> 10 kHz)")
    sub_mono_clean: bool = Field(True, description="Compatibilidade de fase mono nos subgraves (< 100 Hz)")
    tuning_hz: float = Field(440.0, description="Frequência fundamental de afinação base A4 (Hz)")


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
    feedbacks: list[FeedbackItem]
    chart_data: ChartData
    mastering: MasteringMetrics | None = None
    macro_structure: MacroStructureMetrics | None = None
    spectral_eq: SpectralEQCurve | None = None


class GenresResponse(BaseModel):
    genres: list[str]


class HealthResponse(BaseModel):
    status: str
    benchmarks_loaded: bool
    genres_count: int
