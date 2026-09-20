// GLSL for the Gulf hero: a two-scale height-field water simulation layered over
// real dugong footage, then refracted, lit, and ordered-dithered.
//
// Nothing here draws the animal — that's the video. The shader only simulates the
// water the video is seen through, so the creature stays photoreal while the
// surface it swims under is genuinely interactive.

export const VERT = `#version 300 es
// One oversized triangle covering the viewport; cheaper than a quad and no seam.
const vec2 P[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
out vec2 v_uv;
void main() {
  vec2 p = P[gl_VertexID];
  v_uv = p * 0.5 + 0.5;
  gl_Position = vec4(p, 0.0, 1.0);
}`;

// --- simulation pass ------------------------------------------------------
//
// State is packed into one RGBA16F texture as two independent wave fields:
//   .rg = fine field  (stiff, lightly damped  -> small fast ripples)
//   .ba = big field   (slack, heavily damped  -> slow broad swell and wakes)
// Two scales because one looks synthetic: real water carries detail riding on
// top of mass movement, and a single stiffness can't be both at once.
export const SIM_FRAG = `#version 300 es
precision highp float;
precision highp sampler2D;

uniform sampler2D u_state;
uniform sampler2D u_video;      // current video frame
uniform sampler2D u_videoPrev;  // previous video frame
uniform vec2  u_texel;
uniform float u_dt;
uniform vec2  u_stiffness;      // x = fine, y = big
uniform vec2  u_damping;        // x = fine, y = big
uniform vec2  u_pointer;        // current pointer, uv space (-1 = absent)
uniform vec2  u_pointerPrev;
uniform float u_pointerStrength;
uniform vec4  u_drops[8];       // xy = position, z = radius, w = strength
uniform int   u_dropCount;
uniform float u_motionPush;     // how hard on-screen movement shoves the water
uniform float u_aspect;
uniform float u_surfaceBand;    // extra response near the real surface at frame top

in vec2 v_uv;
out vec4 o_state;

float gauss(vec2 a, vec2 b, float r) {
  vec2 d = (a - b) * vec2(u_aspect, 1.0);
  return exp(-dot(d, d) / max(r * r, 1e-6));
}

// Distance from p to the segment ab, aspect-corrected, so a fast pointer lays a
// continuous wake instead of a dotted line of separate impulses.
float segDist(vec2 p, vec2 a, vec2 b) {
  vec2 s = vec2(u_aspect, 1.0);
  vec2 pa = (p - a) * s, ba = (b - a) * s;
  float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0);
  return length(pa - ba * h);
}

void main() {
  vec4 s = texture(u_state, v_uv);

  vec2 dx = vec2(u_texel.x, 0.0);
  vec2 dy = vec2(0.0, u_texel.y);
  vec4 l = texture(u_state, v_uv - dx);
  vec4 r = texture(u_state, v_uv + dx);
  vec4 d = texture(u_state, v_uv - dy);
  vec4 u = texture(u_state, v_uv + dy);

  // Laplacian of each field. Sampling is clamp-to-edge, which makes the borders
  // behave like a reflecting wall — ripples bounce instead of vanishing.
  vec2 lap = (l.rb + r.rb + d.rb + u.rb) - 4.0 * s.rb;

  vec2 h   = s.rb;
  vec2 vel = s.ga;

  // Wave equation. The -h term pulls the surface back to rest so energy decays
  // to flat rather than drifting.
  vel += (u_stiffness * lap - h * 0.0008) * u_dt;

  // --- injections --------------------------------------------------------

  // Pointer drag: a moving body shoves water. Strength scales with speed, so
  // slow exploration barely disturbs it and a fast swipe throws a real wake.
  if (u_pointer.x >= 0.0 && u_pointerStrength > 0.0) {
    float dist = segDist(v_uv, u_pointerPrev, u_pointer);
    float k = exp(-(dist * dist) / 0.00055);
    vel.x += k * u_pointerStrength * 0.10;
    vel.y += k * u_pointerStrength * 0.045;
  }

  // Clicks: a discrete drop, fine field mostly, with a little mass behind it.
  for (int i = 0; i < 8; i++) {
    if (i >= u_dropCount) break;
    vec4 dp = u_drops[i];
    float k = gauss(v_uv, dp.xy, dp.z);
    vel.x += k * dp.w;
    vel.y += k * dp.w * 0.35;
  }

  // Movement in the footage pushes the water. Frame-differencing the video gives
  // a free tracker: wherever the dugong moves, luminance changes, and that change
  // becomes a push into the big field. The real animal leaves a real wake without
  // anyone hand-keying its path.
  if (u_motionPush > 0.0) {
    vec3 a = texture(u_video, v_uv).rgb;
    vec3 b = texture(u_videoPrev, v_uv).rgb;
    float diff = abs(dot(a - b, vec3(0.299, 0.587, 0.114)));
    // Deadzone kills codec noise; the remainder is actual motion. The ceiling
    // matters more: a scene cut or a fast pan differences to nearly 1.0 across
    // the whole frame, and without a cap that spikes the field into a smear.
    diff = clamp(diff - 0.035, 0.0, 0.10);
    // Into the big field only. A body displaces mass, it doesn't shed ripples at
    // its own silhouette, and pushing the fine field here just traces the
    // animal's outline in sharp distortion.
    vel.y += diff * u_motionPush;
  }

  // The real air-water boundary sits at the top of both clips, so the surface is
  // livelier there and calms with depth.
  float band = 1.0 + u_surfaceBand * smoothstep(0.55, 1.0, v_uv.y);
  vel *= mix(vec2(1.0), vec2(band), 0.5);

  vel *= u_damping;
  h += vel * u_dt;

  // A touch of diffusion into the fine field wipes out grid-frequency noise that
  // the integrator accumulates, without visibly softening real ripples.
  h.x = mix(h.x, h.x + lap.x * 0.08, 0.5);

  o_state = clamp(vec4(h.x, vel.x, h.y, vel.y), -2.0, 2.0);
}`;

// --- render pass ----------------------------------------------------------
export const RENDER_FRAG = `#version 300 es
precision highp float;
precision highp sampler2D;

uniform sampler2D u_state;
uniform sampler2D u_video;
uniform vec2  u_texel;
uniform vec2  u_cover;       // object-fit: cover correction
uniform vec2  u_coverOff;
uniform float u_refract;
uniform vec2  u_amp;         // x = fine weight, y = big weight
uniform float u_caustic;
uniform float u_dither;      // 0 = off, 1 = full
uniform float u_levels;      // colour steps per channel when dithering
uniform float u_pixel;       // dither cell size, device px
uniform vec2  u_resolution;
uniform float u_tint;
uniform float u_vignette;

in vec2 v_uv;
out vec4 o_color;

// 8x8 Bayer matrix. Ordered dithering rather than Floyd-Steinberg because error
// diffusion is inherently sequential and can't be evaluated per-pixel on a GPU.
// This is also what gives the crisp woven texture in the reference clip, where
// error diffusion would look like noise.
const float BAYER[64] = float[64](
   0.0, 32.0,  8.0, 40.0,  2.0, 34.0, 10.0, 42.0,
  48.0, 16.0, 56.0, 24.0, 50.0, 18.0, 58.0, 26.0,
  12.0, 44.0,  4.0, 36.0, 14.0, 46.0,  6.0, 38.0,
  60.0, 28.0, 52.0, 20.0, 62.0, 30.0, 54.0, 22.0,
   3.0, 35.0, 11.0, 43.0,  1.0, 33.0,  9.0, 41.0,
  51.0, 19.0, 59.0, 27.0, 49.0, 17.0, 57.0, 25.0,
  15.0, 47.0,  7.0, 39.0, 13.0, 45.0,  5.0, 37.0,
  63.0, 31.0, 55.0, 23.0, 61.0, 29.0, 53.0, 21.0
);

float bayerAt(vec2 fragPx) {
  vec2 c = floor(mod(fragPx / max(u_pixel, 1.0), 8.0));
  int idx = int(c.y) * 8 + int(c.x);
  return BAYER[idx] / 64.0 - 0.5;
}

void main() {
  vec2 dx = vec2(u_texel.x, 0.0);
  vec2 dy = vec2(0.0, u_texel.y);

  vec4 sL = texture(u_state, v_uv - dx);
  vec4 sR = texture(u_state, v_uv + dx);
  vec4 sD = texture(u_state, v_uv - dy);
  vec4 sU = texture(u_state, v_uv + dy);
  vec4 sC = texture(u_state, v_uv);

  // Combined surface height, then its gradient. The gradient is the surface
  // normal's tilt, which is what bends a light ray passing through.
  float hL = sL.r * u_amp.x + sL.b * u_amp.y;
  float hR = sR.r * u_amp.x + sR.b * u_amp.y;
  float hD = sD.r * u_amp.x + sD.b * u_amp.y;
  float hU = sU.r * u_amp.x + sU.b * u_amp.y;
  float hC = sC.r * u_amp.x + sC.b * u_amp.y;

  vec2 slope = vec2(hR - hL, hU - hD);
  // Hard ceiling on displacement. Beyond a few percent of the frame the sample
  // lands somewhere unrelated and the image tears instead of refracting — the
  // difference between water and a smear.
  slope = clamp(slope, -0.10, 0.10);

  // Refraction: offset where we sample the footage by the surface tilt. This is
  // the whole illusion — the dugong is a flat video, but reading it through a
  // displaced coordinate makes it sit *under* moving water.
  // Depth weighting. The real air-water boundary is the band at the top of the
  // frame; the animal sits well below it. Refracting the whole image uniformly
  // warps the dugong's silhouette, which is exactly what surface ripples do not
  // do to a subject that far under. So displacement is strongest at the surface
  // and falls away with depth, while the caustic light still plays over
  // everything — which is how ripples actually read on underwater footage.
  float depthW = mix(0.18, 1.0, smoothstep(0.05, 0.92, v_uv.y));
  vec2 uv = (v_uv - u_coverOff) / u_cover;
  uv += slope * u_refract * depthW;
  vec3 col = texture(u_video, clamp(uv, 0.001, 0.999)).rgb;

  // Caustics: where the surface is concave it focuses light, where convex it
  // spreads it. Curvature (the Laplacian) is a good cheap stand-in for that,
  // and it lands the bright veins right where the ripples pinch.
  float curv = clamp((hL + hR + hD + hU) - 4.0 * hC, -0.5, 0.5);
  // Scaled by how bright the spot already is, so highlights bloom on lit water
  // and the shadowed body doesn't grow a neon rim.
  float lum = dot(col, vec3(0.299, 0.587, 0.114));
  float light = max(curv, 0.0) * (0.35 + 0.65 * lum);
  col += vec3(0.55, 0.78, 0.74) * light * u_caustic;
  col -= vec3(0.05, 0.09, 0.11) * max(-curv, 0.0) * u_caustic * 0.4;

  // Gulf water pulls green-cyan; nudge toward it so the sim and the footage read
  // as one body of water rather than an effect sitting on top of a clip.
  col = mix(col, col * vec3(0.86, 1.04, 1.02), u_tint);

  float r = distance(v_uv, vec2(0.5));
  col *= 1.0 - u_vignette * smoothstep(0.35, 0.95, r);

  if (u_dither > 0.001) {
    float t = bayerAt(gl_FragCoord.xy);
    vec3 q = floor(col * u_levels + 0.5 + t) / u_levels;
    col = mix(col, clamp(q, 0.0, 1.0), u_dither);
  }

  o_color = vec4(col, 1.0);
}`;
