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


class GenresResponse(BaseModel):
    genres: list[str]


class HealthResponse(BaseModel):
    status: str
    benchmarks_loaded: bool
    genres_count: int
