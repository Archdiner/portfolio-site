import { useEffect, useRef, useState } from 'react';
import { VERT, SIM_FRAG, RENDER_FRAG } from './shaders';

/* eslint-disable react/prop-types */

// Defaults tuned against the dugong footage. Every one can be overridden live
// from the query string (?dither=0&caustic=1.6) so the look can be dialled in a
// browser instead of a rebuild.
const DEFAULTS = {
  stiffFine: 0.30,
  stiffBig: 0.10,
  dampFine: 0.984,
  dampBig: 0.994,
  refract: 0.10,
  ampFine: 1.0,
  ampBig: 0.45,
  caustic: 0.55,
  causticScale: 9.0,
  causticSpeed: 0.35,
  causticBend: 2.5,
  dither: 0.85,
  levels: 8,
  pixel: 3,
  tint: 0.25,
  vignette: 0.10,
  motionPush: 0,
  surfaceBand: 0.8,
  ambient: 1,
};

function readOverrides() {
  if (typeof window === 'undefined') return {};
  const q = new URLSearchParams(window.location.search);
  const out = {};
  for (const k of Object.keys(DEFAULTS)) {
    const v = q.get(k);
    if (v !== null && v !== '' && Number.isFinite(Number(v))) out[k] = Number(v);
  }
  return out;
}

function compile(gl, type, src) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(sh);
    gl.deleteShader(sh);
    throw new Error(`shader compile failed: ${log}`);
  }
  return sh;
}

function program(gl, fragSrc) {
  const p = gl.createProgram();
  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, fragSrc);
  gl.attachShader(p, vs);
  gl.attachShader(p, fs);
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    throw new Error(`link failed: ${gl.getProgramInfoLog(p)}`);
  }
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  const uniforms = {};
  const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < n; i++) {
    const info = gl.getActiveUniform(p, i);
    const name = info.name.replace(/\[0\]$/, '');
    uniforms[name] = gl.getUniformLocation(p, name);
  }
  return { p, u: uniforms };
}

function makeTexture(gl, { internal, format, type, w, h, data = null, filter }) {
  const t = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.texImage2D(gl.TEXTURE_2D, 0, internal, w, h, 0, format, type, data);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return t;
}

/**
 * Real footage seen through simulated water.
 *
 * The video supplies the animal; the shader supplies the surface it's seen
 * through. Pointer movement lays a wake, clicks drop into it, and movement
 * within the footage itself pushes the water via frame-differencing — so the
 * dugong disturbs the water it's actually swimming in.
 *
 * Falls back to a plain looping <video> when WebGL2, float render targets, or
 * the user's motion preference rule it out. The fallback is not a degraded
 * experience so much as the same footage without the surface.
 */
export default function WaterVideo({ src, poster, className = '', style, children }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const [fallback, setFallback] = useState(false);
  // The canvas stays hidden until one frame has demonstrably rendered from real
  // video pixels. Revealing it unconditionally means any GL failure downstream
  // of context creation -- an incomplete framebuffer, a tainted video texture --
  // shows a black rectangle instead of falling back to the footage.
  const [live, setLive] = useState(false);

  useEffect(() => {
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setFallback(true);
      return undefined;
    }

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !video || !wrap) return undefined;

    const gl = canvas.getContext('webgl2', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'high-performance',
    });
    if (!gl || !gl.getExtension('EXT_color_buffer_float')) {
      setFallback(true);
      return undefined;
    }

    const P = { ...DEFAULTS, ...readOverrides() };

    let sim, render, vao;
    try {
      sim = program(gl, SIM_FRAG);
      render = program(gl, RENDER_FRAG);
    } catch (err) {
      // A driver that can't compile this isn't worth fighting; show the footage.
      if (import.meta.env?.DEV) console.error(err);
      setFallback(true);
      return undefined;
    }
    vao = gl.createVertexArray();

    // --- resources --------------------------------------------------------
    let simW = 2;
    let simH = 2;
    let states = [];
    let fbos = [];
    let cur = 0;

    const videoTex = [
      makeTexture(gl, { internal: gl.RGBA8, format: gl.RGBA, type: gl.UNSIGNED_BYTE, w: 1, h: 1, filter: gl.LINEAR }),
      makeTexture(gl, { internal: gl.RGBA8, format: gl.RGBA, type: gl.UNSIGNED_BYTE, w: 1, h: 1, filter: gl.LINEAR }),
    ];
    let videoCur = 0;
    let videoSized = false;
    let lastVideoTime = -1;

    function allocSim(w, h) {
      states.forEach((t) => gl.deleteTexture(t));
      fbos.forEach((f) => gl.deleteFramebuffer(f));
      states = [];
      fbos = [];
      simW = w;
      simH = h;
      for (let i = 0; i < 2; i++) {
        const t = makeTexture(gl, {
          internal: gl.RGBA16F, format: gl.RGBA, type: gl.HALF_FLOAT,
          w, h, filter: gl.LINEAR,
        });
        const f = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, f);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
        if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
          // Some drivers advertise EXT_color_buffer_float but can't actually
          // render to RGBA16F. Better to find out here than to draw nothing.
          throw new Error('half-float render target not complete');
        }
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        states.push(t);
        fbos.push(f);
      }
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    // --- sizing -----------------------------------------------------------
    let cw = 1;
    let ch = 1;
    let cover = [1, 1];
    let coverOff = [0, 0];

    function recomputeCover() {
      const vw = video.videoWidth || 540;
      const vh = video.videoHeight || 960;
      const ca = cw / ch;
      const va = vw / vh;
      // cover > 1 on an axis means we sample a centred sub-range of the video
      // on that axis, i.e. crop it — the shader equivalent of object-fit: cover.
      cover = ca > va ? [1, ca / va] : [va / ca, 1];
      coverOff = [0.5 - 0.5 * cover[0], 0.5 - 0.5 * cover[1]];
    }

    function resize() {
      const rect = wrap.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cw = Math.round(rect.width * dpr);
      ch = Math.round(rect.height * dpr);
      canvas.width = cw;
      canvas.height = ch;
      // The sim runs far below display resolution: water is smooth, the extra
      // detail would be invisible, and the cost is quadratic.
      const short = 176;
      const ar = cw / ch;
      const sw = ar >= 1 ? Math.round(short * ar) : short;
      const sh = ar >= 1 ? short : Math.round(short / ar);
      allocSim(Math.min(sw, 420), Math.min(sh, 420));
      recomputeCover();
    }

    try {
      resize();
    } catch (err) {
      if (import.meta.env?.DEV) console.error(err);
      setFallback(true);
      return undefined;
    }
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    // --- input ------------------------------------------------------------
    const pointer = { x: -1, y: -1, px: -1, py: -1, strength: 0, active: false };
    const drops = [];

    function toUv(e) {
      const rect = wrap.getBoundingClientRect();
      return [
        (e.clientX - rect.left) / rect.width,
        1 - (e.clientY - rect.top) / rect.height,
      ];
    }

    function onMove(e) {
      const [x, y] = toUv(e);
      if (pointer.active) {
        const dx = x - pointer.x;
        const dy = y - pointer.y;
        const speed = Math.hypot(dx, dy);
        // Clamped so a flick across the panel doesn't detonate the sim.
        pointer.strength = Math.min(speed * 22, 1.2);
      }
      pointer.px = pointer.active ? pointer.x : x;
      pointer.py = pointer.active ? pointer.y : y;
      pointer.x = x;
      pointer.y = y;
      pointer.active = true;
    }

    function onLeave() {
      pointer.active = false;
      pointer.x = -1;
      pointer.strength = 0;
    }

    function onDown(e) {
      const [x, y] = toUv(e);
      drops.push({ x, y, r: 0.032, s: 0.55 });
    }

    wrap.addEventListener('pointermove', onMove, { passive: true });
    wrap.addEventListener('pointerleave', onLeave, { passive: true });
    wrap.addEventListener('pointerdown', onDown, { passive: true });

    // --- loop -------------------------------------------------------------
    let raf = 0;
    let visible = true;
    let nextAmbient = 900;
    let revealed = false;

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) video.play?.().catch(() => {});
        else video.pause?.();
      },
      { threshold: 0.01 },
    );
    io.observe(wrap);

    const onVisibility = () => {
      if (document.hidden) video.pause?.();
      else if (visible) video.play?.().catch(() => {});
    };
    document.addEventListener('visibilitychange', onVisibility);

    const dropBuf = new Float32Array(32);
    let last = performance.now();

    function frame(now) {
      raf = requestAnimationFrame(frame);
      if (!visible || document.hidden) return;

      const elapsed = Math.min(now - last, 64);
      last = now;

      // Upload the video only when it has actually advanced. Keeping the prior
      // frame in the other texture is what makes frame-differencing possible.
      if (video.readyState >= 2 && video.currentTime !== lastVideoTime) {
        lastVideoTime = video.currentTime;
        videoCur = 1 - videoCur;
        gl.bindTexture(gl.TEXTURE_2D, videoTex[videoCur]);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        try {
        if (!videoSized) {
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, video);
          // Both textures need real dimensions before the first difference.
          gl.bindTexture(gl.TEXTURE_2D, videoTex[1 - videoCur]);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, video);
          videoSized = true;
          recomputeCover();
        } else {
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, video);
        }
        } catch (err) {
          // A cross-origin video taints the texture and throws here. Nothing to
          // recover: show the footage plainly rather than a black canvas.
          if (import.meta.env?.DEV) console.error(err);
          cancelAnimationFrame(raf);
          setFallback(true);
          return;
        }
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      }

      // Idle water still moves. Without this the panel reads as a paused effect
      // the moment the pointer leaves.
      nextAmbient -= elapsed;
      if (P.ambient > 0 && nextAmbient <= 0) {
        nextAmbient = 700 + Math.random() * 2600;
        drops.push({
          x: 0.12 + Math.random() * 0.76,
          y: 0.45 + Math.random() * 0.5,
          // Wider and weaker than a click. The glide clip's open water is smooth
          // enough that a tight idle drop reads as a scratch on the footage
          // rather than a ripple in it.
          r: 0.045 + Math.random() * 0.035,
          s: (0.016 + Math.random() * 0.024) * P.ambient,
        });
      }

      const active = drops.splice(0, 8);
      dropBuf.fill(0);
      active.forEach((d, i) => {
        dropBuf[i * 4] = d.x;
        dropBuf[i * 4 + 1] = d.y;
        dropBuf[i * 4 + 2] = d.r;
        dropBuf[i * 4 + 3] = d.s;
      });

      gl.bindVertexArray(vao);
      gl.disable(gl.BLEND);

      // --- simulate ---
      const dst = 1 - cur;
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbos[dst]);
      gl.viewport(0, 0, simW, simH);
      gl.useProgram(sim.p);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, states[cur]);
      gl.uniform1i(sim.u.u_state, 0);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, videoTex[videoCur]);
      gl.uniform1i(sim.u.u_video, 1);
      gl.activeTexture(gl.TEXTURE2);
      gl.bindTexture(gl.TEXTURE_2D, videoTex[1 - videoCur]);
      gl.uniform1i(sim.u.u_videoPrev, 2);
      gl.uniform2f(sim.u.u_texel, 1 / simW, 1 / simH);
      gl.uniform1f(sim.u.u_dt, 1.0);
      gl.uniform2f(sim.u.u_stiffness, P.stiffFine, P.stiffBig);
      gl.uniform2f(sim.u.u_damping, P.dampFine, P.dampBig);
      gl.uniform2f(sim.u.u_pointer, pointer.active ? pointer.x : -1, pointer.y);
      gl.uniform2f(sim.u.u_pointerPrev, pointer.px, pointer.py);
      gl.uniform1f(sim.u.u_pointerStrength, pointer.strength);
      gl.uniform4fv(sim.u.u_drops, dropBuf);
      gl.uniform1i(sim.u.u_dropCount, active.length);
      gl.uniform1f(sim.u.u_motionPush, P.motionPush);
      gl.uniform1f(sim.u.u_aspect, cw / ch);
      gl.uniform1f(sim.u.u_surfaceBand, P.surfaceBand);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      cur = dst;

      // Movement decays even while the pointer is held still, so a parked
      // cursor stops driving the water instead of boiling it.
      pointer.strength *= 0.82;
      pointer.px = pointer.x;
      pointer.py = pointer.y;

      // --- render ---
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, cw, ch);
      gl.useProgram(render.p);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, states[cur]);
      gl.uniform1i(render.u.u_state, 0);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, videoTex[videoCur]);
      gl.uniform1i(render.u.u_video, 1);
      gl.uniform2f(render.u.u_texel, 1 / simW, 1 / simH);
      gl.uniform2f(render.u.u_cover, cover[0], cover[1]);
      gl.uniform2f(render.u.u_coverOff, coverOff[0], coverOff[1]);
      gl.uniform1f(render.u.u_time, now * 0.001);
      gl.uniform1f(render.u.u_causticScale, P.causticScale);
      gl.uniform1f(render.u.u_causticSpeed, P.causticSpeed);
      gl.uniform1f(render.u.u_causticBend, P.causticBend);
      gl.uniform1f(render.u.u_refract, P.refract);
      gl.uniform2f(render.u.u_amp, P.ampFine, P.ampBig);
      gl.uniform1f(render.u.u_caustic, P.caustic);
      gl.uniform1f(render.u.u_dither, P.dither);
      gl.uniform1f(render.u.u_levels, P.levels);
      gl.uniform1f(render.u.u_pixel, P.pixel);
      gl.uniform1f(render.u.u_tint, P.tint);
      gl.uniform1f(render.u.u_vignette, P.vignette);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      if (!revealed && videoSized) {
        const err = gl.getError();
        if (err === gl.NO_ERROR) {
          revealed = true;
          setLive(true);
        } else {
          if (import.meta.env?.DEV) console.error('gl error', err);
          cancelAnimationFrame(raf);
          setFallback(true);
        }
      }
    }

    video.play?.().catch(() => {});
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      wrap.removeEventListener('pointermove', onMove);
      wrap.removeEventListener('pointerleave', onLeave);
      wrap.removeEventListener('pointerdown', onDown);
      states.forEach((t) => gl.deleteTexture(t));
      fbos.forEach((f) => gl.deleteFramebuffer(f));
      videoTex.forEach((t) => gl.deleteTexture(t));
      gl.deleteVertexArray(vao);
      gl.deleteProgram(sim.p);
      gl.deleteProgram(render.p);
    };
  }, [src]);

  return (
    <div ref={wrapRef} className={`relative overflow-hidden ${className}`} style={style}>
      <video
        ref={videoRef}
        poster={poster}
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        crossOrigin="anonymous"
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
          live && !fallback ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {/* webm first: Chromium builds without the proprietary H.264 decoder are
            real, and they fall through to this rather than showing nothing. */}
        <source src={`${src}.webm`} type="video/webm" />
        <source src={`${src}.mp4`} type="video/mp4" />
      </video>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={`absolute inset-0 w-full h-full transition-opacity duration-500 ${
          live && !fallback ? 'opacity-100' : 'opacity-0'
        }`}
      />
      {children}
    </div>
  );
}
