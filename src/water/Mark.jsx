/* eslint-disable react/prop-types */

// Inline organisation marks, set into running prose.
//
// This is the detail that makes Lance's credential paragraph scan instead of
// blur: every org carries its own favicon at cap height, so the eye lands on
// the marks and reads the names around them. Nobody bothers to do it, which is
// exactly why it reads as care.
//
// The mark is decorative — the name beside it already says the thing — so it's
// aria-hidden and the text carries the meaning for a screen reader.
export default function Mark({ src, size = 16, className = '' }) {
  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      loading="lazy"
      className={`inline-block align-[-0.16em] mr-[0.28em] rounded-[3px] object-contain ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

// Name preceded by its mark, kept on one line so a wrap never orphans the icon
// from the word it belongs to.
export function Org({ src, href, children, size = 16 }) {
  const body = (
    <>
      <Mark src={src} size={size} />
      {children}
    </>
  );
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className="whitespace-nowrap link-ul">
      {body}
    </a>
  ) : (
    <span className="whitespace-nowrap">{body}</span>
  );
}
