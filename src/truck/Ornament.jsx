/* eslint-disable react/prop-types */
// A truck-art ornament system, drawn rather than photographed.
//
// Photographs of truck art can only ever be pictures sitting on a page. The
// actual craft is a vocabulary — repeating petal strips, nested frames, radial
// rosettes, stud rows, hanging chain — applied to whatever surface is in front
// of the painter. To use it as a design language the vocabulary has to be
// generated, so it can wrap any panel at any size.
//
// Everything here is SVG, so it stays sharp at any scale, weighs almost
// nothing next to a photo, and can be recoloured per element.
//
// The palette is measured, not invented: k-means over the painted (high
// saturation) pixels of the four reference photographs, ordered by ink
// coverage. The browns are the wood and rust showing through, which is why
// they are kept separate from the inks.

export const INK = {
  vermilion: '#dd4e25',
  red: '#dc0e0c',
  marigold: '#ed9d0f',
  deepRed: '#9d1c18',
  teal: '#238878',
  green: '#205745',
  cyan: '#15aac1',
  cream: '#f6efdf',
  white: '#ffffff',
  indigo: '#1b2a6b',
  wood: '#965e38',
  darkWood: '#653423',
  night: '#160d0b',
};

// The order painters actually alternate through on a border run.
const CYCLE = [INK.red, INK.marigold, INK.cyan, INK.cream, INK.teal, INK.vermilion];

/**
 * One petal: a pointed almond from r0 to r1, drawn in petal-local coordinates
 * along +x and then rotated into place. Two mirrored quadratics give the
 * leaf its belly and its point, which is the shape that repeats everywhere in
 * this vocabulary — border runs, rosette rays, corner fans.
 */
function petalPath(r0, r1, width) {
  // Cubics, not quadratics: a quadratic gives a lens with two points, which
  // reads as a needle. Real petals are round at the base and taper only near
  // the tip, which needs the two control points a cubic provides.
  const c1 = r0 + (r1 - r0) * 0.18;
  const c2 = r0 + (r1 - r0) * 0.72;
  return `M ${r0} 0 C ${c1} ${width} ${c2} ${width * 0.92} ${r1} 0 `
       + `C ${c2} ${-width * 0.92} ${c1} ${-width} ${r0} 0 Z`;
}

/**
 * A radial medallion. Two rings of petals, the inner ring offset by half a
 * step so it reads through the gaps of the outer, then a target of concentric
 * discs at the centre — the phool (flower) that sits on every tailgate.
 */
export function Rosette({
  size = 120,
  petals = 12,
  outer = INK.red,
  inner = INK.cyan,
  heart = INK.marigold,
  spin = 0,
  className = '',
  style,
}) {
  const R = 50;
  const step = 360 / petals;
  return (
    <svg viewBox="-60 -60 120 120" width={size} height={size} className={className}
      style={style} aria-hidden="true">
      <g style={spin ? { animation: `rosette-spin ${spin}s linear infinite`, transformOrigin: 'center' } : undefined}>
        {/* Scalloped rim: overlapping discs around the edge, which is how the
            painters close a medallion off from whatever it sits on. */}
        {Array.from({ length: petals }, (_, k) => {
          const a = ((k * step + step / 2) * Math.PI) / 180;
          return <circle key={`s${k}`} cx={Math.cos(a) * R * 0.94} cy={Math.sin(a) * R * 0.94}
            r={R * 0.17} fill={INK.cream} />;
        })}
        <circle r={R * 0.82} fill={heart} />
        {Array.from({ length: petals }, (_, k) => (
          <path key={`o${k}`} d={petalPath(R * 0.16, R * 0.80, R * 0.30)} fill={outer}
            transform={`rotate(${k * step})`} />
        ))}
        {Array.from({ length: petals }, (_, k) => (
          <path key={`i${k}`} d={petalPath(R * 0.12, R * 0.52, R * 0.22)} fill={inner}
            transform={`rotate(${k * step + step / 2})`} />
        ))}
        <circle r={R * 0.24} fill={INK.cream} />
        <circle r={R * 0.15} fill={outer} />
        <circle r={R * 0.06} fill={INK.cream} />
      </g>
    </svg>
  );
}

/**
 * The repeating border run: a petal, a pair of flanking dots, on an alternating
 * colour cycle. Emitted as an SVG <pattern> so one element can edge a panel of
 * any width without the unit ever being stretched.
 */
export function borderTile(bg = INK.deepRed, phase = 0) {
  const h = 34;
  const u = 26;
  const span = CYCLE.length;
  let body = `<rect width="${u * span}" height="${h}" fill="${bg}"/>`;
  for (let k = 0; k < span; k++) {
    const cx = k * u + u / 2;
    const col = CYCLE[(k + phase) % span];
    // Petal pointing up, then its mirror pointing down: the two-row leaf run
    // that edges almost every panel on a real truck.
    body += `<g transform="translate(${cx} ${h / 2}) rotate(-90)">`
      + `<path d="${petalPath(0.5, 15.5, 8.4)}" fill="${col}"/></g>`;
    body += `<circle cx="${cx - u / 2}" cy="${h / 2}" r="2.2" fill="${INK.cream}"/>`;
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${u * span}" height="${h}" viewBox="0 0 ${u * span} ${h}">${body}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

/**
 * The repeating border run, as a background tile rather than a stretched SVG.
 *
 * Setting preserveAspectRatio="none" on a full-width SVG squashes every petal
 * into a flat pill — the shape survives only if the tile repeats at its own
 * aspect, which is what a background-repeat does and a stretched viewBox
 * cannot.
 */
export function PetalBorder({ height = 20, bg = INK.deepRed, phase = 0, className = '', style }) {
  return (
    <div
      className={className}
      aria-hidden="true"
      style={{
        height,
        backgroundImage: borderTile(bg, phase),
        backgroundRepeat: 'repeat-x',
        backgroundSize: `auto ${height}px`,
        backgroundColor: bg,
        ...style,
      }}
    />
  );
}

/** A run of chrome domes, the way a bumper or a cab edge is studded. */
export function Studs({ height = 16, bg = INK.darkWood, className = '' }) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="26" height="20" viewBox="0 0 26 20">`
    + `<defs><radialGradient id="g" cx="35%" cy="30%">`
    + `<stop offset="0%" stop-color="#ffffff"/><stop offset="55%" stop-color="#c9ccd1"/>`
    + `<stop offset="100%" stop-color="#6a6f76"/></radialGradient></defs>`
    + `<rect width="26" height="20" fill="${bg}"/><circle cx="13" cy="10" r="7" fill="url(#g)"/></svg>`;
  return (
    <div className={className} aria-hidden="true"
      style={{
        height,
        backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(svg)}")`,
        backgroundRepeat: 'repeat-x',
        backgroundSize: `auto ${height}px`,
        backgroundColor: bg,
      }} />
  );
}

/**
 * Hanging chain. Truck painters fringe the bottom edge of a panel with loops of
 * chain and beads; here it hangs off the foot of a panel and sways, because a
 * real one never hangs still.
 */
export function Fringe({ count = 22, className = '' }) {
  return (
    <div className={`flex justify-between pointer-events-none ${className}`} aria-hidden="true">
      {Array.from({ length: count }, (_, k) => (
        <svg key={k} width="12" height="26" viewBox="0 0 12 26"
          style={{
            animation: `fringe-sway ${2.6 + (k % 5) * 0.35}s ease-in-out ${k * 0.07}s infinite`,
            transformOrigin: '6px 0px',
          }}>
          <line x1="6" y1="0" x2="6" y2="15" stroke={INK.marigold} strokeWidth="1.6" />
          <circle cx="6" cy="18" r="3.4" fill={CYCLE[k % CYCLE.length]} />
          <circle cx="6" cy="18" r="1.3" fill={INK.cream} />
        </svg>
      ))}
    </div>
  );
}

/**
 * A painted panel.
 *
 * This is the load-bearing piece. A truck is not decorated as one surface —
 * it is divided into rectangles, and each rectangle is framed, bordered and
 * then painted inside. Content on this page lives in those rectangles, which
 * is what lets the page be loud and the text still be readable: the ornament
 * happens in the frame, and the field inside it stays calm.
 */
export function Panel({
  children,
  tone = INK.deepRed,
  field = '#120b10',
  corners = true,
  border = true,
  className = '',
  style,
}) {
  return (
    <div
      className={`relative ${className}`}
      style={{
        background: field,
        boxShadow: `0 0 0 3px ${tone}, 0 0 0 6px ${INK.marigold}, 0 0 0 9px ${tone}, 0 18px 40px rgba(0,0,0,0.45)`,
        ...style,
      }}
    >
      {border && (
        <>
          <div className="absolute inset-x-0 top-0"><PetalBorder height={16} bg={tone} /></div>
          <div className="absolute inset-x-0 bottom-0 rotate-180"><PetalBorder height={16} bg={tone} phase={3} /></div>
        </>
      )}
      {corners && (
        <>
          <Rosette size={38} className="absolute -top-3 -left-3" />
          <Rosette size={38} className="absolute -top-3 -right-3" inner={INK.marigold} />
          <Rosette size={38} className="absolute -bottom-3 -left-3" inner={INK.marigold} />
          <Rosette size={38} className="absolute -bottom-3 -right-3" />
        </>
      )}
      <div className="relative">{children}</div>
    </div>
  );
}
