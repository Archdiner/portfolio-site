"""The lab: one tiny transformer, five training objectives, the same data.
Trains on half-second mel windows from the post's recordings and saves the 2-D map of a fixed
set of windows over training, for the animations in part 1.
Usage: python lab.py <assets dir> <hf cache dir>"""
import sys, json, base64, copy, subprocess, numpy as np, torch, torch.nn as nn, torch.nn.functional as Fn
A, CACHE = sys.argv[1], sys.argv[2]
torch.manual_seed(0); np.random.seed(0); torch.set_num_threads(4)
rng = np.random.default_rng(7)

def spec(name):
    d = json.load(open(f"{A}/data/{name}.json")); s = d["spec"]
    a = np.frombuffer(base64.b64decode(s["b64"]), np.uint8).reshape(s["n_mels"], s["frames"]).astype(np.float32) / 255
    return a, s["frame_s"]

W, PT, PF = 8, 4, 16                      # window: 8 frames x 64 mels; patches: 4 frames x 16 mels -> 2 x 4 = 8 patches
CLASSES = [("kettle heating", "kettle", 2.8, 12.6), ("kettle boiling", "kettle", 15, 95), ("pouring", "pour", 0.5, 3.4),
           ("stirring", "stir", 1.2, 21), ("spoon and cup", "cup_spoon", 0.5, 12.5)]
X, Y, T0, CL = [], [], [], []
for ci, (_, clip, a, b) in enumerate(CLASSES):
    S, fs = spec(clip); i0, i1 = int(a / fs), int(b / fs) - W
    for st in rng.integers(i0, i1, size=260):
        X.append(S[:, st:st + W]); Y.append(ci); T0.append(st * fs); CL.append(clip)
X = np.array(X); Y = np.array(Y)
def to_patches(x):  # x: n,64,8 -> n,8,64 (patch order: time block major, then freq band)
    n = len(x); p = x.reshape(n, 4, PF, 2, PT).transpose(0, 3, 1, 2, 4).reshape(n, 8, PF * PT)
    return p
P = to_patches(X); mu, sd = P.mean((0, 1)), P.std((0, 1)) + 1e-3
P = torch.tensor((P - mu) / sd, dtype=torch.float32); Yt = torch.tensor(Y)
plot_idx = np.concatenate([np.where(Y == c)[0][:36] for c in range(5)])
test_idx = np.concatenate([np.where(Y == c)[0][36:72] for c in range(5)])
train_idx = np.setdiff1d(np.arange(len(X)), np.concatenate([plot_idx, test_idx]))

# codes for "name the code": k-means over all patches
flat = P.reshape(-1, P.shape[-1]).numpy(); K = 16
cent = flat[rng.choice(len(flat), K, replace=False)]
for _ in range(50):
    asg = np.argmin(((flat[:, None] - cent[None]) ** 2).sum(-1), 1)
    for k in range(K):
        if (asg == k).any(): cent[k] = flat[asg == k].mean(0)
CODES = torch.tensor(asg.reshape(P.shape[0], 8))

# expert targets for "copy an expert": real Dasheng, averaged over each window
from transformers import AutoModel, AutoFeatureExtractor
SR = 16000
def load(name):
    raw = subprocess.run(["ffmpeg", "-v", "quiet", "-i", f"{A}/audio/{name}.mp3", "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).copy()
dfe = AutoFeatureExtractor.from_pretrained("mispeech/dasheng-base", trust_remote_code=True, cache_dir=CACHE)
das = AutoModel.from_pretrained("mispeech/dasheng-base", outputdim=None, trust_remote_code=True, cache_dir=CACHE).eval()
DF = {}
for clip in set(CL):
    w = load(clip); out = []
    for s in range(0, len(w), SR * 10):
        x = torch.tensor(w[s:s + SR * 10]).unsqueeze(0)
        if x.shape[1] < SR // 4: break
        with torch.no_grad(): out.append(das(**dfe(x, sampling_rate=SR, return_tensors="pt")).hidden_states.squeeze(0).numpy())
    DF[clip] = np.concatenate(out)
EXP = np.array([DF[c][int(t * 25): int(t * 25) + max(1, int(W * 0.064 * 25))].mean(0) for c, t in zip(CL, T0)])
EXP = (EXP - EXP.mean(0)) / (EXP.std(0) + 1e-6); EXP = torch.tensor(EXP, dtype=torch.float32)

# ---------------------------------------------------------------- the tiny transformer
class Encoder(nn.Module):
    def __init__(s, d=32):
        super().__init__()
        s.embed = nn.Linear(PF * PT, d); s.pos = nn.Parameter(torch.randn(8, d) * 0.1); s.mask_tok = nn.Parameter(torch.zeros(d))
        layer = nn.TransformerEncoderLayer(d, 2, 64, dropout=0.0, batch_first=True); s.tf = nn.TransformerEncoder(layer, 2)
        s.to2 = nn.Linear(d, 2)
    def forward(s, p, hide=None):
        h = s.embed(p)
        if hide is not None: h = torch.where(hide[..., None], s.mask_tok.expand_as(h), h)
        tok = s.tf(h + s.pos)
        return s.to2(tok.mean(1)), tok  # z: the two numbers we plot; tok: per-patch outputs (used as a teacher)

class Head(nn.Module):  # every objective guesses its target from z (+ which patch it's asking about)
    def __init__(s, out, per_patch):
        super().__init__(); s.pp = per_patch
        s.net = nn.Sequential(nn.Linear(2 + (8 if per_patch else 0), 64), nn.GELU(), nn.Linear(64, out))
    def forward(s, z):
        if not s.pp: return s.net(z)
        eye = torch.eye(8).expand(len(z), 8, 8)
        return s.net(torch.cat([z[:, None].expand(-1, 8, -1), eye], -1))

def hidden_mask(n, frac=0.75):
    m = torch.rand(n, 8) < frac; m[torch.arange(n), torch.randint(0, 8, (n,))] = False  # keep at least one
    return m

def train(goal, steps=1500, snaps=60, fix_collapse=True):
    torch.manual_seed(1)
    enc = Encoder()
    head = {"labels": Head(5, False), "redraw": Head(PF * PT, True), "code": Head(K, True),
            "teacher": Head(32, True), "expert": Head(EXP.shape[1], False)}[goal]
    teacher = copy.deepcopy(enc).requires_grad_(False) if goal == "teacher" else None
    opt = torch.optim.Adam(list(enc.parameters()) + list(head.parameters()), lr=2e-3)
    every = steps // snaps; frames, losses = [], []
    for t in range(steps + 1):
        if t % every == 0 or t == steps:
            with torch.no_grad(): zp, _ = enc(P[plot_idx])
            frames.append(np.round(zp.numpy(), 3).tolist())
        if t == steps: break
        bi = torch.tensor(rng.choice(train_idx, 128)); p = P[bi]
        if goal in ("labels", "expert"):
            z, _ = enc(p); out = head(z)
            loss = Fn.cross_entropy(out, Yt[bi]) if goal == "labels" else Fn.mse_loss(out, EXP[bi])
        else:
            hide = hidden_mask(len(bi)); z, _ = enc(p, hide); out = head(z)
            if goal == "redraw": loss = Fn.mse_loss(out[hide], p[hide])
            elif goal == "code": loss = Fn.cross_entropy(out[hide], CODES[bi][hide])
            else:
                with torch.no_grad():
                    _, tt = teacher(p)
                    if fix_collapse: tt = (tt - tt.mean((0, 1))) / (tt.std((0, 1)) + 1e-5)  # normalise targets across the batch
                loss = Fn.mse_loss(out[hide], tt[hide])
        opt.zero_grad(); loss.backward(); opt.step(); losses.append(float(loss))
        if teacher is not None:
            with torch.no_grad():
                for pt, ps in zip(teacher.parameters(), enc.parameters()): pt.mul_(0.99).add_(ps, alpha=0.01)
    with torch.no_grad():
        zt = enc(P[test_idx])[0].numpy(); ztr = enc(P[train_idx])[0].numpy()
    yt, ytr = Y[test_idx], Y[train_idx]
    c = np.array([ztr[ytr == k].mean(0) for k in range(5)])
    acc = float((np.argmin(((zt[:, None] - c[None]) ** 2).sum(-1), 1) == yt).mean())
    spread = float(np.std(frames[-1]))
    L = np.array(losses); loss_s = [round(float(L[max(0, i * every - every):i * every + 1].mean()), 4) if i else round(float(L[0]), 4) for i in range(len(frames))]
    print(f"{goal:8s} fix={fix_collapse} acc={acc:.3f} spread={spread:.4f} loss {loss_s[0]} -> {loss_s[-1]}")
    return {"frames": frames, "loss": loss_s, "acc": round(acc, 3), "spread": round(spread, 4)}

out = {"classes": [c[0] for c in CLASSES], "labels": Y[plot_idx].tolist(), "steps": 1500, "runs": {}}
for g in ["labels", "redraw", "code", "teacher", "expert"]:
    out["runs"][g] = train(g)
out["runs"]["teacher_naive"] = train("teacher", fix_collapse=False)
json.dump(out, open(f"{A}/data/lab.json", "w"))
print("saved")
