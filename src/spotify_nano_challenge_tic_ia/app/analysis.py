import json
import random
from pathlib import Path

import numpy as np

# Localização resiliente de feedback_messages.json
def _find_messages_path() -> Path:
    candidates = [
        Path.cwd() / "data" / "feedback_messages.json",
        Path(__file__).resolve().parents[3] / "data" / "feedback_messages.json",
        Path(__file__).resolve().parent.parent / "data" / "feedback_messages.json",
        Path("/app/data/feedback_messages.json"),
    ]
    for p in candidates:
        if p.exists():
            return p
    return candidates[0]


MESSAGES_PATH = _find_messages_path()


def carregar_mensagens_feedback() -> dict:
    """Carrega o banco de dados de mensagens do arquivo JSON em data/."""
    if not MESSAGES_PATH.exists():
        raise FileNotFoundError(
            f"Arquivo de mensagens não encontrado em: {MESSAGES_PATH.resolve()}.\n"
            f"Certifique-se de salvar o arquivo 'feedback_messages.json' dentro da pasta 'data/'."
        )
    with open(MESSAGES_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


# Carrega as mensagens em memória
MESSAGES_DB = carregar_mensagens_feedback()

PESOS = {
    "danceability": 1.25,
    "energy": 1.25,
    "loudness": 1.00,
    "valence": 0.90,
    "tempo": 0.80,
    "acousticness": 0.30,
}


def processar_alinhamento(
    metricas: dict,
    benchmarks: dict,
    genero_alvo: str,
    mastering: dict | None = None,
    macro_structure: dict | None = None,
) -> dict:
    genero_key = genero_alvo.lower().strip()

    if genero_key in benchmarks["genres"]:
        ref_mean = benchmarks["genres"][genero_key]["mean"]
        ref_std = benchmarks["genres"][genero_key]["std"]
        genre_display = genero_alvo
    else:
        ref_mean = benchmarks["global_mean"]
        ref_std = benchmarks["global_std"]
        genre_display = f"{genero_alvo} (Benchmark Geral)"

    # Distância ponderada multivariada em Z-Score
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

    feedbacks = []

    # 1. Ritmo / Dançabilidade
    if metricas["danceability"] < ref_mean["danceability"] - 0.10:
        status_r = "Abaixo da Média"
        msg_r = random.choice(MESSAGES_DB["danceability"]["abaixo"])
    elif metricas["danceability"] > ref_mean["danceability"] + 0.10:
        status_r = "Acima da Média"
        msg_r = random.choice(MESSAGES_DB["danceability"]["acima"])
    else:
        status_r = "Alinhado ao Gênero"
        msg_r = random.choice(MESSAGES_DB["danceability"]["ideal"])

    feedbacks.append(
        {"dimensao": "Ritmo & Flow", "status": status_r, "mensagem": msg_r}
    )

    # 2. Intensidade / Energia
    if metricas["energy"] < ref_mean["energy"] - 0.10:
        status_e = "Abaixo da Média"
        msg_e = random.choice(MESSAGES_DB["energy"]["abaixo"])
    elif metricas["energy"] > ref_mean["energy"] + 0.10:
        status_e = "Acima da Média"
        msg_e = random.choice(MESSAGES_DB["energy"]["acima"])
    else:
        status_e = "Alinhado ao Gênero"
        msg_e = random.choice(MESSAGES_DB["energy"]["ideal"])

    feedbacks.append(
        {"dimensao": "Energia & Calor", "status": status_e, "mensagem": msg_e}
    )

    # 3. Clima / Valência
    if metricas["valence"] > ref_mean["valence"] + 0.15:
        status_v = "Mais Solar que a Média"
        msg_v = random.choice(MESSAGES_DB["valence"]["acima"])
    elif metricas["valence"] < ref_mean["valence"] - 0.15:
        status_v = "Mais Sombrio que a Média"
        msg_v = random.choice(MESSAGES_DB["valence"]["abaixo"])
    else:
        status_v = "Alinhado ao Gênero"
        msg_v = random.choice(MESSAGES_DB["valence"]["ideal"])

    feedbacks.append(
        {"dimensao": "Vibe & Atmosfera", "status": status_v, "mensagem": msg_v}
    )

    # 4. Andamento / BPM
    if metricas["tempo"] < ref_mean["tempo"] - 12.0:
        status_t = "Mais Lento que a Média"
        msg_t = random.choice(MESSAGES_DB["tempo"]["abaixo"])
    elif metricas["tempo"] > ref_mean["tempo"] + 12.0:
        status_t = "Mais Rápido que a Média"
        msg_t = random.choice(MESSAGES_DB["tempo"]["acima"])
    else:
        status_t = "Alinhado ao Gênero"
        msg_t = random.choice(MESSAGES_DB["tempo"]["ideal"])

    feedbacks.append(
        {"dimensao": "Andamento & Marcha", "status": status_t, "mensagem": msg_t}
    )

    # 5. Volume / Loudness
    if metricas["loudness"] < ref_mean["loudness"] - 2.5:
        status_l = "Menos Presente que a Média"
        msg_l = random.choice(MESSAGES_DB["loudness"]["abaixo"])
    elif metricas["loudness"] > ref_mean["loudness"] + 2.5:
        status_l = "Mais Quente que a Média"
        msg_l = random.choice(MESSAGES_DB["loudness"]["acima"])
    else:
        status_l = "Alinhado ao Gênero"
        msg_l = random.choice(MESSAGES_DB["loudness"]["ideal"])

    feedbacks.append(
        {"dimensao": "Pressão Sonora (dB)", "status": status_l, "mensagem": msg_l}
    )

    # Feedbacks de Masterização (EBU R128)
    if mastering:
        lufs = mastering.get("integrated_lufs", -14.0)
        gain_ch = mastering.get("spotify_gain_change_db", 0.0)
        if lufs > -13.0:
            feedbacks.append(
                {
                    "dimensao": "Masterização (LUFS)",
                    "status": "Volume Elevado",
                    "mensagem": f"Faixa a {lufs:.1f} LUFS. Está {abs(gain_ch):.1f} dB acima do padrão Spotify (-14 LUFS) e sofrerá atenuação algorítmica.",
                }
            )
        elif lufs < -15.5:
            feedbacks.append(
                {
                    "dimensao": "Masterização (LUFS)",
                    "status": "Volume Baixo",
                    "mensagem": f"Faixa a {lufs:.1f} LUFS. O Spotify aplicará limiter/ganho positivo para atingir -14 LUFS.",
                }
            )
        else:
            feedbacks.append(
                {
                    "dimensao": "Masterização (LUFS)",
                    "status": "Calibrado",
                    "mensagem": f"Loudness integrado ({lufs:.1f} LUFS) perfeitamente alinhado com o alvo de streaming (-14 LUFS).",
                }
            )

        tp = mastering.get("true_peak_dbtp", -1.0)
        if tp > -1.0:
            feedbacks.append(
                {
                    "dimensao": "True Peak (dBTP)",
                    "status": "Alerta de Clipping",
                    "mensagem": f"True Peak em {tp:.2f} dBTP. Risco de distorção inter-amostral na conversão lossy do streaming. Recomendado teto <= -1.0 dBTP.",
                }
            )

    # Feedbacks de Macroestrutura e Hook
    if macro_structure:
        hook_t = macro_structure.get("time_to_hook_s", 30.0)
        if hook_t > 50.0:
            feedbacks.append(
                {
                    "dimensao": "Estrutura (Hook)",
                    "status": "Refrão Tardio",
                    "mensagem": f"O primeiro refrão surge aos {hook_t:.1f}s. Considere reduzir a introdução para reter ouvintes antes dos 45s.",
                }
            )
        else:
            feedbacks.append(
                {
                    "dimensao": "Estrutura (Hook)",
                    "status": "Retenção Rápida",
                    "mensagem": f"O primeiro refrão surge rapidamente aos {hook_t:.1f}s, favorecendo retenção e menor taxa de skip.",
                }
            )

    response_payload = {
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

    if mastering is not None:
        response_payload["mastering"] = mastering
    if macro_structure is not None:
        response_payload["macro_structure"] = macro_structure

    return response_payload
