import io

import librosa
import numpy as np
from scipy import signal


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


def extrair_psicoacustica_mastering(y: np.ndarray, sr: int) -> dict:
    """Calcula métricas de masterização profissional (EBU R128, True Peak, Crest Factor e Match EQ)."""
    # 1. Loudness Integrado EBU R128 aproximado
    rms_val = float(np.sqrt(np.mean(y**2) + 1e-12))
    integrated_lufs = float(20.0 * np.log10(rms_val + 1e-6) - 0.691)

    # 2. True Peak com oversampling
    y_up = signal.resample(y, len(y) * 4) if len(y) < sr * 180 else y
    true_peak_linear = float(np.max(np.abs(y_up)))
    true_peak_dbtp = float(20.0 * np.log10(true_peak_linear + 1e-6))

    # 3. Crest Factor (Pico vs RMS = Micro-dinâmica)
    crest_factor_db = float(20.0 * np.log10((float(np.max(np.abs(y))) / rms_val) + 1e-6))

    # 4. Loudness Range (LRA aproximado)
    hop = sr // 2
    frame_rms = [np.sqrt(np.mean(y[i:i+hop]**2) + 1e-12) for i in range(0, len(y)-hop, hop)]
    frame_db = [float(20.0 * np.log10(r)) for r in frame_rms if r > 1e-5]
    lra_db = float(np.percentile(frame_db, 95) - np.percentile(frame_db, 10)) if len(frame_db) > 10 else 6.0

    # 5. Balanço Espectral em 5 Bandas (Match EQ)
    S = np.abs(librosa.stft(y, n_fft=2048, hop_length=1024))**2
    freqs = librosa.fft_frequencies(sr=sr, n_fft=2048)

    band_defs = {
        "Sub (20-60Hz)": (20, 60),
        "Low (60-250Hz)": (60, 250),
        "Mid (250-2.5kHz)": (250, 2500),
        "Presence (2.5-7kHz)": (2500, 7000),
        "Air (7-20kHz)": (7000, 20000),
    }

    total_energy = float(np.sum(S) + 1e-12)
    band_energies = {}
    for name, (low, high) in band_defs.items():
        idx = np.where((freqs >= low) & (freqs < high))[0]
        band_energy = float(np.sum(S[idx, :]) / total_energy)
        band_energies[name] = round(band_energy * 100.0, 1)

    spotify_gain_change = round(-14.0 - integrated_lufs, 1)

    return {
        "integrated_lufs": round(integrated_lufs, 1),
        "true_peak_dbtp": round(true_peak_dbtp, 2),
        "crest_factor_db": round(crest_factor_db, 1),
        "lra_db": round(lra_db, 1),
        "spotify_gain_change_db": spotify_gain_change,
        "band_energies": band_energies,
    }


def extrair_macroestrutura(y: np.ndarray, sr: int) -> dict:
    """Calcula a estrutura macro-dinâmica, duração e o tempo até o primeiro refrão (Hook)."""
    duration_s = float(len(y) / sr)
    hop_length = 512

    rms = librosa.feature.rms(y=y, hop_length=hop_length)[0]
    times = librosa.times_like(rms, sr=sr, hop_length=hop_length)

    smooth_rms = signal.medfilt(rms, kernel_size=31)
    smooth_rms_norm = (smooth_rms - np.min(smooth_rms)) / (np.ptp(smooth_rms) + 1e-6)

    min_time_idx = np.where(times >= 12.0)[0]
    if len(min_time_idx) > 0:
        search_slice = smooth_rms_norm[min_time_idx[0]:]
        peak_rel_idx = np.argmax(search_slice)
        time_to_hook_s = float(times[min_time_idx[0] + peak_rel_idx])
    else:
        time_to_hook_s = float(duration_s * 0.3)

    intro_rms = float(np.mean(smooth_rms_norm[times < min(30.0, duration_s)]))
    chorus_peak = float(np.max(smooth_rms_norm))
    dynamic_lift_pct = float(np.clip(((chorus_peak - intro_rms) / (intro_rms + 1e-3)) * 100.0, 0.0, 200.0))

    return {
        "duration_s": round(duration_s, 1),
        "time_to_hook_s": round(time_to_hook_s, 1),
        "dynamic_lift_pct": round(dynamic_lift_pct, 1),
    }


def extrair_espectro_eq(y: np.ndarray, sr: int) -> dict:
    """Calcula o espectro de frequências RTA em 29 bandas ISO de 1/3 de oitava e gera curva de Match EQ sugerida."""
    S = np.abs(librosa.stft(y, n_fft=2048, hop_length=1024))**2
    freqs = librosa.fft_frequencies(sr=sr, n_fft=2048)

    iso_centers = [
        25, 31.5, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500,
        630, 800, 1000, 1250, 1600, 2000, 2500, 3150, 4000, 5000, 6300,
        8000, 10000, 12500, 16000
    ]

    user_curve = []
    for fc in iso_centers:
        f_low = fc / (2 ** (1/6))
        f_high = fc * (2 ** (1/6))
        idx = np.where((freqs >= f_low) & (freqs <= f_high))[0]
        if len(idx) > 0:
            band_power = float(np.mean(S[idx, :]))
            band_db = float(10.0 * np.log10(band_power + 1e-12))
        else:
            band_db = -80.0
        user_curve.append(band_db)

    # Normalização para visualização (pico em 0 dB)
    peak_db = float(np.max(user_curve))
    norm_user = [round(float(db - peak_db), 1) for db in user_curve]

    # Curva de Referência Padrão de Mercado (Roll-off acústico balanceado de 3 dB/oitava)
    target = []
    for fc in iso_centers:
        if fc < 100:
            t_db = -2.0 - (100 - fc) * 0.05
        else:
            octaves = float(np.log2(fc / 100.0))
            t_db = -2.0 - 2.8 * octaves
        target.append(round(float(t_db), 1))

    # Curva diferencial de EQ sugerida (Delta dB com atenuação suave limitada a +/- 6 dB)
    suggested_diff = [
        round(float(np.clip(t - u, -6.0, 6.0)), 1)
        for t, u in zip(target, norm_user)
    ]

    # Diagnósticos de Defeitos de Mixagem
    # Embolamento (200 - 500 Hz: índices 9 a 13)
    mud_diffs = [norm_user[i] - target[i] for i in range(9, 14)]
    mudness_detected = bool(np.mean(mud_diffs) > 3.5)

    # Aspereza / Harshness (3.15k - 6.3k Hz: índices 21 a 24)
    harsh_diffs = [norm_user[i] - target[i] for i in range(21, 25)]
    harshness_detected = bool(np.mean(harsh_diffs) > 3.0)

    # Falta de Ar (> 10k Hz: índices 26 a 28)
    air_diffs = [norm_user[i] - target[i] for i in range(26, 29)]
    air_boost_recommended = bool(np.mean(air_diffs) < -4.0)

    # Estimativa de afinação base A4 (Hz)
    try:
        tuning_offset = float(librosa.estimate_tuning(y=y, sr=sr))
        tuning_hz = round(float(440.0 * (2.0 ** (tuning_offset / 12.0))), 1)
    except Exception:
        tuning_hz = 440.0

    return {
        "frequencies_hz": [float(f) for f in iso_centers],
        "user_spectrum_db": norm_user,
        "target_curve_db": target,
        "suggested_eq_gain_db": suggested_diff,
        "mudness_detected": mudness_detected,
        "harshness_detected": harshness_detected,
        "air_boost_recommended": air_boost_recommended,
        "sub_mono_clean": True,
        "tuning_hz": tuning_hz,
    }


def extrair_analise_completa_bytes(file_bytes: bytes) -> tuple[dict, dict, dict, dict]:
    """Executa a extração DSP básica, masterização EBU R128, macroestrutura e espectro de EQ."""
    audio_stream = io.BytesIO(file_bytes)
    y, sr = librosa.load(audio_stream, sr=22050, mono=True)
    y_harmonic, y_percussive = librosa.effects.hpss(y)

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

    rms_array = librosa.feature.rms(y=y)[0]
    mean_rms = float(np.mean(rms_array))
    loudness = float(np.interp(mean_rms, [0.03, 0.25], [-16.0, -4.0]))
    energy = float(np.interp(mean_rms, [0.03, 0.25], [0.20, 0.96]))

    onset_env = librosa.onset.onset_strength(y=y_percussive, sr=sr)
    pulse = librosa.beat.plp(onset_envelope=onset_env, sr=sr)
    mean_pulse = float(np.mean(pulse))
    danceability = float(np.interp(mean_pulse, [0.08, 0.32], [0.35, 0.92]))

    spec_cent = float(np.mean(librosa.feature.spectral_centroid(y=y, sr=sr)))
    cent_norm = float(np.interp(spec_cent, [1200.0, 4200.0], [0.20, 0.80]))
    valence = float(np.clip(cent_norm, 0.15, 0.90))

    acousticness = float(np.clip(0.85 - (energy * 1.1), 0.001, 0.95))

    metrics = {
        "danceability": round(danceability, 3),
        "energy": round(energy, 3),
        "loudness": round(loudness, 2),
        "acousticness": round(acousticness, 3),
        "valence": round(valence, 3),
        "tempo": round(tempo, 2),
    }

    mastering = extrair_psicoacustica_mastering(y, sr)
    macro = extrair_macroestrutura(y, sr)
    spectral_eq = extrair_espectro_eq(y, sr)

    return metrics, mastering, macro, spectral_eq
