import { useCallback, useEffect, useState } from 'react';
import '@fontsource/newsreader/400.css';
import '@fontsource/newsreader/500.css';
import '@fontsource/ibm-plex-mono/400.css';
import Mark, { Org } from '../water/Mark';
import { INK, Panel, PetalBorder, Rosette, Studs, Fringe } from './Ornament';

/* eslint-disable react/prop-types */

// A truck is not decorated as one surface. It is divided into rectangles, and
// each rectangle is framed, bordered and then painted inside. That division is
// what lets this page be as loud as the reference photographs while the text
// stays readable: the ornament all happens in the frames, and the field inside
// each panel stays calm enough to read.

// --- the painted field ----------------------------------------------------

/**
 * The surface everything is bolted to. Bands of border run stacked down the
 * viewport with rosettes riding the seams, drifting slightly against the
 * pointer so the page has the depth of a real painted panel catching light
 * rather than a flat wallpaper.
 */
const Field = ({ offset }) => (
  <div className="fixed inset-0 overflow-hidden" aria-hidden="true"
    style={{ background: INK.night }}>
    <div
      className="absolute"
      style={{
        inset: '-8%',
        transform: `translate3d(${offset.x * -14}px, ${offset.y * -14}px, 0)`,
        transition: 'transform 380ms cubic-bezier(0.2,0.7,0.2,1)',
      }}
    >
      {Array.from({ length: 20 }, (_, r) => (
        <div key={r} className="relative" style={{ marginBottom: 26 }}>
          <PetalBorder height={30} phase={r % 6}
            bg={[INK.deepRed, INK.green, INK.indigo, INK.darkWood][r % 4]} />
          <div className="flex justify-around" style={{ marginTop: -58 }}>
            {Array.from({ length: 7 }, (_, c) => (
              <Rosette key={c} size={84}
                outer={[INK.red, INK.marigold, INK.cyan][(r + c) % 3]}
                inner={[INK.cyan, INK.teal, INK.red][(r + c) % 3]}
                spin={((r + c) % 3) * 0 + 34 + ((r * 7 + c) % 5) * 9}
                style={{ opacity: 0.92 }} />
            ))}
          </div>
        </div>
      ))}
    </div>
    {/* Hold the field back just enough that type on top of it is legible. */}
    <div className="absolute inset-0" style={{ background: 'rgba(14,8,10,0.34)' }} />
  </div>
);

// --- content --------------------------------------------------------------

const PROJECTS = [
  {
    title: 'Zybit', mark: '/logos/zybit.png', href: 'https://getzybit.com',
    shot: '/shots/zybit.png', meta: 'LIVE · 3 CLINICS',
    blurb: 'Voice AI that writes a dentist’s spoken findings straight into Open Dental, on the right tooth and in their own codes.',
  },
  {
    title: 'Reckon Review', href: 'https://www.reckonreview.dev',
    shot: '/shots/reckon.png', meta: 'LIVE',
    blurb: 'A GitHub app that won’t let a pull request merge until a human can explain, in their own words, what the change does.',
  },
  {
    title: 'Kite Credit', href: 'https://kitecredit.xyz',
    shot: '/kitecredit-screenshot.png', meta: 'LIVE',
    blurb: 'A credit score for people with no local credit file — ZK-verified bank statements, GitHub history, wallet activity.',
  },
  {
    title: 'CommitMint', mark: '/logos/commitmint.ico', href: 'https://commitmint.app',
    shot: '/commitmint-screenshot.png', meta: '★ 3RD, SOLANA',
    blurb: 'Stake money on your own goals; it only pays out once your progress is verified. Settlement runs on Anchor contracts.',
  },
];

const BOOKS = [
  { t: 'The Count of Monte Cristo', a: 'Dumas', c: '/books/monte-cristo.jpg' },
  { t: 'Kafka on the Shore', a: 'Murakami', c: '/books/kafka-shore.jpg' },
  { t: 'Down and Out in Paris and London', a: 'Orwell', c: '/books/down-and-out.jpg' },
  { t: 'The Picture of Dorian Gray', a: 'Wilde', c: '/books/dorian-gray.jpg' },
  { t: 'The Kite Runner', a: 'Hosseini', c: '/books/kite-runner.jpg' },
  { t: 'Life 3.0', a: 'Tegmark', c: '/books/life-3.jpg' },
  { t: 'The Alchemist', a: 'Coelho', c: '/books/alchemist.jpg' },
  { t: 'Twenty Thousand Leagues', a: 'Verne', c: '/books/20000-leagues.jpg' },
];

const Plate = ({ children, className = '' }) => (
  // The hand-lettered name plate every truck carries above its tailgate.
  <div className={`inline-block px-5 py-1.5 ${className}`}
    style={{ background: INK.marigold, color: INK.night, boxShadow: `0 0 0 2px ${INK.deepRed}, 0 0 0 5px ${INK.cream}` }}>
    <span className="font-mono text-[11px] tracking-[0.22em] uppercase">{children}</span>
  </div>
);

const Hello = () => (
  <Panel tone={INK.deepRed} field="#2a0d10" className="px-8 md:px-12 pt-12 pb-14">
    <div className="text-center">
      <Plate>Karachi to Ithaca</Plate>
      <h1 className="mt-5 text-[56px] md:text-[76px] leading-[0.92] tracking-[-0.02em]"
        style={{ color: INK.cream }}>Asad Rizvi</h1>
      <div className="mt-3 flex justify-center"><Rosette size={54} spin={38} /></div>
    </div>
    <div className="mt-8 mx-auto max-w-[58ch] text-[18px] md:text-[19px] leading-[1.62]"
      style={{ color: '#f0e6d6' }}>
      <p>
        I&apos;m a CS student at <Org src="/logos/cornell.png" href="https://www.cornell.edu">Cornell</Org>{' '}
        and the founder of <Org src="/logos/zybit.png" href="https://getzybit.com">Zybit</Org>, voice AI
        that writes up a dentist&apos;s notes while they&apos;re still working on you. It&apos;s running
        in three clinics and backed by{' '}
        <Org src="/logos/cornell.png" href="https://eship.cornell.edu">eLab</Org>.
      </p>
      <p className="mt-4">
        I run LLM projects as VP of{' '}
        <Org src="/logos/genai.ico" href="https://cornellgenai.dev">Generative AI at Cornell</Org>, build
        on-chain with{' '}
        <Org src="/logos/cornellblockchain.png" href="https://cornellblockchain.org">Cornell Blockchain</Org>,
        run workshops for <Org src="/logos/akash.ico" href="https://akash.network">Akash</Org>, and took
        3rd at the Global Solana Student Hackathon.
      </p>
      <p className="mt-4" style={{ color: '#e2d3c0' }}>
        Pakistani, grew up in Bahrain, now in Ithaca. Bass in a jazz band, box a little, once peaked
        top 20 in competitive Pokémon. The ornament on this page is Pakistani truck art — drawn, not
        photographed.
      </p>
    </div>
  </Panel>
);

const ProjectPanel = ({ p }) => (
  <a href={p.href} target="_blank" rel="noopener noreferrer" className="group block">
    <Panel tone={INK.green} field="#0c1a16" corners={false}
      className="overflow-hidden transition-transform duration-300 group-hover:-translate-y-1.5">
      <div className="pt-4 overflow-hidden" style={{ background: INK.night }}>
        <img src={p.shot} alt={p.title} loading="lazy"
          className="w-full aspect-[16/10] object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]" />
      </div>
      <div className="px-5 pt-4 pb-7">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-[22px]" style={{ color: INK.cream }}>
            {p.mark && <Mark src={p.mark} size={17} />}{p.title}
          </h3>
          <span className="font-mono text-[9.5px] tracking-wide shrink-0" style={{ color: INK.marigold }}>{p.meta}</span>
        </div>
        <p className="mt-1.5 text-[15px] leading-[1.5]" style={{ color: '#cdbfae' }}>{p.blurb}</p>
        <span className="mt-3 inline-block font-mono text-[10px] tracking-[0.18em]"
          style={{ color: INK.cyan }}>OPEN →</span>
      </div>
    </Panel>
  </a>
);

const Work = () => (
  <div>
    <div className="text-center mb-10"><Plate>Selected work</Plate></div>
    <div className="grid sm:grid-cols-2 gap-10 md:gap-12">
      {PROJECTS.map((p) => <ProjectPanel key={p.title} p={p} />)}
    </div>
    <div className="mt-10 text-center">
      <a href="https://github.com/Archdiner" target="_blank" rel="noopener noreferrer"
        className="font-mono text-[11px] tracking-[0.18em]" style={{ color: INK.marigold }}>
        EVERYTHING ELSE ON GITHUB →
      </a>
    </div>
  </div>
);

const Writing = () => (
  <Panel tone={INK.indigo} field="#101a3a" className="px-8 md:px-12 pt-12 pb-14">
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
        <li key={t} className="pt-4" style={{ borderTop: `1px solid ${INK.indigo}` }}>
          <div className="flex items-baseline justify-between gap-3">
            <a href={h} target="_blank" rel="noopener noreferrer" className="text-[21px] link-ul"
              style={{ color: INK.cream }}>{t}</a>
            <span className="font-mono text-[9.5px] shrink-0" style={{ color: INK.cyan }}>{m}</span>
          </div>
          <p className="mt-1 text-[16px] leading-[1.5]" style={{ color: '#c9c2d6' }}>{b}</p>
        </li>
      ))}
    </ul>
  </Panel>
);

const Reading = () => (
  <Panel tone={INK.vermilion} field="#2c150b" className="px-7 md:px-11 pt-12 pb-16">
    <div className="text-center"><Plate>On the shelf</Plate></div>
    <p className="mt-6 mx-auto max-w-[52ch] text-center text-[17px] leading-[1.6]"
      style={{ color: '#e6d9c6' }}>
      I read constantly, mostly fiction, mostly old. These are the ones I keep going back to.
    </p>
    <div className="mt-9 grid grid-cols-4 sm:grid-cols-8 gap-3 md:gap-4">
      {BOOKS.map((b) => (
        <figure key={b.t} className="group">
          <div className="relative" style={{ boxShadow: `0 0 0 2px ${INK.marigold}, 0 8px 18px rgba(0,0,0,0.5)` }}>
            <img src={b.c} alt={b.t} loading="lazy"
              className="w-full aspect-[2/3] object-cover transition-transform duration-300 group-hover:-translate-y-1" />
          </div>
          <figcaption className="mt-2 font-mono text-[8.5px] leading-tight tracking-wide"
            style={{ color: '#b7a894' }}>{b.a}</figcaption>
        </figure>
      ))}
    </div>
  </Panel>
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
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const n = SECTIONS.length;
  const go = useCallback((d) => setI((v) => (v + d + n) % n), [n]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    const onMove = (e) => setOffset({
      x: (e.clientX / window.innerWidth - 0.5) * 2,
      y: (e.clientY / window.innerHeight - 0.5) * 2,
    });
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointermove', onMove);
    };
  }, [go]);

  const { Body } = SECTIONS[i];

  return (
    <div className="relative min-h-screen" style={{ fontFamily: 'Newsreader, Georgia, serif' }}>
      <Field offset={offset} />

      <div className="relative">
        <Studs height={16} />
        <header className="sticky top-0 z-20" style={{ background: 'rgba(14,8,10,0.86)', backdropFilter: 'blur(6px)' }}>
          <PetalBorder height={12} bg={INK.deepRed} />
          <nav className="mx-auto max-w-[1180px] px-6 py-3 flex flex-wrap items-center gap-x-4 gap-y-2
                          font-mono text-[11px] tracking-[0.14em] uppercase">
            <button onClick={() => go(-1)} aria-label="Previous" style={{ color: INK.marigold }}>←</button>
            <span className="tabular-nums" style={{ color: INK.cream }}>
              {String(i + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
            </span>
            <button onClick={() => go(1)} aria-label="Next" style={{ color: INK.marigold }}>→</button>
            <span className="flex gap-4 ml-2">
              {SECTIONS.map((s, k) => (
                <button key={s.name} onClick={() => setI(k)}
                  style={{ color: k === i ? INK.cyan : '#9a8b7c' }}
                  className="transition-colors hover:opacity-80">{s.name}</button>
              ))}
            </span>
            <a href="mailto:sar367@cornell.edu" className="ml-auto" style={{ color: INK.cream }}>Email</a>
          </nav>
          <PetalBorder height={12} bg={INK.green} phase={2} />
        </header>

        <main className="mx-auto max-w-[1180px] px-5 md:px-8 py-12 md:py-16">
          <div key={i} className="slide-in">
            <Body />
          </div>

          <footer className="mt-14">
            <Fringe count={26} className="px-2" />
            <div className="mt-6 mx-auto w-fit px-7 py-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-2
                            font-mono text-[10.5px] tracking-[0.16em] uppercase"
              style={{ color: '#e6d9c6', background: INK.night, boxShadow: `0 0 0 3px ${INK.deepRed}, 0 0 0 6px ${INK.marigold}` }}>
              <a href="mailto:sar367@cornell.edu" className="link-ul" style={{ color: INK.marigold }}>Email</a>
              <a href="https://github.com/Archdiner" className="link-ul">GitHub</a>
              <a href="https://www.linkedin.com/in/asad-rizvi-02a1782a2/" className="link-ul">LinkedIn</a>
              <a href="https://x.com/carne_asado" className="link-ul">X</a>
              <a href="/Rizvi_Asad_Resume.pdf" className="link-ul">Résumé</a>
            </div>
            <p className="mt-4 mx-auto w-fit px-3 py-1 text-center font-mono text-[9.5px] tracking-[0.2em] uppercase"
              style={{ color: '#d9c9b4', background: 'rgba(22,13,11,0.9)' }}>Ithaca, NY</p>
          </footer>
        </main>
      </div>
    </div>
  );
}
