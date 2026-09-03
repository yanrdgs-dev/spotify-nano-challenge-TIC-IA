import os

import joblib
import numpy as np
import pandas as pd
import shap
from sklearn.ensemble import RandomForestClassifier

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
    n_estimators: int = 80,
    max_depth: int = 10,
    samples_per_genre_shap: int = 60,
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

    # Define limiar relativo P90/P85 por gênero para treinar o classificador de impacto
    df_filtered["p90_threshold"] = df_filtered.groupby("track_genre")["popularity"].transform(
        lambda s: s.quantile(0.85)
    )
    df_filtered["is_hit"] = (df_filtered["popularity"] >= df_filtered["p90_threshold"]).astype(int)

    print("Treinando Ensemble (RandomForestClassifier) para aprender tração acústica...")
    rf_model = RandomForestClassifier(
        n_estimators=n_estimators,
        max_depth=max_depth,
        class_weight="balanced_subsample",
        random_state=42,
        n_jobs=-1,
    )
    rf_model.fit(df_filtered[TECH_FEATURES], df_filtered["is_hit"])

    print("Calculando SHAP Values via TreeExplainer para extrair a importância das features por gênero...")
    # Amostra estratificada por gênero para cálculo rápido e estável do TreeSHAP
    shap_samples = []
    for genre, group in df_filtered.groupby("track_genre"):
        sample_size = min(len(group), samples_per_genre_shap)
        shap_samples.append(group.sample(sample_size, random_state=42))
    shap_df = pd.concat(shap_samples, ignore_index=True)

    explainer = shap.TreeExplainer(rf_model)
    shap_vals = explainer.shap_values(shap_df[TECH_FEATURES], check_additivity=False)

    # Para classificação binária, seleciona os valores SHAP da classe positiva (is_hit = 1)
    if isinstance(shap_vals, list):
        shap_hit = shap_vals[1]
    elif len(shap_vals.shape) == 3:
        shap_hit = shap_vals[:, :, 1]
    else:
        shap_hit = shap_vals

    # Pesos Globais (Média de todas as instâncias)
    global_shap = np.abs(shap_hit).mean(axis=0)
    if global_shap.sum() > 0:
        global_norm = 6.0 * global_shap / global_shap.sum()
        global_norm = np.clip(global_norm, 0.25, 2.50)
        global_norm = 6.0 * global_norm / global_norm.sum()
    else:
        global_norm = np.ones(len(TECH_FEATURES))

    global_weights = {
        col: round(float(w), 3) for col, w in zip(TECH_FEATURES, global_norm)
    }

    benchmarks = {
        "features": TECH_FEATURES,
        "global_mean": df_filtered[TECH_FEATURES].mean().to_dict(),
        "global_std": df_filtered[TECH_FEATURES].std().replace(0, 1.0).to_dict(),
        "global_weights": global_weights,
        "genres": {},
        "model_info": {
            "algorithm": "RandomForestClassifier + shap.TreeExplainer",
            "n_estimators": n_estimators,
            "max_depth": max_depth,
            "target": "is_hit_p85",
        },
    }

    # Gera perfil estatístico e pesos personalizados por gênero via SHAP
    for genre, group in df_filtered.groupby("track_genre"):
        genre_key = str(genre).lower().strip()
        idx = shap_df[shap_df["track_genre"] == genre].index

        if len(idx) > 0:
            g_shap = np.abs(shap_hit[idx]).mean(axis=0)
            if g_shap.sum() > 0:
                norm_w = 6.0 * g_shap / g_shap.sum()
                norm_w = np.clip(norm_w, 0.25, 2.50)
                norm_w = 6.0 * norm_w / norm_w.sum()
            else:
                norm_w = global_norm
        else:
            norm_w = global_norm

        genre_weights = {
            col: round(float(w), 3) for col, w in zip(TECH_FEATURES, norm_w)
        }

        benchmarks["genres"][genre_key] = {
            "mean": group[TECH_FEATURES].mean().to_dict(),
            "std": group[TECH_FEATURES].std().replace(0, 1.0).to_dict(),
            "weights": genre_weights,
            "count": len(group),
        }

    os.makedirs(os.path.dirname(output_artifact), exist_ok=True)
    joblib.dump(benchmarks, output_artifact)
    print(f"Artefato serializado com sucesso: {output_artifact}")
    print(f"Total de gêneros mapeados: {len(benchmarks['genres'])}")
    print(f"Pesos Globais SHAP: {global_weights}")


if __name__ == "__main__":
    build_benchmarks()
