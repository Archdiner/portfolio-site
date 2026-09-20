import React, { useCallback, useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource/newsreader/400.css';
import '@fontsource/newsreader/500.css';
import '@fontsource/newsreader/400-italic.css';
import '@fontsource/ibm-plex-mono/400.css';
import Mark, { Org } from './Mark';
import '../index.css';

/* eslint-disable react/prop-types */

// The page is the sea, and the halftone is rendered on transparency so the dots
// sit directly on that gradient.
//
// Baking a background into the image cannot work here: the image's ramp runs
// over the image, the page's over the viewport, and the two scales never agree,
// which is what made an earlier version read as a slightly wrong rectangle. A
// flat page fixes that but loses the depth. Transparency costs ~450KB of alpha
// channel and buys a blend that holds at any size, position or viewport.
// Each slide changes the whole page, not just the words. Lance goes white →
// black → black → sky; the image, the background and the crop all move. Holding
// one picture across four sections is what made this read as a deck of the same
// slide with different text on it.
//
// Sea slides carry an alpha halftone over a gradient. Truck-art slides bake a
// flat near-black behind the dots and paint the page the same colour — flat on
// flat needs no alpha channel, which is what keeps them under 350KB.
// Each slide changes the whole page: background, image, and where that image
// sits. Lance goes white → black → black → sky, and the picture moves with it —
// a portrait held to one side, an orchid sprawling off the bottom-right corner,
// a mountain filling the lower half edge to edge. Holding one picture in one
// tidy column across four sections is what made an earlier pass read as a deck
// of the same slide with different words on it.
//
// `place` is what does that work: absolute insets so an image can run off the
// viewport instead of being politely contained. Bleeding off the canvas is most
// of why the reference feels composed rather than laid out.
const LOOKS = [
  {
    name: 'Hello',
    bg: 'linear-gradient(to bottom, #3a8b94 0%, #00477f 100%)',
    img: 'media/dugong-hero.webp',
    alt: 'A dugong gliding over a seagrass meadow, as a halftone screen',
    place: { top: '4%', right: '-4%', height: '92vh' },
    feather: 'linear-gradient(to right, transparent 0%, #000 14%, #000 100%), linear-gradient(to bottom, transparent 0%, #000 8%, #000 86%, transparent 100%)',
  },
  {
    name: 'Work',
    bg: '#120607',
    img: 'media/art-rosette.jpg',
    alt: 'A hand-painted rosette on the tailgate of a Pakistani truck',
    // Oversized and pushed off two edges, so you see a fragment of something
    // much bigger rather than a photograph centred in a box.
    place: { top: '-14%', right: '-16%', height: '128vh' },
    feather: 'linear-gradient(to right, transparent 0%, #000 26%, #000 100%), linear-gradient(to bottom, transparent 0%, #000 18%, #000 82%, transparent 100%)',
  },
  {
    name: 'Writing',
    bg: '#1e6268',
    img: 'media/slide-writing.jpg',
    alt: 'A dugong facing the camera with a mouthful of seagrass, as a halftone screen',
    place: { top: '8%', right: '2%', height: '84vh' },
    feather: 'linear-gradient(to right, transparent 0%, #000 12%, #000 90%, transparent 100%), linear-gradient(to bottom, transparent 0%, #000 8%, #000 84%, transparent 100%)',
  },
  {
    name: 'Reading',
    bg: '#0c0507',
    img: 'media/art-peacock.jpg',
    alt: 'A painted peacock on the door of a Pakistani truck',
    // Low and wide off the bottom-right, the way the orchid sprawls.
    place: { bottom: '-22%', right: '-10%', height: '116vh' },
    feather: 'linear-gradient(to right, transparent 0%, #000 22%, #000 100%), linear-gradient(to bottom, transparent 0%, #000 16%, #000 100%)',
  },
];
const SLIDES = LOOKS.map((l) => l.name);
const P = 'text-[19px] md:text-[20px] leading-[1.6]';

// --- slide bodies ---------------------------------------------------------

const Hello = () => (
  <>
    <h1 className="text-[54px] md:text-[68px] leading-[0.94] tracking-[-0.025em]">Asad Rizvi</h1>
    <p className={`mt-7 ${P} text-white/90`}>
      I&apos;m a CS student at{' '}
      <Org src="logos/cornell.png" href="https://www.cornell.edu">Cornell</Org> and the founder of{' '}
      <Org src="logos/zybit.png" href="https://getzybit.com">Zybit</Org>, voice AI that writes up a
      dentist&apos;s notes while they&apos;re still working on you. It&apos;s running in three
      clinics and backed by{' '}
      <Org src="logos/cornell.png" href="https://eship.cornell.edu">eLab</Org>.
    </p>
    <p className={`mt-5 ${P} text-white/80`}>
      I also run LLM projects as VP of{' '}
      <Org src="logos/genai.ico" href="https://cornellgenai.dev">Generative AI at Cornell</Org>,
      build on-chain with{' '}
      <Org src="logos/cornellblockchain.png" href="https://cornellblockchain.org">Cornell Blockchain</Org>,
      run campus workshops for{' '}
      <Org src="logos/akash.ico" href="https://akash.network">Akash</Org>, and took 3rd at the
      Global Solana Student Hackathon.
    </p>
    <p className={`mt-5 ${P} text-white/75`}>
      Pakistani, grew up in Bahrain, now in Ithaca. I play bass in a jazz band, box a little, and
      once peaked top 20 in competitive Pokémon. The sea I grew up on has one of the biggest dugong
      herds left in the world. Almost nobody knows that.
    </p>
  </>
);

const Item = ({ title, mark, href, meta, children }) => (
  <li className="border-t border-white/15 pt-3">
    <div className="flex items-baseline justify-between gap-4">
      <a href={href} target="_blank" rel="noopener noreferrer"
        className="text-[21px] md:text-[22px] link-ul hover:text-white transition-colors">
        {mark && <Mark src={mark} size={17} />}{title}</a>
      <span className="font-mono text-[10px] tracking-wide text-white/45 shrink-0">{meta}</span>
    </div>
    <p className="mt-1 text-[17px] leading-[1.5] text-white/70">{children}</p>
  </li>
);

const Work = () => (
  <>
    <h2 className="text-[40px] md:text-[48px] leading-[1.0] tracking-[-0.02em]">Work</h2>
    <ul className="mt-7 space-y-5">
      <Item title="Zybit" mark="/logos/zybit.png" href="https://getzybit.com" meta="LIVE · 3 CLINICS">
        Voice AI that writes a dentist&apos;s spoken findings straight into Open Dental, on the right
        tooth and in their own codes.
      </Item>
      <Item title="Reckon Review" href="https://www.reckonreview.dev" meta="LIVE">
        A GitHub app that won&apos;t let a pull request merge until a human can explain, in their own
        words, what the change actually does.
      </Item>
      <Item title="Kite Credit" href="https://kitecredit.xyz" meta="LIVE">
        A credit score for people with no local credit file, assembled from ZK-verified bank
        statements, GitHub history and wallet activity.
      </Item>
      <Item title="CommitMint" mark="/logos/commitmint.ico" href="https://commitmint.app" meta="★ 3RD, SOLANA">
        Stake money on your own goals; it only pays out once your progress is verified. Settlement
        runs on Anchor contracts.
      </Item>
    </ul>
    <a href="https://github.com/Archdiner" target="_blank" rel="noopener noreferrer"
      className="mt-6 inline-block font-mono text-[11px] tracking-wide text-white/55 link-ul">
      MORE ON GITHUB →
    </a>
  </>
);

const Writing = () => (
  <>
    <h2 className="text-[40px] md:text-[48px] leading-[1.0] tracking-[-0.02em]">Writing</h2>
    <ul className="mt-7 space-y-5">
      <Item title="Arteta-Ball" href="research/arteta_wharton-2.pdf" meta="RESEARCH · 2025">
        Modelling Arsenal&apos;s possession play as a Markov chain, to ask which build-up patterns
        actually end in a shot.
      </Item>
      <Item title="Gradient Integrity" href="research/gradient-integrity.pdf" meta="RESEARCH · 2025">
        How to check that a GPU you rented on a decentralised network really ran the training step
        it billed you for.
      </Item>
      <Item title="The volume numbers are fake"
        href="https://github.com/Archdiner/blockchain_trading_volume_generator" meta="WRITE-UP">
        I wrote the wash-trading bot to show how little it costs to manufacture the trading volume
        quoted on token listings.
      </Item>
    </ul>
  </>
);

const Life = () => (
  <>
    <h2 className="text-[40px] md:text-[48px] leading-[1.0] tracking-[-0.02em]">Off the clock</h2>
    <p className={`mt-7 ${P} text-white/85`}>
      I play bass in a jazz band, box a little, and once peaked top 20 in competitive Pokémon VGC.
      I read constantly — Monte Cristo, Kafka on the Shore, Down and Out in Paris and London.
    </p>
    <p className={`mt-5 ${P} text-white/75`}>
      I have a grey Persian cat called Leo. My family is Pakistani; I grew up in Bahrain, which is
      where the dugongs are. The painted panels on this page are Pakistani truck art.
    </p>
    <p className={`mt-7 ${P} text-white/90`}>
      Open to internships, and to building things with people. If you&apos;re working on applied AI
      or crypto infrastructure,{' '}
      <a href="mailto:sar367@cornell.edu" className="text-white link-ul">email me</a>.
    </p>
  </>
);

const BODIES = [Hello, Work, Writing, Life];

// --- shell ----------------------------------------------------------------

const Site = () => {
  const [i, setI] = useState(0);
  const n = SLIDES.length;
  const go = useCallback((d) => setI((v) => (v + d + n) % n), [n]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go]);

  const Body = BODIES[i];
  const look = LOOKS[i];

  return (
    <main
      className="relative min-h-screen w-full overflow-x-hidden"
      style={{
        background: look.bg,
        transition: 'background 500ms ease',
        fontFamily: 'Newsreader, Georgia, serif',
        color: '#f2f6f7',
      }}
    >
      {/* The picture is a layer, not a column: absolute, sized in viewport units,
          and allowed to run past the edges. Bleeding off the canvas is most of
          why the reference reads as composed rather than laid out. */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden hidden md:block" aria-hidden="true">
        <img
          key={look.img}
          src={look.img}
          alt=""
          className="absolute max-w-none slide-in"
          style={{
            ...look.place,
            WebkitMaskImage: look.feather,
            maskImage: look.feather,
            WebkitMaskComposite: 'source-in',
            maskComposite: 'intersect',
          }}
        />
      </div>

      <div className="relative mx-auto max-w-[1240px] px-7 md:px-14 py-12 md:py-16
                      grid gap-8 md:gap-0 md:grid-cols-12 items-center min-h-screen">
        <div className="md:col-span-5 md:pr-12">
          {/* Lance's 01 / 04 — a mechanism rather than a label. It promises there
              is more, and gives the eye somewhere to click. */}
          <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-8 font-mono text-[11px] tracking-wide">
            <button onClick={() => go(-1)} aria-label="Previous"
              className="text-white/45 hover:text-white transition-colors px-1">←</button>
            <span className="tabular-nums text-white/55">
              {String(i + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
            </span>
            <button onClick={() => go(1)} aria-label="Next"
              className="text-white/80 hover:text-white transition-colors px-1">→</button>
            <span className="flex gap-3 ml-1">
              {SLIDES.map((s, k) => (
                <button key={s} onClick={() => setI(k)}
                  className={`transition-colors ${k === i ? 'text-white' : 'text-white/35 hover:text-white/70'}`}>
                  {s}
                </button>
              ))}
            </span>
          </nav>

          {/* Keyed so each slide re-mounts and replays its entrance rather than
              cross-fading one block of text into a different one. */}
          <div key={i} className="slide-in">
            <Body />
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-2
                          font-mono text-[11px] tracking-wide text-white/55">
            <a href="mailto:sar367@cornell.edu" className="text-white link-ul">EMAIL</a>
            <a href="https://github.com/Archdiner" className="link-ul">GITHUB</a>
            <a href="https://www.linkedin.com/in/asad-rizvi-02a1782a2/" className="link-ul">LINKEDIN</a>
            <a href="https://x.com/carne_asado" className="link-ul">X</a>
            <a href="Rizvi_Asad_Resume.pdf" className="link-ul">RÉSUMÉ</a>
          </div>
        </div>

        {/* On phones the picture stacks under the words instead of bleeding,
            since there is no margin to bleed into. */}
        <div className="md:hidden -mx-7">
          <img src={look.img} alt={look.alt} className="w-full h-auto" />
        </div>
      </div>
    </main>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Site />
  </React.StrictMode>,
);
