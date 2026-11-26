/* What a Kettle Knows: interactions.
   Every number and every label is loaded from assets/data (generated from the
   tinker-proj results and the Freesound recordings). Prose lives in index.html. */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const clock = (s) => { s = Math.max(0, s || 0); return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`; };
const clockT = (s) => `${Math.floor(s / 60)}:${(s % 60).toFixed(1).padStart(4, "0")}`;
const dpr = () => window.devicePixelRatio || 1;
const json = (n) => fetch(`assets/data/${n}.json`).then((r) => r.json());

const C = { blood: "#7c2b26", teal: "#2f6f5e", gold: "#a8792f", ink: "#1d1b17", muted: "#6f675c", faint: "#9a9183", line: "#e2d9c8", card: "#fffdf8", dark: "#171614", peach: "#f3a27f", sage: "#6fbfa8" };
const STAGE = { off: { c: "#8c8275", name: "off" }, heat: { c: C.gold, name: "heating" }, boil: { c: C.teal, name: "boiling" } };
const ENC = {
  dsp_rich: ["Recipe", "dsp"], mn04_as: ["Tagger S", "tag"], mn10_as: ["Tagger M", "tag"], mn20_as: ["Tagger L", "tag"],
  usad2_small: ["USAD", "ssl"], dasheng_base: ["Dasheng", "ssl"], eat_pretrain: ["EAT", "ssl"], beats_iter3: ["BEATs", "ssl"],
};
const FAM = { dsp: C.gold, tag: C.blood, ssl: C.teal };
const EAR_WORDS = { light_switch: "light switch", running_water: "running water", coffee_machine: "coffee machine", vacuum_cleaner: "vacuum cleaner" };

const S = { clips: {} };

/* ------------------------------------------------------------------ boot */
async function boot() {
  const names = ["kettle", "codec_original", "codec_8khz", "codec_4khz", "hpss_mix", "hpss_harmonic", "hpss_percussive", "bouncing_ball"];
  const [results, taps, similarity, sources, bounce, ...clips] = await Promise.all(
    ["results", "taps", "similarity", "sources", "bouncing_onsets", ...names].map(json));
  Object.assign(S, { results, taps, similarity, sources, bounce });
  clips.forEach((c) => (S.clips[c.name] = c));
  S.k = S.clips.kettle;

  initAudio();
  buildBlind();
  buildKettleViews();
  buildZoom();
  buildSwitcher({ tabs: "#codecTabs", attr: "codec", play: "#codecPlay", canvas: "#codecSpec", meta: "#codecMeta",
    metas: { codec_original: "16,000 numbers a second", codec_8khz: "8,000 numbers a second · phone quality", codec_4khz: "nothing above 4,000 Hz" } });
  buildSwitcher({ tabs: "#hpssTabs", attr: "stem", play: "#hpssPlay", canvas: "#hpssSpec", meta: "#hpssMeta",
    metas: { hpss_mix: "cup, spoon and hot water · 0:14", hpss_harmonic: "the horizontal stripes: water and room", hpss_percussive: "the vertical lines: spoon and cup" } });
  buildTaps();
  buildSim();
  buildEar();
  buildSkills();
  buildBounce();
  buildDiary();
  buildMemory();
  buildCost();
  buildTables();
  wireProgress();
  const plan = $("#plan");
  new IntersectionObserver((es, io) => { if (es[0].isIntersecting) { plan.classList.add("go"); io.disconnect(); } }, { threshold: 0.4 }).observe(plan);
  addEventListener("resize", debounce(redrawAll, 150));
}

function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }

/* ------------------------------------------------------------------ audio */
const players = [];
function makeAudio(src) {
  const a = src ? new Audio(src) : new Audio();
  a.preload = "metadata";
  a.addEventListener("play", () => { players.forEach((p) => p !== a && p.pause()); loop(); });
  players.push(a);
  return a;
}
let kettle;
let activeView = null;
function initAudio() {
  kettle = makeAudio("assets/audio/kettle.mp3");
  ["play", "pause", "ended", "seeked", "timeupdate"].forEach((e) => kettle.addEventListener(e, syncKettle));
}
let looping = false;
function loop() {
  if (looping) return;
  looping = true;
  const step = () => {
    syncKettle(); syncSwitchers();
    if (players.some((p) => !p.paused)) requestAnimationFrame(step); else { looping = false; syncKettle(); syncSwitchers(); }
  };
  requestAnimationFrame(step);
}
function toggleKettle(view) {
  if (!kettle.paused && activeView === view) { kettle.pause(); return; }
  activeView = view;
  if (kettle.ended) kettle.currentTime = 0;
  kettle.play().catch(() => {});
}
function kDur() { return kettle.duration || S.k.duration; }

/* ------------------------------------------------------------------ drawing */
function sizeCanvas(cv) {
  const w = cv.clientWidth || 600, h = Number(cv.getAttribute("height")) || 100;
  cv.style.height = h + "px";
  cv.width = Math.round(w * dpr()); cv.height = Math.round(h * dpr());
  const g = cv.getContext("2d"); g.setTransform(dpr(), 0, 0, dpr(), 0, 0);
  return { g, w, h };
}
function drawWave(cv, peaks, { color = C.blood, bg = C.card, upto = 1, ghost = null } = {}) {
  const { g, w, h } = sizeCanvas(cv);
  g.fillStyle = bg; g.fillRect(0, 0, w, h);
  const n = peaks.hi.length, mid = h / 2, amp = h * 0.46;
  for (let i = 0; i < n; i++) {
    const f = i / n;
    if (f > upto && !ghost) break;
    g.fillStyle = f <= upto ? color : ghost;
    const x = f * w, y1 = mid + (peaks.lo[i] / 127) * amp, y2 = mid + (peaks.hi[i] / 127) * amp;
    g.fillRect(x, Math.min(y1, y2), Math.max(1, w / n + 0.3), Math.max(1, Math.abs(y2 - y1)));
  }
}
let _lut;
function lut() {
  if (_lut) return _lut;
  const stops = [[0, [23, 22, 20]], [0.3, [40, 46, 42]], [0.52, [47, 111, 94]], [0.74, [168, 121, 47]], [0.9, [236, 168, 122]], [1, [252, 244, 222]]];
  _lut = [];
  for (let i = 0; i < 256; i++) {
    const t = i / 255; let j = 0;
    while (j < stops.length - 2 && t > stops[j + 1][0]) j++;
    const [a, ca] = stops[j], [b, cb] = stops[j + 1], u = (t - a) / (b - a);
    _lut.push(ca.map((v, k) => Math.round(v + (cb[k] - v) * u)));
  }
  return _lut;
}
const specCache = new Map();
function specImage(spec) {
  if (specCache.has(spec)) return specCache.get(spec);
  const raw = Uint8Array.from(atob(spec.b64), (c) => c.charCodeAt(0));
  const nF = spec.frames, nM = spec.n_mels, o = document.createElement("canvas");
  o.width = nF; o.height = nM;
  const x = o.getContext("2d"), img = x.createImageData(nF, nM), L = lut();
  for (let y = 0; y < nM; y++) for (let f = 0; f < nF; f++) {
    const c = L[raw[y * nF + f]], k = (y * nF + f) * 4;
    img.data[k] = c[0]; img.data[k + 1] = c[1]; img.data[k + 2] = c[2]; img.data[k + 3] = 255;
  }
  x.putImageData(img, 0, 0);
  specCache.set(spec, o);
  return o;
}
function drawSpec(cv, spec, playFrac = null) {
  const { g, w, h } = sizeCanvas(cv);
  g.imageSmoothingEnabled = true;
  g.drawImage(specImage(spec), 0, 0, w, h);
  if (playFrac != null) {
    g.fillStyle = C.peach; g.fillRect(playFrac * w - 1, 0, 2, h);
  }
}
function svg(w, h, body, label) { return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(label)}">${body}</svg>`; }

/* ------------------------------------------------------------------ cold open */
const GUESS = {
  vacuum: ["You said: a vacuum cleaner", "Hold that thought. You're not the only listener who heard a vacuum cleaner in this recording, and we'll meet the other one later."],
  tea: ["You said: someone making tea", "Very close. This is the first half of making tea: the kettle, from the moment it's switched on to the moment it switches itself off."],
  rain: ["You said: rain on a window", "Fair enough. A rolling boil and rain both hiss, because both are thousands of tiny impacts at once. The clicks at the start and the end give the kettle away."],
  coffee: ["You said: a coffee machine", "Good instinct: a kitchen machine heating water. You'll meet another listener later that made exactly the same guess."],
};
let heardMax = 0;
function buildBlind() {
  drawBlind();
  $$("[data-guess]").forEach((b) => b.addEventListener("click", () => {
    S.guess = b.dataset.guess;
    const [tag, sub] = GUESS[S.guess];
    $("#revealTag").textContent = tag;
    $("#revealSub").textContent = sub;
    $("#guess").hidden = true;
    $("#reveal").hidden = false;
    heardMax = 1; drawBlind();
    updateCallback();
  }));
}
function drawBlind() {
  drawWave($("#blindWave"), S.k.peaks, { color: C.peach, bg: C.dark, upto: heardMax, ghost: "#26231f" });
}
function updateCallback() {
  const el = $("#guessCallback");
  const base = "A light switch. Running water. A coffee machine. And then, for most of the boil, a vacuum cleaner.";
  if (S.guess === "vacuum") el.textContent = `If you guessed a vacuum cleaner at the top, you and the Ear agree. ${base}`;
  else if (S.guess === "coffee") el.textContent = `If you guessed a coffee machine at the top, so did the Ear, for a while. ${base}`;
  else el.textContent = base;
}

/* ------------------------------------------------------------------ kettle views */
const MOMENTS = [
  [2.7, "click: switched on", 0], [7, "heating, getting louder", 1], [30, "full boil", 0], [99, "click: switched off", 0, true],
];
const SPEC_NOTES = [
  [2.7, 6, "the click: a thin vertical line"], [8, 80, "heating: low rumble builds"], [45, 55, "the boil: every pitch at once"], [99, 28, "click off: the water settles", true],
];
const LOG = [
  [2.7, "kettle switched on"], [12.7, "kettle boiling"], [99.0, "kettle switched off"],
];
function buildKettleViews() {
  $("#momentPins").innerHTML = MOMENTS.map(([t, l, row, r]) =>
    `<div class="pin ${r ? "right" : ""}" data-t="${t}" style="left:${(t / S.k.duration) * 100}%"><span style="top:${row * 28 - 4}px">${l}</span></div>`).join("");
  $("#specNotes").innerHTML = SPEC_NOTES.map(([t, y, l, r]) =>
    `<div class="spec-note" data-t="${t}" style="${r ? `right:${100 - (t / S.k.duration) * 100 + 0.6}%` : `left:${(t / S.k.duration) * 100 + 0.6}%`};top:${y}%">${l}</div>`).join("");
  $$("[data-kettle]").forEach((b) => b.addEventListener("click", () => toggleKettle(b.dataset.kettle)));
  $$("[data-view] .kwave, [data-view] .kspec").forEach((cv) => cv.addEventListener("click", (e) => {
    const r = cv.getBoundingClientRect();
    activeView = cv.closest("[data-view]").dataset.view;
    kettle.currentTime = ((e.clientX - r.left) / r.width) * kDur();
    syncKettle();
  }));
  drawKettleViews();
  syncKettle();
}
function drawKettleViews() {
  $$("[data-view]").forEach((v) => {
    const isDark = v.classList.contains("dark");
    $$(".kwave", v).forEach((cv) => drawWave(cv, S.k.peaks, { color: isDark ? C.sage : C.blood, bg: isDark ? C.dark : C.card }));
    $$(".kspec", v).forEach((cv) => drawSpec(cv, S.k.spec));
  });
}
let lastLogT = -1;
function syncKettle() {
  if (!S.k) return;
  const t = kettle.currentTime || 0, d = kDur(), f = Math.min(1, t / d), playing = !kettle.paused;
  // blind
  $("#blindTime").textContent = `${clock(t)} / ${clock(d)}`;
  if (f > heardMax && activeView === "blind") { heardMax = f; drawBlind(); }
  $$("[data-kettle]").forEach((b) => b.classList.toggle("on", playing && b.dataset.kettle === activeView));
  $$("[data-view]").forEach((v) => {
    const mine = v.dataset.view === activeView;
    v.classList.toggle("playing", mine && (playing || t > 0));
    $$(".ph", v).forEach((p) => (p.style.left = `calc(${f * 100}% - 1px)`));
    const tm = $("[data-time]", v); if (tm) tm.textContent = `${clock(t)} / ${clock(d)}`;
  });
  $$(".pin").forEach((p) => p.classList.toggle("lit", activeView === "moments" && t >= Number(p.dataset.t)));
  $$(".spec-note").forEach((p) => { const pt = Number(p.dataset.t); p.classList.toggle("lit", t >= pt - 1 && t <= pt + (pt === 45 ? 50 : 8)); });
  // ear
  const now = S.k.events.filter((e) => t >= e.start && t <= e.end).map((e) => EAR_WORDS[e.label] || e.text);
  if ($("#earNow")) $("#earNow").textContent = activeView === "ear" && t > 0 ? (now.length ? `Ear hears: ${[...new Set(now)].join(" + ")}` : "Ear hears: nothing") : "";
  // log
  if (Math.abs(t - lastLogT) > 0.05) { lastLogT = t; drawLog(t); }
}
function drawLog(t) {
  const el = $("#log"); if (!el) return;
  const done = LOG.filter(([lt]) => t >= lt);
  const key = done.length + (t >= 99 ? "s" : "");
  if (el.dataset.key === key) return;
  el.dataset.key = key;
  if (!done.length) { el.innerHTML = `<li class="wait">press play: entries appear as they happen</li>`; return; }
  el.innerHTML = done.map(([lt, l]) => `<li><time>${clockT(lt)}</time><span>${l}</span></li>`).join("") +
    (t >= 99 ? `<li class="sum"><time></time><span>boiled for 86.3 s · on for 96.3 s in total · switched on once</span></li>` : "");
}

/* ------------------------------------------------------------------ zoom */
let samples = null, zoomCenter = 40;
async function buildZoom() {
  const ov = $("#zoomOverview"), sl = $("#zoomSlider");
  const draw = () => drawZoom();
  sl.addEventListener("input", draw);
  ov.addEventListener("click", (e) => {
    const r = ov.getBoundingClientRect();
    zoomCenter = ((e.clientX - r.left) / r.width) * S.k.duration;
    draw();
  });
  draw();
  const io = new IntersectionObserver(async (es) => {
    if (!es[0].isIntersecting) return;
    io.disconnect();
    try {
      const buf = await fetch("assets/audio/kettle.mp3").then((r) => r.arrayBuffer());
      const ctx = new OfflineAudioContext(1, 16000, 16000);
      const ab = await ctx.decodeAudioData(buf);
      samples = ab.getChannelData(0);
      draw();
    } catch { $("#zoomRead").textContent = "This browser couldn't decode the audio, so the deepest zoom isn't available."; }
  }, { rootMargin: "400px" });
  io.observe($("#zoom"));
}
function zoomWindow() {
  const z = Number($("#zoomSlider").value) / 1000, D = S.k.duration;
  const span = D * Math.pow(0.004 / D, z);
  let a = zoomCenter - span / 2;
  a = Math.max(0, Math.min(D - span, a));
  return [a, a + span];
}
function drawZoom() {
  const [a, b] = zoomWindow(), D = S.k.duration, span = b - a;
  // overview
  const ov = $("#zoomOverview");
  drawWave(ov, S.k.peaks, { color: "#c9b9a6", bg: C.card });
  const g0 = ov.getContext("2d"), w0 = ov.clientWidth, h0 = Number(ov.getAttribute("height"));
  g0.fillStyle = "rgba(124,43,38,.18)"; g0.strokeStyle = C.blood; g0.lineWidth = 1.5;
  const x0 = (a / D) * w0, ww = Math.max(3, (span / D) * w0);
  g0.fillRect(x0, 0, ww, h0); g0.strokeRect(x0 + 0.5, 0.5, ww - 1, h0 - 1);
  // main
  const cv = $("#zoomCanvas"), { g, w, h } = sizeCanvas(cv), mid = h / 2, amp = h * 0.44;
  g.fillStyle = C.card; g.fillRect(0, 0, w, h);
  g.strokeStyle = C.line; g.beginPath(); g.moveTo(0, mid); g.lineTo(w, mid); g.stroke();
  const n = Math.round(span * 16000);
  if (!samples) {
    // peaks only
    const P = S.k.peaks, N = P.hi.length;
    const i0 = Math.floor((a / D) * N), i1 = Math.ceil((b / D) * N);
    g.fillStyle = C.blood;
    for (let i = i0; i < i1; i++) {
      const x = ((i - i0) / (i1 - i0)) * w, y1 = mid + (P.lo[i] / 127) * amp, y2 = mid + (P.hi[i] / 127) * amp;
      g.fillRect(x, Math.min(y1, y2), Math.max(1, w / (i1 - i0)), Math.max(1, Math.abs(y2 - y1)));
    }
  } else {
    const s0 = Math.floor(a * 16000), s1 = Math.min(samples.length, s0 + n);
    let peak = 0;
    for (let i = s0; i < s1; i += Math.max(1, Math.floor(n / 4000))) peak = Math.max(peak, Math.abs(samples[i]));
    const scale = amp / Math.max(0.02, peak);
    if (n > w * 1.5) {
      g.fillStyle = C.blood;
      for (let px = 0; px < w; px++) {
        const i0 = s0 + Math.floor((px / w) * n), i1 = s0 + Math.floor(((px + 1) / w) * n);
        let lo = 1, hi = -1;
        for (let i = i0; i < i1 && i < s1; i++) { const v = samples[i]; if (v < lo) lo = v; if (v > hi) hi = v; }
        if (hi < lo) continue;
        g.fillRect(px, mid - hi * scale, 1, Math.max(1, (hi - lo) * scale));
      }
    } else {
      g.strokeStyle = "rgba(124,43,38,.45)"; g.lineWidth = 1.2; g.beginPath();
      for (let i = s0; i < s1; i++) { const x = ((i - s0) / n) * w, y = mid - samples[i] * scale; i === s0 ? g.moveTo(x, y) : g.lineTo(x, y); }
      g.stroke();
      if (n < w / 3) {
        g.fillStyle = C.blood;
        for (let i = s0; i < s1; i++) {
          const x = ((i - s0) / n) * w, y = mid - samples[i] * scale;
          g.strokeStyle = "rgba(124,43,38,.25)"; g.beginPath(); g.moveTo(x, mid); g.lineTo(x, y); g.stroke();
          g.beginPath(); g.arc(x, y, 3.2, 0, 7); g.fill();
        }
      }
    }
  }
  const secs = span >= 1 ? `${span.toFixed(span >= 10 ? 0 : 1)} seconds` : span >= 0.01 ? `${(span * 1000).toFixed(0)} milliseconds` : `${(span * 1000).toFixed(1)} milliseconds`;
  const deep = n < w / 3 && samples ? " · each dot is one measurement, 1/16,000 of a second apart" : "";
  $("#zoomRead").textContent = `${clock(a)} to ${clock(b)} · ${secs} · ${n.toLocaleString()} numbers${deep}`;
}

/* ------------------------------------------------------------------ switchers (codec, hpss) */
const switchers = [];
function buildSwitcher(o) {
  const tabs = $$(`${o.tabs} .tab`);
  const sw = { ...o, cur: tabs[0].dataset[o.attr], audio: null };
  sw.audio = makeAudio(`assets/audio/${sw.cur}.mp3`);
  ["pause", "ended", "seeked"].forEach((e) => sw.audio.addEventListener(e, () => syncSwitchers()));
  tabs.forEach((b) => b.addEventListener("click", () => {
    const was = !sw.audio.paused, t = sw.audio.currentTime;
    sw.cur = b.dataset[o.attr];
    tabs.forEach((x) => x.classList.toggle("on", x === b));
    sw.audio.src = `assets/audio/${sw.cur}.mp3`;
    sw.audio.addEventListener("loadedmetadata", () => { sw.audio.currentTime = t; if (was) sw.audio.play().catch(() => {}); }, { once: true });
    $(o.meta).textContent = o.metas[sw.cur];
    drawSwitcher(sw);
  }));
  $(o.play).addEventListener("click", () => { if (sw.audio.paused) sw.audio.play().catch(() => {}); else sw.audio.pause(); });
  $(o.canvas).addEventListener("click", (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    sw.audio.currentTime = ((e.clientX - r.left) / r.width) * S.clips[sw.cur].duration;
    drawSwitcher(sw);
  });
  $(o.canvas).style.cursor = "pointer";
  switchers.push(sw);
  drawSwitcher(sw);
}
function drawSwitcher(sw) {
  const c = S.clips[sw.cur], t = sw.audio.currentTime || 0;
  drawSpec($(sw.canvas), c.spec, t > 0 ? Math.min(1, t / c.duration) : null);
  $(sw.play).classList.toggle("on", !sw.audio.paused);
}
function syncSwitchers() { switchers.forEach(drawSwitcher); }

/* ------------------------------------------------------------------ taps + similarity */
function buildTaps() {
  const a = makeAudio(null);
  $("#taps").innerHTML = S.taps.clips.map((c, i) => `
    <button class="tap" data-tap="${c.name}" aria-label="Play ${esc(c.label)}">
      <div class="tap-letter">${"ABCD"[i]}</div>
      <div class="tap-name">${esc(c.label)}</div>
      <canvas height="36" data-tapwave="${c.name}"></canvas>
    </button>`).join("");
  drawTaps();
  $$("[data-tap]").forEach((b) => b.addEventListener("click", () => {
    a.src = `assets/audio/${b.dataset.tap}.mp3`; a.play().catch(() => {});
    b.classList.add("hit"); setTimeout(() => b.classList.remove("hit"), 150);
  }));
}
function drawTaps() { S.taps.clips.forEach((c) => drawWave($(`[data-tapwave="${c.name}"]`), S.taps.peaks[c.name], { color: C.blood, bg: C.card })); }

const SIM_NOTES = {
  dsp_rich: "The recipe hears materials clearly. The two mug taps are almost identical (0.96), and the soft mug tap and the metal bowl are the furthest apart of any pair (0.56).",
  beats_iter3: "BEATs puts the mug taps closest (0.98), but everything is bunched between 0.87 and 0.93. It hears a difference, just a smaller one.",
  eat_pretrain: "EAT barely separates anything: every pair scores 0.96 or higher. To EAT, a china mug and a metal bowl are nearly the same sound.",
  usad2_small: "USAD sits in between. The mug taps are closest (0.97), and the other pairs land around 0.90 to 0.93.",
};
function buildSim() {
  let cur = "dsp_rich";
  const draw = () => {
    const M = S.similarity.matrices[cur], L = ["A", "B", "C", "D"];
    const off = M.flatMap((r, i) => r.filter((_, j) => j !== i)), lo = Math.min(...off), hi = Math.max(...off);
    const col = (v, i, j) => {
      if (i === j) return ["#e9e1d2", C.faint];
      const t = (v - lo) / (hi - lo || 1), a = [246, 238, 226], b = [124, 43, 38];
      return [`rgb(${a.map((x, k) => Math.round(x + (b[k] - x) * t)).join(",")})`, t > 0.55 ? "#fff" : C.ink];
    };
    $("#simMatrix").innerHTML = `<div class="sim-grid"><div></div>${L.map((l) => `<div class="h">${l}</div>`).join("")}${
      M.map((row, i) => `<div class="r">${L[i]}</div>${row.map((v, j) => { const [bg, fg] = col(v, i, j); return `<div class="sim-cell" style="background:${bg};color:${fg}">${v.toFixed(2)}</div>`; }).join("")}`).join("")}</div>`;
    $("#simNote").textContent = SIM_NOTES[cur];
    $$("#simTabs .tab").forEach((b) => b.classList.toggle("on", b.dataset.sim === cur));
  };
  $$("#simTabs .tab").forEach((b) => b.addEventListener("click", () => { cur = b.dataset.sim; draw(); }));
  draw();
}

/* ------------------------------------------------------------------ ear */
function buildEar() {
  const D = S.k.duration, P = (t) => `${(Math.min(t, D) / D) * 100}%`;
  const ev = S.k.events.filter((e) => e.start < D);
  const order = ["light_switch", "running_water", "coffee_machine", "vacuum_cleaner"].filter((l) => ev.some((e) => e.label === l));
  let html = `<div class="row-label truth">what happened</div><div class="row-track truth" data-seek>${
    S.k.stages.map((s) => `<i style="left:${P(s.start)};width:calc(${P(s.end)} - ${P(s.start)});background:${STAGE[s.kind].c}">${s.end - s.start > 9 ? `<b>${STAGE[s.kind].name}</b>` : ""}</i>`).join("")}<div class="ph"></div></div>
    <div class="divider"></div>`;
  html += order.map((l) => `<div class="row-label">“${EAR_WORDS[l]}”</div><div class="row-track" data-seek>${
    ev.filter((e) => e.label === l).map((e) => `<i style="left:${P(e.start)};width:max(4px,calc(${P(e.end)} - ${P(e.start)}))" title="${clockT(e.start)}–${clockT(Math.min(e.end, D))}"></i>`).join("")}<div class="ph"></div></div>`).join("");
  $("#earRows").innerHTML = html;
  $$("#earRows [data-seek]").forEach((tr) => tr.addEventListener("click", (e) => {
    const r = tr.getBoundingClientRect();
    activeView = "ear";
    kettle.currentTime = ((e.clientX - r.left) / r.width) * kDur();
    syncKettle();
  }));
}

/* ------------------------------------------------------------------ skills */
function barPanel({ title, sub, rows, max = 1, floor = null, floorLabel = "" }) {
  const W = 400, rowH = 26, top = 8, labelW = 104, H = top + rows.length * rowH + 22;
  const X = (v) => labelW + (v / max) * (W - labelW - 44);
  let b = "";
  rows.forEach((r, i) => {
    const y = top + i * rowH;
    b += `<text x="${labelW - 8}" y="${y + 15}" text-anchor="end" font-size="12" fill="${r.strong ? C.ink : C.muted}" font-weight="${r.strong ? 600 : 400}">${esc(r.label)}</text>`;
    b += `<rect x="${labelW}" y="${y + 4}" width="${Math.max(2, X(r.v) - labelW)}" height="15" rx="2" fill="${r.color}" opacity="${r.strong ? 1 : 0.85}"/>`;
    b += `<text x="${X(r.v) + 6}" y="${y + 15}" font-size="12" font-family="IBM Plex Mono" fill="${C.ink}">${r.v.toFixed(2)}</text>`;
  });
  if (floor != null) {
    b += `<line x1="${X(floor)}" x2="${X(floor)}" y1="${top}" y2="${top + rows.length * rowH}" stroke="${C.ink}" stroke-dasharray="3 3" opacity=".55"/>`;
    b += `<text x="${X(floor) + 4}" y="${H - 6}" font-size="11" fill="${C.muted}">${floorLabel}</text>`;
  }
  b += `<line x1="${labelW}" x2="${labelW}" y1="${top}" y2="${top + rows.length * rowH}" stroke="${C.line}"/>`;
  return `<div class="chart"><p class="chart-title">${title}</p><p class="chart-sub">${sub}</p>${svg(W, H, b, title)}</div>`;
}
function buildSkills() {
  const E = S.results.encoders;
  const rows = (k) => E.map((e) => ({ label: ENC[e.id][0], v: e[k], color: FAM[ENC[e.id][1]] }));
  const count = rows("g1_f2");
  count.push({ label: "Waveform trick", v: S.results.g1.f2_ncc, color: C.ink, strong: true });
  $("#skillsChart").innerHTML = `<div class="skills">${
    barPanel({ title: "Did it notice the change?", sub: "345 clips · 1 is perfect", rows: rows("g1_f1"), floor: 0.192, floorLabel: "luck" })}${
    barPanel({ title: "Could it count the repeats?", sub: "same clips · 1 is perfect", rows: count, floor: 0.13, floorLabel: "luck" })}</div>`;
}

/* ------------------------------------------------------------------ bounce */
let bounceShown = false;
function buildBounce() {
  const a = makeAudio("assets/audio/bouncing_ball.mp3");
  $("#bouncePlay").addEventListener("click", () => { a.currentTime = 0; a.play().catch(() => {}); });
  a.addEventListener("play", () => $("#bouncePlay").classList.add("on"));
  a.addEventListener("ended", () => $("#bouncePlay").classList.remove("on"));
  $("#bounceShow").addEventListener("click", () => {
    bounceShown = !bounceShown;
    $("#bounceShow").textContent = bounceShown ? "hide the answer" : "show the answer";
    $("#bounceAnswer").hidden = !bounceShown;
    drawBounce();
  });
  drawBounce();
}
function drawBounce() {
  const c = S.clips.bouncing_ball, cv = $("#bounceWave");
  drawWave(cv, c.peaks, { color: C.blood, bg: C.card });
  if (!bounceShown) return;
  const g = cv.getContext("2d"), w = cv.clientWidth, h = Number(cv.getAttribute("height"));
  const xs = S.bounce.onsets.map((t) => (t / c.duration) * w), lastX = xs[xs.length - 1];
  let prev = -99;
  xs.forEach((x, i) => {
    g.strokeStyle = C.teal; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x, 14); g.lineTo(x, h); g.stroke();
    const isLast = i === xs.length - 1;
    if (isLast || (x - prev > 16 && lastX - x > 16)) {
      g.fillStyle = C.teal; g.font = "600 11px Inter"; g.textAlign = "center"; g.fillText(i + 1, Math.max(5, x), 11); prev = x;
    }
  });
}

/* ------------------------------------------------------------------ diary */
function buildDiary() {
  const D = S.k.duration, st = S.k.stages;
  $("#diaryStrip").innerHTML = st.map((s) => `<div class="seg" style="width:${((s.end - s.start) / D) * 100}%;background:${STAGE[s.kind].c}">${s.end - s.start > 9 ? STAGE[s.kind].name : ""}</div>`).join("") + `<div class="hl" id="diaryHl"></div>`;
  $("#diaryStrip").addEventListener("click", (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    activeView = "diary"; kettle.currentTime = ((e.clientX - r.left) / r.width) * kDur(); syncKettle();
  });
  const HOW = [
    ["boiling ended − boiling started = 1:39.0 − 0:12.7", 12.7, 99],
    ["the first “switched on” entry", 2.7, 12.7],
    ["the last “switched off” entry", 99, 110],
    ["count the “switched on” entries", 2.7, 12.7],
    ["look up which entry covers 0:30", 12.7, 99],
    ["look up which entry covers 1:45", 99, 110],
    ["switched off − switched on = 1:39.0 − 0:02.7", 2.7, 99],
  ];
  $("#questions").innerHTML = S.k.questions.map((q, i) => `<button class="q" data-q="${i}">${esc(q.q)}<span class="a">${esc(q.answer)}</span><span class="how"></span></button>`).join("");
  $$("#questions .q").forEach((b) => b.addEventListener("click", () => {
    const [how, a, z] = HOW[b.dataset.q];
    b.classList.add("open"); $(".how", b).textContent = how;
    const hl = $("#diaryHl");
    hl.style.left = `${(a / D) * 100}%`; hl.style.width = `${((z - a) / D) * 100}%`; hl.classList.add("on");
  }));
}

/* ------------------------------------------------------------------ memory */
function buildMemory() {
  memoryChart("#memoryChartA", ["af3", "const"], "A week in one home: just ask a big model");
  memoryChart("#memoryChart", ["ours", "af3", "const"], "The same questions, answered from the diary");
}
function memoryChart(target, keys, title) {
  const T = S.results.t1;
  const groups = [
    ["Is it happening?", T.by_type.at], ["How long did it last?", T.by_type.dur], ["Since when?", T.by_type.since],
    ["How long ago was it?", T.by_type.ago], ["How many times?", T.by_type.count], ["All 298 questions", { ours: T.ours, af3: T.af3, const: T.const, n: T.n }, true],
  ];
  const series = [["ours", "The diary", C.teal], ["af3", "Audio Flamingo 3", C.blood], ["const", "Same answer each time", "#c9bca4"]].filter(([k]) => keys.includes(k));
  const W = 640, labelW = 226, bh = 11, gap = 3, gh = series.length * (bh + gap) + 16, top = 34, H = top + groups.length * gh + 4;
  const X = (v) => labelW + v * (W - labelW - 46);
  let b = "";
  series.forEach(([, l, c], i) => {
    const x = labelW + (series.length === 3 ? [0, 100, 236] : [0, 136])[i];
    b += `<rect x="${x}" y="6" width="11" height="11" rx="2" fill="${c}"/><text x="${x + 17}" y="15.5" font-size="12" fill="${C.muted}">${l}</text>`;
  });
  groups.forEach(([label, d, strong], gi) => {
    const y = top + gi * gh;
    if (strong) b += `<line x1="0" x2="${W}" y1="${y - 6}" y2="${y - 6}" stroke="${C.line}"/>`;
    b += `<text x="${labelW - 12}" y="${y + 17}" text-anchor="end" font-size="13" fill="${C.ink}" font-weight="${strong ? 600 : 400}">${label}</text>`;
    b += `<text x="${labelW - 12}" y="${y + 32}" text-anchor="end" font-size="11" fill="${C.faint}">${d.n} questions</text>`;
    series.forEach(([k, , c], si) => {
      const yy = y + si * (bh + gap);
      b += `<rect x="${labelW}" y="${yy}" width="${Math.max(2, X(d[k]) - labelW)}" height="${bh}" rx="2" fill="${c}"/>`;
      b += `<text x="${X(d[k]) + 5}" y="${yy + 9.5}" font-size="11" font-family="IBM Plex Mono" fill="${C.ink}">${d[k].toFixed(2)}</text>`;
    });
  });
  $(target).innerHTML = `<div class="chart"><p class="chart-title">${title}</p>${svg(W, H, b, title)}</div>`;
}

/* ------------------------------------------------------------------ cost */
function buildCost() {
  const E = Object.fromEntries(S.results.encoders.map((e) => [e.id, e]));
  const rows = [
    ["Small AudioSet tagger", E.mn10_as.rtf_1c, C.blood],
    ["EAT (what the Ear is built on)", E.eat_pretrain.rtf_1c, C.teal],
    ["BEATs on its own", E.beats_iter3.rtf_1c, C.teal],
    ["Full diary system", S.results.t4.rtf_1c, C.ink],
  ];
  const fmtT = (h) => { const m = Math.round(h * 60); return m < 60 ? `${m} min` : `${Math.floor(m / 60)} h ${m % 60} min`; };
  const W = 640, labelW = 210, rowH = 44, top = 26, H = top + rows.length * rowH + 20;
  const X = (hrs) => labelW + (hrs / 24) * (W - labelW - 10);
  let b = `<text x="${labelW}" y="14" font-size="11" fill="${C.faint}">0 h</text><text x="${W - 10}" y="14" text-anchor="end" font-size="11" fill="${C.faint}">24 h: a whole day of audio</text>`;
  rows.forEach(([l, rtf, c], i) => {
    const y = top + i * rowH, hrs = rtf * 24;
    b += `<text x="${labelW - 12}" y="${y + 15}" text-anchor="end" font-size="13" fill="${C.ink}">${l}</text>`;
    b += `<rect x="${labelW}" y="${y + 2}" width="${W - labelW - 10}" height="18" rx="3" fill="#f2ece0"/>`;
    b += `<rect x="${labelW}" y="${y + 2}" width="${Math.max(2, X(hrs) - labelW)}" height="18" rx="3" fill="${c}"/>`;
    b += `<text x="${X(hrs) + 8}" y="${y + 15.5}" font-size="12" font-family="IBM Plex Mono" fill="${C.ink}">${fmtT(hrs)} · ${(rtf * 100).toFixed(1)}% of a core</text>`;
  });
  $("#costChart").innerHTML = `<div class="chart"><p class="chart-title">Processor time to listen to one day</p>${svg(W, H, b, "Compute cost per day")}</div>`;
}

/* ------------------------------------------------------------------ appendix */
const FAILURES = [
  ["Synthetic listening drills (RL)", "fail", "drills 0.565 → 0.709; STAR-Bench flat or worse", "Gains on the drills only."],
  ["Same-home self-supervised training", "void", "0.746 → 0.783 on the same home", "That home wasn't held out, so it isn't generalisation."],
  ["Heart-murmur recipe transfer", "inconclusive", "murmur 0.95–0.96, lung 0.885, valve 0.395", "The domain shift broke every method."],
  ["Heads for short kitchen events", "fail", "0.179–0.213 vs linear 0.228", "Limited by data from five kitchens."],
  ["Dasheng on short kitchen events", "fail", "0.388 vs BEATs 0.438", "Self-supervision didn't rescue a small label set."],
  ["Adding AudioSet-Strong labels", "fail", "−0.033 on the target", "The extra labels hurt."],
  ["Re-listen when unsure", "fail", "AUC 0.685 vs Ear 0.869", "No gain from a second look."],
  ["Fine-tune to convergence", "inconclusive", "0.466 [0.423, 0.500] vs frozen 0.438", "Fold-2 validation loss was still falling at epoch 4."],
  ["Counting with embeddings", "fail", "0.00–0.14 vs waveform 0.940", "Kept waveform cross-correlation."],
  ["Novelty alarm", "fail", "40.9 false alarms a day; hit rate 0.51 at 10 dB", "Not usable as an always-on alert."],
];
function buildTables() {
  const E = S.results.encoders;
  const cols = [["params_m", "size (M)", 1, null], ["rtf_1c", "speed", 4, "min"], ["g1_f1", "notice", 3, "max"], ["g1_f2", "count", 2, null],
    ["g1_f4", "describe the change", 3, "max"], ["cremad", "voice emotion", 3, "max"], ["epic_dense", "kitchen", 3, "max"]];
  const best = Object.fromEntries(cols.map(([k, , , m]) => [k, m === "max" ? Math.max(...E.map((e) => e[k])) : m === "min" ? Math.min(...E.map((e) => e[k])) : null]));
  $("#allTable").innerHTML = `<thead><tr><th>listener</th><th>model</th>${cols.map((c) => `<th>${c[1]}</th>`).join("")}</tr></thead><tbody>${
    E.map((e) => `<tr><td>${ENC[e.id][0]}</td><td><code>${e.id}</code></td>${cols.map(([k, , d]) => `<td class="n ${e[k] === best[k] ? "best" : ""}">${e[k].toFixed(d)}</td>`).join("")}</tr>`).join("")}</tbody>`;
  $("#failTable").innerHTML = `<thead><tr><th>idea</th><th>verdict</th><th>number</th><th>note</th></tr></thead><tbody>${
    FAILURES.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody>`;
  $("#srcTable").innerHTML = `<thead><tr><th>recording</th><th>author</th><th>licence</th></tr></thead><tbody>${
    S.sources.map((s) => `<tr><td><a href="${s.url}">${esc(s.title)}</a></td><td>${esc(s.author)}</td><td>${esc(s.license)}</td></tr>`).join("")}</tbody>`;
}

/* ------------------------------------------------------------------ misc */
function wireProgress() {
  const bar = $("#progress");
  const on = () => { const h = document.documentElement.scrollHeight - innerHeight; bar.style.width = `${h > 0 ? (scrollY / h) * 100 : 0}%`; };
  addEventListener("scroll", on, { passive: true }); on();
}
function redrawAll() {
  drawBlind(); drawKettleViews(); drawZoom(); syncSwitchers(); drawTaps(); drawBounce();
}

boot();
