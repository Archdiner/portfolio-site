import { useState } from 'react';
import { Github, Linkedin, Twitter, FileText, Mail, ArrowUpRight } from 'lucide-react';
import {
  siPython, siTypescript, siReact, siNextdotjs, siNodedotjs, siFastapi,
  siPostgresql, siDocker, siSolana, siPytorch, siLangchain, siOcaml,
} from 'simple-icons';
import projectsData from './data/projects.json';
import repoMeta from './data/repo-meta.json';

// --- content --------------------------------------------------------------

const STACK = [
  { name: 'Python', icon: siPython }, { name: 'TypeScript', icon: siTypescript },
  { name: 'React', icon: siReact }, { name: 'Next.js', icon: siNextdotjs },
  { name: 'Node.js', icon: siNodedotjs }, { name: 'FastAPI', icon: siFastapi },
  { name: 'PostgreSQL', icon: siPostgresql }, { name: 'Docker', icon: siDocker },
  { name: 'Solana', icon: siSolana }, { name: 'PyTorch', icon: siPytorch },
  { name: 'LangChain', icon: siLangchain }, { name: 'OCaml', icon: siOcaml },
];

const careerTimeline = [
  { year: '2026 — now', role: 'Student Ambassador', company: 'Akash Network', domain: 'akash.network', mark: 'AK', companyUrl: 'https://akash.network', desc: 'Representing Akash on campus; running workshops on decentralized compute.' },
  { year: '2025 — now', role: 'Vice President (prev. AI Engineer)', company: 'Generative AI at Cornell', domain: 'cornellgenai.com', mark: 'GA', companyUrl: 'https://cornellgenai.com', desc: 'Leading LLM-focused initiatives. Started as an engineer, stepped up to VP.' },
  { year: '2025 — now', role: 'Accelerator Subteam', company: 'Cornell Blockchain', domain: 'cornellblockchain.org', mark: 'CB', companyUrl: 'https://cornellblockchain.org', desc: 'Working on accelerator initiatives and early-stage ventures.' },
  { year: '2024', role: 'LLM Application Developer Intern', company: 'RIIG / HOOTL', domain: 'riigtech.com', mark: 'R', companyUrl: 'https://www.riigtech.com', desc: 'Built an AI pipeline for financial regulatory analysis and document summarization.' },
];

const writing = [
  { tag: 'Research · 2025', title: "Arteta-Ball: Modeling Arsenal's Possession with Markov Chains", href: '/research/arteta_wharton-2.pdf' },
  { tag: 'Research · 2025', title: 'Gradient Integrity: Verifying Honest Computation on Decentralized GPU Networks', href: '/research/gradient-integrity.pdf' },
  { tag: 'Write-up', title: "Why You Can't Trust the Volume Numbers You See Online", href: 'https://github.com/Archdiner/blockchain_trading_volume_generator' },
];

const reading = [
  { title: 'Six of Crows', author: 'Leigh Bardugo' },
  { title: 'Kafka on the Shore', author: 'Haruki Murakami' },
  { title: 'The Metamorphosis', author: 'Franz Kafka' },
  { title: 'Down and Out in Paris and London', author: 'George Orwell' },
  { title: 'Dear Evan Hansen', author: 'Steven Levenson' },
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

const TechIcon = ({ icon }) => (
  <svg role="img" viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <title>{icon.title}</title><path d={icon.path} />
  </svg>
);

// Org logo: pulls the real favicon; falls back to a clean monogram if it fails.
const OrgLogo = ({ domain, mark }) => {
  const [failed, setFailed] = useState(false);
  if (failed || !domain) {
    return <div className="w-11 h-11 shrink-0 border-2 border-ink bg-card flex items-center justify-center font-mono text-sm font-bold text-orange">{mark}</div>;
  }
  return (
    <div className="w-11 h-11 shrink-0 border-2 border-ink bg-white flex items-center justify-center overflow-hidden">
      <img src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`} alt="" width="24" height="24" onError={() => setFailed(true)} />
    </div>
  );
};

const CropMarks = () => (
  <>
    {[['top-0 left-0', 'border-l border-t'], ['top-0 right-0', 'border-r border-t'], ['bottom-0 left-0', 'border-l border-b'], ['bottom-0 right-0', 'border-r border-b']].map(([pos, b], i) => (
      <span key={i} className={`absolute ${pos} w-3 h-3 ${b} border-ink z-20`} />
    ))}
  </>
);

const SectionLabel = ({ n, children }) => (
  <div className="flex items-center gap-3 mb-8">
    <span className="font-mono text-lg font-bold text-orange leading-none">{n}</span>
    <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-ink">{children}</h2>
    <span className="flex-1 h-px bg-orange/40" />
  </div>
);

const App = () => (
  <div className="bg-paper text-ink font-sans min-h-screen">

    {/* Header */}
    <header className="sticky top-0 z-30 bg-paper/90 backdrop-blur border-b-2 border-ink">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <span className="font-serif text-xl tracking-tight">Asad Rizvi</span>
        <nav className="flex items-center gap-5 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
          <a href="#projects" className="hidden sm:inline hover:text-orange transition-colors">Projects</a>
          <a href="#stack" className="hidden sm:inline hover:text-orange transition-colors">Stack</a>
          <a href="#experience" className="hidden sm:inline hover:text-orange transition-colors">Experience</a>
          <a href="/Rizvi_Asad_Resume.pdf" target="_blank" rel="noopener noreferrer" className="text-orange hover:underline">Résumé ↗</a>
        </nav>
      </div>
    </header>

    <main className="max-w-5xl mx-auto px-6">

      {/* Hero */}
      <section className="pt-14 md:pt-16 pb-10 grid md:grid-cols-[1fr_360px] gap-10 md:gap-12 items-center">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-orange flex items-center gap-2 mb-6">
            <span className="w-2 h-2 rounded-full bg-orange inline-block" /> Open to Summer 2027 · Founder, Zybit
          </p>
          <h1 className="font-serif text-[2.7rem] md:text-[3.8rem] leading-[1.0] tracking-tight">
            I build <span className="text-orange italic">AI</span> for health, finance &amp; compute.
          </h1>
          <p className="mt-6 text-[17px] leading-relaxed text-ink/85 max-w-xl">
            CS student at Cornell, from Bahrain. Right now I&apos;m founding <span className="font-serif italic">Zybit</span>,
            voice AI that charts for dentists. Before that: cross-border credit scoring, a decentralized GPU marketplace,
            and regulatory knowledge-graph RAG.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="mailto:sar367@cornell.edu" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-orange text-paper font-medium text-sm hover:bg-rust transition-colors">
              <Mail size={16} /> Email me
            </a>
            {CONTACTS.map(({ label, href, Icon }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md border-2 border-ink text-ink font-medium text-sm hover:border-orange hover:text-orange transition-colors">
                <Icon size={16} /> {label}
              </a>
            ))}
          </div>
          <p className="mt-5 font-mono text-xs text-muted">Ithaca, NY · sar367@cornell.edu</p>
        </div>

        {/* Halftone specimen panel + full-color headshot overlapping */}
        <div className="relative w-[300px] h-[360px] mx-auto md:mx-0 md:justify-self-end">
          <div className="absolute top-0 right-0 w-[240px] h-[300px] bg-card border-2 border-ink overflow-hidden">
            <img src="/art/zine/radiolaria-orange.png" alt="" aria-hidden="true" className="w-full h-full object-cover opacity-90" />
            <CropMarks />
            <span className="absolute bottom-1.5 left-2 font-mono text-[9px] uppercase tracking-wide text-ink bg-card/85 px-1.5 py-0.5">Radiolaria · Haeckel 1904</span>
          </div>
          <img src="/art/zine/avatar-color.jpg" alt="Asad Rizvi" className="absolute bottom-0 left-0 w-[168px] h-[168px] rounded-full object-cover border-[3px] border-paper ring-2 ring-ink shadow-[0_6px_30px_rgba(25,22,18,0.22)] z-10" />
          <span className="absolute bottom-2 left-[176px] font-mono text-[10px] text-orange">↖ that&apos;s me</span>
        </div>
      </section>

      {/* Index strip */}
      <div className="flex items-center justify-between border-y-2 border-ink py-3 font-mono text-[11px] uppercase tracking-[0.1em]">
        <span className="text-orange">→ Index</span>
        <div className="flex gap-4 md:gap-7 text-ink flex-wrap justify-end">
          <span>01 Projects</span><span>02 Stack</span><span>03 Experience</span><span>04 Writing</span><span>05 Reading</span>
        </div>
      </div>

      {/* Projects */}
      <section id="projects" className="py-12 scroll-mt-16">
        <SectionLabel n="01">Selected Projects</SectionLabel>
        <div className="grid md:grid-cols-2 gap-6">
          {projects.map((p, i) => (
            <article key={i} className="group flex flex-col border-2 border-ink bg-card overflow-hidden hover:-translate-y-0.5 transition-transform">
              <div className="aspect-[16/10] overflow-hidden bg-paper border-b-2 border-ink relative">
                {p.image ? (
                  <img src={p.image} alt={p.title} loading="lazy" className="w-full h-full object-cover object-top group-hover:scale-[1.03] transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-mono text-xs text-muted">{p.stack.join(' · ')}</div>
                )}
                <span className="absolute top-0 left-0 font-mono text-xs font-bold px-2.5 py-1 bg-orange text-paper">#{String(i + 1).padStart(2, '0')}</span>
              </div>
              <div className="flex flex-col flex-1 p-5">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-serif text-2xl">{p.title}</h3>
                  <div className="flex items-center gap-3 font-mono text-xs text-muted shrink-0">
                    {p.stars != null && <span>{p.stars}★</span>}
                    {p.updated && <span>{p.updated}</span>}
                  </div>
                </div>
                {(p.tag || p.hackathonWinner) && (
                  <p className="mt-1.5 font-mono text-xs text-orange">{p.hackathonWinner ? `★ ${p.hackathonWinner}` : p.tag}</p>
                )}
                <p className="mt-3 text-[15px] leading-relaxed text-ink/80 flex-1">{p.blurb}</p>
                <p className="mt-4 font-mono text-[11px] text-muted">{p.stack.join(' · ')}</p>
                <div className="mt-4 flex items-center gap-4">
                  {p.projectLink && (
                    <a href={p.projectLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-orange hover:underline">
                      Live <ArrowUpRight size={14} />
                    </a>
                  )}
                  {p.githubLink && (
                    <a href={p.githubLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-medium text-ink/70 hover:text-orange">
                      <Github size={14} /> Code
                    </a>
                  )}
                  {!p.githubLink && !p.projectLink && (
                    <span className="font-mono text-xs text-muted">Private — available on request</span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Stack */}
      <section id="stack" className="py-12 scroll-mt-16">
        <SectionLabel n="02">Stack</SectionLabel>
        <div className="flex flex-wrap gap-3">
          {STACK.map((t) => (
            <div key={t.name} className="flex items-center gap-2.5 px-4 py-2.5 border-2 border-ink bg-card text-ink hover:border-orange hover:text-orange transition-colors">
              <TechIcon icon={t.icon} />
              <span className="font-mono text-sm">{t.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Experience */}
      <section id="experience" className="py-12 scroll-mt-16">
        <SectionLabel n="03">Experience</SectionLabel>
        <div className="divide-y divide-line border-t border-line">
          {careerTimeline.map((item, i) => (
            <div key={i} className="py-5 flex gap-4">
              <OrgLogo domain={item.domain} mark={item.mark} />
              <div className="flex-1">
                <div className="flex items-baseline justify-between gap-3 flex-wrap">
                  <h3 className="font-serif text-xl">{item.role}</h3>
                  <span className="font-mono text-xs text-muted">{item.year}</span>
                </div>
                <a href={item.companyUrl} target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-orange hover:underline">{item.company} ↗</a>
                <p className="mt-2 text-[15px] leading-relaxed text-ink/80 max-w-2xl">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Writing */}
      <section id="writing" className="py-12 scroll-mt-16">
        <SectionLabel n="04">Writing &amp; Research</SectionLabel>
        <div className="divide-y divide-line border-t border-line">
          {writing.map((w, i) => (
            <a key={i} href={w.href} target="_blank" rel="noopener noreferrer" className="group flex items-start justify-between gap-4 py-5">
              <div>
                <p className="font-mono text-[11px] text-orange mb-1">{w.tag}</p>
                <h3 className="font-serif text-lg group-hover:text-orange transition-colors">{w.title}</h3>
              </div>
              <ArrowUpRight size={18} className="text-muted group-hover:text-orange shrink-0 mt-1" />
            </a>
          ))}
        </div>
      </section>

      {/* Reading */}
      <section id="reading" className="py-12 scroll-mt-16">
        <SectionLabel n="05">On My Shelf</SectionLabel>
        <ul className="divide-y divide-line border-t border-line">
          {reading.map((r, i) => (
            <li key={i} className="py-4 flex items-baseline gap-4">
              <span className="font-mono text-xs text-orange w-6 shrink-0">{String(i + 1).padStart(2, '0')}</span>
              <span className="font-serif text-lg">{r.title}</span>
              <span className="flex-1 border-b border-line/60 translate-y-[-4px]" />
              <span className="font-mono text-xs text-muted shrink-0">{r.author}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Footer — bold ink block with orange */}
      <footer className="mb-10 mt-6 bg-ink text-paper rounded-lg overflow-hidden relative">
        <img src="/art/zine/radiolaria-orange.png" alt="" aria-hidden="true" className="absolute right-0 top-0 h-full opacity-25 pointer-events-none" />
        <div className="relative p-10 md:p-14">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-orange mb-4">Let&apos;s talk</p>
          <h2 className="font-serif text-4xl md:text-5xl leading-tight max-w-xl">Building something, or hiring someone who does? <span className="text-orange">Say hi.</span></h2>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="mailto:sar367@cornell.edu" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-orange text-paper font-medium text-sm hover:bg-rust transition-colors">
              <Mail size={16} /> sar367@cornell.edu
            </a>
            {CONTACTS.map(({ label, href, Icon }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md border border-paper/40 text-paper font-medium text-sm hover:border-orange hover:text-orange transition-colors">
                <Icon size={16} /> {label}
              </a>
            ))}
          </div>
          <p className="mt-10 font-mono text-[11px] text-paper/50">Specimen: E. Haeckel, Kunstformen der Natur (1904).</p>
        </div>
      </footer>
    </main>
  </div>
);

export default App;
