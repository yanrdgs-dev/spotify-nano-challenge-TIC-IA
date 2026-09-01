import numpy as np

PESOS = {
    "danceability": 1.25,
    "energy": 1.25,
    "loudness": 1.00,
    "valence": 0.90,
    "tempo": 0.80,
    "acousticness": 0.30,
}


def processar_alinhamento(metricas: dict, benchmarks: dict, genero_alvo: str) -> dict:
    genero_key = genero_alvo.lower().strip()

    if genero_key in benchmarks["genres"]:
        ref_mean = benchmarks["genres"][genero_key]["mean"]
        ref_std = benchmarks["genres"][genero_key]["std"]
        genre_display = genero_alvo
    else:
        ref_mean = benchmarks["global_mean"]
        ref_std = benchmarks["global_std"]
        genre_display = f"{genero_alvo} (Benchmark Geral)"

    # Cálculo da distância ponderada em Z-Score
    diff_quadrada = []
    for col, w in PESOS.items():
        media = ref_mean[col]
        desvio = ref_std[col] if ref_std[col] > 0 else 1.0
        z = (metricas[col] - media) / desvio
        diff_quadrada.append(w * (z**2))

    distancia_ponderada = np.sqrt(np.sum(diff_quadrada) / sum(PESOS.values()))
    score_alinhamento = float(
        np.clip(100.0 * np.exp(-0.35 * distancia_ponderada), 5.0, 99.0)
    )

    # Feedbacks de estúdio estruturados
    feedbacks = []

    # Ritmo
    if metricas["danceability"] < ref_mean["danceability"] - 0.10:
        feedbacks.append(
            {
                "dimensao": "Ritmo",
                "status": "Abaixo",
                "mensagem": "Sua música é menos dançante que a média do gênero. Destaque mais o pulso rítmico e linha de baixo.",
            }
        )
    elif metricas["danceability"] > ref_mean["danceability"] + 0.10:
        feedbacks.append(
            {
                "dimensao": "Ritmo",
                "status": "Acima",
                "mensagem": "Sua música tem um balanço rítmico mais forte que o padrão usual do estilo.",
            }
        )
    else:
        feedbacks.append(
            {
                "dimensao": "Ritmo",
                "status": "Ideal",
                "mensagem": "O balanço rítmico está perfeitamente alinhado ao gênero.",
            }
        )

    # Intensidade / Energia
    if metricas["energy"] < ref_mean["energy"] - 0.10:
        feedbacks.append(
            {
                "dimensao": "Intensidade e Pressão",
                "status": "Abaixo",
                "mensagem": "A música soa mais calma ou com menos peso do que o padrão. Considere mais compressão e saturação.",
            }
        )
    else:
        feedbacks.append(
            {
                "dimensao": "Intensidade e Pressão",
                "status": "Ideal",
                "mensagem": "A força e o peso da música estão bem alinhados ao gênero.",
            }
        )

    # Clima / Valência
    if metricas["valence"] > ref_mean["valence"] + 0.15:
        feedbacks.append(
            {
                "dimensao": "Clima e Tom",
                "status": "Mais Positivo",
                "mensagem": "A faixa passa uma sensação mais alegre e vibrante que a média do gênero.",
            }
        )
    elif metricas["valence"] < ref_mean["valence"] - 0.15:
        feedbacks.append(
            {
                "dimensao": "Clima e Tom",
                "status": "Mais Sombrio",
                "mensagem": "A faixa tem um tom mais melancólico ou sombrio que o padrão do gênero.",
            }
        )
    else:
        feedbacks.append(
            {
                "dimensao": "Clima e Tom",
                "status": "Ideal",
                "mensagem": "A positividade e atmosfera da música estão dentro do esperado para o estilo.",
            }
        )

    return {
        "genre": genre_display,
        "genre_alignment_score": round(score_alinhamento, 1),
        "metrics": metricas,
        "benchmark_means": {k: round(v, 3) for k, v in ref_mean.items()},
        "feedbacks": feedbacks,
        "chart_data": {
            "labels": [
                "Ritmo (Dançabilidade)",
                "Pressão (Energia)",
                "Clima (Valência)",
            ],
            "user_values": [
                metricas["danceability"] * 100,
                metricas["energy"] * 100,
                metricas["valence"] * 100,
            ],
            "genre_values": [
                ref_mean["danceability"] * 100,
                ref_mean["energy"] * 100,
                ref_mean["valence"] * 100,
            ],
        },
    }
