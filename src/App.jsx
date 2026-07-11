import { useState } from 'react';
import { Github, Linkedin, Twitter, FileText, Mail, ArrowUpRight } from 'lucide-react';
import projectsData from './data/projects.json';
import repoMeta from './data/repo-meta.json';

// --- content --------------------------------------------------------------

const STACK = ['Python', 'TypeScript', 'OCaml', 'React', 'Next.js', 'FastAPI', 'PostgreSQL', 'PyTorch', 'LangChain', 'Solana / Anchor', 'Docker', 'Neo4j'];

const careerTimeline = [
  { year: '2026', role: 'Student Ambassador', company: 'Akash Network', domain: 'akash.network', mark: 'AK', companyUrl: 'https://akash.network', desc: 'Running campus workshops on decentralized compute.' },
  { year: '2025', role: 'Vice President, prev. AI Engineer', company: 'Generative AI at Cornell', domain: 'cornellgenai.com', mark: 'GA', companyUrl: 'https://cornellgenai.com', desc: 'Leading LLM initiatives after starting as an engineer.' },
  { year: '2025', role: 'Accelerator Subteam', company: 'Cornell Blockchain', domain: 'cornellblockchain.org', mark: 'CB', companyUrl: 'https://cornellblockchain.org', desc: 'Working on accelerator initiatives and early-stage ventures.' },
  { year: '2024', role: 'LLM Application Developer Intern', company: 'RIIG / HOOTL', domain: 'riigtech.com', mark: 'R', companyUrl: 'https://www.riigtech.com', desc: 'Built an AI pipeline for financial regulatory analysis.' },
];

const writing = [
  { tag: 'Research, 2025', title: "Arteta-Ball: Modeling Arsenal's Possession with Markov Chains", href: '/research/arteta_wharton-2.pdf' },
  { tag: 'Research, 2025', title: 'Gradient Integrity: Verifying Honest Computation on GPU Networks', href: '/research/gradient-integrity.pdf' },
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
    return <div className="w-9 h-9 shrink-0 rounded bg-cream border border-line flex items-center justify-center font-mono text-[11px] font-semibold text-orange">{mark}</div>;
  }
  return (
    <div className="w-9 h-9 shrink-0 rounded bg-white border border-line flex items-center justify-center overflow-hidden">
      <img src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`} alt="" width="20" height="20" onError={() => setFailed(true)} />
    </div>
  );
};

const Eyebrow = ({ children }) => (
  <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted mb-6">{children}</p>
);

const App = () => (
  <div className="grain relative bg-paper text-ink min-h-screen">
    <div className="relative z-[2] max-w-4xl mx-auto px-6">

      {/* Hero — photo first */}
      <section className="pt-16 md:pt-20 pb-14 flex flex-col md:flex-row gap-8 md:gap-12 md:items-center">
        <img
          src="/art/zine/avatar-color.jpg"
          alt="Asad Rizvi"
          className="w-40 h-40 md:w-52 md:h-52 rounded-2xl object-cover shrink-0 ring-1 ring-line"
        />
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
            in 3 practices. Before it: cross-border credit scoring, a GPU marketplace, and a knowledge-graph
            system over financial regulation.
          </p>
          <div className="mt-6 flex flex-wrap gap-2.5">
            <a href="mailto:sar367@cornell.edu" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange text-cream font-medium text-sm hover:bg-rust transition-colors">
              <Mail size={15} /> Email
            </a>
            {CONTACTS.map(({ label, href, Icon }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-line text-ink font-medium text-sm hover:border-orange hover:text-orange transition-colors">
                <Icon size={15} /> {label}
              </a>
            ))}
          </div>
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
                <div className="aspect-[16/10] rounded-lg overflow-hidden bg-cream ring-1 ring-line">
                  {p.image ? (
                    <img src={p.image} alt={p.title} className="w-full h-full object-cover object-top group-hover:scale-[1.03] transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-mono text-[11px] text-muted p-4 text-center">{p.stack.join(' · ')}</div>
                  )}
                </div>
                <div className="mt-3 flex items-baseline justify-between gap-2">
                  <h3 className="font-display font-bold text-lg leading-tight group-hover:text-orange transition-colors">{p.title}</h3>
                  <span className="font-mono text-[11px] text-orange shrink-0">
                    {p.hackathonWinner ? '★ 3rd' : p.tag ? 'Live' : p.projectLink ? 'Live' : 'Code'}
                  </span>
                </div>
                <p className="mt-1.5 text-[14px] leading-snug text-ink/75">{p.blurb}</p>
                <p className="mt-2 font-mono text-[11px] text-muted">{p.stack.join(' · ')}</p>
              </Wrap>
            );
          })}
        </div>
      </section>

      {/* Stack + Reading side by side, tasteful */}
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
          <Eyebrow>On my shelf</Eyebrow>
          <ul className="space-y-2.5">
            {reading.map((r) => (
              <li key={r.title} className="flex items-baseline gap-2 text-[15px]">
                <span className="font-medium">{r.title}</span>
                <span className="flex-1 border-b border-dotted border-line translate-y-[-3px]" />
                <span className="text-muted text-sm shrink-0">{r.author}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Experience */}
      <section id="experience" className="py-12 border-t border-line">
        <Eyebrow>Experience</Eyebrow>
        <div className="space-y-6">
          {careerTimeline.map((item, i) => (
            <div key={i} className="flex gap-4 items-start">
              <OrgLogo domain={item.domain} mark={item.mark} />
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

      {/* Writing */}
      <section className="py-12 border-t border-line">
        <Eyebrow>Writing</Eyebrow>
        <div className="space-y-4">
          {writing.map((w, i) => (
            <a key={i} href={w.href} target="_blank" rel="noopener noreferrer" className="group flex items-baseline justify-between gap-4">
              <h3 className="text-[15px] group-hover:text-orange transition-colors">{w.title}</h3>
              <span className="font-mono text-[11px] text-muted shrink-0">{w.tag}</span>
            </a>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <footer className="my-10 rounded-2xl bg-ink text-cream p-10 md:p-14">
        <h2 className="font-display font-bold text-3xl md:text-4xl leading-tight max-w-lg">
          Building something, or hiring someone who does? <span className="text-orange">Say hi.</span>
        </h2>
        <div className="mt-7 flex flex-wrap gap-2.5">
          <a href="mailto:sar367@cornell.edu" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange text-cream font-medium text-sm hover:bg-rust transition-colors">
            <Mail size={15} /> sar367@cornell.edu
          </a>
          {CONTACTS.map(({ label, href, Icon }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cream/30 font-medium text-sm hover:border-orange hover:text-orange transition-colors">
              <Icon size={15} /> {label}
            </a>
          ))}
        </div>
        <p className="mt-9 font-mono text-[11px] text-cream/45">Ithaca, NY. Bass in a jazz band, amateur boxing, top-20 competitive Pokémon.</p>
      </footer>
    </div>
  </div>
);

export default App;
