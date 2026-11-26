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
  const run = (sel, fn) => { if ($(sel)) fn(); };
  run("#blind", buildBlind);
  buildKettleViews();
  run("#zoom", buildZoom);
  run("#codecTabs", () => buildSwitcher({ tabs: "#codecTabs", attr: "codec", play: "#codecPlay", canvas: "#codecSpec", meta: "#codecMeta",
    metas: { codec_original: "16,000 numbers a second", codec_8khz: "8,000 numbers a second · phone quality", codec_4khz: "nothing above 4,000 Hz" } }));
  run("#hpssTabs", () => buildSwitcher({ tabs: "#hpssTabs", attr: "stem", play: "#hpssPlay", canvas: "#hpssSpec", meta: "#hpssMeta",
    metas: { hpss_mix: "cup, spoon and hot water · 0:14", hpss_harmonic: "the horizontal stripes: water and room", hpss_percussive: "the vertical lines: spoon and cup" } }));
  run("#taps", buildTaps);
  run("#simTabs", buildSim);
  run("#earRows", buildEar);
  run("#skillsChart", buildSkills);
  run("#bounceWave", buildBounce);
  run("#probeCurve", buildProbe);
  run("#patches", buildPatches);
  run("#tiny", buildTiny);
  run("#flipChart", buildFlip);
  run("#curve", buildCurve);
  run("#realMaps, #selfSim, #repeats", buildReal);
  run("#benchTable", buildBenchTable);
  run("#diaryStrip", buildDiary);
  run("#memoryChart", buildMemory);
  run("#costChart", buildCost);
  run(".bench", buildBenches);
  run("#report", buildReport);
  buildTables();
  wireProgress();
  const plan = $("#plan");
  if (plan) new IntersectionObserver((es, io) => { if (es[0].isIntersecting) { plan.classList.add("go"); io.disconnect(); } }, { threshold: 0.4 }).observe(plan);
  let lastW = innerWidth;
  addEventListener("resize", debounce(() => { if (innerWidth === lastW) return; lastW = innerWidth; redrawAll(); }, 150));
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
  if (!cv.dataset.h) cv.dataset.h = cv.getAttribute("height") || 100;
  const w = cv.clientWidth || 600, h = Number(cv.dataset.h);
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
  if (!el) return;
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
  const g0 = ov.getContext("2d"), w0 = ov.clientWidth, h0 = ov.clientHeight;
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
  count.push({ label: "Waveform match", v: S.results.g1.f2_ncc, color: C.ink, strong: true });
  $("#skillsChart").innerHTML = `<div class="skills">${
    barPanel({ title: "Did it notice the change?", sub: "125 clips · 1 is perfect", rows: rows("g1_f1"), floor: 0.192, floorLabel: "luck" })}${
    barPanel({ title: "Could it find the repeats?", sub: "100 clips, last 50 scored", rows: count, floor: 0.13, floorLabel: "luck" })}</div>`;
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
  const g = cv.getContext("2d"), w = cv.clientWidth, h = cv.clientHeight;
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
  if ($("#memoryChartA")) memoryChart("#memoryChartA", ["af3", "const"], "A week in one home: just ask a big model");
  memoryChart("#memoryChart", ["ours", "af3", "const"], "A week in one home: 298 questions");
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
  if ($("#failTable")) $("#failTable").innerHTML = `<thead><tr><th>idea</th><th>verdict</th><th>number</th><th>note</th></tr></thead><tbody>${
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
  [drawBlind, drawKettleViews, drawZoom, syncSwitchers, drawTaps, drawBounce, drawProbe, drawPatches, drawTiny, drawRealMap, drawSelf, drawRepeats, redrawBenches]
    .forEach((f) => { try { f(); } catch (e) { /* that figure isn't on this page */ } });
}


/* ------------------------------------------------------------------ patches */
const PT = { step: "whole", goal: null, data: null, img: null, hidden: null };
async function buildPatches() {
  PT.data = await json("patches");
  const d = PT.data;
  PT.img = specImage({ b64: d.b64, frames: d.frames, n_mels: d.n_mels });
  let seed = 11; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  PT.hidden = Array.from({ length: d.nF }, () => Array.from({ length: d.nT }, () => rnd() < 0.75));
  $$("#patchSteps .tab").forEach((b) => b.addEventListener("click", () => {
    PT.step = b.dataset.step; if (PT.step !== "hide") PT.goal = null;
    $$("#patchSteps .tab").forEach((x) => x.classList.toggle("on", x === b));
    if ($("#patchGoals")) $("#patchGoals").hidden = PT.step !== "hide";
    $$("#patchGoals .tab").forEach((x) => x.classList.remove("on"));
    drawPatches();
  }));
  $$("#patchGoals .tab").forEach((b) => b.addEventListener("click", () => {
    PT.goal = b.dataset.goal;
    $$("#patchGoals .tab").forEach((x) => x.classList.toggle("on", x === b));
    drawPatches();
  }));
  $$("#patchGoals .tab").forEach((x) => x.classList.remove("on"));
  drawPatches();
}
const CODE_COLORS = ["#7c2b26", "#2f6f5e", "#a8792f", "#3b6ea5", "#7a5aa6", "#b5523b", "#4f8a5b", "#c49a3c", "#5f7f9e", "#8c4f6f", "#6b6b3a", "#38707a"];
const PATCH_NOTES = {
  whole: "The kettle's first 24 seconds as a spectrogram: the click, the heating rumble, and the start of the boil.",
  cut: "Cut into a grid. Each square gets flattened into a list of numbers and becomes one token, like a word in a sentence.",
  hide: "Now hide three quarters of them. Training is a guessing game about the hidden squares. Pick what the model has to guess:",
  redraw: "Dasheng redraws each hidden patch from the ones it can see. Here they're filled with a blurred copy of the real patch, which is roughly what an early, half-trained model manages.",
  code: "BEATs only has to name each hidden patch: which entry in a codebook it is. Patches that look alike share a code, shown by colour and number.",
  teacher: "EAT has to match a teacher: a slowly updated copy of itself that sees every patch. Its target is the teacher's summary of each patch (shown as a single colour) and of the whole clip (the bar underneath).",
};
function drawPatches() {
  const d = PT.data, cv = $("#patchCanvas");
  if (!d || !cv) return;
  const { g, w, h } = sizeCanvas(cv);
  g.fillStyle = C.card; g.fillRect(0, 0, w, h);
  const gap = PT.step === "whole" ? 0 : 3, teacherBar = PT.goal === "teacher" ? 22 : 0;
  const pw = (w - gap * (d.nT - 1)) / d.nT, ph = (h - teacherBar - gap * (d.nF - 1)) / d.nF;
  const tmp = document.createElement("canvas"); tmp.width = 3; tmp.height = 3; const tg = tmp.getContext("2d");
  let sum = [0, 0, 0], n = 0;
  for (let f = 0; f < d.nF; f++) for (let t = 0; t < d.nT; t++) {
    const x = t * (pw + gap), y = f * (ph + gap), sx = t * d.pt, sy = f * d.pf;
    const hid = PT.step === "hide" && PT.hidden[f][t];
    tg.clearRect(0, 0, 3, 3); tg.imageSmoothingEnabled = true; tg.drawImage(PT.img, sx, sy, d.pt, d.pf, 0, 0, 1, 1);
    const px = tg.getImageData(0, 0, 1, 1).data; sum[0] += px[0]; sum[1] += px[1]; sum[2] += px[2]; n++;
    if (!hid) { g.imageSmoothingEnabled = true; g.drawImage(PT.img, sx, sy, d.pt, d.pf, x, y, pw, ph); continue; }
    if (!PT.goal) {
      g.fillStyle = "#2a2723"; g.fillRect(x, y, pw, ph);
      g.fillStyle = "#8c8275"; g.font = `500 ${Math.min(16, pw * 0.5)}px Inter`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("?", x + pw / 2, y + ph / 2);
    } else if (PT.goal === "redraw") {
      tg.drawImage(PT.img, sx, sy, d.pt, d.pf, 0, 0, 3, 3);
      g.imageSmoothingEnabled = true; g.drawImage(tmp, 0, 0, 3, 3, x, y, pw, ph);
      g.strokeStyle = C.peach; g.setLineDash([3, 2]); g.strokeRect(x + 0.5, y + 0.5, pw - 1, ph - 1); g.setLineDash([]);
    } else if (PT.goal === "code") {
      const c = d.codes[f][t]; g.fillStyle = CODE_COLORS[c % CODE_COLORS.length]; g.fillRect(x, y, pw, ph);
      g.fillStyle = "#fff"; g.font = `600 ${Math.min(13, pw * 0.45)}px "IBM Plex Mono"`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(c, x + pw / 2, y + ph / 2);
    } else {
      g.fillStyle = `rgb(${px[0]},${px[1]},${px[2]})`; g.fillRect(x, y, pw, ph);
      g.strokeStyle = C.ink; g.lineWidth = 1.5; g.strokeRect(x + 1, y + 1, pw - 2, ph - 2); g.lineWidth = 1;
    }
  }
  if (teacherBar) {
    const y = h - teacherBar + 6;
    g.fillStyle = `rgb(${Math.round(sum[0] / n)},${Math.round(sum[1] / n)},${Math.round(sum[2] / n)})`; g.fillRect(0, y, w, teacherBar - 6);
    g.fillStyle = "#fff"; g.font = "500 11px Inter"; g.textAlign = "left"; g.textBaseline = "middle"; g.fillText("teacher's summary of the whole clip", 8, y + (teacherBar - 6) / 2);
  }
  $("#patchNote").textContent = PATCH_NOTES[PT.goal || PT.step];
}

/* ------------------------------------------------------------------ tiny model training */
const TINY_COLORS = [C.gold, C.teal, "#3b6ea5", C.blood, "#7a5aa6"];
const TN = { d: null, i: 0, timer: null, view: { sup: null, ssl: null } };
async function buildTiny() {
  TN.d = await json("tiny_training");
  const last = TN.d.sup.snaps.length - 1;
  $("#tinySlider").max = last;
  $("#tinyLegend").innerHTML = TN.d.classes.map((c, i) => `<span><i style="background:${TINY_COLORS[i]}"></i>${esc(c)}</span>`).join("");
  $("#tinySlider").addEventListener("input", (e) => { stopTiny(); TN.i = Number(e.target.value); drawTiny(); });
  $("#tinyPlay").addEventListener("click", () => {
    if (TN.timer) { stopTiny(); return; }
    if (TN.i >= last) TN.i = 0;
    $("#tinyPlay").classList.add("on");
    TN.timer = setInterval(() => { TN.i++; drawTiny(); if (TN.i >= last) stopTiny(); }, 110);
  });
  new IntersectionObserver((es, io) => { if (es[0].isIntersecting && TN.i === 0) { io.disconnect(); $("#tinyPlay").click(); } }, { threshold: 0.5 }).observe($("#tiny"));
  drawTiny();
}
function stopTiny() { clearInterval(TN.timer); TN.timer = null; $("#tinyPlay")?.classList.remove("on"); }
function drawTiny() {
  if (!TN.d) return;
  const steps = 900, nSnap = TN.d.sup.snaps.length;
  const stepNo = TN.i === 0 ? 1 : Math.round((TN.i / (nSnap - 1)) * steps);
  $("#tinySlider").value = TN.i; $("#tinyStep").textContent = `step ${stepNo} of ${steps}`;
  [["sup", "#tinySup", "#tinyLossSup", "guessing the label"], ["ssl", "#tinySsl", "#tinyLossSsl", "redrawing hidden patches"]].forEach(([k, sel, lossSel, what]) => {
    const pts = TN.d[k].snaps[TN.i], cv = $(sel), { g, w, h } = sizeCanvas(cv);
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    pts.forEach(([x, y]) => { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); });
    const tgt = { x0, x1, y0, y1 }, v = TN.view[k] && TN.i > 0 ? TN.view[k] : tgt;
    for (const q of ["x0", "x1", "y0", "y1"]) v[q] = v[q] + (tgt[q] - v[q]) * 0.5;
    TN.view[k] = v;
    const pad = 16, sx = (x) => pad + ((x - v.x0) / (v.x1 - v.x0 || 1)) * (w - 2 * pad), sy = (y) => pad + ((y - v.y0) / (v.y1 - v.y0 || 1)) * (h - 2 * pad);
    g.fillStyle = "#faf6ee"; g.fillRect(0, 0, w, h);
    pts.forEach(([x, y], i) => {
      g.fillStyle = TINY_COLORS[TN.d.labels[i]]; g.globalAlpha = 0.85;
      g.beginPath(); g.arc(sx(x), sy(y), 3.6, 0, 7); g.fill();
    });
    g.globalAlpha = 1;
    $(lossSel).textContent = `${what} · error ${TN.d[k].loss[TN.i].toFixed(3)}`;
  });
}

/* ------------------------------------------------------------------ rank flip */
function buildFlip() {
  const E = S.results.encoders;
  const rank = (k) => [...E].sort((a, b) => b[k] - a[k]).map((e) => e.id);
  const L = rank("epic_dense"), R = rank("cremad");
  const W = 640, top = 46, rowH = 30, H = top + E.length * rowH, xl = 230, xr = 410;
  let b = `<text x="${xl}" y="20" text-anchor="end" font-size="13" font-weight="600" fill="${C.ink}">kitchen events</text>
    <text x="${xr}" y="20" font-size="13" font-weight="600" fill="${C.ink}">emotion in a voice</text>
    <text x="${xl}" y="36" text-anchor="end" font-size="11" fill="${C.faint}">rank 1 at the top</text>
    <text x="${xr}" y="36" font-size="11" fill="${C.faint}">rank 1 at the top</text>`;
  E.forEach((e) => {
    const yl = top + L.indexOf(e.id) * rowH + 10, yr = top + R.indexOf(e.id) * rowH + 10, col = FAM[ENC[e.id][1]];
    b += `<line x1="${xl + 8}" y1="${yl}" x2="${xr - 8}" y2="${yr}" stroke="${col}" stroke-width="2.2" opacity=".75"/>`;
    b += `<circle cx="${xl + 8}" cy="${yl}" r="4" fill="${col}"/><circle cx="${xr - 8}" cy="${yr}" r="4" fill="${col}"/>`;
    b += `<text x="${xl - 4}" y="${yl + 4}" text-anchor="end" font-size="12" fill="${C.ink}">${ENC[e.id][0]} <tspan font-family="IBM Plex Mono" fill="${C.muted}">${e.epic_dense.toFixed(2)}</tspan></text>`;
    b += `<text x="${xr + 4}" y="${yr + 4}" font-size="12" fill="${C.ink}"><tspan font-family="IBM Plex Mono" fill="${C.muted}">${e.cremad.toFixed(2)}</tspan> ${ENC[e.id][0]}</text>`;
  });
  $("#flipChart").innerHTML = `<div class="chart"><p class="chart-title">The same eight listeners, ranked on two tasks</p>${svg(W, H, b, "Rank flip between kitchen events and voice emotion")}</div>`;
}

/* ------------------------------------------------------------------ training curve */
const CURVE = {
  "1e-5": { loss: [0.2467, 0.1501, 0.1338, 0.1382, 0.1256, 0.1242, 0.1210, 0.1193, 0.1188, 0.1235], f1: [0.794, 0.825, 0.849, 0.857, 0.864, 0.869, 0.870, 0.875, 0.875, 0.875], c: "#c9a36a" },
  "3e-5": { loss: [0.2078, 0.1377, 0.1219, 0.1261, 0.1128, 0.1099, 0.1067, 0.1041, 0.1027, 0.1069], f1: [0.831, 0.867, 0.878, 0.884, 0.886, 0.889, 0.891, 0.893, 0.893, 0.894], c: C.teal },
  "1e-4": { loss: [0.1865, 0.1349, 0.1179, 0.1207, 0.1060, 0.1012, 0.0967, 0.0929, 0.0902, 0.0939], f1: [0.860, 0.879, 0.889, 0.895, 0.899, 0.902, 0.904, 0.906, 0.906, 0.906], c: C.blood },
};
let curveE = 9, curveTimer = null;
function buildCurve() {
  $("#curvePlay").addEventListener("click", () => {
    if (curveTimer) { clearInterval(curveTimer); curveTimer = null; $("#curvePlay").classList.remove("on"); return; }
    curveE = 0; drawCurve(); $("#curvePlay").classList.add("on");
    curveTimer = setInterval(() => { curveE++; drawCurve(); if (curveE >= 9) { clearInterval(curveTimer); curveTimer = null; $("#curvePlay").classList.remove("on"); } }, 450);
  });
  new IntersectionObserver((es, io) => { if (es[0].isIntersecting) { io.disconnect(); $("#curvePlay").click(); } }, { threshold: 0.5 }).observe($("#curve"));
  drawCurve();
}
function drawCurve() {
  const W = 640, H = 230, pw = 280, ph = 160, top = 34, gapX = 60;
  const panel = (ox, title, key, lo, hi, fmt) => {
    const X = (e) => ox + 34 + (e / 9) * (pw - 44), Y = (v) => top + ph - ((v - lo) / (hi - lo)) * ph;
    let b = `<text x="${ox}" y="16" font-size="13" font-weight="600" fill="${C.ink}">${title}</text>`;
    for (let i = 0; i <= 4; i++) { const v = lo + ((hi - lo) * i) / 4, y = Y(v);
      b += `<line x1="${ox + 34}" x2="${ox + pw - 10}" y1="${y}" y2="${y}" stroke="${C.line}"/><text x="${ox + 28}" y="${y + 4}" text-anchor="end" font-size="10" font-family="IBM Plex Mono" fill="${C.faint}">${fmt(v)}</text>`; }
    for (let e = 0; e <= 9; e += 3) b += `<text x="${X(e)}" y="${top + ph + 16}" text-anchor="middle" font-size="10" font-family="IBM Plex Mono" fill="${C.faint}">${e}</text>`;
    if (key === "f1") {
      b += `<rect x="${ox + 34}" y="${Y(0.906)}" width="${pw - 44}" height="${Y(0.888) - Y(0.906)}" fill="${C.ink}" opacity=".07"/>`;
      b += `<line x1="${ox + 34}" x2="${ox + pw - 10}" y1="${Y(0.897)}" y2="${Y(0.897)}" stroke="${C.ink}" stroke-dasharray="4 3"/>`;
      b += `<text x="${ox + pw - 10}" y="${Y(0.897) + 14}" text-anchor="end" font-size="10" fill="${C.ink}">held out: 0.897</text>`;
    }
    Object.entries(CURVE).forEach(([lr, d]) => {
      const pts = d[key].slice(0, curveE + 1).map((v, e) => `${X(e)},${Y(v)}`).join(" ");
      b += `<polyline points="${pts}" fill="none" stroke="${d.c}" stroke-width="2.2"/>`;
      const v = d[key][curveE]; b += `<circle cx="${X(curveE)}" cy="${Y(v)}" r="3.5" fill="${d.c}"/>`;
    });
    return b;
  };
  let b = panel(0, "Training loss", "loss", 0.08, 0.26, (v) => v.toFixed(2)) + panel(pw + gapX, "F1 on validation clips", "f1", 0.78, 0.92, (v) => v.toFixed(2));
  b += Object.entries(CURVE).map(([lr, d], i) => `<rect x="${34 + i * 110}" y="${H - 12}" width="10" height="10" rx="2" fill="${d.c}"/><text x="${50 + i * 110}" y="${H - 3}" font-size="11" fill="${C.muted}">rate ${lr}</text>`).join("");
  $("#curveSvg").innerHTML = svg(W, H, b, "Training curves of the Ear");
  $("#curveEpoch").textContent = `epoch ${curveE} of 9`;
}

/* ------------------------------------------------------------------ probe matching (live) */
const PR = { sim: null, hop: 16 };
async function buildProbe() {
  $("#probeThr").addEventListener("input", drawProbe);
  try {
    const buf = await fetch("assets/audio/bouncing_ball.mp3").then((r) => r.arrayBuffer());
    const ab = await new OfflineAudioContext(1, 16000, 16000).decodeAudioData(buf);
    const x = ab.getChannelData(0), sr = 16000;
    let s0 = 0; const thr0 = 0.2 * Math.max(...x.slice(0, sr).map(Math.abs));
    while (s0 < x.length && Math.abs(x[s0]) < thr0) s0++;
    s0 = Math.max(0, s0 - 16);
    const L = Math.round(0.03 * sr), p = x.slice(s0, s0 + L);
    let pn = 0; for (const v of p) pn += v * v; pn = Math.sqrt(pn) || 1;
    const out = [];
    for (let i = 0; i + L < x.length; i += PR.hop) {
      let dot = 0, xn = 0;
      for (let j = 0; j < L; j++) { const v = x[i + j]; dot += v * p[j]; xn += v * v; }
      out.push(Math.max(0, dot / (pn * (Math.sqrt(xn) || 1))));
    }
    PR.sim = out; PR.sr = sr; PR.dur = x.length / sr;
  } catch { $("#probeRead").textContent = "This browser couldn't decode the audio."; }
  drawProbe();
}
function drawProbe() {
  const cv = $("#probeCurve"); if (!cv) return;
  const { g, w, h } = sizeCanvas(cv);
  g.fillStyle = C.card; g.fillRect(0, 0, w, h);
  if (!PR.sim) return;
  const thr = Number($("#probeThr").value) / 100, n = PR.sim.length, c = S.clips.bouncing_ball;
  const X = (i) => ((i * PR.hop) / PR.sr / c.duration) * w, Y = (v) => h - 6 - v * (h - 12);
  g.strokeStyle = C.teal; g.lineWidth = 1.2; g.beginPath();
  PR.sim.forEach((v, i) => (i ? g.lineTo(X(i), Y(v)) : g.moveTo(X(i), Y(v)))); g.stroke();
  g.strokeStyle = C.ink; g.setLineDash([4, 3]); g.beginPath(); g.moveTo(0, Y(thr)); g.lineTo(w, Y(thr)); g.stroke(); g.setLineDash([]);
  const minGap = Math.round((0.03 * PR.sr) / PR.hop), peaks = [];
  for (let i = 1; i < n - 1; i++) {
    const v = PR.sim[i];
    if (v < thr || v < PR.sim[i - 1] || v < PR.sim[i + 1]) continue;
    if (peaks.length && i - peaks[peaks.length - 1] < minGap) { if (v > PR.sim[peaks[peaks.length - 1]]) peaks[peaks.length - 1] = i; continue; }
    peaks.push(i);
  }
  g.fillStyle = C.blood; peaks.forEach((i) => { g.beginPath(); g.arc(X(i), Y(PR.sim[i]), 3.5, 0, 7); g.fill(); });
  $("#probeRead").textContent = `${peaks.length} peak${peaks.length === 1 ? "" : "s"} above the line · the ball really bounced ${S.bounce.onsets.length} times`;
}


/* ------------------------------------------------------------------ real pretrained models */
const RM = { d: null, map: "spectrogram", self: "spectrogram", mode: "peaks", audio: null };
const REAL_NOTES = {
  spectrogram: "No model, just the picture. Pouring sits on its own and the heating runs into the boil, but stirring and tapping are spread out.",
  EAT: "In its two biggest directions EAT looks the messiest of the four, even though in its full space it sorts the windows better than the raw picture. Something other than these five sounds dominates its biggest directions.",
  Dasheng: "Dasheng draws the heating and the boil as one continuous path, which is what they are, and keeps the other three sounds in tight, separate groups.",
  USAD: "USAD also draws the heating flowing into the boil, packs pouring tightly at one edge, and spreads the spoon sounds along the top.",
};
const SELF_NOTES = {
  spectrogram: "Blocks that follow the sound: one while the boil is loudest, another once the roar dulls and the kettle switches off.",
  EAT: "A grid, not blocks: frames that sit at the same spot in their ten-second window look alike, whatever is playing.",
  Dasheng: "The same grid, fainter, with diagonal stripes every ten seconds for the same reason.",
  USAD: "Big blocks every thirty seconds, the size of the windows USAD was fed. Inside each block the effect is weak.",
};
async function buildReal() {
  RM.d = await json("real_models");
  if ($("#realLegend")) $("#realLegend").innerHTML = RM.d.maps.classes.map((c, i) => `<span><i style="background:${TINY_COLORS[i]}"></i>${esc(c)}</span>`).join("");
  if ($("#realTabs")) $$("#realTabs .tab").forEach((b) => b.addEventListener("click", () => { RM.map = b.dataset.m; $$("#realTabs .tab").forEach((x) => x.classList.toggle("on", x === b)); drawRealMap(); }));
  if ($("#simModelTabs")) $$("#simModelTabs .tab").forEach((b) => b.addEventListener("click", () => { RM.self = b.dataset.m; $$("#simModelTabs .tab").forEach((x) => x.classList.toggle("on", x === b)); drawSelf(); }));
  $$("#repMode .tab").forEach((b) => b.addEventListener("click", () => { RM.mode = b.dataset.mode; $$("#repMode .tab").forEach((x) => x.classList.toggle("on", x === b)); drawRepeats(); }));
  if ($("#repeats")) {
  RM.audio = makeAudio("assets/audio/repeats.mp3");
  $("#repPlay").addEventListener("click", () => { if (RM.audio.paused) RM.audio.play().catch(() => {}); else RM.audio.pause(); });
  RM.audio.addEventListener("play", () => { $("#repPlay").classList.add("on"); const tick = () => { drawRepeatHead(); if (!RM.audio.paused) requestAnimationFrame(tick); }; tick(); });
  RM.audio.addEventListener("pause", () => $("#repPlay").classList.remove("on"));
  }
  drawRealMap();
  if ($("#selfSim")) { drawSelf(); wireSelfHover(); }
  if ($("#repeats")) drawRepeats();
}
function drawRealMap() {
  if (!RM.d || !$("#realCanvas")) return;
  const m = RM.d.maps.models[RM.map], y = RM.d.maps.labels, cv = $("#realCanvas"), { g, w, h } = sizeCanvas(cv);
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  m.z.forEach(([a, b]) => { x0 = Math.min(x0, a); x1 = Math.max(x1, a); y0 = Math.min(y0, b); y1 = Math.max(y1, b); });
  const pad = 18, sx = (a) => pad + ((a - x0) / (x1 - x0 || 1)) * (w - 2 * pad), sy = (b) => pad + ((b - y0) / (y1 - y0 || 1)) * (h - 2 * pad);
  g.fillStyle = "#faf6ee"; g.fillRect(0, 0, w, h);
  m.z.forEach(([a, b], i) => { g.fillStyle = TINY_COLORS[y[i]]; g.globalAlpha = 0.85; g.beginPath(); g.arc(sx(a), sy(b), 4, 0, 7); g.fill(); });
  g.globalAlpha = 1;
  $("#realNote").innerHTML = `<b>${Math.round(m.acc * 100)}% of windows sit closest to their own kind.</b> ${esc(REAL_NOTES[RM.map])}`;
}
function drawSelf() {
  if (!RM.d || !$("#selfCanvas")) return;
  const s = RM.d.selfsim.maps[RM.self], cv = $("#selfCanvas");
  const side = Math.min(cv.parentElement.clientWidth || 340, 340);
  cv.style.width = side + "px"; cv.dataset.h = side;
  const { g, w, h } = sizeCanvas(cv);
  const raw = Uint8Array.from(atob(s.b64), (c) => c.charCodeAt(0)), n = s.n, o = document.createElement("canvas");
  o.width = n; o.height = n;
  const x = o.getContext("2d"), img = x.createImageData(n, n), L = lut();
  for (let i = 0; i < n * n; i++) { const c = L[raw[i]]; img.data[i * 4] = c[0]; img.data[i * 4 + 1] = c[1]; img.data[i * 4 + 2] = c[2]; img.data[i * 4 + 3] = 255; }
  x.putImageData(img, 0, 0); g.imageSmoothingEnabled = false; g.drawImage(o, 0, 0, w, h);
  $("#selfNote").textContent = SELF_NOTES[RM.self];
}
function countMarks(c, mode, rate = 25) {
  const med = (a) => { const b = [...a].sort((p, q) => p - q); return b[b.length >> 1]; };
  const m = med(c), mad = med(c.map((v) => Math.abs(v - m))) * 1.4826 || 1e-9;
  const z = c.map((v) => ((v - m) / mad) * (mode === "dips" ? -1 : 1));
  const cand = [];
  for (let i = 1; i < z.length - 1; i++) if (z[i] > 2.5 && z[i] >= z[i - 1] && z[i] >= z[i + 1]) cand.push(i);
  cand.sort((a, b) => z[b] - z[a]);
  const keep = [];
  cand.forEach((i) => { if (keep.every((j) => Math.abs(i - j) > 1.5 * rate)) keep.push(i); });
  return keep.sort((a, b) => a - b);
}
const REP_ROWS = [["USAD", C.teal], ["Dasheng", C.teal], ["EAT", C.teal], ["waveform", C.ink]];
function drawRepeats() {
  if (!RM.d) return;
  const r = RM.d.repeats;
  if (!$("[data-rep]")) {
    $("#repRows").innerHTML = REP_ROWS.map(([k]) => `<div class="rep-row"><div class="rep-head"><b>${k === "waveform" ? "raw waveform" : k}</b><span class="mono" data-count="${k}"></span></div><canvas height="62" data-rep="${k}"></canvas></div>`).join("");
  }
  REP_ROWS.forEach(([k, col]) => {
    const c = r.curves[k], cv = $(`[data-rep="${k}"]`), { g, w, h } = sizeCanvas(cv);
    g.fillStyle = "#faf6ee"; g.fillRect(0, 0, w, h);
    const X = (t) => (t / r.duration) * w;
    g.fillStyle = "rgba(124,43,38,.10)"; g.fillRect(X(r.probe[0]), 0, X(r.probe[1]) - X(r.probe[0]), h);
    r.times.forEach((t) => { g.fillStyle = C.gold; g.beginPath(); g.moveTo(X(t) - 5, 0); g.lineTo(X(t) + 5, 0); g.lineTo(X(t), 7); g.fill(); });
    const lo = Math.min(...c), hi = Math.max(...c), Y = (v) => h - 6 - ((v - lo) / (hi - lo || 1)) * (h - 16);
    g.strokeStyle = col; g.lineWidth = 1.3; g.beginPath();
    c.forEach((v, i) => { const xx = (i / 25 / r.duration) * w; i ? g.lineTo(xx, Y(v)) : g.moveTo(xx, Y(v)); });
    g.stroke();
    const marks = countMarks(c, RM.mode);
    let hits = 0;
    marks.forEach((i) => {
      const t = i / 25, real = r.times.some((tt) => Math.abs(tt - t) < 0.4);
      if (real) hits++;
      g.fillStyle = real ? C.blood : "#9a9183"; g.beginPath(); g.arc(X(t), Y(c[i]), 4, 0, 7); g.fill();
    });
    $(`[data-count="${k}"]`).textContent = `${marks.length} found · ${hits} of 6 real taps`;
  });
}
function drawRepeatHead() {
  if (!RM.d || !RM.audio) return;
  drawRepeats();
  const f = RM.audio.currentTime / RM.d.repeats.duration;
  $$("[data-rep]").forEach((cv) => { const g = cv.getContext("2d"); g.fillStyle = C.blood; g.fillRect(f * cv.clientWidth - 1, 0, 2, cv.clientHeight); });
}


/* ------------------------------------------------------------------ the lab: five objectives */
const LAB = { d: null, st: {} };
const LAB_CODE = {
  labels: { hide: "nothing", loss: ["loss = cross_entropy(guess_label(z), window.label)"] },
  redraw: { hide: "random(patches, 75%)", loss: ["loss = mse(redraw(z, hidden), hidden.pixels)"] },
  code: { hide: "random(patches, 75%)", loss: ["loss = cross_entropy(name_code(z, hidden), codebook[hidden])"] },
  teacher: { hide: "random(patches, 75%)", loss: ["target = teacher(patches)[hidden]   # sees everything", "loss = mse(guess(z, hidden), target)", "teacher.follow(encoder, slowly=0.99)"] },
  expert: { hide: "nothing", loss: ["loss = mse(copy(z), dasheng(window))   # a real model"] },
};
function labCode(goal) {
  const c = LAB_CODE[goal], hideChanged = c.hide === "nothing";
  const line = (t, chg) => `<span class="${chg ? "chg" : ""}">${esc(t)}${chg ? '  <b class="arrow">◀</b>' : ""}</span>`;
  return [
    line("for window in kitchen_sounds:", false),
    line("    patches = cut_into_patches(window)   # 8 of them", false),
    line(`    hidden  = ${c.hide}`, hideChanged),
    line("    z = encoder(patches, hide=hidden)    # two numbers", false),
    ...c.loss.map((t) => line("    " + t, true)),
    line("    loss.backward(); optimizer.step()", false),
  ].join("\n");
}
function benchPatch(cv, goal) {
  const d = PT.data; if (!d || !cv) return;
  const { g, w, h } = sizeCanvas(cv);
  g.fillStyle = C.card; g.fillRect(0, 0, w, h);
  const bar = 20, gap = 2, ph = (h - bar - 4 - gap * (d.nF - 1)) / d.nF, pw = (w - gap * (d.nT - 1)) / d.nT;
  const hideOn = !["labels", "expert"].includes(goal);
  const tmp = document.createElement("canvas"); tmp.width = 3; tmp.height = 3; const tg = tmp.getContext("2d");
  let sum = [0, 0, 0], n = 0;
  for (let f = 0; f < d.nF; f++) for (let t = 0; t < d.nT; t++) {
    const x = t * (pw + gap), y = f * (ph + gap), sx = t * d.pt, sy = f * d.pf, hid = hideOn && PT.hidden[f][t];
    tg.clearRect(0, 0, 3, 3); tg.drawImage(PT.img, sx, sy, d.pt, d.pf, 0, 0, 1, 1);
    const px = tg.getImageData(0, 0, 1, 1).data; sum[0] += px[0]; sum[1] += px[1]; sum[2] += px[2]; n++;
    if (!hid) { g.imageSmoothingEnabled = true; g.drawImage(PT.img, sx, sy, d.pt, d.pf, x, y, pw, ph); continue; }
    if (goal === "redraw") {
      tg.drawImage(PT.img, sx, sy, d.pt, d.pf, 0, 0, 3, 3); g.drawImage(tmp, 0, 0, 3, 3, x, y, pw, ph);
      g.strokeStyle = C.peach; g.setLineDash([3, 2]); g.strokeRect(x + 0.5, y + 0.5, pw - 1, ph - 1); g.setLineDash([]);
    } else if (goal === "code") {
      const c = d.codes[f][t]; g.fillStyle = CODE_COLORS[c % CODE_COLORS.length]; g.fillRect(x, y, pw, ph);
      g.fillStyle = "#fff"; g.font = `600 ${Math.min(11, pw * 0.45)}px "IBM Plex Mono"`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(c, x + pw / 2, y + ph / 2);
    } else {
      g.fillStyle = `rgb(${px[0]},${px[1]},${px[2]})`; g.fillRect(x, y, pw, ph);
      g.strokeStyle = C.ink; g.lineWidth = 1.2; g.strokeRect(x + 1, y + 1, pw - 2, ph - 2); g.lineWidth = 1;
    }
  }
  const y = h - bar; g.font = "500 11px Inter"; g.textBaseline = "middle"; g.textAlign = "left";
  const seg = (x0, x1, col, txt) => { g.fillStyle = col; g.fillRect(x0, y, x1 - x0 - 2, bar); g.fillStyle = "#fff"; g.fillText(txt, x0 + 6, y + bar / 2); };
  if (goal === "labels") { const cut = (12.7 / 24) * w; seg(0, cut, C.gold, "label: kettle heating"); seg(cut, w, C.teal, "label: kettle boiling"); }
  else if (goal === "expert") seg(0, w, C.ink, "target: what the real Dasheng outputs for each window");
  else if (goal === "teacher") seg(0, w, `rgb(${Math.round(sum[0] / n)},${Math.round(sum[1] / n)},${Math.round(sum[2] / n)})`, "the teacher sees every patch; its view of the hidden ones is the target");
  else if (goal === "code") seg(0, w, "#5f5a52", "target: the code word of each hidden patch, from a small codebook");
  else seg(0, w, "#5f5a52", "target: the hidden patches themselves, pixel by pixel");
}
async function buildBenches() {
  const benches = $$(".bench"); if (!benches.length) return;
  if (!PT.data) {
    PT.data = await json("patches");
    PT.img = specImage({ b64: PT.data.b64, frames: PT.data.frames, n_mels: PT.data.n_mels });
    let seed = 11; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    PT.hidden = Array.from({ length: PT.data.nF }, () => Array.from({ length: PT.data.nT }, () => rnd() < 0.75));
  }
  LAB.d = await json("lab");
  if ($("#labLegend")) $("#labLegend").innerHTML = LAB.d.classes.map((c, i) => `<span><i style="background:${TINY_COLORS[i]}"></i>${esc(c)}</span>`).join("");
  benches.forEach((el) => {
    const goal = el.dataset.bench, run = LAB.d.runs[goal], last = run.frames.length - 1;
    const st = (LAB.st[goal] = { i: 0, timer: null, view: null, el, run, last });
    $(".bench-code", el).innerHTML = labCode(goal);
    const sl = $("input[type=range]", el), btn = $(".bench-ctl .play", el);
    sl.max = last;
    sl.addEventListener("input", () => { stopBench(st); st.i = Number(sl.value); drawBench(goal); });
    btn.addEventListener("click", () => {
      if (st.timer) { stopBench(st); return; }
      if (st.i >= last) { st.i = 0; st.view = null; }
      btn.classList.add("on");
      st.timer = setInterval(() => { st.i++; drawBench(goal); if (st.i >= last) stopBench(st); }, 90);
    });
    new IntersectionObserver((es, io) => { if (es[0].isIntersecting) { io.disconnect(); if (st.i === 0) btn.click(); } }, { threshold: 0.55 }).observe(el);
    benchPatch($(".bench-patch", el), goal);
    drawBench(goal);
  });
}
function stopBench(st) { clearInterval(st.timer); st.timer = null; $(".bench-ctl .play", st.el).classList.remove("on"); }
function drawBench(goal) {
  const st = LAB.st[goal]; if (!st) return;
  const pts = st.run.frames[st.i], cv = $(".bench-map", st.el), { g, w, h } = sizeCanvas(cv);
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  pts.forEach(([x, y]) => { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); });
  const tgt = { x0, x1, y0, y1 }, v = st.view && st.i > 0 ? st.view : { ...tgt };
  for (const q of ["x0", "x1", "y0", "y1"]) v[q] += (tgt[q] - v[q]) * 0.45;
  st.view = v;
  const pad = 14, sx = (x) => pad + ((x - v.x0) / (v.x1 - v.x0 || 1)) * (w - 2 * pad), sy = (y) => pad + ((y - v.y0) / (v.y1 - v.y0 || 1)) * (h - 2 * pad);
  g.fillStyle = "#faf6ee"; g.fillRect(0, 0, w, h);
  pts.forEach(([x, y], i) => { g.fillStyle = TINY_COLORS[LAB.d.labels[i]]; g.globalAlpha = 0.85; g.beginPath(); g.arc(sx(x), sy(y), 3.6, 0, 7); g.fill(); });
  g.globalAlpha = 1;
  const step = Math.round((st.i / st.last) * LAB.d.steps);
  $(".bench-step", st.el).textContent = `step ${step} of ${LAB.d.steps}`;
  $("input[type=range]", st.el).value = st.i;
  $(".bench-score", st.el).innerHTML = st.i >= st.last
    ? `<b>${Math.round(st.run.acc * 100)}%</b> of new windows land closest to their own kind.`
    : `training… error ${st.run.loss[st.i].toFixed(3)}`;
}
function redrawBenches() { Object.keys(LAB.st).forEach((g) => { benchPatch($(".bench-patch", LAB.st[g].el), g); drawBench(g); }); }

/* ------------------------------------------------------------------ report card */
function buildReport() {
  const E = Object.fromEntries(S.results.encoders.map((e) => [e.id, e])), M = S.similarity.matrices;
  const rows = [
    ["The recipe", "no training", "dsp_rich"], ["AudioSet tagger", "labels, plus copying a bigger model", "mn10_as"],
    ["Dasheng", "redraw what's hidden", "dasheng_base"], ["BEATs", "name the code", "beats_iter3"],
    ["EAT", "match a teacher", "eat_pretrain"], ["USAD", "copy two experts", "usad2_small"],
  ];
  const cols = [
    ["china vs metal", "lower = hears the difference", (id) => (M[id] ? M[id][0][3] : null), "min"],
    ["kitchen events", "EPIC-SOUNDS", (id) => E[id].epic_dense, "max"],
    ["emotion in a voice", "CREMA-D", (id) => E[id].cremad, "max"],
    ["notices a change", "125 clips", (id) => E[id].g1_f1, "max"],
    ["size", "million parameters", (id) => E[id].params_m, null],
  ];
  const cell = (v, col) => {
    if (v == null) return `<td class="rc-na">not measured</td>`;
    if (!col[3]) return `<td class="rc-n">${v < 1 ? "0" : v.toFixed(v < 10 ? 1 : 0)}</td>`;
    const vals = rows.map((r) => col[2](r[2])).filter((x) => x != null), lo = Math.min(...vals), hi = Math.max(...vals);
    let t = (v - lo) / (hi - lo || 1); if (col[3] === "min") t = 1 - t;
    const bg = `rgba(47,111,94,${(0.08 + t * 0.72).toFixed(2)})`;
    return `<td class="rc-n" style="background:${bg};color:${t > 0.6 ? "#fff" : C.ink}">${v.toFixed(2)}</td>`;
  };
  $("#report").innerHTML = `<p class="chart-title">The report card</p><div class="table-scroll"><table class="rc"><thead><tr><th>listener</th><th>trained by</th>${cols.map((c) => `<th>${c[0]}<small>${c[1]}</small></th>`).join("")}</tr></thead><tbody>${
    rows.map(([name, how, id]) => `<tr><td><b>${name}</b></td><td class="rc-how">${how}</td>${cols.map((c) => cell(c[2](id), c)).join("")}</tr>`).join("")}</tbody></table></div>`;
}


/* ------------------------------------------------------------------ every-moment map: hover readout */
function wireSelfHover() {
  const cv = $("#selfCanvas"); if (!cv || cv.dataset.hover) return; cv.dataset.hover = 1;
  cv.addEventListener("mousemove", (e) => {
    if (!RM.d) return;
    const s = RM.d.selfsim.maps[RM.self], r = cv.getBoundingClientRect(), n = s.n;
    const i = Math.min(n - 1, Math.floor(((e.clientY - r.top) / r.height) * n)), j = Math.min(n - 1, Math.floor(((e.clientX - r.left) / r.width) * n));
    const raw = (RM.raw = RM.raw || {}), key = RM.self;
    if (!raw[key]) raw[key] = Uint8Array.from(atob(s.b64), (c) => c.charCodeAt(0));
    const v = raw[key][i * n + j] / 255, dur = RM.d.selfsim.duration;
    const word = v > 0.8 ? "very alike" : v > 0.55 ? "fairly alike" : v > 0.3 ? "somewhat different" : "very different";
    $("#selfNote").textContent = `${clock((i / n) * dur)} and ${clock((j / n) * dur)}: ${word} to ${RM.self === "spectrogram" ? "the raw spectrogram" : RM.self}.`;
  });
  cv.addEventListener("mouseleave", () => { $("#selfNote").textContent = SELF_NOTES[RM.self]; });
}

/* ------------------------------------------------------------------ rebuilt counting test */
async function buildBenchTable() {
  const d = await json("repeats_bench"), R = d.results;
  const rules = [["peaks", "last", "original rule", "#c9bca4"], ["dips", "last", "count the dips", C.teal], ["onset", "last, position removed", "match the start, position removed", C.blood]];
  const rows = [["Dasheng", "Dasheng"], ["USAD", "USAD"], ["EAT", "EAT"], ["raw spectrogram", "spectrogram"]];
  const W = 640, labelW = 130, bh = 11, gap = 3, gh = rules.length * (bh + gap) + 14, top = 34, H = top + rows.length * gh + 40;
  const X = (v) => labelW + v * (W - labelW - 50);
  let b = rules.map(([, , l, c], i) => `<rect x="${labelW + [0, 120, 250][i]}" y="6" width="11" height="11" rx="2" fill="${c}"/><text x="${labelW + [0, 120, 250][i] + 16}" y="15.5" font-size="12" fill="${C.muted}">${l}</text>`).join("");
  rows.forEach(([label, key], gi) => {
    const y = top + gi * gh;
    b += `<text x="${labelW - 10}" y="${y + 19}" text-anchor="end" font-size="13" fill="${C.ink}">${label}</text>`;
    rules.forEach(([rule, layer, , c], ri) => {
      const res = (R[`${key} ${layer}`] || R[`${key} last`])[rule], yy = y + ri * (bh + gap);
      const note = layer !== "last" && !R[`${key} ${layer}`] ? "*" : "";
      b += `<rect x="${labelW}" y="${yy}" width="${Math.max(2, X(res.acc) - labelW)}" height="${bh}" rx="2" fill="${c}"/>`;
      b += `<text x="${X(res.acc) + 5}" y="${yy + 9.5}" font-size="11" font-family="IBM Plex Mono" fill="${C.ink}">${res.acc.toFixed(2)}${note}</text>`;
    });
  });
  const wy = top + rows.length * gh, wv = R.waveform.peaks.acc;
  b += `<text x="${labelW - 10}" y="${wy + 10}" text-anchor="end" font-size="13" fill="${C.ink}">raw waveform</text>`;
  b += `<rect x="${labelW}" y="${wy + 1}" width="${X(wv) - labelW}" height="${bh}" rx="2" fill="${C.ink}"/><text x="${X(wv) + 5}" y="${wy + 10.5}" font-size="11" font-family="IBM Plex Mono" fill="${C.ink}">${wv.toFixed(2)}</text>`;
  const cx = X(d.chance_exact);
  b += `<line x1="${cx}" x2="${cx}" y1="${top - 4}" y2="${wy + 16}" stroke="${C.ink}" stroke-dasharray="4 3" opacity=".6"/><text x="${cx + 4}" y="${wy + 30}" font-size="11" fill="${C.muted}">guessing the most common count (${d.chance_exact.toFixed(2)})</text>`;
  $("#benchTable").innerHTML = `<div class="chart"><p class="chart-title">Counting repeats, rebuilt: three rules, the same models</p>${svg(W, H, b, "Rebuilt counting test")}<p class="chart-sub" style="margin-top:6px">* USAD is barely affected by window position and the spectrogram not at all, so their third bar matches the start without removing anything.</p></div>`;
}

boot();
