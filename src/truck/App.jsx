import { useCallback, useEffect, useRef, useState } from 'react';
import '@fontsource/newsreader/400.css';
import '@fontsource/newsreader/500.css';
import '@fontsource/ibm-plex-mono/400.css';
import Mark, { Org } from '../water/Mark';

/* eslint-disable react/prop-types */

// Truck art, used as the real painted material rather than as vectors.
//
// The generated version failed because the craft is not geometric. A real panel
// is hand-painted: the flowers have weight and brush texture, the sequence along
// a border alternates between several motifs rather than repeating one, and no
// two units are identical. None of that survives being reduced to a petal path.
//
// So the ornament here is cut from the photographs themselves. The border run is
// a detected repeat — autocorrelated rather than guessed, which is what removes
// the seam — assembled into a frame tile and applied with CSS border-image, the
// one property actually designed for ornamental frames. It wraps a box of any
// size the way a painter wraps a panel of any size.
//
// Nothing on this page animates on its own. Everything that moves is answering
// the pointer, at a depth of its own.

const NIGHT = '#140a08';
const CREAM = '#f6efdf';
const MARIGOLD = '#ed9d0f';
const CYAN = '#15aac1';

// Frame tile is 432px square with a 116px slice; 26px of border renders the run
// at a weight that reads without swallowing small panels.
const FRAME = {
  border: '26px solid transparent',
  borderImage: 'url(/truck/frame.png) 116 round',
};
const frameAt = (px) => ({ border: `${px}px solid transparent`, borderImage: 'url(/truck/frame.png) 116 round' });

// --- background -----------------------------------------------------------

// Scattered, not tiled. Each piece has its own size, rotation, opacity and
// parallax depth, so the field never resolves into a grid and never moves as
// one block.
const SCATTER = [
  { src: '/truck/rosette.jpg', top: '-6%', left: '-8%', w: 620, rot: -8, op: 0.9, depth: 26 },
  { src: '/truck/peacock.jpg', top: '34%', left: '62%', w: 760, rot: 5, op: 0.85, depth: 14 },
  { src: '/truck/fan.jpg', top: '58%', left: '4%', w: 480, rot: 12, op: 0.8, depth: 34 },
  { src: '/truck/rosette.jpg', top: '72%', left: '44%', w: 380, rot: 22, op: 0.72, depth: 46 },
  { src: '/truck/chain.jpg', top: '12%', left: '30%', w: 900, rot: -3, op: 0.78, depth: 20 },
  { src: '/truck/fan.jpg', top: '-2%', left: '72%', w: 420, rot: -16, op: 0.75, depth: 40 },
  { src: '/truck/peacock.jpg', top: '76%', left: '-4%', w: 560, rot: -11, op: 0.66, depth: 30 },
  { src: '/truck/rosette.jpg', top: '46%', left: '26%', w: 440, rot: 15, op: 0.6, depth: 52 },
  { src: '/truck/chain.jpg', top: '88%', left: '55%', w: 780, rot: 4, op: 0.6, depth: 24 },
];

const Field = ({ p }) => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true"
    style={{ background: NIGHT }}>
    {SCATTER.map((s, k) => (
      <img
        key={k}
        src={s.src}
        alt=""
        style={{
          position: 'absolute',
          top: s.top,
          left: s.left,
          width: s.w,
          opacity: s.op,
          transform: `translate3d(${p.x * s.depth}px, ${p.y * s.depth}px, 0) rotate(${s.rot}deg)`,
          transition: 'transform 700ms cubic-bezier(0.16,0.8,0.24,1)',
          filter: 'saturate(1.2) contrast(1.05)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, #000 38%, rgba(0,0,0,0.55) 66%, transparent 88%)',
          maskImage: 'radial-gradient(ellipse at center, #000 38%, rgba(0,0,0,0.55) 66%, transparent 88%)',
        }}
      />
    ))}
    {/* Enough ground to read type against; the paint still shows through. */}
    <div className="absolute inset-0" style={{ background: 'rgba(20,10,8,0.30)' }} />
  </div>
);

// --- content --------------------------------------------------------------

const PROJECTS = [
  { title: 'Zybit', mark: '/logos/zybit.png', href: 'https://getzybit.com', shot: '/shots/zybit.png',
    meta: 'LIVE · 3 CLINICS',
    blurb: 'Voice AI that writes a dentist’s spoken findings straight into Open Dental — right tooth, their own codes.' },
  { title: 'Reckon Review', href: 'https://www.reckonreview.dev', shot: '/shots/reckon.png', meta: 'LIVE',
    blurb: 'A GitHub app that won’t let a pull request merge until a human can explain, in their own words, what it does.' },
  { title: 'Kite Credit', href: 'https://kitecredit.xyz', shot: '/kitecredit-screenshot.png', meta: 'LIVE',
    blurb: 'A credit score for people with no local credit file — ZK-verified bank statements, GitHub history, wallet activity.' },
  { title: 'CommitMint', mark: '/logos/commitmint.ico', href: 'https://commitmint.app',
    shot: '/commitmint-screenshot.png', meta: '★ 3RD, SOLANA',
    blurb: 'Stake money on your own goals; it pays out only once your progress is verified, settled on Anchor contracts.' },
];

const BOOKS = [
  ['The Count of Monte Cristo', 'Dumas', '/books/monte-cristo.jpg'],
  ['Kafka on the Shore', 'Murakami', '/books/kafka-shore.jpg'],
  ['Down and Out in Paris and London', 'Orwell', '/books/down-and-out.jpg'],
  ['The Picture of Dorian Gray', 'Wilde', '/books/dorian-gray.jpg'],
  ['The Kite Runner', 'Hosseini', '/books/kite-runner.jpg'],
  ['Life 3.0', 'Tegmark', '/books/life-3.jpg'],
  ['The Alchemist', 'Coelho', '/books/alchemist.jpg'],
  ['Twenty Thousand Leagues', 'Verne', '/books/20000-leagues.jpg'],
];

const Plate = ({ children }) => (
  // The painted name plate above a tailgate: the chain-link panel is the real
  // strip from the reference, cropped to a band and used as the plate's ground.
  <div className="relative inline-block px-10 py-2.5"
    style={{
      backgroundImage: 'url(/truck/chain.jpg)',
      backgroundSize: 'auto 100%',
      backgroundPosition: 'center',
      boxShadow: `0 0 0 2px ${MARIGOLD}, 0 0 0 5px #8f1d12`,
    }}>
    <span className="relative font-mono text-[11px] tracking-[0.24em] uppercase px-3 py-1"
      style={{ color: CREAM, background: 'rgba(18,8,6,0.72)', boxShadow: `0 0 0 1px ${MARIGOLD}` }}>{children}</span>
  </div>
);

const Section = ({ children, pad = 'px-7 md:px-12 py-11 md:py-14' }) => (
  <div style={{ ...FRAME, background: 'rgba(38,11,10,0.95)' }}>
    <div className={pad}>{children}</div>
  </div>
);

const Hello = () => (
  <Section>
    <div className="text-center">
      <Plate>Karachi · Bahrain · Ithaca</Plate>
      <h1 className="mt-6 text-[52px] md:text-[74px] leading-[0.93] tracking-[-0.02em]" style={{ color: CREAM }}>
        Asad Rizvi
      </h1>
    </div>
    <div className="mt-8 mx-auto max-w-[58ch] text-[18px] md:text-[19px] leading-[1.62]" style={{ color: '#efe3d2' }}>
      <p>
        I&apos;m a CS student at <Org src="/logos/cornell.png" href="https://www.cornell.edu">Cornell</Org> and
        the founder of <Org src="/logos/zybit.png" href="https://getzybit.com">Zybit</Org>, voice AI that writes
        up a dentist&apos;s notes while they&apos;re still working on you. It&apos;s running in three clinics and
        backed by <Org src="/logos/cornell.png" href="https://eship.cornell.edu">eLab</Org>.
      </p>
      <p className="mt-4">
        I run LLM projects as VP of{' '}
        <Org src="/logos/genai.ico" href="https://cornellgenai.dev">Generative AI at Cornell</Org>, build
        on-chain with{' '}
        <Org src="/logos/cornellblockchain.png" href="https://cornellblockchain.org">Cornell Blockchain</Org>,
        run workshops for <Org src="/logos/akash.ico" href="https://akash.network">Akash</Org>, and took 3rd
        at the Global Solana Student Hackathon.
      </p>
      <p className="mt-4" style={{ color: '#dfcdb8' }}>
        Pakistani, grew up in Bahrain, now in Ithaca. Bass in a jazz band, box a little, once peaked top 20
        in competitive Pokémon. Every painted panel here is cut from photographs of real Pakistani trucks.
      </p>
    </div>
  </Section>
);

const ProjectCard = ({ p, tilt }) => (
  <a href={p.href} target="_blank" rel="noopener noreferrer" className="group block"
    style={{
      ...frameAt(20),
      background: '#1b0a09',
      transform: `perspective(900px) rotateX(${tilt.y * -1.6}deg) rotateY(${tilt.x * 1.6}deg)`,
      transition: 'transform 500ms cubic-bezier(0.16,0.8,0.24,1)',
    }}>
    <div className="overflow-hidden" style={{ background: NIGHT }}>
      <img src={p.shot} alt={p.title} loading="lazy"
        className="w-full aspect-[16/10] object-cover object-top transition-transform duration-500 group-hover:scale-[1.05]" />
    </div>
    <div className="px-4 pt-3.5 pb-4">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-[21px]" style={{ color: CREAM }}>
          {p.mark && <Mark src={p.mark} size={17} />}{p.title}
        </h3>
        <span className="font-mono text-[9px] tracking-wide shrink-0" style={{ color: MARIGOLD }}>{p.meta}</span>
      </div>
      <p className="mt-1.5 text-[14.5px] leading-[1.5]" style={{ color: '#c9b9a6' }}>{p.blurb}</p>
      <span className="mt-2.5 inline-block font-mono text-[9.5px] tracking-[0.2em]"
        style={{ color: CYAN }}>OPEN →</span>
    </div>
  </a>
);

const Work = ({ tilt }) => (
  <div>
    <div className="text-center mb-9"><Plate>Selected work</Plate></div>
    <div className="grid sm:grid-cols-2 gap-7 md:gap-9">
      {PROJECTS.map((p) => <ProjectCard key={p.title} p={p} tilt={tilt} />)}
    </div>
    <div className="mt-9 text-center">
      <a href="https://github.com/Archdiner" target="_blank" rel="noopener noreferrer"
        className="font-mono text-[10.5px] tracking-[0.2em]" style={{ color: MARIGOLD }}>
        EVERYTHING ELSE ON GITHUB →
      </a>
    </div>
  </div>
);

const Writing = () => (
  <Section>
    <div className="text-center"><Plate>Writing</Plate></div>
    <ul className="mt-8 mx-auto max-w-[60ch] space-y-6">
      {[
        ['Arteta-Ball', '/research/arteta_wharton-2.pdf', 'RESEARCH · 2025',
          'Modelling Arsenal’s possession play as a Markov chain, to ask which build-up patterns actually end in a shot.'],
        ['Gradient Integrity', '/research/gradient-integrity.pdf', 'RESEARCH · 2025',
          'How to check that a GPU you rented on a decentralised network really ran the training step it billed you for.'],
        ['The volume numbers are fake', 'https://github.com/Archdiner/blockchain_trading_volume_generator', 'WRITE-UP',
          'I wrote the wash-trading bot to show how little it costs to manufacture the volume quoted on token listings.'],
      ].map(([t, h, m, b]) => (
        <li key={t} style={{ borderTop: '1px solid rgba(237,157,15,0.28)', paddingTop: 14 }}>
          <div className="flex items-baseline justify-between gap-3">
            <a href={h} target="_blank" rel="noopener noreferrer" className="text-[20px] link-ul"
              style={{ color: CREAM }}>{t}</a>
            <span className="font-mono text-[9px] shrink-0" style={{ color: CYAN }}>{m}</span>
          </div>
          <p className="mt-1 text-[15.5px] leading-[1.5]" style={{ color: '#c9b9a6' }}>{b}</p>
        </li>
      ))}
    </ul>
  </Section>
);

const Reading = () => (
  <Section>
    <div className="text-center"><Plate>On the shelf</Plate></div>
    <p className="mt-6 mx-auto max-w-[50ch] text-center text-[17px] leading-[1.6]" style={{ color: '#e3d4c1' }}>
      I read constantly, mostly fiction, mostly old. These are the ones I keep going back to.
    </p>
    <div className="mt-9 grid grid-cols-4 sm:grid-cols-8 gap-3 md:gap-4">
      {BOOKS.map(([t, a, c]) => (
        <figure key={t} className="group">
          <img src={c} alt={t} loading="lazy"
            className="w-full aspect-[2/3] object-cover transition-transform duration-300 group-hover:-translate-y-1.5"
            style={{ boxShadow: `0 0 0 2px ${MARIGOLD}, 0 10px 22px rgba(0,0,0,0.55)` }} />
          <figcaption className="mt-2 font-mono text-[8px] tracking-wide" style={{ color: '#a89682' }}>{a}</figcaption>
        </figure>
      ))}
    </div>
  </Section>
);

const SECTIONS = [
  { name: 'Hello', Body: Hello },
  { name: 'Work', Body: Work },
  { name: 'Writing', Body: Writing },
  { name: 'Reading', Body: Reading },
];

// --- shell ----------------------------------------------------------------

export default function TruckSite() {
  const [i, setI] = useState(0);
  const [p, setP] = useState({ x: 0, y: 0 });
  const raf = useRef(0);
  const n = SECTIONS.length;
  const go = useCallback((d) => setI((v) => (v + d + n) % n), [n]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    const onMove = (e) => {
      // Coalesced into a frame: a pointermove fires far more often than the
      // screen refreshes, and setting state on every one of them is what makes
      // pointer-driven motion feel like jitter instead of drift.
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => setP({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      }));
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointermove', onMove);
    };
  }, [go]);

  const { Body } = SECTIONS[i];

  return (
    <div className="relative min-h-screen" style={{ fontFamily: 'Newsreader, Georgia, serif', background: NIGHT }}>
      <Field p={p} />

      <div className="relative">
        <header className="sticky top-0 z-20"
          style={{ background: 'rgba(16,8,7,0.9)', backdropFilter: 'blur(7px)', borderBottom: `2px solid ${MARIGOLD}` }}>
          <nav className="mx-auto max-w-[1160px] px-6 py-3 flex flex-wrap items-center gap-x-4 gap-y-2
                          font-mono text-[10.5px] tracking-[0.16em] uppercase">
            <button onClick={() => go(-1)} aria-label="Previous" style={{ color: MARIGOLD }}>←</button>
            <span className="tabular-nums" style={{ color: CREAM }}>
              {String(i + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
            </span>
            <button onClick={() => go(1)} aria-label="Next" style={{ color: MARIGOLD }}>→</button>
            <span className="flex gap-4 ml-2">
              {SECTIONS.map((s, k) => (
                <button key={s.name} onClick={() => setI(k)}
                  style={{ color: k === i ? CYAN : '#9b8a7a' }}>{s.name}</button>
              ))}
            </span>
            <a href="mailto:sar367@cornell.edu" className="ml-auto" style={{ color: CREAM }}>Email</a>
          </nav>
        </header>

        <main className="mx-auto max-w-[1160px] px-4 md:px-8 py-10 md:py-14">
          <div key={i} className="slide-in"><Body tilt={p} /></div>

          <footer className="mt-12 text-center">
            <div className="mx-auto w-fit px-8 py-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2
                            font-mono text-[10px] tracking-[0.18em] uppercase"
              style={{ ...frameAt(18), background: '#1b0a09', color: '#f0e2cf' }}>
              <a href="mailto:sar367@cornell.edu" className="link-ul" style={{ color: MARIGOLD }}>Email</a>
              <a href="https://github.com/Archdiner" className="link-ul">GitHub</a>
              <a href="https://www.linkedin.com/in/asad-rizvi-02a1782a2/" className="link-ul">LinkedIn</a>
              <a href="https://x.com/carne_asado" className="link-ul">X</a>
              <a href="/Rizvi_Asad_Resume.pdf" className="link-ul">Résumé</a>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
