import os

import joblib
import pandas as pd

TECH_FEATURES = [
    "danceability",
    "energy",
    "loudness",
    "acousticness",
    "valence",
    "tempo",
]


def build_benchmarks(
    input_csv: str = "data/dataset_limpo.csv",
    output_artifact: str = "artifacts/genre_benchmarks.joblib",
):
    if not os.path.exists(input_csv):
        raise FileNotFoundError(
            f"Arquivo sanitizado não encontrado: {input_csv}. Execute '01_clean_dataset.py' primeiro."
        )

    print(f"Lendo dados de {input_csv}...")
    df = pd.read_csv(input_csv)

    # Filtros de qualidade pré-benchmark (remove ruídos extremos e spoken word)
    df_filtered = df[
        (df["duration_min"].between(1.2, 6.5))
        & (df["speechiness"] < 0.40)
        & (~((df["energy"] < 0.15) & (df["popularity"] > 60)))
    ].copy()

    benchmarks = {
        "features": TECH_FEATURES,
        "global_mean": df_filtered[TECH_FEATURES].mean().to_dict(),
        "global_std": df_filtered[TECH_FEATURES].std().replace(0, 1.0).to_dict(),
        "genres": {},
    }

    # Gera perfil estatístico por gênero
    for genre, group in df_filtered.groupby("track_genre"):
        genre_key = str(genre).lower().strip()
        benchmarks["genres"][genre_key] = {
            "mean": group[TECH_FEATURES].mean().to_dict(),
            "std": group[TECH_FEATURES].std().replace(0, 1.0).to_dict(),
            "count": len(group),
        }

    os.makedirs(os.path.dirname(output_artifact), exist_ok=True)
    joblib.dump(benchmarks, output_artifact)
    print(f"Artefato serializado com sucesso: {output_artifact}")
    print(f"Total de gêneros mapeados: {len(benchmarks['genres'])}")


if __name__ == "__main__":
    build_benchmarks()
