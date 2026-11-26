"""Train a tiny network two ways on real mel-spectrogram windows from the post's clips,
and save 2D positions of a fixed sample set over training, for the animation.
Also compute k-means patch codes for the patches widget."""
import json, base64, numpy as np, sys
D = sys.argv[1]
rng = np.random.default_rng(7)
def spec(name):
    d = json.load(open(f"{D}/{name}.json")); s = d["spec"]
    a = np.frombuffer(base64.b64decode(s["b64"]), np.uint8).reshape(s["n_mels"], s["frames"]).astype(np.float32) / 255
    return a, s["frame_s"]
W = 8
CLASSES = [("kettle heating", "kettle", 2.8, 12.6), ("kettle boiling", "kettle", 15, 95),
           ("pouring", "pour", 0.5, 3.4), ("stirring", "stir", 1.2, 21), ("spoon and cup", "cup_spoon", 0.5, 12.5)]
X, Y = [], []
for ci, (_, clip, a, b) in enumerate(CLASSES):
    S, fs = spec(clip)
    i0, i1 = int(a / fs), int(b / fs) - W
    starts = rng.integers(i0, i1, size=260)
    for st in starts:
        X.append(S[:, st:st + W].T.reshape(-1)); Y.append(ci)
X = np.array(X); Y = np.array(Y)
mu, sd = X.mean(0), X.std(0) + 1e-3
Xn = (X - mu) / sd
# fixed plot set: 36 per class
plot_idx = np.concatenate([np.where(Y == c)[0][:36] for c in range(len(CLASSES))])
train_idx = np.setdiff1d(np.arange(len(X)), plot_idx)

def adam_init(params): return {k: (np.zeros_like(v), np.zeros_like(v)) for k, v in params.items()}
def adam_step(params, grads, st, t, lr=3e-3):
    for k in params:
        m, v = st[k]; g = grads[k]
        m[:] = 0.9 * m + 0.1 * g; v[:] = 0.999 * v + 0.001 * g * g
        params[k] -= lr * (m / (1 - 0.9 ** t)) / (np.sqrt(v / (1 - 0.999 ** t)) + 1e-8)

def init(seed, out_dim_head):
    r = np.random.default_rng(seed); d = X.shape[1]
    p = {"W1": r.normal(0, 1 / np.sqrt(d), (d, 64)), "b1": np.zeros(64),
         "W2": r.normal(0, 1 / 8, (64, 2)), "b2": np.zeros(2)}
    p.update(out_dim_head(r)); return p

def encode(p, x):
    h = np.tanh(x @ p["W1"] + p["b1"]); z = h @ p["W2"] + p["b2"]; return h, z

def train(mode, steps=900, snap_every=15):
    if mode == "sup":
        p = init(1, lambda r: {"W3": r.normal(0, 0.5, (2, len(CLASSES))), "b3": np.zeros(len(CLASSES))})
    else:
        d = X.shape[1]
        p = init(1, lambda r: {"W4": r.normal(0, 0.5, (2, 64)), "b4": np.zeros(64),
                               "W5": r.normal(0, 1 / 8, (64, d)), "b5": np.zeros(d)})
    st = adam_init(p); snaps = []; losses = []
    # patch mask: 8 frames x 64 mels -> 2 time blocks x 4 freq bands = 8 patches (4 frames x 16 mels)
    def patch_mask(n):
        keep = rng.random((n, 2, 4)) > 0.75
        keep[np.arange(n), rng.integers(0, 2, n), rng.integers(0, 4, n)] = True  # keep at least one
        m = np.repeat(np.repeat(keep, 4, axis=1), 16, axis=2)  # n,8,64
        return m.reshape(n, -1).astype(np.float32)
    for t in range(1, steps + 1):
        bi = rng.choice(train_idx, 128); x = Xn[bi]
        if mode == "sup":
            h, z = encode(p, x)
            lg = z @ p["W3"] + p["b3"]; lg -= lg.max(1, keepdims=True)
            pr = np.exp(lg); pr /= pr.sum(1, keepdims=True)
            loss = -np.log(pr[np.arange(len(bi)), Y[bi]] + 1e-9).mean()
            dlg = pr.copy(); dlg[np.arange(len(bi)), Y[bi]] -= 1; dlg /= len(bi)
            g = {"W3": z.T @ dlg, "b3": dlg.sum(0)}; dz = dlg @ p["W3"].T
        else:
            m = patch_mask(len(bi)); xin = x * m
            h, z = encode(p, xin)
            h2 = np.tanh(z @ p["W4"] + p["b4"]); out = h2 @ p["W5"] + p["b5"]
            hid = 1 - m; err = (out - x) * hid; denom = hid.sum() + 1
            loss = (err ** 2).sum() / denom
            dout = 2 * err / denom
            g = {"W5": h2.T @ dout, "b5": dout.sum(0)}; dh2 = dout @ p["W5"].T * (1 - h2 ** 2)
            g.update({"W4": z.T @ dh2, "b4": dh2.sum(0)}); dz = dh2 @ p["W4"].T
            x = xin
        g.update({"W2": h.T @ dz, "b2": dz.sum(0)}); dh = dz @ p["W2"].T * (1 - h ** 2)
        g.update({"W1": x.T @ dh, "b1": dh.sum(0)})
        adam_step(p, g, st, t)
        if t == 1 or t % snap_every == 0:
            _, zp = encode(p, Xn[plot_idx]); snaps.append(np.round(zp, 3).tolist()); losses.append(round(float(loss), 4))
    # accuracy-ish: nearest class centroid in 2D on the plot set (for the caption)
    _, zp = encode(p, Xn[plot_idx]); yp = Y[plot_idx]
    cent = np.array([zp[yp == c].mean(0) for c in range(len(CLASSES))])
    pred = np.argmin(((zp[:, None] - cent[None]) ** 2).sum(-1), 1)
    print(mode, "final loss", losses[-1], "nearest-centroid acc on plot set", round(float((pred == yp).mean()), 3))
    return {"snaps": snaps, "loss": losses}

sup = train("sup"); ssl = train("ssl")
json.dump({"classes": [c[0] for c in CLASSES], "labels": Y[plot_idx].tolist(), "sup": sup, "ssl": ssl,
           "note": "Tiny MLP (512->64->2), trained in numpy on 0.5 s mel windows. 'sup' predicts the class; 'ssl' hides 75% of 8 patches and redraws them."},
          open(f"{D}/tiny_training.json", "w"))

# patch codes for the patches widget: kettle 0-24 s
S, fs = spec("kettle"); i0, i1 = 0, int(24 / fs)
crop = S[:, i0:i1]; PT, PF = 16, 16
nT, nF = crop.shape[1] // PT, crop.shape[0] // PF
patches = np.array([[crop[f*PF:(f+1)*PF, t*PT:(t+1)*PT].reshape(-1) for t in range(nT)] for f in range(nF)])  # nF,nT,256
flat = patches.reshape(-1, PF * PT)
K = 12; cent = flat[rng.choice(len(flat), K, replace=False)]
for _ in range(40):
    a = np.argmin(((flat[:, None] - cent[None]) ** 2).sum(-1), 1)
    for k in range(K):
        if (a == k).any(): cent[k] = flat[a == k].mean(0)
codes = a.reshape(nF, nT)
crop8 = np.clip(np.round(crop * 255), 0, 255).astype(np.uint8)
json.dump({"n_mels": crop.shape[0], "frames": crop.shape[1], "frame_s": fs, "pt": PT, "pf": PF, "nT": nT, "nF": nF,
           "b64": base64.b64encode(crop8.tobytes()).decode(), "codes": codes.tolist(), "k": K},
          open(f"{D}/patches.json", "w"))
print("patches", nF, "x", nT)
