import { useState, useEffect } from 'react';
import { Github, Linkedin, Twitter, FileText, Mail, ChevronLeft, ChevronRight } from 'lucide-react';
import projectsData from './data/projects.json';
import repoMeta from './data/repo-meta.json';

// --- content --------------------------------------------------------------

const STACK = ['Python', 'TypeScript', 'Java', 'OCaml', 'React', 'Next.js', 'FastAPI', 'PostgreSQL', 'PyTorch', 'LangChain', 'Solana / Anchor', 'Docker'];

const careerTimeline = [
  { year: '2025', role: 'Founder & CTO', company: 'Zybit', logo: '/logos/zybit.png', mark: 'Z', companyUrl: 'https://getzybit.com', desc: 'Voice AI that charts for dentists. Live in 3 dental clinics today, onboarding more by hand.' },
  { year: '2026', role: 'Student Ambassador', company: 'Akash Network', logo: '/logos/akash.ico', mark: 'AK', companyUrl: 'https://akash.network', desc: 'Running campus workshops on decentralized compute.' },
  { year: '2025', role: 'Vice President, prev. AI Engineer', company: 'Generative AI at Cornell', logo: '/logos/genai.ico', mark: 'GA', companyUrl: 'https://cornellgenai.dev', desc: 'Leading LLM initiatives after starting as an engineer.' },
  { year: '2025', role: 'Accelerator Subteam', company: 'Cornell Blockchain', logo: '/logos/cornellblockchain.png', mark: 'CB', companyUrl: 'https://cornellblockchain.org', desc: 'Working on accelerator initiatives and early-stage ventures.' },
  { year: '2024', role: 'LLM Application Developer Intern', company: 'RIIG / HOOTL', logo: '/logos/riig.png', mark: 'R', companyUrl: 'https://www.riigtech.com', desc: 'Built an AI pipeline for financial regulatory analysis.' },
];

const writing = [
  { tag: 'Research, 2025', title: "Arteta-Ball: Modeling Arsenal's Possession with Markov Chains", href: '/research/arteta_wharton-2.pdf' },
  { tag: 'Research, 2025', title: 'Gradient Integrity: Verifying Honest Computation on GPU Networks', href: '/research/gradient-integrity.pdf' },
  { tag: 'Write-up', title: "Why You Can't Trust the Volume Numbers You See Online", href: 'https://github.com/Archdiner/blockchain_trading_volume_generator' },
];

const reading = [
  { title: 'Six of Crows', author: 'Leigh Bardugo', cover: '/books/six-of-crows.jpg' },
  { title: 'Kafka on the Shore', author: 'Haruki Murakami', cover: '/books/kafka-shore.jpg' },
  { title: 'The Secret History', author: 'Donna Tartt', cover: '/books/secret-history.jpg' },
  { title: 'The Kite Runner', author: 'Khaled Hosseini', cover: '/books/kite-runner.jpg' },
  { title: 'Down and Out in Paris and London', author: 'George Orwell', cover: '/books/down-and-out.jpg' },
  { title: 'Dear Evan Hansen', author: 'Val Emmich', cover: '/books/dear-evan-hansen.jpg' },
  { title: 'The Picture of Dorian Gray', author: 'Oscar Wilde', cover: '/books/dorian-gray.jpg' },
  { title: 'Life 3.0', author: 'Max Tegmark', cover: '/books/life-3.jpg' },
  { title: 'Twenty Thousand Leagues Under the Sea', author: 'Jules Verne', cover: '/books/20000-leagues.jpg' },
];

// --- helpers --------------------------------------------------------------

function timeAgo(iso) {
  if (!iso) return null;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;
  const days = Math.floor((Date.now() - then) / 86_400_000);
  if (days <= 1) return 'today';
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}
const projects = projectsData.map((p) => {
  const meta = p.repo ? repoMeta[p.repo] : null;
  return { ...p, stars: meta?.stars ?? null, updated: timeAgo(meta?.pushedAt) };
});

/* eslint-disable react/prop-types */
const CONTACTS = [
  { label: 'GitHub', href: 'https://github.com/Archdiner', Icon: Github },
  { label: 'Résumé', href: '/Rizvi_Asad_Resume.pdf', Icon: FileText },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/asad-rizvi-02a1782a2/', Icon: Linkedin },
  { label: 'X', href: 'https://x.com/carne_asado', Icon: Twitter },
];

const OrgLogo = ({ logo, mark }) => {
  const [failed, setFailed] = useState(false);
  if (failed || !logo) {
    return <div className="w-9 h-9 shrink-0 rounded-sm bg-cream border border-line flex items-center justify-center font-mono text-[11px] font-semibold text-orange">{mark}</div>;
  }
  return (
    <div className="w-9 h-9 shrink-0 rounded-sm bg-white border border-line flex items-center justify-center overflow-hidden">
      <img src={logo} alt="" className="w-6 h-6 object-contain" onError={() => setFailed(true)} />
    </div>
  );
};

const Eyebrow = ({ children }) => (
  <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted mb-6">{children}</p>
);

const ReadingCarousel = () => {
  const [idx, setIdx] = useState(0);
  const n = reading.length;
  // warm the browser cache with every cover so paging never hits the network cold
  useEffect(() => {
    reading.forEach((b) => { const im = new Image(); im.src = b.cover; });
  }, []);
  const at = (o) => reading[((idx + o) % n + n) % n];
  const go = (d) => setIdx((i) => ((i + d) % n + n) % n);
  const center = at(0);
  return (
    <section className="py-12 border-t border-line select-none">
      <div className="flex items-center justify-between mb-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">Reading List</p>
        <span className="font-mono text-[11px] text-muted">{String(idx + 1).padStart(2, '0')} / {n}</span>
      </div>
      {/* fixed-height book row so the caption below never shifts the arrows */}
      <div className="flex items-center justify-center gap-2 sm:gap-6 h-[220px] sm:h-[268px]">
        <button aria-label="Previous" onClick={() => go(-1)} className="p-1.5 sm:p-2 rounded-md border border-line hover:border-orange hover:text-orange transition-colors shrink-0"><ChevronLeft size={18} /></button>
        {[-1, 0, 1].map((o) => {
          const b = at(o);
          const isCenter = o === 0;
          return (
            <button
              key={o}
              aria-label={isCenter ? b.title : `Go to ${b.title}`}
              onClick={() => !isCenter && go(o)}
              className={`shrink-0 transition-opacity duration-300 ${isCenter ? '' : 'opacity-40 hover:opacity-75 cursor-pointer'}`}
            >
              <img src={b.cover} alt={b.title} draggable="false" className={`${isCenter ? 'w-28 sm:w-40' : 'w-16 sm:w-24'} aspect-[2/3] object-cover rounded-md border border-line shadow-[0_6px_24px_rgba(28,26,20,0.16)]`} />
            </button>
          );
        })}
        <button aria-label="Next" onClick={() => go(1)} className="p-1.5 sm:p-2 rounded-md border border-line hover:border-orange hover:text-orange transition-colors shrink-0"><ChevronRight size={18} /></button>
      </div>
      {/* caption lives in its own fixed-height block, out of the flex row */}
      <div className="h-14 mt-4 flex flex-col items-center justify-start text-center px-4">
        <p className="font-display font-bold text-[15px] leading-tight">{center.title}</p>
        <p className="font-mono text-xs text-muted mt-1">{center.author}</p>
      </div>
    </section>
  );
};

const App = () => (
  <div className="grain relative bg-paper text-ink min-h-screen">
    <div className="relative z-[2] max-w-4xl mx-auto px-6">

      {/* Hero — photo first */}
      <section className="pt-16 md:pt-20 pb-14 flex flex-col md:flex-row gap-8 md:gap-12 md:items-center">
        <img src="/art/zine/avatar-color.jpg" alt="Asad Rizvi" className="w-40 h-40 md:w-52 md:h-52 rounded-xl object-cover shrink-0 ring-1 ring-line" />
        <div>
          <div className="inline-flex items-center gap-2 mb-5 font-mono text-[11px] uppercase tracking-wide text-muted">
            <span className="w-2 h-2 rounded-full bg-orange animate-pulse" /> Open to Summer 2027 internships
          </div>
          <h1 className="font-display font-extrabold text-4xl md:text-5xl tracking-tight leading-none">Asad Rizvi</h1>
          <p className="mt-3 text-lg text-ink/80">
            CS at Cornell, from Bahrain. Founder of <a href="https://getzybit.com" target="_blank" rel="noopener noreferrer" className="text-orange font-semibold hover:underline">Zybit</a>.
          </p>
          <p className="mt-4 text-[16px] leading-relaxed text-ink/75 max-w-xl">
            I build AI products and ship them. Right now that&apos;s Zybit, voice AI that charts for dentists, live
            in 3 practices. Before it: an agent that audits whether tokenized real-world assets are actually
            backed, a GPU marketplace, and an app that makes you stake money on your screen-time goals.
          </p>
          <div className="mt-6 flex flex-wrap gap-2.5">
            <a href="mailto:sar367@cornell.edu" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange text-cream font-medium text-sm hover:bg-rust transition-colors">
              <Mail size={15} /> Email
            </a>
            {CONTACTS.map(({ label, href, Icon }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-line text-ink font-medium text-sm hover:border-orange hover:text-orange transition-colors">
                <Icon size={15} /> {label}
              </a>
            ))}
          </div>
          <p className="mt-6 font-mono text-[12px] text-muted flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>Bass in a jazz band</span>
            <span className="text-orange">·</span>
            <span>amateur boxing</span>
            <span className="text-orange">·</span>
            <span>once top-20 at competitive Pok&eacute;mon</span>
          </p>
        </div>
      </section>

      {/* Projects — scannable grid */}
      <section id="work" className="py-10 border-t border-line">
        <Eyebrow>Projects</Eyebrow>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
          {projects.map((p, i) => {
            const href = p.projectLink || p.githubLink;
            const Wrap = href ? 'a' : 'div';
            return (
              <Wrap key={i} {...(href ? { href, target: '_blank', rel: 'noopener noreferrer' } : {})} className="group block">
                <div className="aspect-[16/10] rounded-md overflow-hidden bg-cream ring-1 ring-line">
                  {p.image ? (
                    <img src={p.image} alt={p.title} className="w-full h-full object-cover object-top group-hover:scale-[1.03] transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-mono text-[11px] text-muted p-4 text-center">{p.stack.join(' · ')}</div>
                  )}
                </div>
                <div className="mt-3 flex items-baseline justify-between gap-2">
                  <h3 className="font-display font-bold text-lg leading-tight group-hover:text-orange transition-colors">{p.title}</h3>
                  <span className="font-mono text-[11px] text-orange shrink-0">{p.hackathonWinner ? '★ 3rd' : (p.tag || p.projectLink) ? 'Live' : 'Code'}</span>
                </div>
                <p className="mt-1.5 text-[14px] leading-snug text-ink/75">{p.blurb}</p>
                <p className="mt-2 font-mono text-[11px] text-muted">{p.stack.join(' · ')}</p>
              </Wrap>
            );
          })}
        </div>
      </section>

      {/* Experience */}
      <section id="experience" className="py-12 border-t border-line">
        <Eyebrow>Experience</Eyebrow>
        <div className="space-y-6">
          {careerTimeline.map((item, i) => (
            <div key={i} className="flex gap-4 items-start">
              <OrgLogo logo={item.logo} mark={item.mark} />
              <div className="flex-1">
                <div className="flex items-baseline justify-between gap-3 flex-wrap">
                  <h3 className="font-semibold text-[16px]">{item.role}</h3>
                  <span className="font-mono text-xs text-muted">{item.year}</span>
                </div>
                <a href={item.companyUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-orange hover:underline">{item.company}</a>
                <p className="text-[14px] text-ink/70 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Reading carousel */}
      <ReadingCarousel />

      {/* Stack + Writing */}
      <section className="py-12 border-t border-line grid md:grid-cols-2 gap-12">
        <div>
          <Eyebrow>What I work with</Eyebrow>
          <p className="text-[17px] leading-loose text-ink/80">
            {STACK.map((t, i) => (
              <span key={t}>
                <span className="text-ink">{t}</span>
                {i < STACK.length - 1 && <span className="text-orange"> · </span>}
              </span>
            ))}
          </p>
        </div>
        <div>
          <Eyebrow>Writing</Eyebrow>
          <div className="space-y-4">
            {writing.map((w, i) => (
              <a key={i} href={w.href} target="_blank" rel="noopener noreferrer" className="group block">
                <h3 className="text-[15px] leading-snug group-hover:text-orange transition-colors">{w.title}</h3>
                <span className="font-mono text-[11px] text-muted">{w.tag}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <footer className="my-10 rounded-xl bg-ink text-cream p-10 md:p-14">
        <h2 className="font-display font-bold text-3xl md:text-4xl leading-tight max-w-lg">
          Building something, or hiring someone who does? <span className="text-orange">Say hi.</span>
        </h2>
        <div className="mt-7 flex flex-wrap gap-2.5">
          <a href="mailto:sar367@cornell.edu" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange text-cream font-medium text-sm hover:bg-rust transition-colors">
            <Mail size={15} /> sar367@cornell.edu
          </a>
          {CONTACTS.map(({ label, href, Icon }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-cream/30 font-medium text-sm hover:border-orange hover:text-orange transition-colors">
              <Icon size={15} /> {label}
            </a>
          ))}
        </div>
        <p className="mt-9 font-mono text-[11px] text-cream/45">Ithaca, NY.</p>
      </footer>
    </div>
  </div>
);

export default App;
