import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource/newsreader/400.css';
import '@fontsource/newsreader/500.css';
import '@fontsource/newsreader/400-italic.css';
import '@fontsource/ibm-plex-mono/400.css';
import { Org } from './Mark';
import '../index.css';

// Gulf hero — colour halftone, edgeless.
//
// The page background is the sea. Both stops are sampled from the footage's own
// water column (#3a8b94 at the surface down to #005399 in the deep), and the
// halftone is screened against that same ramp, so every cell that *is* water
// cancels to nothing. The animal, the bubbles, the surface sparkle and the
// seagrass are what's left — which means the image has no edge and needs no
// frame. It doesn't sit on the page; it is the page.
const SEA_TOP = '#3a8b94';
const SEA_DEEP = '#005399';

const Hero = () => (
  <main
    className="min-h-screen w-full"
    style={{
      background: `linear-gradient(to bottom, ${SEA_TOP} 0%, ${SEA_DEEP} 100%)`,
      fontFamily: 'Newsreader, Georgia, serif',
      color: '#f2f6f7',
    }}
  >
    <div className="mx-auto max-w-[1240px] px-7 md:px-14 py-14 md:py-20
                    grid gap-10 md:gap-0 md:grid-cols-12 items-center min-h-screen">
      <div className="md:col-span-5 md:pr-12">
        <h1 className="text-[54px] md:text-[68px] leading-[0.94] tracking-[-0.025em]">
          Asad Rizvi
        </h1>

        <p className="mt-7 text-[19px] md:text-[20px] leading-[1.6] text-white/90">
          I&apos;m a CS student at{' '}
          <Org src="/logos/cornell.png" href="https://www.cornell.edu">Cornell</Org>{' '}
          and the founder of{' '}
          <Org src="/logos/zybit.png" href="https://getzybit.com">Zybit</Org>, voice AI
          that writes up a dentist&apos;s notes while they&apos;re still working on you.
          It&apos;s running in three clinics and backed by{' '}
          <Org src="/logos/cornell.png" href="https://eship.cornell.edu">eLab</Org>.
        </p>

        <p className="mt-5 text-[19px] md:text-[20px] leading-[1.6] text-white/80">
          I also run LLM projects as VP of{' '}
          <Org src="/logos/genai.ico" href="https://cornellgenai.dev">Generative AI at Cornell</Org>,
          build on-chain with{' '}
          <Org src="/logos/cornellblockchain.png" href="https://cornellblockchain.org">Cornell Blockchain</Org>,
          run campus workshops for{' '}
          <Org src="/logos/akash.ico" href="https://akash.network">Akash</Org>, and took
          3rd at the Global Solana Student Hackathon.
        </p>

        <p className="mt-5 text-[19px] md:text-[20px] leading-[1.6] text-white/75">
          Pakistani, grew up in Bahrain, now in Ithaca. I play bass in a jazz band,
          box a little, and once peaked top 20 in competitive Pokémon. The sea I
          grew up on has one of the biggest dugong herds left in the world. Almost
          nobody knows that.
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-2
                        font-mono text-[11px] tracking-wide text-white/60">
          <a href="mailto:sar367@cornell.edu" className="text-white link-ul">EMAIL</a>
          <a href="https://github.com/Archdiner" className="link-ul">GITHUB</a>
          <a href="https://x.com/carne_asado" className="link-ul">X</a>
          <span className="ml-auto hidden md:inline">ITHACA, NY</span>
        </div>
      </div>

      <div className="md:col-span-6 md:col-start-7 relative">
        {/* No mask, no border, no aspect box. The halftone's own background is
            the page gradient, so the footage already ends in nothing. */}
        <video
          src="media/dugong-halftone.mp4"
          poster="media/dugong-halftone-poster.jpg"
          muted
          loop
          playsInline
          autoPlay
          preload="auto"
          aria-hidden="true"
          className="w-full h-auto max-h-[68vh] object-contain"
          style={{
            // Feather every edge into nothing. The page behind is the exact
            // gradient the halftone was screened against, so a mask fade here
            // doesn't blend the footage into a background — it returns those
            // cells to the sea they came from. No border, no frame, no edge.
            WebkitMaskImage:
              'linear-gradient(to right, transparent 0%, #000 14%, #000 88%, transparent 100%), linear-gradient(to bottom, transparent 0%, #000 10%, #000 74%, transparent 100%)',
            maskImage:
              'linear-gradient(to right, transparent 0%, #000 14%, #000 88%, transparent 100%), linear-gradient(to bottom, transparent 0%, #000 10%, #000 74%, transparent 100%)',
            WebkitMaskComposite: 'source-in',
            maskComposite: 'intersect',
          }}
        />
        <p className="mt-3 flex items-baseline gap-3 font-mono text-[10.5px] tracking-wide text-white/45">
          <span className="italic font-sans text-[12px] text-white/60">Dugong dugon</span>
          <span className="h-px flex-1 bg-white/20" />
          <span>GULF OF BAHRAIN</span>
        </p>
      </div>
    </div>
  </main>
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Hero />
  </React.StrictMode>,
);
