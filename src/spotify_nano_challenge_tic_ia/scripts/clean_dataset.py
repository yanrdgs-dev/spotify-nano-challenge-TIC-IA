from pathlib import Path

import pandas as pd

# Define a raiz do projeto de forma absoluta baseada na localização deste arquivo
# scripts/ -> spotify_nano_challenge_tic_ia/ -> src/ -> raiz do repo
PROJECT_ROOT = Path(__file__).resolve().parents[3]

DEFAULT_INPUT_CSV = PROJECT_ROOT / "data" / "dataset.csv"
DEFAULT_OUTPUT_CSV = PROJECT_ROOT / "data" / "dataset_limpo.csv"


def clean_spotify_dataset(
    input_csv: Path | str = DEFAULT_INPUT_CSV,
    output_csv: Path | str = DEFAULT_OUTPUT_CSV,
):
    input_path = Path(input_csv)
    output_path = Path(output_csv)

    if not input_path.exists():
        raise FileNotFoundError(
            f"Arquivo não encontrado: {input_path.resolve()}\n"
            f"Certifique-se de que o arquivo 'dataset.csv' está dentro de: {input_path.parent.resolve()}"
        )

    print(f"Carregando dataset de {input_path.resolve()}...")
    df = pd.read_csv(input_path)
    print(f"Total de linhas originais: {df.shape[0]}")

    # 1. Remover coluna residual de índice se existir
    if "Unnamed: 0" in df.columns:
        df = df.drop(columns=["Unnamed: 0"])

    # 2. Remover nulos em metadados vitais
    df_clean = df.dropna(subset=["artists", "album_name", "track_name"]).copy()

    # 3. Filtrar limites físicos e inconsistências
    df_clean = df_clean[
        (df_clean["duration_ms"] >= 10000)
        & (df_clean["duration_ms"] <= 1200000)
        & (df_clean["tempo"] > 0)
        & (df_clean["popularity"].between(0, 100))
        & (df_clean["danceability"].between(0.0, 1.0))
        & (df_clean["energy"].between(0.0, 1.0))
        & (df_clean["loudness"] <= 5.0)
    ]

    # 4. Remover duplicatas mantendo a maior popularidade
    df_clean = df_clean.sort_values(by="popularity", ascending=False).drop_duplicates(
        subset=["track_name", "artists"], keep="first"
    )

    # 5. Feature Engineering
    df_clean["duration_min"] = (df_clean["duration_ms"] / 60000).round(2)
    df_clean["explicit"] = df_clean["explicit"].astype(int)

    # Garante que a pasta destino existe
    output_path.parent.mkdir(parents=True, exist_ok=True)
    df_clean.to_csv(output_path, index=False)

    print("\n--- Relatório de Limpeza ---")
    print(f"• Linhas removidas: {df.shape[0] - df_clean.shape[0]}")
    print(f"• Linhas finais salvas em '{output_path.resolve()}': {df_clean.shape[0]}")


if __name__ == "__main__":
    clean_spotify_dataset()
