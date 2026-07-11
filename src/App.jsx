import { Github, Linkedin, Twitter, FileText, Mail, ArrowUpRight } from 'lucide-react';
import projectsData from './data/projects.json';
import repoMeta from './data/repo-meta.json';

// --- content --------------------------------------------------------------

const TECH = ['Python', 'TypeScript', 'React', 'Next.js', 'FastAPI', 'PostgreSQL', 'Docker', 'Solana / Anchor', 'LangChain', 'OCaml'];

const careerTimeline = [
  { year: '2026 — now', role: 'Student Ambassador', company: 'Akash Network', companyUrl: 'https://akash.network', desc: 'Representing Akash on campus; running workshops on decentralized compute.' },
  { year: '2025 — now', role: 'Vice President (prev. AI Engineer)', company: 'Generative AI at Cornell', companyUrl: 'https://cornellgenai.com', desc: 'Leading LLM-focused initiatives. Started as an engineer, stepped up to VP.' },
  { year: '2025 — now', role: 'Accelerator Subteam', company: 'Cornell Blockchain', companyUrl: 'https://cornellblockchain.org', desc: 'Working on accelerator initiatives and early-stage ventures.' },
  { year: '2024', role: 'LLM Application Developer Intern', company: 'RIIG / HOOTL', companyUrl: 'https://www.riigtech.com', desc: 'Built an AI pipeline for financial regulatory analysis and document summarization.' },
];

const writing = [
  { tag: 'Research · 2025', title: "Arteta-Ball: Modeling Arsenal's Possession with Markov Chains", href: '/research/arteta_wharton-2.pdf' },
  { tag: 'Research · 2025', title: 'Gradient Integrity: Verifying Honest Computation on Decentralized GPU Networks', href: '/research/gradient-integrity.pdf' },
  { tag: 'Write-up', title: "Why You Can't Trust the Volume Numbers You See Online", href: 'https://github.com/Archdiner/blockchain_trading_volume_generator' },
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

const SectionLabel = ({ n, children }) => (
  <div className="flex items-baseline gap-3 mb-8">
    <span className="font-mono text-sm text-green">{n}</span>
    <h2 className="font-mono text-sm uppercase tracking-[0.18em] text-muted">{children}</h2>
    <span className="flex-1 border-t border-line translate-y-[-3px]" />
  </div>
);

const App = () => (
  <div className="bg-paper text-ink font-sans min-h-screen">

    {/* Header */}
    <header className="sticky top-0 z-30 bg-paper/90 backdrop-blur border-b border-line">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/art/zine/avatar.jpg" alt="Asad Rizvi" className="w-9 h-9 rounded-full object-cover ring-1 ring-line" />
          <span className="font-serif text-xl">Asad Rizvi</span>
        </div>
        <nav className="hidden sm:flex items-center gap-6 font-mono text-xs uppercase tracking-[0.1em] text-muted">
          <a href="#projects" className="hover:text-green transition-colors">Projects</a>
          <a href="#experience" className="hover:text-green transition-colors">Experience</a>
          <a href="#writing" className="hover:text-green transition-colors">Writing</a>
          <a href="/Rizvi_Asad_Resume.pdf" target="_blank" rel="noopener noreferrer" className="text-green hover:underline">Résumé ↗</a>
        </nav>
      </div>
    </header>

    <main className="max-w-5xl mx-auto px-6">

      {/* Hero */}
      <section className="py-14 md:py-20 grid md:grid-cols-[1fr_auto] gap-12 items-center">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-green flex items-center gap-2 mb-6">
            <span className="w-2 h-2 rounded-full bg-green inline-block" /> Open to Summer 2027 · Founder, Zybit
          </p>
          <h1 className="font-serif text-[2.6rem] md:text-[3.6rem] leading-[1.02] tracking-tight text-forest">
            I build AI for health, finance &amp; compute.
          </h1>
          <p className="mt-6 text-[17px] leading-relaxed text-ink/85 max-w-xl">
            CS student at Cornell, from Bahrain. Right now I&apos;m founding <span className="font-serif italic">Zybit</span>,
            voice AI that charts for dentists. Before that: cross-border credit scoring, a decentralized GPU marketplace,
            and regulatory knowledge-graph RAG.
          </p>
          {/* Contact buttons — the important part, made obvious */}
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="mailto:sar367@cornell.edu" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-green text-paper font-medium text-sm hover:bg-forest transition-colors">
              <Mail size={16} /> Email me
            </a>
            {CONTACTS.map(({ label, href, Icon }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md border border-ink/25 text-ink font-medium text-sm hover:border-green hover:text-green transition-colors">
                <Icon size={16} /> {label}
              </a>
            ))}
          </div>
          <p className="mt-5 font-mono text-xs text-muted">Ithaca, NY · sar367@cornell.edu</p>
        </div>
        <div className="justify-self-center md:justify-self-end">
          <img src="/art/zine/avatar.jpg" alt="Asad Rizvi" className="w-44 h-44 md:w-56 md:h-56 rounded-full object-cover ring-1 ring-line shadow-[0_4px_30px_rgba(28,53,36,0.14)]" />
        </div>
      </section>

      {/* Projects */}
      <section id="projects" className="py-12 scroll-mt-20">
        <SectionLabel n="01">Selected Projects</SectionLabel>
        <div className="grid md:grid-cols-2 gap-6">
          {projects.map((p, i) => (
            <article key={i} className="group flex flex-col rounded-lg border border-line bg-card overflow-hidden hover:border-green/50 transition-colors">
              <div className="aspect-[16/10] overflow-hidden bg-paper border-b border-line relative">
                {p.image ? (
                  <img src={p.image} alt={p.title} loading="lazy" className="w-full h-full object-cover object-top group-hover:scale-[1.03] transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-mono text-xs text-muted">{p.stack.join(' · ')}</div>
                )}
                <span className="absolute top-3 left-3 font-mono text-[11px] px-2 py-1 rounded bg-paper/90 text-green">#{String(i + 1).padStart(2, '0')}</span>
              </div>
              <div className="flex flex-col flex-1 p-5">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-serif text-2xl text-forest">{p.title}</h3>
                  <div className="flex items-center gap-3 font-mono text-xs text-muted shrink-0">
                    {p.stars != null && <span>{p.stars}★</span>}
                    {p.updated && <span>{p.updated}</span>}
                  </div>
                </div>
                {(p.tag || p.hackathonWinner) && (
                  <p className="mt-1.5 font-mono text-xs text-green">{p.hackathonWinner ? `🏆 ${p.hackathonWinner}` : p.tag}</p>
                )}
                <p className="mt-3 text-[15px] leading-relaxed text-ink/80 flex-1">{p.blurb}</p>
                <p className="mt-4 font-mono text-[11px] text-muted">{p.stack.join(' · ')}</p>
                <div className="mt-4 flex items-center gap-3">
                  {p.projectLink && (
                    <a href={p.projectLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-medium text-green hover:underline">
                      Live <ArrowUpRight size={14} />
                    </a>
                  )}
                  {p.githubLink && (
                    <a href={p.githubLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-medium text-ink/70 hover:text-green">
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

      {/* Experience */}
      <section id="experience" className="py-12 scroll-mt-20">
        <SectionLabel n="02">Experience</SectionLabel>
        <div className="divide-y divide-line">
          {careerTimeline.map((item, i) => (
            <div key={i} className="py-5 grid md:grid-cols-[140px_1fr] gap-2 md:gap-6">
              <span className="font-mono text-xs text-muted pt-1">{item.year}</span>
              <div>
                <h3 className="font-serif text-xl text-forest">{item.role}</h3>
                <a href={item.companyUrl} target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-green hover:underline">{item.company} ↗</a>
                <p className="mt-2 text-[15px] leading-relaxed text-ink/80 max-w-2xl">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Writing */}
      <section id="writing" className="py-12 scroll-mt-20">
        <SectionLabel n="03">Writing &amp; Research</SectionLabel>
        <div className="divide-y divide-line">
          {writing.map((w, i) => (
            <a key={i} href={w.href} target="_blank" rel="noopener noreferrer" className="group flex items-start justify-between gap-4 py-5">
              <div>
                <p className="font-mono text-[11px] text-muted mb-1">{w.tag}</p>
                <h3 className="font-serif text-lg text-forest group-hover:text-green transition-colors">{w.title}</h3>
              </div>
              <ArrowUpRight size={18} className="text-muted group-hover:text-green shrink-0 mt-1" />
            </a>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-14 border-t border-line">
        <h2 className="font-serif text-3xl text-forest">Let&apos;s build something.</h2>
        <div className="mt-6 flex flex-wrap gap-3">
          <a href="mailto:sar367@cornell.edu" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-green text-paper font-medium text-sm hover:bg-forest transition-colors">
            <Mail size={16} /> sar367@cornell.edu
          </a>
          {CONTACTS.map(({ label, href, Icon }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md border border-ink/25 text-ink font-medium text-sm hover:border-green hover:text-green transition-colors">
              <Icon size={16} /> {label}
            </a>
          ))}
        </div>
        <p className="mt-10 font-mono text-[11px] text-muted">
          Built with React. Tools: {TECH.join(' · ')}.
        </p>
      </footer>
    </main>
  </div>
);

export default App;
