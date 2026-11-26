/* Wireframe interactions for the tea cut.
   Every number is loaded from assets/data, generated from tinker-proj results
   and Freesound recordings. No prose lives here. */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const fmt = (n, d = 3) => Number(n).toFixed(d);
const pct = (n) => `${Math.round(n * 100)}%`;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const clock = (s) => {
  s = Math.max(0, s || 0);
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
};
const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };

const FAMILY_COLOR = {
  dsp: "#a8792f", cnn_distilled: "#7c2b26",
  vit_universal_ssl: "#2f6f5e", vit_mae: "#2f6f5e", vit_ssl: "#2f6f5e", vit_unit_ssl: "#2f6f5e",
};
const FAMILY_LABEL = {
  dsp: "DSP", cnn_distilled: "AudioSet CNN",
  vit_universal_ssl: "SSL ViT", vit_mae: "SSL ViT", vit_ssl: "SSL ViT", vit_unit_ssl: "SSL ViT",
};
const fcolor = (f) => FAMILY_COLOR[f] || "#2f6f5e";
const flabel = (f) => FAMILY_LABEL[f] || "SSL ViT";

const CLIP_NAMES = ["kettle", "cup_spoon", "stir", "pour", "codec_original", "codec_8khz",
  "codec_4khz", "hpss_mix", "hpss_harmonic", "hpss_percussive", "bouncing_ball", "making_tea",
  "reference"];
const MINI = [
  ["kettle", "Electric kettle", "1:50"],
  ["cup_spoon", "Cup and spoon", "0:14"],
  ["stir", "Spoon stirring", "0:30"],
  ["pour", "Water pour", "0:04"],
];

const state = {
  results: null, kettle: null, taps: null, similarity: null, sources: null,
  timeline: null, bounce: null, manifest: null, clips: {}, clip: "kettle",
  simModel: "dsp_rich", codec: "codec_original", selectedEncoder: "mn10_as",
};

/* ---------------------------------------------------------------- loading */
async function boot() {
  const [results, kettle, taps, similarity, sources, timeline, bounce, manifest] = await Promise.all([
    fetch("assets/data/results.json").then((r) => r.json()),
    fetch("assets/data/kettle.json").then((r) => r.json()),
    fetch("assets/data/taps.json").then((r) => r.json()),
    fetch("assets/data/similarity.json").then((r) => r.json()),
    fetch("assets/data/sources.json").then((r) => r.json()),
    fetch("assets/data/timeline.json").then((r) => r.json()),
    fetch("assets/data/bouncing_onsets.json").then((r) => r.json()),
    fetch("assets/data/manifest.json").then((r) => r.json()),
  ]);
  Object.assign(state, { results, kettle, taps, similarity, sources, timeline, bounce, manifest });

  const loaded = await Promise.all(CLIP_NAMES.map((n) =>
    fetch(`assets/data/${n}.json`).then((r) => r.json())
  ));
  loaded.forEach((c) => (state.clips[c.name] = c));

  buildRail();
  buildHero();
  buildDesk();
  buildMiniClips();
  buildDock();
  buildRecognition();
  buildCause();
  buildPhysics();
  buildRegime();
  buildCodec();
  buildTaps();
  buildSimilarity();
  buildMixer();
  buildG1();
  buildBounce();
  buildF2();
  buildMemory();
  buildHomeSlice();
  buildKettleQuestions();
  buildPrediction();
  buildCremad();
  buildCost();
  buildFailures();
  buildNext();
  buildSources();
  buildAllTable();
  wireScroll();
  wireKeys();
}

/* ---------------------------------------------------------------- rail / scroll */
function buildRail() {
  const rail = document.createElement("nav");
  rail.className = "rail";
  rail.setAttribute("aria-label", "Sections");
  const items = [
    ["s01", "01 recording"], ["s02", "02 recognition"], ["s03", "03 signal"],
    ["s04", "04 resolution"], ["s05", "05 similarity"], ["s06", "06 separation"],
    ["s07", "07 detection"], ["s08", "08 recurrence"], ["s09", "09 memory"],
    ["s10", "10 prediction"], ["s11", "11 speech"], ["s12", "12 cost"],
    ["s13", "13 failures"], ["s14", "14 next"], ["s15", "15 reproduce"],
    ["appendix", "appendix"],
  ];
  rail.innerHTML = items.map(([id, l]) => `<a href="#${id}" data-for="${id}">${l}</a>`).join("");
  document.body.appendChild(rail);
  const links = $$("a", rail);
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) links.forEach((l) => l.classList.toggle("on", l.dataset.for === e.target.id));
  }), { rootMargin: "-20% 0px -70% 0px" });
  items.forEach(([id]) => { const s = document.getElementById(id); if (s) io.observe(s); });
}

function wireScroll() {
  const bar = $("#progress");
  const on = () => {
    const h = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = `${h > 0 ? (scrollY / h) * 100 : 0}%`;
  };
  addEventListener("scroll", on, { passive: true });
  on();
}

function wireKeys() {
  addEventListener("keydown", (e) => {
    if (e.code !== "Space") return;
    const tag = document.activeElement?.tagName;
    if (["INPUT", "SELECT", "TEXTAREA", "BUTTON"].includes(tag)) return;
    e.preventDefault(); togglePlay();
  });
}

/* ---------------------------------------------------------------- audio core */
let audio, heroBase, deskBase;

function redrawHeroWave() {
  const cv = $("#heroWave");
  drawWave(cv, state.kettle.peaks, "#6fbfa8", "#171614", "rgba(241,234,220,.10)");
  heroBase = snapshot(cv);
}

function buildHero() {
  redrawHeroWave();
  $("#heroPlay").addEventListener("click", () => { togglePlay(); });
  $("#heroReveal").addEventListener("click", revealHero);
  $("#heroWave").addEventListener("click", (e) => seekOn($("#heroWave"), e));
  addEventListener("scroll", debounce(() => {
    if ($("#heroListen").getBoundingClientRect().bottom > 0) {
      redrawHeroWave();
      progressWaves();
    }
  }, 200));
}

function revealHero() {
  const el = $("#heroLabel");
  el.textContent = "an electric kettle, coming to the boil";
  el.classList.remove("blind");
  $("#heroReveal").textContent = "that is the whole trick";
  $("#heroReveal").disabled = true;
}

function buildDesk() {
  audio = new Audio("assets/audio/kettle.mp3");
  audio.preload = "metadata";
  audio.addEventListener("timeupdate", syncAll);
  audio.addEventListener("seeked", syncAll);
  audio.addEventListener("play", () => setPlaying(true));
  audio.addEventListener("pause", () => setPlaying(false));
  audio.addEventListener("ended", () => setPlaying(false));
  audio.addEventListener("loadedmetadata", syncAll);

  $("#playBtn").addEventListener("click", togglePlay);
  $("#wave").addEventListener("click", seekMain);
  $("#wave").addEventListener("mousemove", hoverMain);
  $("#wave").addEventListener("mouseleave", () => ($("#hoverTime").style.opacity = 0));
  $$(".clip-switch .chip").forEach((b) => b.addEventListener("click", () => loadClip(b.dataset.clip)));

  drawDesk();
  addEventListener("resize", debounce(() => {
    redrawHeroWave();
    drawDesk();
    progressWaves();
  }, 150));
}

function drawDesk() {
  const c = clip();
  drawWave($("#wave"), c.peaks, "#6fbfa8", "#171614", "rgba(241,234,220,.10)");
  deskBase = snapshot($("#wave"));
  drawSpec($("#spec"), c.spec);
  drawStages(c);
  drawLane(c);
  $("#clipLabel").textContent = c.label;
  $("#deskFoot").textContent = `${clock(c.duration)} · 16 kHz · ${c.events.length} predicted episode${c.events.length === 1 ? "" : "s"} · ${c.stages.length} annotated state${c.stages.length === 1 ? "" : "s"}`;
}

function clip(name = state.clip) { return state.clips[name]; }

function loadClip(name, play = false) {
  const was = play || !audio.paused;
  state.clip = name;
  audio.src = `assets/audio/${name}.mp3`;
  audio.load();
  $$(".clip-switch .chip").forEach((b) => b.classList.toggle("active", b.dataset.clip === name));
  $$(".mini").forEach((m) => m.classList.toggle("active", m.dataset.clip === name));
  drawDesk();
  $("#dockLabel").textContent = `${name.replaceAll("_", " ")} · ${clip().label.toLowerCase()}`;
  if (was) audio.play().catch(() => {});
  syncAll();
}

function togglePlay() {
  if (audio.paused) audio.play().catch(() => {});
  else audio.pause();
}

function setPlaying(on) {
  $$("#playBtn, #heroPlay, #dockPlay").forEach((b) => {
    b.classList.toggle("playing", on);
    const label = b.querySelector("span:last-child");
    if (label && (b.id === "playBtn" || b.id === "heroPlay")) label.textContent = on ? "Pause" : "Play";
  });
}

function seekOn(canvas, e) {
  const r = canvas.getBoundingClientRect();
  const f = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
  audio.currentTime = f * (audio.duration || clip().duration || state.kettle.duration);
  syncAll();
}

function seekMain(e) { seekOn($("#wave"), e); }

function hoverMain(e) {
  const r = $("#wave").getBoundingClientRect();
  const f = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
  const tip = $("#hoverTime");
  tip.style.opacity = 1; tip.style.left = `${f * 100}%`;
  tip.textContent = clock(f * (audio.duration || state.kettle.duration));
}

function syncAll() {
  const d = audio.duration || clip().duration;
  const t = audio.currentTime || 0;
  const f = d > 0 ? Math.min(1, t / d) : 0;
  $("#playhead").style.left = `${f * 100}%`;
  $("#dockProgress").style.width = `${f * 100}%`;
  const stamp = `${clock(t)} / ${clock(d)}`;
  $("#dockTime").textContent = stamp;
  const heroTime = $("#heroTime");
  if (heroTime) heroTime.textContent = stamp;
  const active = clip().events.filter((e) => t >= e.start && t <= e.end);
  const label = active.length ? [...new Set(active.map((e) => e.text || e.label))].join(" · ") : "—";
  $("#nowEvent").textContent = label;
  $("#dockNow").textContent = label;
  const stage = clip().stages.find((s) => t >= s.start && t <= s.end);
  $("#timelineNow").textContent = stage ? `${stage.label} · ${clock(t)}` : `— · ${clock(t)}`;
  progressWaves(f);
}

function progressWaves(f) {
  if (!audio) return;
  const d = audio.duration || clip().duration || 0;
  const played = f == null ? (d > 0 ? Math.min(1, (audio.currentTime || 0) / d) : 0) : f;
  paintPlayed($("#heroWave"), heroBase, state.kettle.peaks, played);
  paintPlayed($("#wave"), deskBase, clip().peaks, played);
}

/* Recolor peaks in the played region. A full-height fill would hide the wave. */
function paintPlayed(cv, base, peaks, f) {
  if (!cv || !base || !peaks) return;
  const dpr = window.devicePixelRatio || 1;
  const w = cv.width / dpr;
  const h = cv.height / dpr;
  const g = cv.getContext("2d");
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.drawImage(base, 0, 0, w, h);
  if (!(f > 0)) return;
  const playedW = w * Math.min(1, f);
  g.save();
  g.beginPath();
  g.rect(0, 0, playedW, h);
  g.clip();
  const n = peaks.hi.length;
  const mid = h / 2;
  const amp = h * 0.44;
  const barW = Math.max(1, w / n);
  g.fillStyle = "#f3a27f";
  for (let i = 0; i < n; i++) {
    const x = (i / n) * w;
    if (x > playedW) break;
    const y1 = mid + (peaks.lo[i] / 127) * amp;
    const y2 = mid + (peaks.hi[i] / 127) * amp;
    g.fillRect(x, Math.min(y1, y2), barW, Math.max(1, Math.abs(y2 - y1)));
  }
  g.restore();
}

function drawWave(cv, peaks, color, bg, midline = "rgba(241,234,220,.12)") {
  const dpr = window.devicePixelRatio || 1;
  const w = cv.clientWidth || 800, h = cv.clientHeight || 120;
  cv.width = w * dpr; cv.height = h * dpr;
  const g = cv.getContext("2d");
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.fillStyle = bg; g.fillRect(0, 0, w, h);
  const n = peaks.hi.length, mid = h / 2, amp = h * 0.44;
  g.fillStyle = color;
  for (let i = 0; i < n; i++) {
    const x = (i / n) * w;
    const y1 = mid + (peaks.lo[i] / 127) * amp;
    const y2 = mid + (peaks.hi[i] / 127) * amp;
    g.fillRect(x, Math.min(y1, y2), Math.max(1, w / n), Math.max(1, Math.abs(y2 - y1)));
  }
  g.strokeStyle = midline; g.beginPath(); g.moveTo(0, mid); g.lineTo(w, mid); g.stroke();
}

function snapshot(cv) {
  const o = document.createElement("canvas");
  o.width = cv.width; o.height = cv.height;
  o.getContext("2d").drawImage(cv, 0, 0);
  return o;
}

function drawSpec(cv, spec) {
  const dpr = window.devicePixelRatio || 1;
  const w = cv.clientWidth || 800, h = cv.clientHeight || 118;
  cv.width = w * dpr; cv.height = h * dpr;
  const g = cv.getContext("2d");
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.fillStyle = "#171614"; g.fillRect(0, 0, w, h);
  const raw = Uint8Array.from(atob(spec.b64), (c) => c.charCodeAt(0));
  const nF = spec.frames, nM = spec.n_mels;
  const off = document.createElement("canvas"); off.width = nF; off.height = nM;
  const octx = off.getContext("2d");
  const img = octx.createImageData(nF, nM);
  const lut = specLUT();
  for (let y = 0; y < nM; y++) for (let x = 0; x < nF; x++) {
    const c = lut[raw[y * nF + x]], k = (y * nF + x) * 4;
    img.data[k] = c[0]; img.data[k + 1] = c[1]; img.data[k + 2] = c[2]; img.data[k + 3] = 255;
  }
  octx.putImageData(img, 0, 0);
  g.imageSmoothingEnabled = true;
  g.drawImage(off, 0, 0, w, h);
  g.strokeStyle = "rgba(241,234,220,.10)"; g.setLineDash([2, 4]);
  [0.25, 0.5, 0.75].forEach((f) => { g.beginPath(); g.moveTo(0, h * f); g.lineTo(w, h * f); g.stroke(); });
  g.setLineDash([]);
}

let _lut = null;
function specLUT() {
  if (_lut) return _lut;
  _lut = [];
  const stops = [[0, [23, 22, 20]], [0.28, [43, 48, 44]], [0.5, [47, 111, 94]], [0.72, [168, 121, 47]], [0.88, [232, 165, 120]], [1, [250, 240, 214]]];
  for (let i = 0; i < 256; i++) {
    const t = i / 255; let a = stops[0], b = stops[stops.length - 1];
    for (let j = 0; j < stops.length - 1; j++) if (t >= stops[j][0] && t <= stops[j + 1][0]) { a = stops[j]; b = stops[j + 1]; break; }
    const u = (t - a[0]) / (b[0] - a[0] || 1);
    _lut.push(a[1].map((v, k) => Math.round(v + (b[1][k] - v) * u)));
  }
  return _lut;
}

/* stage strip */
const STAGE_COLOR = { off: "#3b362d", heat: "#a8792f", boil: "#2f6f5e" };
function drawStages(c) {
  const strip = $("#stageStrip");
  if (!c.stages.length) { strip.innerHTML = ""; strip.style.display = "none"; return; }
  strip.style.display = "flex";
  strip.innerHTML = c.stages.map((s) => {
    const w = ((s.end - s.start) / c.duration) * 100;
    return `<div class="stage" style="width:${w}%;border-color:${STAGE_COLOR[s.kind] || "#3b362d"}">
      <span class="mono" style="color:${STAGE_COLOR[s.kind] || "#a49b8b"}">${esc(s.label)}</span>
      ${w > 7 ? `<em class="mono">${clock(s.start)}–${clock(s.end)}</em>` : ""}</div>`;
  }).join("");
}

/* event lane */
function drawLane(c) {
  const lane = $("#lane");
  if (!c.events.length) { lane.innerHTML = `<p class="mono" style="color:#a49b8b;padding:8px 0">no predictions for this clip</p>`; return; }
  const labels = [...new Set(c.events.map((e) => e.text || e.label))].sort();
  lane.innerHTML = labels.map((l) => {
    const bars = c.events.filter((e) => (e.text || e.label) === l).map((e) => {
      const left = (e.start / c.duration) * 100;
      const width = Math.max(0.6, ((Math.min(e.end, c.duration) - e.start) / c.duration) * 100);
      return `<i class="lane-bar" style="left:${left}%;width:${width}%" data-t="${e.start}" title="${esc(l)} · ${e.start.toFixed(1)}–${e.end.toFixed(1)}s"></i>`;
    }).join("");
    return `<div class="lane-row"><span class="lbl">${esc(l)}</span><span class="lane-track">${bars}</span></div>`;
  }).join("");
  $$(".lane-bar", lane).forEach((b) => b.addEventListener("click", () => {
    audio.currentTime = Number(b.dataset.t); syncAll();
  }));
}

/* mini clips */
function buildMiniClips() {
  const wrap = $("#miniClips");
  wrap.innerHTML = MINI.map(([name, title, dur]) => `
    <div class="mini ${name === state.clip ? "active" : ""}" data-clip="${name}">
      <div class="mini-head"><b>${title}</b><span class="mono">${dur}</span></div>
      <canvas height="34" data-wave="${name}"></canvas>
      <button data-load="${name}">load into desk →</button>
    </div>`).join("");
  MINI.forEach(([name]) => drawWave(wrap.querySelector(`[data-wave="${name}"]`), state.clips[name].peaks, "#7c2b26", "#fbf7ee", "rgba(27,25,22,.12)"));
  $$("[data-load]", wrap).forEach((b) => b.addEventListener("click", () => {
    loadClip(b.dataset.load, true);
    document.getElementById("desk").scrollIntoView({ behavior: "smooth", block: "center" });
  }));
}

/* dock */
function buildDock() {
  drawWave($("#dockWave"), state.kettle.peaks, "#6fbfa8", "#171614");
  $("#dockPlay").addEventListener("click", togglePlay);
  $("#dockWave").addEventListener("click", (e) => seekOn($("#dockWave"), e));
  const io = new IntersectionObserver(([e]) => {
    $("#dock").classList.toggle("on", !e.isIntersecting && e.boundingClientRect.top < 0);
  }, { threshold: 0 });
  io.observe($("#hero"));
}

/* ---------------------------------------------------------------- recognition */
function buildRecognition() {
  const ev = state.kettle.events;
  const by = {};
  ev.forEach((e) => {
    const k = e.text || e.label;
    by[k] = by[k] || { p: 0, dur: 0 };
    by[k].p = Math.max(by[k].p, e.p);
    by[k].dur += (e.end - e.start);
  });
  const rows = Object.entries(by).sort((a, b) => b[1].p - a[1].p);
  $("#earTags").innerHTML = rows.map(([k, v]) => `
    <div class="ear-tag"><span>${esc(k)}</span><em class="mono">${v.p.toFixed(2)}</em></div>`).join("");

  // timeline: human states on top, ear rows below
  const c = state.kettle;
  const w = 1000, labelW = 150, barY = 24, barH = 24, rowStart = 96, rowH = 25;
  const labels = rows.map(([k]) => k);
  const h = rowStart + labels.length * rowH + 10;
  const X = (t) => labelW + (t / c.duration) * (w - labelW - 20);
  let b = `<text x="10" y="14" class="svg-mono" fill="#7c2b26">human states</text>`;
  c.stages.forEach((s) => {
    const x = X(s.start), ww = X(s.end) - x;
    b += `<rect x="${x}" y="${barY}" width="${ww}" height="${barH}" fill="${STAGE_COLOR[s.kind]}" opacity=".86" rx="1"/>`;
    if (ww > 40) b += `<text x="${x + 5}" y="${barY + barH + 14}" class="svg-small" fill="#6f675c">${esc(s.label)}</text>`;
  });
  b += `<text x="10" y="82" class="svg-mono" fill="#2f6f5e">Ear v1 labels</text>`;
  labels.forEach((l, i) => {
    const y = rowStart + i * rowH;
    b += `<text x="${labelW - 8}" y="${y + 11}" text-anchor="end" class="svg-small">${esc(l)}</text>`;
    b += `<line x1="${labelW}" y1="${y + 8}" x2="${w - 20}" y2="${y + 8}" stroke="#eee4d2"/>`;
    c.events.filter((e) => (e.text || e.label) === l).forEach((e) => {
      const x = X(e.start), ww = Math.max(1.5, X(Math.min(e.end, c.duration)) - x);
      b += `<rect x="${x}" y="${y}" width="${ww}" height="15" fill="#2f6f5e" opacity=".8" rx="1"><title>${esc(l)} · ${clock(e.start)}–${clock(e.end)}</title></rect>`;
    });
  });
  $("#tagTimeline").innerHTML = svgWrap(w, h, b, "Human states versus ear labels");
}

/* Play a few seconds, then reveal the human name. The ear label is already in the file. */
let causeAudio;
let causeToken = 0;
function buildCause() {
  causeAudio = new Audio();
  const names = ["kettle", "pour", "cup_spoon"];
  const frame = $("#causeFrame");
  if (!frame) return;
  frame.innerHTML = names.map((name) => {
    const c = state.clips[name];
    const ear = c.events[0];
    const heard = ear ? `${ear.text} · ${ear.p.toFixed(2)}` : "—";
    return `<div class="cause" data-cause="${name}">
      <button type="button" class="mini-play" data-cause-play="${name}"><span class="play-icon"></span> play 3 s</button>
      <span class="ear">${esc(heard)}</span>
      <span class="human">${esc(c.label)}</span>
      <button type="button" class="reveal" data-cause-reveal>reveal</button>
    </div>`;
  }).join("");
  $$("[data-cause-play]", frame).forEach((b) => b.addEventListener("click", () => playCause(b.dataset.causePlay)));
  $$("[data-cause-reveal]", frame).forEach((b) => b.addEventListener("click", () => {
    const row = b.closest(".cause");
    const on = row.classList.toggle("revealed");
    b.textContent = on ? "hide" : "reveal";
  }));
}

function playCause(name) {
  const c = state.clips[name];
  const start = c.events[0] ? Math.max(0, c.events[0].start) : 0;
  const token = ++causeToken;
  causeAudio.pause();
  causeAudio.src = `assets/audio/${name}.mp3`;
  const go = () => {
    if (token !== causeToken) return;
    const dur = causeAudio.duration || c.duration;
    causeAudio.currentTime = Math.min(start, Math.max(0, dur - 0.05));
    causeAudio.play().catch(() => {});
    const slice = Math.min(3, Math.max(0.3, dur - causeAudio.currentTime));
    setTimeout(() => { if (token === causeToken) causeAudio.pause(); }, slice * 1000);
  };
  causeAudio.addEventListener("loadedmetadata", go, { once: true });
  causeAudio.load();
}

/* ---------------------------------------------------------------- physics */
function buildPhysics() {
  const cards = [
    ["kettle", "Sustained · boiling", "broadband · slow decay", "kettle"],
    ["pour", "Turbulent · pouring", "broadband · no pitch", "pour"],
    ["cup_spoon", "Transient · spoon and cup", "short · material resonances", "cup"],
  ];
  $("#physicsCards").innerHTML = cards.map(([name, title, sub, label]) => `
    <div class="physics card" data-clip="${name}">
      <p class="eyebrow">${label}</p>
      <h3>${title}</h3>
      <p class="mono phys-sub">${sub}</p>
      <canvas height="56" data-p="${name}"></canvas>
      <canvas height="70" data-s="${name}"></canvas>
      <button class="mini-play" data-play="${name}"><span class="play-icon"></span> hear it</button>
    </div>`).join("");
  cards.forEach(([name]) => {
    drawWave($(`[data-p="${name}"]`), state.clips[name].peaks, "#7c2b26", "#fbf7ee", "rgba(27,25,22,.12)");
    drawSpec($(`[data-s="${name}"]`), state.clips[name].spec);
  });
  $$("[data-play]").forEach((b) => b.addEventListener("click", () => loadClip(b.dataset.play, true)));
}

function buildRegime() {
  const host = $("#regimeBar");
  if (!host) return;
  const k = state.kettle;
  const secs = (n) => (Math.round(n * 10) / 10).toFixed(1);
  host.innerHTML = `<div class="regime-bar">${k.stages.map((s) => {
    const w = ((s.end - s.start) / k.duration) * 100;
    return `<div class="regime-seg" style="width:${w}%;background:${STAGE_COLOR[s.kind] || "#3b362d"}" title="${esc(s.label)} · ${secs(s.end - s.start)} s"></div>`;
  }).join("")}</div>
  <div class="regime-legend mono">${k.stages.map((s) =>
    `<span><i style="background:${STAGE_COLOR[s.kind] || "#3b362d"}"></i>${esc(s.label)} ${secs(s.end - s.start)} s</span>`
  ).join("")}</div>`;
}

/* ---------------------------------------------------------------- codec */
let codecAudio;
function buildCodec() {
  codecAudio = new Audio("assets/audio/codec_original.mp3");
  const draw = () => {
    const d = state.clips[state.codec];
    drawWave($("#codecWave"), d.peaks, "#7c2b26", "#fbf7ee", "rgba(27,25,22,.12)");
    $("#codecMeta").textContent = { codec_original: "128 kbps · 16 kHz", codec_8khz: "32 kbps · 8 kHz", codec_4khz: "4 kHz low-pass" }[state.codec];
  };
  draw();
  $("#codecPlay").addEventListener("click", () => {
    if (codecAudio.paused) codecAudio.play().catch(() => {});
    else codecAudio.pause();
  });
  $$("#codecTabs .tab").forEach((b) => b.addEventListener("click", () => {
    const was = !codecAudio.paused, t = codecAudio.currentTime;
    state.codec = b.dataset.codec;
    $$("#codecTabs .tab").forEach((x) => x.classList.toggle("active", x === b));
    codecAudio.src = `assets/audio/${state.codec}.mp3`;
    codecAudio.load();
    const go = () => { codecAudio.currentTime = Math.min(t, 19); if (was) codecAudio.play().catch(() => {}); };
    codecAudio.addEventListener("loadedmetadata", go, { once: true });
    draw();
  }));
}

/* ---------------------------------------------------------------- taps + similarity */
let tapAudio;
function buildTaps() {
  tapAudio = new Audio();
  const labels = state.taps.labels;
  $("#taps").innerHTML = state.taps.clips.map((c, i) => `
    <div class="tap card" data-tap="${c.name}">
      <div class="tap-head"><span class="mono">${String.fromCharCode(65 + i)}</span><b>${esc(labels[i])}</b></div>
      <canvas height="42" data-tapwave="${c.name}"></canvas>
      <button class="mini-play" data-tapplay="${c.name}"><span class="play-icon"></span> play</button>
    </div>`).join("");
  state.taps.clips.forEach((c) => drawWave($(`[data-tapwave="${c.name}"]`), state.taps.peaks[c.name], "#7c2b26", "#fbf7ee", "rgba(27,25,22,.12)"));
  $$("[data-tapplay]").forEach((b) => b.addEventListener("click", () => {
    tapAudio.src = `assets/audio/${b.dataset.tapplay}.mp3`;
    tapAudio.currentTime = 0;
    tapAudio.play().catch(() => {});
  }));
}

function buildSimilarity() {
  const draw = () => {
    const M = state.similarity.matrices[state.simModel];
    const labels = state.similarity.labels;
    if (!M) { $("#simMatrix").innerHTML = `<p class="bracket">matrix unavailable</p>`; return; }
    const flat = M.flat();
    const lo = Math.min(...flat), hi = Math.max(...flat);
    const color = (v) => {
      const t = (v - lo) / (hi - lo || 1);
      const a = [244, 239, 228], b = [124, 43, 38];
      return `rgb(${a.map((x, i) => Math.round(x + (b[i] - x) * t)).join(",")})`;
    };
    let html = `<div class="sim-grid" style="grid-template-columns:88px repeat(4,1fr)">`;
    html += `<div></div>${labels.map((l) => `<div class="sim-head mono">${esc(l)}</div>`).join("")}`;
    M.forEach((row, i) => {
      html += `<div class="sim-row-label mono">${esc(labels[i])}</div>`;
      row.forEach((v, j) => {
        const t = (v - lo) / (hi - lo || 1);
        html += `<div class="sim-cell" style="background:${color(v)};color:${t > 0.6 ? "#f4efe4" : "#1b1916"}">${v.toFixed(2)}</div>`;
      });
    });
    html += `</div>`;
    $("#simMatrix").innerHTML = html;
    const notes = {
      dsp_rich: "DSP separates the metal bowl furthest (0.55) and keeps the two mug taps closest (0.96).",
      beats_iter3: "BEATs keeps the mug pair closest (0.98), but every pair is above 0.87: the matrix is compressed.",
      eat_pretrain: "EAT is nearly flat (0.96–0.99): clip-mean embeddings of 0.75 s transients lose material identity.",
      usad2_small: "USAD keeps the mug pair closest (0.97) and spreads the rest more than EAT, less than DSP.",
    };
    $("#simTitle").textContent = { dsp_rich: "DSP baseline", beats_iter3: "BEATs iter3", eat_pretrain: "EAT pretrain", usad2_small: "USAD2-small" }[state.simModel];
    $("#simNote").textContent = `[NOTE — ${notes[state.simModel]} Colour is within-matrix rank; numbers are cosine. All four taps loudness-normalised before embedding.]`;
    $$("#simTabs .tab").forEach((b) => b.classList.toggle("active", b.dataset.sim === state.simModel));
  };
  $$("#simTabs .tab").forEach((b) => b.addEventListener("click", () => { state.simModel = b.dataset.sim; draw(); }));
  draw();
}

/* ---------------------------------------------------------------- mixer */
const mixerAudios = {};
const mixerState = { mix: true, harmonic: true, percussive: true };
function buildMixer() {
  const stems = [
    ["hpss_mix", "mixture", "all causes"],
    ["hpss_harmonic", "harmonic", "water + room"],
    ["hpss_percussive", "percussive", "spoon + cup"],
  ];
  $("#stems").innerHTML = stems.map(([name, title, sub]) => `
    <div class="stem" data-stem="${name}">
      <div class="stem-head">
        <div><b>${title}</b><span class="mono">${sub}</span></div>
        <button class="toggle on" data-mute="${name}">on</button>
      </div>
      <canvas height="44" data-stemwave="${name}"></canvas>
    </div>`).join("");
  stems.forEach(([name]) => {
    const a = new Audio(`assets/audio/${name}.mp3`);
    a.preload = "metadata"; a.loop = false;
    mixerAudios[name] = a;
    drawWave($(`[data-stemwave="${name}"]`), state.clips[name].peaks, "#2f6f5e", "#fbf7ee", "rgba(27,25,22,.12)");
  });
  $$("[data-mute]").forEach((b) => b.addEventListener("click", () => {
    const k = b.dataset.mute;
    mixerState[k] = !mixerState[k];
    mixerAudios[k].volume = mixerState[k] ? 1 : 0;
    b.textContent = mixerState[k] ? "on" : "muted";
    b.classList.toggle("on", mixerState[k]);
  }));
  $("#mixerPlay").addEventListener("click", () => {
    const any = Object.values(mixerAudios).some((a) => !a.paused);
    if (any) { Object.values(mixerAudios).forEach((a) => a.pause()); $("#mixerPlay").classList.remove("playing"); $("#mixerPlay span:last-child").textContent = "Play mix"; return; }
    const t = 0;
    Object.values(mixerAudios).forEach((a) => { a.currentTime = t; a.volume = 1; a.play().catch(() => {}); });
    $("#mixerPlay").classList.add("playing"); $("#mixerPlay span:last-child").textContent = "Pause";
  });
}

/* ---------------------------------------------------------------- charts */
function svgWrap(w, h, body, label = "") {
  return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(label)}">${body}</svg>`;
}
function arrow(x1, y1, x2, y2, color = "#9a9183") {
  return `<defs><marker id="ar${x1}${y1}" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="${color}"/></marker></defs>
  <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="1.4" marker-end="url(#ar${x1}${y1})"/>`;
}
function box(x, y, w, h, fill, stroke) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="${fill}" stroke="${stroke}"/>`;
}
function hBars(items, opts) {
  const {
    w = 1000, rowH = 30, labelW = 190, pad = 16, max = 1,
    valueFmt = (v) => fmt(v, 3), color = () => "#7c2b26",
    chance = null, chanceLabel = "", sort = true,
  } = opts;
  const data = sort ? [...items].sort((a, b) => b.value - a.value) : items;
  const h = pad * 2 + data.length * rowH + 26;
  const plotW = w - labelW - 78;
  let b = "";
  for (let i = 0; i <= 4; i++) {
    const x = labelW + (i / 4) * plotW;
    b += `<line x1="${x}" y1="${pad}" x2="${x}" y2="${h - 26}" stroke="#e4dac7"/>`;
    b += `<text x="${x}" y="${h - 8}" text-anchor="middle" class="svg-mono" fill="#9a9183">${valueFmt((i / 4) * max)}</text>`;
  }
  data.forEach((d, i) => {
    const y = pad + i * rowH;
    const bw = Math.max(1.5, (d.value / max) * plotW);
    b += `<text x="${labelW - 10}" y="${y + 15}" text-anchor="end" class="svg-label">${esc(d.label)}</text>`;
    b += `<rect x="${labelW}" y="${y + 5}" width="${bw}" height="${rowH - 12}" fill="${color(d)}" rx="1"/>`;
    b += `<text x="${labelW + bw + 7}" y="${y + 16}" class="svg-mono" fill="#6f675c">${valueFmt(d.value)}</text>`;
  });
  if (chance != null) {
    const x = labelW + (chance / max) * plotW;
    b += `<line x1="${x}" y1="${pad - 4}" x2="${x}" y2="${h - 26}" stroke="#7c2b26" stroke-dasharray="3 3"/>`;
    b += `<text x="${x + 4}" y="${pad - 6}" class="svg-mono" fill="#7c2b26">${chanceLabel || "chance"}</text>`;
  }
  return svgWrap(w, h, b, opts.aria || "");
}

function buildG1() {
  const encs = state.results.encoders;
  const metrics = [
    { key: "g1_f1", label: "F1 · change", chance: 0.2, note: "5-way" },
    { key: "g1_f2", label: "F2 · count", chance: 0.1, note: "exact count" },
    { key: "g1_f4", label: "F4 · properties", chance: 0.5, note: "joint" },
  ];
  const w = 1000, h = 330;
  let b = "";
  metrics.forEach((m, ci) => {
    const x0 = ci * 340 + 10, plotX = x0 + 92, plotW = 190;
    b += `<text x="${x0}" y="18" class="svg-mono" fill="#7c2b26">${m.label}</text>`;
    b += `<text x="${x0}" y="34" class="svg-small">${m.note} · chance ${m.chance}</text>`;
    b += `<line x1="${plotX + m.chance * plotW}" y1="44" x2="${plotX + m.chance * plotW}" y2="${h - 26}" stroke="#7c2b26" stroke-dasharray="3 3"/>`;
    [...encs].sort((a, z) => z[m.key] - a[m.key]).forEach((e, i) => {
      const y = 54 + i * 32, bw = Math.max(1, e[m.key] * plotW);
      b += `<text x="${plotX - 8}" y="${y + 12}" text-anchor="end" class="svg-small">${e.id}</text>`;
      b += `<rect x="${plotX}" y="${y + 2}" width="${bw}" height="15" fill="${fcolor(e.family)}" opacity=".9" rx="1"/>`;
      b += `<text x="${plotX + bw + 5}" y="${y + 14}" class="svg-mono" fill="#6f675c">${fmt(e[m.key], 3)}</text>`;
    });
  });
  $("#g1Chart").innerHTML = svgWrap(w, h, b, "G1 results by encoder");
}

function buildF2() {
  const items = state.results.encoders.map((e) => ({ label: e.id, value: e.g1_f2, family: e.family }));
  items.push({ label: "waveform NCC", value: 0.94, family: "dsp" });
  $("#f2Chart").innerHTML = hBars(items, {
    w: 520, max: 1, rowH: 26, labelW: 110,
    color: (d) => d.label === "waveform NCC" ? "#1b1916" : fcolor(d.family),
    aria: "Counting recurrence by encoder",
  });
}

/* ---------------------------------------------------------------- bounce */
let bounceAudio;
function buildBounce() {
  bounceAudio = new Audio("assets/audio/bouncing_ball.mp3");
  drawBounce(true);
  $("#bounceHide").addEventListener("click", () => {
    state.bounceHidden = !state.bounceHidden;
    $("#bounceHide").textContent = state.bounceHidden ? "show onsets" : "hide onsets";
    drawBounce(!state.bounceHidden);
  });
  $("#bouncePlay").addEventListener("click", () => {
    if (bounceAudio.paused) bounceAudio.play().catch(() => {});
    else bounceAudio.pause();
  });
}
function drawBounce(show) {
  const c = state.clips.bouncing_ball;
  const cv = $("#bounceWave");
  drawWave(cv, c.peaks, "#7c2b26", "#fbf7ee", "rgba(27,25,22,.12)");
  if (!show) return;
  const g = cv.getContext("2d"), dpr = window.devicePixelRatio || 1;
  const w = cv.width / dpr, h = cv.height / dpr;
  g.strokeStyle = "#2f6f5e"; g.lineWidth = 1;
  state.bounce.onsets.forEach((t) => {
    const x = (t / c.duration) * w;
    g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke();
  });
}

/* ---------------------------------------------------------------- memory */
function buildMemory() {
  const c = state.kettle;
  const w = 1000, h = 150, labelW = 10, X = (t) => labelW + (t / c.duration) * (w - 20);
  let b = "";
  c.stages.forEach((s) => {
    const x = X(s.start), ww = X(s.end) - x;
    b += `<rect x="${x}" y="20" width="${ww}" height="46" fill="${STAGE_COLOR[s.kind]}" opacity=".9" rx="2"/>`;
    if (ww > 80) b += `<text x="${x + 8}" y="49" class="svg-small" fill="#f4efe4">${esc(s.label)}</text>`;
    b += `<text x="${x + 4}" y="82" class="svg-mono" fill="#6f675c">${clock(s.start)}</text>`;
  });
  // ticks
  for (let m = 0; m <= 110; m += 20) {
    b += `<line x1="${X(m)}" y1="92" x2="${X(m)}" y2="100" stroke="#c9bca4"/>`;
    b += `<text x="${X(m)}" y="116" text-anchor="middle" class="svg-mono" fill="#9a9183">${clock(m)}</text>`;
  }
  b += `<line x1="${X(0)}" y1="96" x2="${X(110)}" y2="96" stroke="#c9bca4"/>`;
  $("#kettleTimeline").innerHTML = svgWrap(w, 130, b, "Kettle state timeline");

  const t = state.results.t1;
  const types = Object.entries(t.by_type).map(([k, v]) => ({ label: k, ours: v.ours, af3: v.af3, n: v.n }));
  const w2 = 1000, rowH = 34, labelW2 = 120, plotW = 700, h2 = 60 + types.length * rowH + 40;
  let b2 = "";
  b2 += `<text x="16" y="18" class="svg-mono" fill="#7c2b26">overall · n = ${t.n}</text>`;
  [["ours", t.ours, "#2f6f5e"], ["AF3", t.af3, "#7c2b26"], ["constant", t.const, "#c9bca4"]].forEach(([l, v, col], i) => {
    const y = 30 + i * 24;
    b2 += `<text x="${labelW2 - 8}" y="${y + 12}" text-anchor="end" class="svg-small">${l}</text>`;
    b2 += `<rect x="${labelW2}" y="${y + 3}" width="${v * plotW}" height="14" fill="${col}" rx="1"/>`;
    b2 += `<text x="${labelW2 + v * plotW + 6}" y="${y + 14}" class="svg-mono" fill="#6f675c">${fmt(v, 3)}</text>`;
  });
  const y0 = 118;
  b2 += `<text x="16" y="${y0 - 8}" class="svg-mono" fill="#7c2b26">by question type</text>`;
  types.forEach((d, i) => {
    const y = y0 + i * rowH;
    b2 += `<text x="${labelW2 - 8}" y="${y + 13}" text-anchor="end" class="svg-small">${d.label} · n=${d.n}</text>`;
    b2 += `<rect x="${labelW2}" y="${y + 2}" width="${d.ours * plotW}" height="11" fill="#2f6f5e" rx="1"/>`;
    b2 += `<rect x="${labelW2}" y="${y + 16}" width="${d.af3 * plotW}" height="8" fill="#7c2b26" opacity=".8" rx="1"/>`;
    b2 += `<text x="${labelW2 + d.ours * plotW + 6}" y="${y + 11}" class="svg-mono" fill="#6f675c">${fmt(d.ours, 3)}</text>`;
  });
  $("#memoryBars").innerHTML = svgWrap(w2, h2, b2, "Long-horizon memory accuracy");
}

let homeAudio;
function buildHomeSlice() {
  const c = state.clips.reference;
  const host = $("#homeLanes");
  if (!c || !host) return;
  homeAudio = new Audio("assets/audio/reference.mp3");
  homeAudio.preload = "metadata";
  $("#homeLabel").textContent = c.label;
  drawWave($("#homeWave"), c.peaks, "#7c2b26", "#fbf7ee", "rgba(27,25,22,.12)");
  const win = state.timeline.reference_window;
  const left = (win.start / state.timeline.duration) * 100;
  const width = ((win.end - win.start) / state.timeline.duration) * 100;
  $("#homePos").innerHTML = `<i style="left:${left}%;width:${width}%"></i>`;
  const bars = (events, cls) => events.map((e) => {
    const x = (e.start / c.duration) * 100;
    const w = Math.max(0.4, ((Math.min(e.end, c.duration) - e.start) / c.duration) * 100);
    return `<i class="${cls}" style="left:${x}%;width:${w}%" title="${esc(e.label)} · ${e.start.toFixed(1)}–${e.end.toFixed(1)}s"></i>`;
  }).join("");
  host.innerHTML = `
    <div class="home-lane"><span class="mono">predicted</span><span class="lane-track">${bars(c.pred, "pred")}</span></div>
    <div class="home-lane"><span class="mono">annotated</span><span class="lane-track">${bars(c.gt, "gt")}</span></div>`;
  $("#homeMeta").textContent = `${c.label} · ${c.pred.length} predicted · ${c.gt.length} annotated · ${clock(c.duration)}`;
  const btn = $("#homePlay");
  const setHome = (on) => {
    btn.classList.toggle("playing", on);
    btn.querySelector("span:last-child").textContent = on ? "Pause" : "Play";
  };
  btn.addEventListener("click", () => {
    if (homeAudio.paused) homeAudio.play().catch(() => {});
    else homeAudio.pause();
  });
  homeAudio.addEventListener("play", () => setHome(true));
  homeAudio.addEventListener("pause", () => setHome(false));
  homeAudio.addEventListener("ended", () => setHome(false));
}

function buildKettleQuestions() {
  const qs = state.kettle.questions;
  const wrap = $("#kettleQuestions");
  wrap.innerHTML = qs.map((q, i) => `
    <div class="q" data-i="${i}">
      <p>${esc(q.q)}</p>
      <span class="ans">${esc(q.answer)}</span>
      <button>reveal</button>
    </div>`).join("");
  $$(".q", wrap).forEach((row) => {
    row.querySelector("button").addEventListener("click", () => {
      const on = row.classList.toggle("revealed");
      row.querySelector("button").textContent = on ? "hide" : "reveal";
      $("#qProgress").textContent = `${$$(".q.revealed", wrap).length} / ${qs.length} revealed`;
    });
  });
}

/* ---------------------------------------------------------------- prediction */
function buildPrediction() {
  const c = state.kettle;
  const w = 1000, h = 70, X = (t) => 10 + (t / c.duration) * (w - 20);
  let b = "";
  b += `<rect x="${X(0)}" y="12" width="${X(90) - X(0)}" height="34" fill="#dcebe4" stroke="#2f6f5e"/>`;
  b += `<rect x="${X(90)}" y="12" width="${X(110) - X(90)}" height="34" fill="#f0dfda" stroke="#7c2b26" stroke-dasharray="3 3"/>`;
  b += `<text x="${X(4)}" y="34" class="svg-small">known: 0:00–1:30</text>`;
  b += `<text x="${X(92)}" y="34" class="svg-small" fill="#7c2b26">hidden: 1:30–1:50</text>`;
  b += `<text x="${X(0)}" y="62" class="svg-mono" fill="#9a9183">0:00</text>`;
  b += `<text x="${X(90)}" y="62" text-anchor="middle" class="svg-mono" fill="#9a9183">1:30</text>`;
  b += `<text x="${X(110)}" y="62" text-anchor="end" class="svg-mono" fill="#9a9183">1:50</text>`;
  $("#predictKnown").innerHTML = svgWrap(w, h, b, "Known and hidden regions");
  $$("[data-pred]").forEach((btn) => btn.addEventListener("click", () => {
    const out = $("#predictOut");
    if (btn.dataset.pred === "switches off") {
      out.textContent = "correct — the auto-off click is at 1:39, then silence.";
      out.style.background = "#2f6f5e";
    } else {
      out.textContent = `not what happened — the kettle ${btn.dataset.pred}, but it switches off at 1:39.`;
      out.style.background = "#7c2b26";
    }
  }));
}

/* ---------------------------------------------------------------- speech */
function buildCremad() {
  const items = state.results.encoders.map((e) => ({ label: e.id, value: e.cremad, family: e.family }));
  $("#cremadChart").innerHTML = hBars(items, {
    w: 520, max: 0.8, rowH: 26, labelW: 110, chance: 0.167, chanceLabel: "chance 0.167",
    color: (d) => fcolor(d.family), aria: "CREMA-D emotion accuracy",
  });
}

/* ---------------------------------------------------------------- cost */
function buildCost() {
  const encs = state.results.encoders;
  const sel = $("#calcEncoder");
  sel.innerHTML = encs.map((e) => `<option value="${e.id}" ${e.id === "mn10_as" ? "selected" : ""}>${e.id}</option>`).join("");
  const beats = encs.find((e) => e.id === "beats_iter3");
  const calc = () => {
    const hours = Number($("#hours").value);
    const e = encs.find((x) => x.id === sel.value);
    $("#hoursOut").textContent = hours;
    const coreHours = e.rtf_1c * hours * 30.4;
    $("#coreHours").textContent = coreHours < 10 ? coreHours.toFixed(1) : Math.round(coreHours);
    $("#shareCore").textContent = `${((coreHours / (24 * 30.4)) * 100).toFixed(1)}%`;
    $("#vsBeats").textContent = `${(beats.rtf_1c / e.rtf_1c).toFixed(1)}×`;
  };
  $("#hours").addEventListener("input", calc);
  sel.addEventListener("change", calc);
  calc();

  const w = 1000, rowH = 28, labelW = 150, plotW = 760, h = 30 + encs.length * rowH + 24;
  let b = "";
  const max = Math.max(...encs.map((e) => e.s_per_audio_h_1c));
  [...encs].sort((a, z) => a.s_per_audio_h_1c - z.s_per_audio_h_1c).forEach((e, i) => {
    const y = 20 + i * rowH, bw = Math.max(2, Math.sqrt(e.s_per_audio_h_1c / max) * plotW);
    b += `<text x="${labelW - 8}" y="${y + 15}" text-anchor="end" class="svg-small">${e.id}</text>`;
    b += `<rect x="${labelW}" y="${y + 5}" width="${bw}" height="16" fill="${fcolor(e.family)}" rx="1"/>`;
    b += `<text x="${labelW + bw + 6}" y="${y + 17}" class="svg-mono" fill="#6f675c">${e.s_per_audio_h_1c} s</text>`;
  });
  $("#costChart").innerHTML = svgWrap(w, h, b, "Wall seconds per audio hour");

  buildFrontier();
  buildProfileTable();
}

function buildFrontier() {
  const encs = state.results.encoders;
  const w = 1000, h = 400, padL = 64, padR = 30, padT = 30, padB = 48;
  const xs = (p) => Math.log10(p + 1), xmax = Math.log10(100);
  const ymin = Math.log10(0.0003), ymax = Math.log10(0.08);
  const X = (p) => padL + (xs(p) / xmax) * (w - padL - padR);
  const Y = (r) => padT + (1 - (Math.log10(r) - ymin) / (ymax - ymin)) * (h - padT - padB);
  let b = "";
  [0, 0.5, 1, 5, 10, 25, 50, 100].forEach((p) => {
    const x = X(p);
    b += `<line x1="${x}" y1="${padT}" x2="${x}" y2="${h - padB}" stroke="#e4dac7"/>`;
    b += `<text x="${x}" y="${h - padB + 18}" text-anchor="middle" class="svg-mono" fill="#9a9183">${p}M</text>`;
  });
  [0.001, 0.003, 0.01, 0.03, 0.07].forEach((r) => {
    const y = Y(r);
    b += `<line x1="${padL}" y1="${y}" x2="${w - padR}" y2="${y}" stroke="#e4dac7"/>`;
    b += `<text x="${padL - 10}" y="${y + 4}" text-anchor="end" class="svg-mono" fill="#9a9183">${r}</text>`;
  });
  b += `<text x="${padL}" y="${h - 8}" class="svg-mono" fill="#6f675c">parameters (M, log)</text>`;
  b += `<text x="14" y="${padT - 10}" class="svg-mono" fill="#6f675c">RTF (log)</text>`;
  b += `<text x="${padL + 8}" y="${padT + 28}" class="svg-mono" fill="#7c2b26">compact CNNs: 6.8–12.6× faster than BEATs</text>`;
  encs.forEach((e) => {
    const x = X(e.params_m), y = Y(e.rtf_1c);
    const left = ["beats_iter3", "eat_pretrain", "dasheng_base"].includes(e.id);
    const sel = e.id === state.selectedEncoder;
    b += `<g class="pt" data-id="${e.id}" style="cursor:pointer">`;
    b += `<circle cx="${x}" cy="${y}" r="${sel ? 8 : 5.5}" fill="${fcolor(e.family)}" stroke="${sel ? "#1b1916" : "#fbf7ee"}" stroke-width="${sel ? 2 : 1.5}"/>`;
    b += `<text x="${left ? x - 11 : x + 10}" y="${y + (e.id === "eat_pretrain" ? 14 : e.id === "beats_iter3" ? -8 : 4)}" text-anchor="${left ? "end" : "start"}" class="svg-small" fill="${sel ? "#1b1916" : "#6f675c"}" font-weight="${sel ? 600 : 400}">${e.id}</text>`;
    b += `<title>${e.id} · ${e.params_m}M · RTF ${e.rtf_1c}</title></g>`;
  });
  $("#frontier").innerHTML = svgWrap(w, h, b, "Parameter count versus real-time factor");
  $$("#frontier .pt").forEach((g) => g.addEventListener("click", () => {
    state.selectedEncoder = g.dataset.id; buildFrontier();
  }));
  buildEncoderCard();
}

function buildEncoderCard() {
  const e = state.results.encoders.find((x) => x.id === state.selectedEncoder);
  const beats = state.results.encoders.find((x) => x.id === "beats_iter3");
  $("#encoderCard").innerHTML = `
    <div>
      <p class="eyebrow">selected encoder</p>
      <div class="big">${e.id}</div>
      <p style="margin-top:8px;font-size:12.5px;color:#6f675c">${flabel(e.family)} · ${e.params_m}M params · ${e.dim}-dim</p>
      <p class="bracket" style="margin-top:12px">[NOTE — Swap the selection to feel the frontier. This card is the anchor for the paragraph on the knee of the curve.]</p>
    </div>
    <div class="kv">
      <div><span>RTF, 1 core</span><b>${e.rtf_1c}</b></div>
      <div><span>s / audio hour</span><b>${e.s_per_audio_h_1c}</b></div>
      <div><span>peak RSS</span><b>${e.rss_gb} GB</b></div>
      <div><span>speed vs BEATs</span><b>${(beats.rtf_1c / e.rtf_1c).toFixed(1)}×</b></div>
      <div><span>CREMA-D</span><b>${fmt(e.cremad, 3)}</b></div>
      <div><span>EPIC dense</span><b>${fmt(e.epic_dense, 3)}</b></div>
      <div><span>EPIC vocab</span><b>${fmt(e.epic_disc, 3)}</b></div>
      <div><span>G1 F1 / F2 / F4</span><b>${fmt(e.g1_f1, 3)} / ${fmt(e.g1_f2, 3)} / ${fmt(e.g1_f4, 3)}</b></div>
    </div>`;
}

function buildProfileTable() {
  const rows = [...state.results.encoders].sort((a, b) => a.params_m - b.params_m);
  const best = (k) => Math.max(...rows.map((r) => r[k]));
  const b1 = best("cremad"), b2 = best("epic_dense"), b3 = best("epic_disc");
  $("#profileTable").innerHTML = `
    <thead><tr><th>encoder</th><th>params</th><th>dim</th><th>RTF 1c</th><th>s / audio h</th><th>RSS</th><th>CREMA-D</th><th>EPIC dense</th><th>EPIC vocab</th></tr></thead>
    <tbody>${rows.map((r) => `<tr><td>${r.id}</td><td class="num">${r.params_m}M</td><td class="num">${r.dim}</td>
      <td class="num">${r.rtf_1c}</td><td class="num">${r.s_per_audio_h_1c}</td><td class="num">${r.rss_gb}</td>
      <td class="num ${r.cremad === b1 ? "best" : ""}">${fmt(r.cremad, 3)}</td>
      <td class="num ${r.epic_dense === b2 ? "best" : ""}">${fmt(r.epic_dense, 3)}</td>
      <td class="num ${r.epic_disc === b3 ? "best" : ""}">${fmt(r.epic_disc, 3)}</td></tr>`).join("")}</tbody>`;
}

/* ---------------------------------------------------------------- failures / next */
const FAILURES = [
  ["Synthetic drill RL (Gym v1–v3)", "fail", "drills 0.565 → 0.709, STAR-Bench flat or worse", "proxy gain only; killed 2026-11-18"],
  ["Same-home SSL (ak_ssl1)", "void", "0.746 → 0.783 on the same home", "violates held-out sources; not generalisation"],
  ["Heart-murmur recipe transfer", "inc", "murmur 0.95–0.96, lung 0.885, valve 0.395", "domain shift broke every method"],
  ["Short kitchen event heads", "fail", "0.179–0.213 vs linear 0.228", "data-limited at 5 kitchens"],
  ["Dasheng on short kitchen events", "fail", "0.388 vs BEATs 0.438", "SSL does not rescue a small label set"],
  ["+AudioSet-Strong aux labels", "fail", "−0.033 on the target", "auxiliary labels hurt"],
  ["Re-listen when unsure", "fail", "AUC 0.685 vs ear 0.869", "no gain from a second look"],
  ["Fine-tune to convergence", "inc", "0.466 [0.423, 0.500] vs frozen 0.438", "fold-2 val loss still falling at epoch 4"],
  ["Embedding recurrence (F2)", "fail", "0.00–0.14 vs NCC 0.940", "keep waveform cross-correlation"],
];
function buildFailures() {
  $("#failureTable").innerHTML = `
    <thead><tr><th>idea</th><th>verdict</th><th>number</th><th>what replaced it</th></tr></thead>
    <tbody>${FAILURES.map(([idea, v, num, rep]) => `<tr>
      <td style="white-space:normal;max-width:280px">${idea}</td>
      <td><span class="verdict ${v}">${v}</span></td>
      <td class="num" style="text-align:left;white-space:normal;max-width:260px">${num}</td>
      <td style="text-align:left;white-space:normal;max-width:260px;color:#6f675c">${rep}</td></tr>`).join("")}</tbody>`;
}

function buildNext() {
  const w = 1000, h = 280;
  let b = "";
  const paths = [
    { y: 30, t: "mn10_as", s: "AudioSet CNN · 4.9M", note: "identity", fill: "#f0dfda", stroke: "#7c2b26" },
    { y: 100, t: "dsp_rich", s: "0M · 70-dim", note: "change", fill: "#f2e7cf", stroke: "#a8792f" },
    { y: 170, t: "SSL clip path", s: "USAD / Dasheng", note: "prosody", fill: "#dcebe4", stroke: "#2f6f5e" },
  ];
  paths.forEach((p) => {
    b += box(20, p.y, 210, 56, p.fill, p.stroke);
    b += `<text x="34" y="${p.y + 23}" class="svg-label" font-weight="600">${p.t}</text>`;
    b += `<text x="34" y="${p.y + 41}" class="svg-small">${p.s} · ${p.note}</text>`;
    b += arrow(232, p.y + 28, 330, 120);
  });
  b += box(335, 82, 180, 76, "#fbf7ee", "#1b1916");
  b += `<text x="350" y="110" class="svg-label" font-weight="600">router</text>`;
  b += `<text x="350" y="130" class="svg-small">task-aware, cheap</text>`;
  b += arrow(517, 120, 610, 120);
  b += box(615, 70, 170, 100, "#dcebe4", "#2f6f5e");
  b += `<text x="630" y="98" class="svg-label" font-weight="600">shared state</text>`;
  b += `<text x="630" y="118" class="svg-small">episodes · durations</text>`;
  b += `<text x="630" y="134" class="svg-small">recency · novelty</text>`;
  b += arrow(787, 120, 860, 120);
  b += box(865, 88, 120, 64, "#fbf7ee", "#c9bca4");
  b += `<text x="878" y="114" class="svg-label" font-weight="600">tools</text>`;
  b += `<text x="878" y="132" class="svg-small">to the LLM</text>`;
  b += `<text x="20" y="252" class="svg-mono" fill="#9a9183">cheapest falsifiable test: does [mn10_as + dsp_rich] beat either alone on G1 F1?</text>`;
  $("#nextDiagram").innerHTML = svgWrap(w, h, b, "Proposed hybrid ear");
}

/* ---------------------------------------------------------------- sources / tables */
function buildSources() {
  $("#sourcesTable").innerHTML = `
    <thead><tr><th>recording</th><th>author</th><th>licence</th><th>source</th></tr></thead>
    <tbody>${state.sources.map((s) => `<tr>
      <td>${esc(s.title)}</td><td>${esc(s.author)}</td>
      <td><span class="verdict ${s.license === "CC0" ? "pass" : "inc"}">${s.license}</span></td>
      <td class="num" style="text-align:left"><a href="${s.url}" target="_blank" rel="noopener">freesound ${s.freesound}</a></td></tr>`).join("")}</tbody>`;

  const rows = [
    ["EPIC-KITCHENS-100", "kitchen identity · held-out kitchens", "9853 clips · 21 classes"],
    ["CREMA-D", "vocal prosody · actor-disjoint", "1066 test clips · 6 classes"],
    ["SINS", "one home · days 4–7 held out", "~1 week · 15 classes"],
    ["RealDESED", "stitched timelines · consensus labels", "20 timelines · 30 min each"],
    ["AudioSet-Strong", "distillation source · eval novel events", "200 eval events"],
    ["PhysioNet / CirCor", "closed medical line · failure ledger", "268 balanced recordings"],
  ];
  $("#dataTable").innerHTML = rows.map(([a, b, c]) => `<div class="data-row"><div><b style="font-weight:500">${a}</b><div style="font-size:11.5px;color:#6f675c">${b}</div></div><span>${c}</span></div>`).join("");
  buildPassport();
  buildGlossary();
  buildLimits();
  buildCite();
}

function buildPassport() {
  const host = $("#kettlePassport");
  if (!host) return;
  const k = state.kettle;
  const src = state.sources.find((s) => s.key === "kettle");
  const khz = state.manifest.sr / 1000;
  host.innerHTML = `
    <div class="passport">
      <canvas id="passWave" height="48" aria-label="Kettle waveform"></canvas>
      <dl>
        <div><dt>recording</dt><dd>${esc(src.title)}</dd></div>
        <div><dt>author</dt><dd>${esc(src.author)}</dd></div>
        <div><dt>licence</dt><dd>${esc(src.license)}</dd></div>
        <div><dt>freesound</dt><dd><a href="${src.url}" target="_blank" rel="noopener">${src.freesound}</a></dd></div>
        <div><dt>duration</dt><dd>${clock(k.duration)} · ${k.duration.toFixed(1)} s</dd></div>
        <div><dt>rate</dt><dd>${khz} kHz</dd></div>
        <div><dt>states</dt><dd>${k.stages.length}</dd></div>
        <div><dt>episodes</dt><dd>${k.events.length}</dd></div>
      </dl>
    </div>`;
  drawWave($("#passWave"), k.peaks, "#7c2b26", "#fbf7ee", "rgba(27,25,22,.12)");
}

function buildGlossary() {
  const host = $("#glossaryFrame");
  if (!host) return;
  const k = state.kettle;
  const mn04 = state.results.encoders.find((e) => e.id === "mn04_as");
  const boil = k.questions.find((q) => q.type === "dur" && q.q.startsWith("How long did the kettle boil"));
  const click = k.events[0];
  const rows = [
    ["RTF", `${mn04.id} · ${mn04.rtf_1c} · 1 core`],
    ["episode", `${k.events.length} predicted on the kettle`],
    ["onset", `${click.start.toFixed(2)}–${click.end.toFixed(2)} s · ${click.text}`],
    ["boil", boil.answer],
    ["NCC", `waveform · ${state.results.g1.f2_ncc}`],
    ["G1", `n = ${state.results.g1.n}`],
    ["HPSS", "cup · mixture / harmonic / percussive"],
    ["actor-disjoint", `CREMA-D · n = ${state.results.cremad.n}`],
  ];
  host.innerHTML = rows.map(([term, ex]) => `<dt>${esc(term)}</dt><dd>${esc(ex)}</dd>`).join("");
}

function buildLimits() {
  const host = $("#limitsFrame");
  if (!host) return;
  const k = state.kettle;
  const chips = [
    `kettle · ${clock(k.duration)}`,
    `${state.similarity.labels.length} taps`,
    `${state.results.encoders.length} encoders`,
    `memory · n = ${state.results.t1.n}`,
    `CREMA-D · n = ${state.results.cremad.n}`,
    "fp32 · unquantized",
  ];
  host.innerHTML = chips.map((c) => `<span>${esc(c)}</span>`).join("");
}

function buildCite() {
  const host = $("#citeFrame");
  if (!host) return;
  const src = state.sources.find((s) => s.key === "kettle");
  const rows = [
    ["author", "Asad Rizvi"],
    ["title", "What a Kettle Knows"],
    ["date", "November 2026"],
    ["recording", `${src.author} · Freesound ${src.freesound} · ${src.license}`],
    ["url", "—"],
    ["commit", "—"],
  ];
  host.innerHTML = rows.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("");
}

function buildAllTable() {
  const rows = [...state.results.encoders].sort((a, b) => a.params_m - b.params_m);
  const best = (k) => Math.max(...rows.map((r) => r[k]));
  const B = { cremad: best("cremad"), dense: best("epic_dense"), disc: best("epic_disc"), f1: best("g1_f1"), f4: best("g1_f4") };
  $("#allTable").innerHTML = `
    <thead><tr><th>encoder</th><th>family</th><th>params</th><th>dim</th><th>RTF 1c</th><th>s/h 1c</th><th>RSS GB</th><th>CREMA-D</th><th>EPIC dense</th><th>EPIC vocab</th><th>G1 F1</th><th>G1 F2</th><th>G1 F4</th></tr></thead>
    <tbody>${rows.map((r) => `<tr><td>${r.id}</td><td class="dim" style="text-align:left">${flabel(r.family)}</td>
      <td class="num">${r.params_m}</td><td class="num">${r.dim}</td><td class="num">${r.rtf_1c}</td>
      <td class="num">${r.s_per_audio_h_1c}</td><td class="num">${r.rss_gb}</td>
      <td class="num ${r.cremad === B.cremad ? "best" : ""}">${fmt(r.cremad, 3)}</td>
      <td class="num ${r.epic_dense === B.dense ? "best" : ""}">${fmt(r.epic_dense, 3)}</td>
      <td class="num ${r.epic_disc === B.disc ? "best" : ""}">${fmt(r.epic_disc, 3)}</td>
      <td class="num ${r.g1_f1 === B.f1 ? "best" : ""}">${fmt(r.g1_f1, 3)}</td>
      <td class="num">${fmt(r.g1_f2, 3)}</td>
      <td class="num ${r.g1_f4 === B.f4 ? "best" : ""}">${fmt(r.g1_f4, 3)}</td></tr>`).join("")}</tbody>`;
}

boot().catch((e) => {
  console.error(e);
  document.body.insertAdjacentHTML("afterbegin", `<div style="background:#7c2b26;color:#fff;padding:10px 16px;font:12px monospace">Asset load failed: ${esc(e.message)}. Serve over http, not file://.</div>`);
});
