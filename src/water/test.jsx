import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource/newsreader/400.css';
import '@fontsource/newsreader/500.css';
import '@fontsource/newsreader/400-italic.css';
import '@fontsource/ibm-plex-mono/400.css';
import WaterVideo from './WaterVideo';
import '../index.css';

// Composition study for the Gulf hero.
//
// Not a split screen. A half-and-half layout makes the footage a *panel* — two
// equal architectural slabs, which is what made the earlier pass read as a tech
// demo bolted to some text. This treats the water as an *object* instead: one
// aperture, cut into a field of warm paper, placed off-centre with real margins
// so the paper stays the dominant material and the water is the thing set into
// it. The feathered mask is doing most of that work — a hard rectangle reads as
// a video element, a soft edge reads as a window.

const Aperture = () => (
  <figure className="m-0 w-full">
    <div
      className="relative w-full"
      style={{
        aspectRatio: '3 / 4',
        // Feathered on all four sides so the footage dissolves into the paper
        // instead of ending at a border.
        WebkitMaskImage:
          'linear-gradient(to right, transparent 0%, #000 4%, #000 96%, transparent 100%), linear-gradient(to bottom, transparent 0%, #000 3.5%, #000 96.5%, transparent 100%)',
        maskImage:
          'linear-gradient(to right, transparent 0%, #000 4%, #000 96%, transparent 100%), linear-gradient(to bottom, transparent 0%, #000 3.5%, #000 96.5%, transparent 100%)',
        WebkitMaskComposite: 'source-in',
        maskComposite: 'intersect',
      }}
    >
      <WaterVideo
        src="media/dugong-glide"
        poster="media/dugong-glide-poster.jpg"
        className="w-full h-full"
      />
    </div>
    {/* A plate caption, the way a specimen sits under one in a naturalist
        volume. Costs nothing and does more for tone than any amount of chrome. */}
    <figcaption className="mt-4 flex items-baseline gap-3 font-mono text-[10.5px] tracking-wide text-muted">
      <span className="italic font-sans text-[12px] text-ink/70">Dugong dugon</span>
      <span className="h-px flex-1 bg-line" />
      <span className="hidden sm:inline">DRAG THE WATER</span>
      <span className="sm:hidden">TOUCH THE WATER</span>
    </figcaption>
  </figure>
);

const Study = () => (
  <main className="min-h-screen bg-paper text-ink" style={{ fontFamily: 'Newsreader, Georgia, serif' }}>
    {/* Asymmetric on purpose: 5/12 of text against 6/12 of water with a full
        column of gutter, rather than two equal halves meeting in the middle. */}
    <div className="mx-auto max-w-[1180px] px-8 md:px-14 py-16 md:py-24
                    grid gap-12 md:gap-0 md:grid-cols-12 items-center">
      <div className="md:col-span-5 md:pr-10">
        <h1 className="text-[52px] md:text-[64px] leading-[0.95] tracking-[-0.02em]">
          Asad Rizvi
        </h1>
        {/* Plain declaratives, concrete nouns, one unguarded personal line at
            the end. No thesis statement — neither reference site has one, and
            a slogan is the fastest way to sound like everyone else. */}
        <p className="mt-6 text-[19px] md:text-[20px] leading-[1.55] text-ink/80">
          I&apos;m a CS student at Cornell and the founder of{' '}
          <a href="https://getzybit.com" className="text-blood link-ul">Zybit</a>, voice
          AI that writes up a dentist&apos;s notes while they&apos;re still working
          on you. It&apos;s running in three clinics.
        </p>
        <p className="mt-5 text-[19px] md:text-[20px] leading-[1.55] text-ink/75">
          I also run LLM projects as VP of Generative AI at Cornell, build on-chain
          with Cornell Blockchain, and took 3rd at the Global Solana Student
          Hackathon.
        </p>
        <p className="mt-5 text-[19px] md:text-[20px] leading-[1.55] text-ink/70">
          Pakistani, grew up in Bahrain, now in Ithaca. I play bass in a jazz band,
          box a little, and once peaked top 20 in competitive Pokémon. The sea I
          grew up on has one of the biggest dugong herds left in the world. Almost
          nobody knows that.
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-2
                        font-mono text-[11px] tracking-wide text-muted">
          <a href="mailto:sar367@cornell.edu" className="text-blood link-ul">EMAIL</a>
          <a href="https://github.com/Archdiner" className="link-ul">GITHUB</a>
          <a href="https://x.com/carne_asado" className="link-ul">X</a>
          <span className="ml-auto hidden md:inline">ITHACA, NY</span>
        </div>
      </div>

      <div className="md:col-span-6 md:col-start-7">
        <Aperture />
      </div>
    </div>
  </main>
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Study />
  </React.StrictMode>,
);
