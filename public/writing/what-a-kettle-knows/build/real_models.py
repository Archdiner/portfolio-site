"""Run real pretrained audio models (EAT, Dasheng, USAD2-Small) on the post's recordings and
save data for three figures. Usage: python real_models.py <assets dir> <hf cache dir>"""
import sys, json, base64, subprocess, numpy as np, torch, torchaudio
from transformers import AutoModel, AutoFeatureExtractor
A, CACHE = sys.argv[1], sys.argv[2]
torch.set_num_threads(4); torch.manual_seed(0); SR = 16000

def load(name):
    raw = subprocess.run(["ffmpeg", "-v", "quiet", "-i", f"{A}/audio/{name}.mp3", "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).copy()

# ---------------------------------------------------------------- models -> (frames [T,D], fps)
eat = AutoModel.from_pretrained("worstchan/EAT-base_epoch30_pretrain", trust_remote_code=True, cache_dir=CACHE).eval()
def eat_frames(w):
    out, chunk = [], 163840  # 10.24 s
    for s in range(0, len(w), chunk):
        x = torch.tensor(w[s:s + chunk]); n = len(x)
        x = x - x.mean()
        mel = torchaudio.compliance.kaldi.fbank(x.unsqueeze(0), htk_compat=True, sample_frequency=SR, use_energy=False,
                                                window_type="hanning", num_mel_bins=128, dither=0.0, frame_shift=10).unsqueeze(0)
        mel = torch.nn.ZeroPad2d((0, 0, 0, 1024 - mel.shape[1]))(mel) if mel.shape[1] < 1024 else mel[:, :1024]
        mel = ((mel - -4.268) / (4.569 * 2)).unsqueeze(0)
        with torch.no_grad(): f = eat.extract_features(mel).squeeze(0)[1:]  # drop CLS -> 512 tokens
        f = f.reshape(64, 8, -1).mean(1)  # 64 time steps x 8 freq tokens -> average over freq
        out.append(f[: max(1, int(np.ceil(n / SR * 6.25)))].numpy())
    return np.concatenate(out), 6.25

dfe = AutoFeatureExtractor.from_pretrained("mispeech/dasheng-base", trust_remote_code=True, cache_dir=CACHE)
das = AutoModel.from_pretrained("mispeech/dasheng-base", outputdim=None, trust_remote_code=True, cache_dir=CACHE).eval()
def das_frames(w):
    out = []
    for s in range(0, len(w), SR * 10):
        x = torch.tensor(w[s:s + SR * 10]).unsqueeze(0)
        if x.shape[1] < SR // 4: break
        inp = dfe(x, sampling_rate=SR, return_tensors="pt")
        with torch.no_grad(): out.append(das(**inp).hidden_states.squeeze(0).numpy())
    return np.concatenate(out), 25.0

usad = AutoModel.from_pretrained("MIT-SLS/USAD2-Small", trust_remote_code=True, cache_dir=CACHE).eval()
def usad_frames(w):
    x = torch.tensor(w).unsqueeze(0)
    with torch.no_grad(): r = usad(wavs=x, wav_lengths=torch.tensor([x.shape[1]]), target_layer=None)
    return r["x"].squeeze(0)[: int(r["x_lengths"][0])].numpy(), float(usad.encoder_frame_rate)

def mel_frames(w):
    m = torchaudio.compliance.kaldi.fbank(torch.tensor(w).unsqueeze(0), sample_frequency=SR, num_mel_bins=64, frame_shift=10, dither=0.0)
    return m.numpy(), 100.0

MODELS = {"spectrogram": mel_frames, "EAT": eat_frames, "Dasheng": das_frames, "USAD": usad_frames}

def pool(F, fps, rate):  # average frames into bins of 1/rate seconds
    k = max(1, int(round(fps / rate))); T = len(F) // k
    return F[: T * k].reshape(T, k, -1).mean(1)
def cos(a, b): a = a / (np.linalg.norm(a, axis=-1, keepdims=True) + 1e-9); b = b / (np.linalg.norm(b, axis=-1, keepdims=True) + 1e-9); return a @ b.T
def b64u8(M): return base64.b64encode(np.clip(np.round(M * 255), 0, 255).astype(np.uint8).tobytes()).decode()

out = {"models": list(MODELS)}

# ---------------------------------------------------------------- 1. kettle self-similarity
k = load("kettle"); RATE = 2.0
sims = {}
for name, fn in MODELS.items():
    F, fps = fn(k); P = pool(F, fps, RATE)
    if name == "spectrogram": P = P - P.mean(0)
    M = cos(P, P); lo, hi = np.percentile(M, 2), np.percentile(M, 99.5)
    sims[name] = {"n": len(P), "b64": b64u8(np.clip((M - lo) / (hi - lo), 0, 1)), "lo": round(float(lo), 3), "hi": round(float(hi), 3)}
    print("selfsim", name, F.shape, fps, len(P))
out["selfsim"] = {"rate": RATE, "duration": len(k) / SR, "maps": sims}

# ---------------------------------------------------------------- 2. repeats: mug taps dropped into the boil
rng = np.random.default_rng(3)
bg = k[int(30 * SR): int(52 * SR)].copy(); tap = load("tap_mug_hard")
times = [2.0, 5.6, 8.4, 11.9, 14.5, 18.2]
mix = bg * 0.6
for t in times:
    i = int(t * SR); seg = tap[: len(mix) - i]; mix[i:i + len(seg)] += seg / (np.abs(tap).max() + 1e-9) * np.abs(bg).max() * 1.2
mix = mix / (np.abs(mix).max() + 1e-9) * 0.9
subprocess.run(["ffmpeg", "-v", "quiet", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", "-b:a", "96k", f"{A}/audio/repeats.mp3"], input=mix.astype(np.float32).tobytes(), check=True)
PROBE = (1.0, 3.0)  # a two-second example containing the first tap
rep = {"times": times, "duration": len(mix) / SR, "probe": PROBE, "curves": {}}
for name, fn in MODELS.items():
    F, fps = fn(mix)
    if name == "spectrogram": F = F - F.mean(0)
    p = F[int(PROBE[0] * fps): int(PROBE[1] * fps)].mean(0, keepdims=True)  # averaged into one vector
    c = cos(F, p)[:, 0]
    P = np.repeat(c, int(round(25.0 / fps))) if fps < 25 else pool(c[:, None], fps, 25.0)[:, 0]  # put every curve on a 25 Hz grid
    rep["curves"][name] = [round(float(v), 4) for v in P]
    print("repeat", name, len(P), round(float(c.min()), 3), round(float(c.max()), 3))
# waveform matching: slide the first tap's own 50 ms along the raw waveform, at every sample (FFT)
L = int(0.05 * SR); i0 = int(times[0] * SR); pr = mix[i0:i0 + L].astype(np.float64); pr -= pr.mean()
nfft = 1 << int(np.ceil(np.log2(len(mix) + L)))
num = np.fft.irfft(np.fft.rfft(mix, nfft) * np.conj(np.fft.rfft(pr, nfft)), nfft)[: len(mix) - L]
c2 = np.concatenate([[0.0], np.cumsum(mix.astype(np.float64) ** 2)]); en = np.sqrt(np.maximum(c2[L:L + len(num)] - c2[: len(num)], 1e-12))
nc = np.clip(num / (en * np.linalg.norm(pr)), 0, 1)
k25 = SR // 25; nc25 = nc[: len(nc) // k25 * k25].reshape(-1, k25).max(1)
rep["curves"]["waveform"] = [round(float(v), 4) for v in nc25]
out["repeats"] = rep

# ---------------------------------------------------------------- 3. five sound types, as each real model arranges them
CLASSES = [("kettle heating", "kettle", 2.8, 12.6), ("kettle boiling", "kettle", 15, 95), ("pouring", "pour", 0.5, 3.4),
           ("stirring", "stir", 1.2, 21), ("spoon and cup", "cup_spoon", 0.5, 12.5)]
audio = {c: load(c) for c in {"kettle", "pour", "stir", "cup_spoon"}}
maps = {}
for name, fn in MODELS.items():
    Fs = {c: fn(w) for c, w in audio.items()}
    X, Y = [], []
    for ci, (_, clip, a, b) in enumerate(CLASSES):
        F, fps = Fs[clip]; win = max(1, int(round(0.5 * fps)))
        starts = np.linspace(int(a * fps), int(b * fps) - win, 36).astype(int)
        for s in starts: X.append(F[s:s + win].mean(0)); Y.append(ci)
    X = np.array(X); Y = np.array(Y); Xc = X - X.mean(0)
    U, Sv, Vt = np.linalg.svd(Xc, full_matrices=False); Z = Xc @ Vt[:2].T
    cent = np.array([X[Y == c].mean(0) for c in range(5)])
    pred = np.argmax(cos(X, cent), 1); acc = float((pred == Y).mean())
    maps[name] = {"z": np.round(Z, 4).tolist(), "acc": round(acc, 3)}
    print("map", name, "nearest-centroid", round(acc, 3))
out["maps"] = {"classes": [c[0] for c in CLASSES], "labels": Y.tolist(), "models": maps}
# ---------------------------------------------------------------- 4. do frames remember where they sit in the window?
seg = k[int(15 * SR): int(95 * SR)]  # boiling only, so the sound barely changes
pos = {}
for name, fn, per_s in [("EAT", eat_frames, 10.24), ("Dasheng", das_frames, 10.0), ("USAD", usad_frames, 30.0)]:
    F, fps = fn(seg); per = int(round(per_s * fps)); Fn = F / np.linalg.norm(F, axis=1, keepdims=True); nch = len(Fn) // per
    same, half = [], []
    for c1 in range(nch):
        for c2 in range(c1 + 1, nch):
            for p in range(per):
                same.append(Fn[c1 * per + p] @ Fn[c2 * per + p]); half.append(Fn[c1 * per + p] @ Fn[c2 * per + (p + per // 2) % per])
    pos[name] = {"same": round(float(np.mean(same)), 3), "half": round(float(np.mean(half)), 3), "window_s": per_s}
    print("position", name, pos[name])
out["position"] = pos
json.dump(out, open(f"{A}/data/real_models.json", "w"))
print("saved")
