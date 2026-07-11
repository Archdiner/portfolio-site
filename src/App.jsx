import { useState } from 'react';
import { Github, Linkedin, Twitter, FileText, Mail, ArrowUpRight, ArrowRight } from 'lucide-react';
import projectsData from './data/projects.json';
import repoMeta from './data/repo-meta.json';

// --- content --------------------------------------------------------------

const STACK = [
  { group: 'Languages', items: ['Python', 'TypeScript', 'OCaml', 'Solidity', 'Rust (Anchor)'] },
  { group: 'AI / Data', items: ['PyTorch', 'LangChain', 'GraphRAG', 'Neo4j', 'MCP'] },
  { group: 'Web / Infra', items: ['React', 'Next.js', 'FastAPI', 'PostgreSQL', 'Supabase', 'Docker', 'Solana'] },
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

const OrgLogo = ({ domain, mark }) => {
  const [failed, setFailed] = useState(false);
  if (failed || !domain) {
    return <div className="w-10 h-10 shrink-0 border border-line bg-cream flex items-center justify-center font-mono text-xs font-semibold text-orange">{mark}</div>;
  }
  return (
    <div className="w-10 h-10 shrink-0 border border-line bg-white flex items-center justify-center overflow-hidden">
      <img src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`} alt="" width="22" height="22" onError={() => setFailed(true)} />
    </div>
  );
};

const Label = ({ n, children }) => (
  <div className="flex items-center gap-3 mb-10">
    <span className="font-mono text-xs text-orange">✳</span>
    <span className="font-mono text-xs uppercase tracking-[0.22em] text-ink">{children}</span>
    <span className="flex-1 border-t border-dashed border-line" />
    <span className="font-mono text-xs text-muted">{n}</span>
  </div>
);

const Term = () => (
  <div className="relative font-mono text-[13px] leading-[1.7] bg-cream border border-ink/70 shadow-[6px_6px_0_rgba(28,26,20,0.9)]">
    <div className="flex items-center justify-between px-3 py-2 border-b border-ink/25">
      <span className="text-ink/60">asad@rizvi — ~/portfolio</span>
      <span className="flex gap-1.5"><i className="w-2.5 h-2.5 rounded-full bg-orange inline-block" /><i className="w-2.5 h-2.5 rounded-full bg-ink/25 inline-block" /><i className="w-2.5 h-2.5 rounded-full bg-ink/25 inline-block" /></span>
    </div>
    <div className="p-4 text-ink/90">
      <p><span className="text-orange">$</span> whoami</p>
      <p className="text-ink/70 pl-3">asad rizvi — cs @ cornell &apos;29 · from bahrain</p>
      <p className="mt-2"><span className="text-orange">$</span> cat status.txt</p>
      <p className="text-ink/70 pl-3">▸ founding zybit — voice AI for dentists, live in 3 practices</p>
      <p className="text-ink/70 pl-3">▸ prev: credit scoring · gpu marketplace · regulatory rag</p>
      <p className="mt-2"><span className="text-orange">$</span> ls projects/</p>
      <p className="text-ink/70 pl-3">zybit  rwa-analyzer  kite-credit  compute-swarm  graphrag</p>
      <p className="mt-2"><span className="text-orange">$</span> echo $AVAILABILITY</p>
      <p className="text-orange pl-3">open to summer 2027 internships<span className="inline-block w-2 h-4 bg-orange align-middle ml-1 animate-pulse" /></p>
    </div>
  </div>
);

const App = () => (
  <div className="grain relative bg-paper text-ink min-h-screen">

    {/* Header */}
    <header className="sticky top-0 z-30 bg-paper/90 backdrop-blur">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between border-b border-line">
        <span className="font-display font-extrabold text-xl tracking-tight">asad rizvi<span className="text-orange">.</span></span>
        <nav className="flex items-center gap-6 font-mono text-xs uppercase tracking-[0.12em] text-muted">
          <a href="#work" className="hidden sm:inline hover:text-orange transition-colors">Work</a>
          <a href="#stack" className="hidden sm:inline hover:text-orange transition-colors">Stack</a>
          <a href="#experience" className="hidden sm:inline hover:text-orange transition-colors">Experience</a>
          <a href="/Rizvi_Asad_Resume.pdf" target="_blank" rel="noopener noreferrer" className="text-orange hover:underline">Résumé ↗</a>
        </nav>
      </div>
    </header>

    <main className="relative z-[2] max-w-6xl mx-auto px-6">

      {/* Hero */}
      <section className="pt-14 md:pt-16 pb-16 grid lg:grid-cols-[1fr_440px] gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 border border-line rounded-full pl-2 pr-4 py-1.5 mb-8 bg-cream">
            <span className="w-2 h-2 rounded-full bg-orange animate-pulse" />
            <span className="font-mono text-xs text-ink">Founding Zybit — live in 3 dental practices</span>
          </div>
          <h1 className="font-display font-extrabold text-[3rem] md:text-[4.4rem] leading-[0.95] tracking-tight">
            I build <span className="text-orange">AI</span> for the messy, physical world.
          </h1>
          <p className="mt-7 text-[18px] leading-relaxed text-ink/80 max-w-xl">
            CS student at Cornell, from Bahrain. Voice AI for dentists, cross-border credit scoring, a
            decentralized GPU marketplace, regulatory knowledge-graph RAG — software that has to survive
            contact with reality.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a href="mailto:sar367@cornell.edu" className="inline-flex items-center gap-2 px-5 py-3 bg-orange text-cream font-mono text-sm uppercase tracking-wide hover:bg-rust transition-colors">
              <Mail size={15} /> Email me <ArrowRight size={15} />
            </a>
            {CONTACTS.map(({ label, href, Icon }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 border border-ink font-mono text-sm uppercase tracking-wide hover:text-orange hover:border-orange transition-colors">
                <Icon size={15} /> {label}
              </a>
            ))}
          </div>
        </div>
        <div className="relative">
          <span className="absolute -top-5 -left-2 font-mono text-[10px] text-muted hidden lg:block">ITHACA · N42.44° W76.50°</span>
          <Term />
          <span className="absolute -bottom-5 right-0 font-mono text-[10px] text-muted">[ build_2027 ]</span>
        </div>
      </section>

      {/* Work — editorial rows */}
      <section id="work" className="py-14">
        <Label n="01 / Selected work">Projects</Label>
        <div className="border-t border-line">
          {projects.map((p, i) => (
            <div key={i} className="grid md:grid-cols-[1.05fr_1fr] gap-8 md:gap-12 py-12 border-b border-line items-center">
              <div className={`relative ${i % 2 ? 'md:order-2' : ''}`}>
                <span className="absolute -top-3 -left-2 z-10 font-mono text-xs font-semibold bg-orange text-cream px-2 py-0.5">#{String(i + 1).padStart(2, '0')}</span>
                {p.image ? (
                  <div className="border border-ink/70 shadow-[6px_6px_0_rgba(28,26,20,0.9)] bg-cream overflow-hidden">
                    <img src={p.image} alt={p.title} className="w-full aspect-[16/10] object-cover object-top" />
                  </div>
                ) : (
                  <div className="border border-ink/70 shadow-[6px_6px_0_rgba(28,26,20,0.9)] bg-cream aspect-[16/10] flex items-center justify-center font-mono text-xs text-muted p-6 text-center">{p.stack.join(' · ')}</div>
                )}
              </div>
              <div className={i % 2 ? 'md:order-1' : ''}>
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-display font-bold text-[1.9rem] leading-tight">{p.title}</h3>
                  <div className="flex items-center gap-3 font-mono text-xs text-muted shrink-0">
                    {p.stars != null && <span>{p.stars}★</span>}
                    {p.updated && <span>{p.updated}</span>}
                  </div>
                </div>
                {(p.tag || p.hackathonWinner) && (
                  <p className="mt-1.5 font-mono text-xs text-orange uppercase tracking-wide">{p.hackathonWinner ? `★ ${p.hackathonWinner}` : p.tag}</p>
                )}
                <p className="mt-3 text-[16px] leading-relaxed text-ink/80">{p.blurb}</p>
                <p className="mt-4 font-mono text-[11px] text-muted uppercase tracking-wide">{p.stack.join(' / ')}</p>
                <div className="mt-5 flex items-center gap-5 font-mono text-sm">
                  {p.projectLink && (
                    <a href={p.projectLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-orange font-semibold hover:underline uppercase tracking-wide">
                      Live <ArrowUpRight size={14} />
                    </a>
                  )}
                  {p.githubLink && (
                    <a href={p.githubLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-ink/70 hover:text-orange uppercase tracking-wide">
                      <Github size={14} /> Code
                    </a>
                  )}
                  {!p.githubLink && !p.projectLink && <span className="text-muted uppercase tracking-wide">Private · on request</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Manifesto — bold orange block */}
      <section className="my-6 blueprint bg-orange text-cream rounded-lg overflow-hidden relative">
        <span className="absolute top-6 left-6 font-mono text-xs uppercase tracking-[0.2em] text-cream/80">✳ Approach</span>
        <span className="absolute top-4 right-6 font-mono text-7xl font-bold text-cream/15 leading-none select-none">02</span>
        <div className="relative grid md:grid-cols-[1fr_240px] gap-10 items-center p-10 md:p-16 pt-20">
          <div>
            <p className="font-display font-bold text-[1.9rem] md:text-[2.6rem] leading-[1.15]">
              I care about AI that meets the physical, high-stakes world — a dentist&apos;s chair, a credit
              decision, a GPU cluster. Systems that are honest about what they can and can&apos;t verify.
            </p>
            <p className="mt-6 font-mono text-sm text-cream/80 max-w-lg">
              Bass in a jazz band · amateur boxer (3-0) · top-20 globally in competitive Pokémon. I like hard
              problems and shipping fast.
            </p>
          </div>
          <div className="justify-self-center md:justify-self-end">
            <div className="border-2 border-cream bg-cream p-1.5 rotate-2 shadow-[6px_6px_0_rgba(28,26,20,0.35)]">
              <img src="/art/zine/avatar-color.jpg" alt="Asad Rizvi" className="w-[200px] h-[200px] object-cover" />
              <p className="font-mono text-[10px] text-ink text-center py-1.5">ASAD RIZVI · ITHACA</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stack */}
      <section id="stack" className="py-14">
        <Label n="03 / Toolkit">Stack</Label>
        <div className="grid md:grid-cols-3 gap-8">
          {STACK.map((g) => (
            <div key={g.group}>
              <p className="font-mono text-xs uppercase tracking-[0.15em] text-orange mb-4">{g.group}</p>
              <ul className="space-y-2">
                {g.items.map((t) => (
                  <li key={t} className="font-mono text-sm text-ink/85 flex items-center gap-2">
                    <span className="text-orange text-xs">→</span> {t}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Experience */}
      <section id="experience" className="py-14">
        <Label n="04 / Track record">Experience</Label>
        <div className="border-t border-line">
          {careerTimeline.map((item, i) => (
            <div key={i} className="py-6 flex gap-4 border-b border-line">
              <OrgLogo domain={item.domain} mark={item.mark} />
              <div className="flex-1">
                <div className="flex items-baseline justify-between gap-3 flex-wrap">
                  <h3 className="font-display font-bold text-lg">{item.role}</h3>
                  <span className="font-mono text-xs text-muted">{item.year}</span>
                </div>
                <a href={item.companyUrl} target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-orange hover:underline">{item.company} ↗</a>
                <p className="mt-2 text-[15px] leading-relaxed text-ink/80 max-w-2xl">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Writing + Reading */}
      <section className="py-14 grid md:grid-cols-2 gap-14">
        <div>
          <Label n="05 / Papers">Writing</Label>
          <div className="border-t border-line">
            {writing.map((w, i) => (
              <a key={i} href={w.href} target="_blank" rel="noopener noreferrer" className="group flex items-start justify-between gap-3 py-4 border-b border-line">
                <div>
                  <p className="font-mono text-[10px] text-orange uppercase tracking-wide mb-1">{w.tag}</p>
                  <h3 className="font-display font-medium text-[15px] leading-snug group-hover:text-orange transition-colors">{w.title}</h3>
                </div>
                <ArrowUpRight size={16} className="text-muted group-hover:text-orange shrink-0 mt-1" />
              </a>
            ))}
          </div>
        </div>
        <div>
          <Label n="06 / Shelf">Reading</Label>
          <ul className="border-t border-line">
            {reading.map((r, i) => (
              <li key={i} className="py-3 flex items-baseline gap-3 border-b border-line">
                <span className="font-mono text-xs text-orange w-5 shrink-0">{String(i + 1).padStart(2, '0')}</span>
                <span className="font-display font-medium text-[15px]">{r.title}</span>
                <span className="flex-1" />
                <span className="font-mono text-[11px] text-muted shrink-0">{r.author}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Footer CTA — the block you liked */}
      <footer className="mb-12 mt-6 bg-ink text-cream rounded-lg overflow-hidden relative blueprint">
        <div className="relative p-10 md:p-16">
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-orange mb-4">✳ Let&apos;s talk</p>
          <h2 className="font-display font-bold text-4xl md:text-5xl leading-[1.05] max-w-2xl">
            Building something, or hiring someone who does? <span className="text-orange">Say hi.</span>
          </h2>
          <div className="mt-9 flex flex-wrap gap-3">
            <a href="mailto:sar367@cornell.edu" className="inline-flex items-center gap-2 px-5 py-3 bg-orange text-cream font-mono text-sm uppercase tracking-wide hover:bg-rust transition-colors">
              <Mail size={15} /> sar367@cornell.edu
            </a>
            {CONTACTS.map(({ label, href, Icon }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 border border-cream/40 font-mono text-sm uppercase tracking-wide hover:text-orange hover:border-orange transition-colors">
                <Icon size={15} /> {label}
              </a>
            ))}
          </div>
          <p className="mt-12 font-mono text-[11px] text-cream/45">Ithaca, NY · sar367@cornell.edu · built by hand, 2027.</p>
        </div>
      </footer>
    </main>
  </div>
);

export default App;
