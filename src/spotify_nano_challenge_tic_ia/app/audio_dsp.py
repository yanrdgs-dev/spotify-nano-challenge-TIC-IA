import io

import librosa
import numpy as np


def extrair_metricas_bytes(file_bytes: bytes) -> dict:
    """Extrai features do áudio a partir de um buffer em memória."""
    audio_stream = io.BytesIO(file_bytes)
    y, sr = librosa.load(audio_stream, sr=22050, mono=True)
    y_harmonic, y_percussive = librosa.effects.hpss(y)

    # BPM / Tempo centrado em 120 BPM
    tempo_array, _ = librosa.beat.beat_track(y=y_percussive, sr=sr, start_bpm=120.0)
    tempo = (
        float(tempo_array)
        if not isinstance(tempo_array, np.ndarray)
        else float(tempo_array[0])
    )
    if tempo < 55:
        tempo *= 2
    elif tempo > 210:
        tempo /= 2

    # RMS, Loudness e Energia
    rms_array = librosa.feature.rms(y=y)[0]
    mean_rms = float(np.mean(rms_array))
    loudness = float(np.interp(mean_rms, [0.03, 0.25], [-16.0, -4.0]))
    energy = float(np.interp(mean_rms, [0.03, 0.25], [0.20, 0.96]))

    # Dançabilidade
    onset_env = librosa.onset.onset_strength(y=y_percussive, sr=sr)
    pulse = librosa.beat.plp(onset_envelope=onset_env, sr=sr)
    mean_pulse = float(np.mean(pulse))
    danceability = float(np.interp(mean_pulse, [0.08, 0.32], [0.35, 0.92]))

    # Valência
    spec_cent = float(np.mean(librosa.feature.spectral_centroid(y=y, sr=sr)))
    cent_norm = float(np.interp(spec_cent, [1200.0, 4200.0], [0.20, 0.80]))
    valence = float(np.clip(cent_norm, 0.15, 0.90))

    # Acústica (peso secundário)
    acousticness = float(np.clip(0.85 - (energy * 1.1), 0.001, 0.95))

    return {
        "danceability": round(danceability, 3),
        "energy": round(energy, 3),
        "loudness": round(loudness, 2),
        "acousticness": round(acousticness, 3),
        "valence": round(valence, 3),
        "tempo": round(tempo, 2),
    }
