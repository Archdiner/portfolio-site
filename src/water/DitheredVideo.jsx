/* eslint-disable react/prop-types */

/**
 * Footage, dithered offline, played back plainly.
 *
 * This replaces the WebGL water simulation (see commit 7b8ba8e if it's ever
 * wanted back). Three reasons it's the better answer:
 *
 * - The interaction was unwanted, and once it's gone the shader's only job is a
 *   colour treatment, which ffmpeg does better and once rather than 60 times a
 *   second on the viewer's GPU.
 * - No WebGL means no context loss, no half-float support matrix, no tainted
 *   textures, and no way to end up staring at a black rectangle.
 * - The dither is what makes the footage belong to the page. Raw, it's bright
 *   tropical turquoise sitting on warm cream paper — two palettes arguing. Cut
 *   to a six-step ramp built from the site's own ink and paper, it joins them.
 *
 * The file is encoded at the dither grid's native width and scaled up by the
 * browser with nearest-neighbour, so the cells stay crisp squares at any size
 * and we aren't paying to store a blow-up of detail that doesn't exist.
 */
export default function DitheredVideo({ src, poster, className = '', style }) {
  return (
    <video
      src={`${src}.mp4`}
      poster={poster}
      muted
      loop
      playsInline
      autoPlay
      preload="auto"
      aria-hidden="true"
      className={`w-full h-full object-cover ${className}`}
      style={{ imageRendering: 'pixelated', ...style }}
    />
  );
}
