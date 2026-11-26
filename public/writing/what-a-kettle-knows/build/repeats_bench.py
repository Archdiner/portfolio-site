"""A rebuilt version of the repeat-counting test, at a size you can trust a little more than one example.
120 synthetic items: 20 s of the kettle's boil with one short sound repeated 2-8 times, at least 1.5 s apart.
Counting rules, as in the original test: a two-second example around the first event, peaks at least 1.5 s
apart, threshold tuned on the first half of the items and scored on the second half.
Compares: peaks on the averaged example (the original rule), dips on the averaged example, peaks on a single
frame at the event's onset, and raw waveform matching. Also tests two controls for the window-position effect:
a middle layer, and subtracting each window position's average.
Usage: python repeats_bench.py <assets dir> <hf cache dir>"""
import sys, json, subprocess, numpy as np, torch, torchaudio
from transformers import AutoModel, AutoFeatureExtractor
A, CACHE = sys.argv[1], sys.argv[2]
torch.set_num_threads(4); SR = 16000; rng = np.random.default_rng(11)

def load(name):
    raw = subprocess.run(["ffmpeg", "-v", "quiet", "-i", f"{A}/audio/{name}.mp3", "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).copy()

# ---------------------------------------------------------------- stimuli
kettle = load("kettle")
events = {n: load(n)[: int(0.6 * SR)] for n in ["tap_mug_soft", "tap_mug_hard", "tap_glass", "tap_metal"]}
ball = load("bouncing_ball"); i0 = int(np.argmax(np.abs(ball) > 0.2 * np.abs(ball).max())); events["ball"] = ball[max(0, i0 - 80): i0 + int(0.3 * SR)]
perc = load("hpss_percussive"); env = np.convolve(np.abs(perc), np.ones(400) / 400, "same")
picks = []
for i in np.argsort(-env):
    if all(abs(i - j) > SR for j in picks): picks.append(i)
    if len(picks) == 3: break
for k, i in enumerate(picks): events[f"spoon{k}"] = perc[max(0, i - 800): i + int(0.3 * SR)]
names = list(events)
N, DUR = 120, 20.0
items = []
for n in range(N):
    st = rng.uniform(15, 75); bg = kettle[int(st * SR): int(st * SR) + int(DUR * SR)].copy() * 0.6
    ev = events[names[n % len(names)]]; ev = ev / (np.abs(ev).max() + 1e-9)
    k = int(rng.integers(2, 9)); times = [rng.uniform(1.2, 2.5)]
    while len(times) < k:
        t = rng.uniform(times[0] + 1.5, DUR - 0.8)
        if all(abs(t - u) >= 1.5 for u in times): times.append(t)
    times.sort(); x = bg.copy()
    for t in times:
        g = rng.uniform(0.8, 2.0) * np.abs(bg).max(); i = int(t * SR); seg = ev[: len(x) - i]; x[i:i + len(seg)] += seg * g
    items.append({"x": (x / (np.abs(x).max() + 1e-9) * 0.9).astype(np.float32), "times": times, "k": k, "event": names[n % len(names)]})
print("items", N, "counts", np.bincount([it["k"] for it in items]))

# ---------------------------------------------------------------- features (last and middle layer)
def grab(module):
    store = {}
    def hook(_, __, out): store["x"] = out[0] if isinstance(out, tuple) else out
    module.register_forward_hook(hook); return store
eat = AutoModel.from_pretrained("worstchan/EAT-base_epoch30_pretrain", trust_remote_code=True, cache_dir=CACHE).eval()
eat_mid = grab(eat.model.blocks[5])
def eat_feats(w):
    last, mid = [], []
    for s in range(0, len(w), 163840):
        x = torch.tensor(w[s:s + 163840]); n = len(x); x = x - x.mean()
        mel = torchaudio.compliance.kaldi.fbank(x.unsqueeze(0), htk_compat=True, sample_frequency=SR, use_energy=False, window_type="hanning", num_mel_bins=128, dither=0.0, frame_shift=10).unsqueeze(0)
        mel = torch.nn.ZeroPad2d((0, 0, 0, 1024 - mel.shape[1]))(mel) if mel.shape[1] < 1024 else mel[:, :1024]
        mel = ((mel - -4.268) / (4.569 * 2)).unsqueeze(0)
        with torch.no_grad(): f = eat.extract_features(mel).squeeze(0)
        keep = max(1, int(np.ceil(n / SR * 6.25)))
        last.append(f[1:].reshape(64, 8, -1).mean(1)[:keep].numpy())
        m = eat_mid["x"].squeeze(0); mid.append(m[-512:].reshape(64, 8, -1).mean(1)[:keep].numpy())
    return {"last": np.concatenate(last), "mid": np.concatenate(mid)}, 6.25, 64
dfe = AutoFeatureExtractor.from_pretrained("mispeech/dasheng-base", trust_remote_code=True, cache_dir=CACHE)
das = AutoModel.from_pretrained("mispeech/dasheng-base", outputdim=None, trust_remote_code=True, cache_dir=CACHE).eval()
das_mid = grab(das.encoder.blocks[5])
def das_feats(w):
    last, mid = [], []
    for s in range(0, len(w), SR * 10):
        x = torch.tensor(w[s:s + SR * 10]).unsqueeze(0)
        if x.shape[1] < SR // 4: break
        with torch.no_grad(): h = das(**dfe(x, sampling_rate=SR, return_tensors="pt")).hidden_states.squeeze(0)
        last.append(h.numpy()); mid.append(das_mid["x"].squeeze(0)[-h.shape[0]:].numpy())
    return {"last": np.concatenate(last), "mid": np.concatenate(mid)}, 25.0, 250
usad = AutoModel.from_pretrained("MIT-SLS/USAD2-Small", trust_remote_code=True, cache_dir=CACHE).eval()
def usad_feats(w):
    x = torch.tensor(w).unsqueeze(0)
    with torch.no_grad(): r = usad(wavs=x, wav_lengths=torch.tensor([x.shape[1]]), target_layer=None)
    return {"last": r["x"].squeeze(0)[: int(r["x_lengths"][0])].numpy()}, float(usad.encoder_frame_rate), None
def spec_feats(w):
    m = torchaudio.compliance.kaldi.fbank(torch.tensor(w).unsqueeze(0), sample_frequency=SR, num_mel_bins=64, frame_shift=10, dither=0.0).numpy()
    return {"last": m - m.mean(0)}, 100.0, None

FEATS = {}
for name, fn in [("spectrogram", spec_feats), ("EAT", eat_feats), ("Dasheng", das_feats), ("USAD", usad_feats)]:
    out = [fn(it["x"]) for it in items]
    fps, per = out[0][1], out[0][2]
    for layer in out[0][0]:
        FEATS[f"{name} {layer}"] = ([o[0][layer] for o in out], fps)
    if per:  # subtract each window position's average, estimated over all items
        F = [o[0]["last"] for o in out]; allF = np.concatenate([f[: (len(f) // per) * per] for f in F])
        pm = allF.reshape(-1, per, allF.shape[1]).mean(0)
        FEATS[f"{name} last, position removed"] = ([f - pm[np.arange(len(f)) % per] for f in F], fps)
    print("features", name, fps)

# ---------------------------------------------------------------- counting
def cos(F, p): F = F / (np.linalg.norm(F, axis=1, keepdims=True) + 1e-9); return F @ (p / (np.linalg.norm(p) + 1e-9))
def rz(c): m = np.median(c); s = np.median(np.abs(c - m)) * 1.4826 + 1e-9; return (c - m) / s
def count(z, thr, fps, gap=1.5):
    cand = [i for i in range(1, len(z) - 1) if z[i] > thr and z[i] >= z[i - 1] and z[i] >= z[i + 1]]
    keep = []
    for i in sorted(cand, key=lambda i: -z[i]):
        if all(abs(i - j) > gap * fps for j in keep): keep.append(i)
    return len(keep)
def curves(F, fps, it, rule):
    t0 = it["times"][0]
    if rule == "onset": p = F[min(len(F) - 1, int(round(t0 * fps)))] if fps < 20 else F[int(t0 * fps): int((t0 + 0.08) * fps) + 1].mean(0)
    else: p = F[int((t0 - 0.5) * fps): int((t0 + 1.5) * fps)].mean(0)
    z = rz(cos(F, p)); return -z if rule == "dips" else z
THRS = np.arange(1.0, 8.01, 0.25)
half = N // 2
def evaluate(zs, fps):
    def acc(thr, idx): return np.mean([count(zs[i], thr, fps) == items[i]["k"] for i in idx])
    best = max(THRS, key=lambda t: acc(t, range(half)))
    test = range(half, N)
    preds = [count(zs[i], best, fps) for i in test]
    return {"acc": round(float(np.mean([p == items[i]["k"] for p, i in zip(preds, test)])), 3),
            "mae": round(float(np.mean([abs(p - items[i]["k"]) for p, i in zip(preds, test)])), 2), "thr": float(best)}
res = {}
for key, (Fs, fps) in FEATS.items():
    res[key] = {rule: evaluate([curves(F, fps, it, rule) for F, it in zip(Fs, items)], fps) for rule in ["peaks", "dips", "onset"]}
    print(f"{key:34s}", "  ".join(f"{r}: {v['acc']:.2f} (±{v['mae']})" for r, v in res[key].items()))
# waveform matching: the first event's own 50 ms, at every sample
wz = []
for it in items:
    x = it["x"].astype(np.float64); L = int(0.05 * SR); i0 = int(it["times"][0] * SR); pr = x[i0:i0 + L] - x[i0:i0 + L].mean()
    nfft = 1 << int(np.ceil(np.log2(len(x) + L)))
    num = np.fft.irfft(np.fft.rfft(x, nfft) * np.conj(np.fft.rfft(pr, nfft)), nfft)[: len(x) - L]
    c2 = np.concatenate([[0.0], np.cumsum(x ** 2)]); en = np.sqrt(np.maximum(c2[L:L + len(num)] - c2[: len(num)], 1e-12))
    nc = num / (en * np.linalg.norm(pr)); k = SR // 100; nc = nc[: len(nc) // k * k].reshape(-1, k).max(1)
    wz.append(rz(nc))
res["waveform"] = {"peaks": evaluate(wz, 100.0)}
print("waveform", res["waveform"])
chance = max(np.bincount([it["k"] for it in items[half:]])) / (N - half)

# ---------------------------------------------------------------- window position, before and after the controls
seg = kettle[int(15 * SR): int(95 * SR)]
def pos_stats(F, per):
    Fn = F / np.linalg.norm(F, axis=1, keepdims=True); nch = len(Fn) // per; same, half_ = [], []
    for c1 in range(nch):
        for c2 in range(c1 + 1, nch):
            for p in range(per):
                same.append(Fn[c1 * per + p] @ Fn[c2 * per + p]); half_.append(Fn[c1 * per + p] @ Fn[c2 * per + (p + per // 2) % per])
    return {"same": round(float(np.mean(same)), 3), "half": round(float(np.mean(half_)), 3)}
pos = {}
for name, fn in [("EAT", eat_feats), ("Dasheng", das_feats)]:
    f, fps, per = fn(seg); pos[name] = {"last": pos_stats(f["last"], per), "mid": pos_stats(f["mid"], per)}
    L = f["last"][: (len(f["last"]) // per) * per]; pm = L.reshape(-1, per, L.shape[1]).mean(0)
    pos[name]["last, position removed"] = pos_stats(L - pm[np.arange(len(L)) % per], per)
    print("position", name, pos[name])
json.dump({"n_items": N, "n_scored": N - half, "chance_exact": round(float(chance), 3), "results": res, "position": pos,
           "events": names}, open(f"{A}/data/repeats_bench.json", "w"), indent=1)
print("saved")
