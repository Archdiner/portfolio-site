import projectsData from './data/projects.json';
import repoMeta from './data/repo-meta.json';
import readingData from './data/reading.json';

// --- content --------------------------------------------------------------

const TECH = [
  'Python', 'TypeScript', 'React', 'Next.js', 'Node.js', 'FastAPI',
  'PostgreSQL', 'Supabase', 'Docker', 'Solana / Anchor', 'LangChain', 'OCaml',
];

const careerTimeline = [
  { year: '2026 —', role: 'Student Ambassador', company: 'Akash Network', companyUrl: 'https://akash.network', desc: 'Representing Akash on campus and running workshops on decentralized compute.' },
  { year: '2025 —', role: 'Accelerator Subteam', company: 'Cornell Blockchain', companyUrl: 'https://cornellblockchain.org', desc: 'Working on accelerator initiatives and early-stage ventures.' },
  { year: '2025 —', role: 'VP, prev. AI Engineer', company: 'Generative AI at Cornell', companyUrl: 'https://cornellgenai.com', desc: 'Leading LLM-focused initiatives. Started as an engineer, stepped up to VP.' },
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

const reading = readingData.filter((r) => !r.title.startsWith('Replace me'));

/* eslint-disable react/prop-types */
const Out = ({ href, children }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
    {children}<span className="text-accent"> ↗</span>
  </a>
);

const Label = ({ children }) => (
  <div className="flex items-center gap-3 mb-8">
    <img src="/art/specimen-sphere.png" alt="" className="w-7 h-7 opacity-60 select-none" />
    <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted">{children}</h2>
  </div>
);

const App = () => (
  <div className="grain relative min-h-screen bg-ivory text-ink font-sans overflow-x-hidden">
    {/* ambient naturalist plate, very faint */}
    <img
      src="/art/radiolaria-ink.png"
      alt=""
      aria-hidden="true"
      loading="lazy"
      className="pointer-events-none select-none absolute right-[-120px] top-[420px] w-[420px] opacity-[0.05] hidden lg:block"
    />

    {/* Header */}
    <header className="sticky top-0 z-30 bg-ivory/80 backdrop-blur-sm border-b border-ink/10">
      <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
        <span className="font-serif text-lg tracking-tight">Asad Rizvi</span>
        <nav className="flex gap-5 font-mono text-[11px] text-muted">
          <a href="#projects" className="hidden sm:inline hover:text-accent transition-colors">projects</a>
          <a href="#writing" className="hidden sm:inline hover:text-accent transition-colors">writing</a>
          <a href="/Rizvi_Asad_Resume.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">résumé</a>
        </nav>
      </div>
    </header>

    <main className="relative z-[2] max-w-3xl mx-auto px-6">

      {/* Hero */}
      <section className="pt-16 md:pt-24 pb-20">
        <div className="grid md:grid-cols-5 gap-10 md:gap-8 items-start">
          <div className="md:col-span-3 min-w-0">
            <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-muted flex items-center gap-2 mb-7">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" /> Open to Summer 2027
            </p>
            <h1 className="font-serif text-[2rem] sm:text-[2.6rem] md:text-5xl leading-[1.05] tracking-tight text-balance">
              I build AI for health, finance, and compute.
            </h1>
            <p className="mt-7 text-[17px] leading-relaxed text-ink/70 max-w-md">
              CS student at Cornell, from Bahrain. Right now I&apos;m founding{' '}
              <span className="font-serif italic">Zybit</span>, voice AI that charts for dentists.
              Before that: credit scoring, GPU marketplaces, and regulatory RAG.
            </p>
            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[11px] text-muted">
              <span>Ithaca, NY</span>
              <Out href="https://github.com/Archdiner">github</Out>
              <Out href="https://www.linkedin.com/in/asad-rizvi-02a1782a2/">linkedin</Out>
              <Out href="https://x.com/carne_asado">x</Out>
              <a href="mailto:sar367@cornell.edu" className="hover:text-accent transition-colors">email</a>
            </div>
          </div>
          <figure className="md:col-span-2 min-w-0">
            <div className="border border-ink/15 bg-paper p-2 shadow-[0_1px_20px_rgba(28,26,23,0.06)]">
              <img src="/art/jellyfish.jpg" alt="Haeckel, Discomedusae" className="w-full block" />
            </div>
            <figcaption className="mt-2.5 font-mono text-[10px] leading-snug text-faint">
              Discomedusae. E. Haeckel,<br />Kunstformen der Natur, 1904.
            </figcaption>
          </figure>
        </div>
      </section>

      {/* Projects */}
      <section id="projects" className="py-14 scroll-mt-20">
        <Label>Projects</Label>
        <div>
          {projects.map((p, i) => {
            const href = p.projectLink || p.githubLink;
            return (
              <div key={i} className="py-6 border-t border-ink/12 first:border-t-0">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-serif text-xl tracking-tight">
                    {href ? (
                      <a href={href} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">{p.title}</a>
                    ) : p.title}
                  </h3>
                  <div className="flex gap-3 font-mono text-[11px] text-muted shrink-0">
                    {p.projectLink && <Out href={p.projectLink}>live</Out>}
                    {p.githubLink && <Out href={p.githubLink}>code</Out>}
                  </div>
                </div>
                {(p.tag || p.hackathonWinner) && (
                  <p className="font-mono text-[11px] text-accent mt-1.5">{p.tag || p.hackathonWinner}</p>
                )}
                <p className="mt-2.5 text-[15px] leading-relaxed text-ink/70">{p.blurb}</p>
                <p className="mt-3 font-mono text-[11px] text-faint">
                  {p.stack.join(' · ')}
                  {p.stars != null && <span className="text-ink/25"> &nbsp;/&nbsp; </span>}
                  {p.stars != null && <span>{p.stars}★</span>}
                  {p.updated && <span> · {p.updated}</span>}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Writing */}
      <section id="writing" className="py-14 scroll-mt-20">
        <Label>Writing &amp; Research</Label>
        <div>
          {writing.map((w, i) => (
            <a key={i} href={w.href} target="_blank" rel="noopener noreferrer" className="group block py-6 border-t border-ink/12 first:border-t-0">
              <p className="font-mono text-[11px] text-faint mb-2">{w.tag}</p>
              <h3 className="font-serif text-lg leading-snug group-hover:text-accent transition-colors">
                {w.title}<span className="text-accent"> ↗</span>
              </h3>
            </a>
          ))}
        </div>
      </section>

      {/* Reading */}
      {reading.length > 0 && (
        <section className="py-14">
          <Label>On My Shelf</Label>
          <div className="flex flex-wrap gap-7">
            {reading.map((r, i) => (
              <div key={i} className="w-24">
                <div className="aspect-[2/3] overflow-hidden border border-ink/15 bg-paper shadow-[0_1px_12px_rgba(28,26,23,0.08)]">
                  {r.cover ? (
                    <img src={r.cover} alt={r.title} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center p-2 text-center font-mono text-[10px] text-faint">{r.title}</div>
                  )}
                </div>
                <p className="font-mono text-[10px] mt-2 leading-tight text-ink/70">{r.title}</p>
                {r.author && <p className="font-mono text-[10px] text-faint">{r.author}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Stack */}
      <section className="py-14">
        <Label>Stack</Label>
        <p className="font-mono text-sm text-ink/70 leading-loose">{TECH.join('   ·   ')}</p>
      </section>

      {/* Experience */}
      <section className="py-14">
        <Label>Experience</Label>
        <div>
          {careerTimeline.map((item, i) => (
            <div key={i} className="py-6 border-t border-ink/12 first:border-t-0">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="font-serif text-lg tracking-tight">{item.role}</h3>
                <span className="font-mono text-[11px] text-faint shrink-0">{item.year}</span>
              </div>
              <p className="mt-1">
                <a href={item.companyUrl} target="_blank" rel="noopener noreferrer" className="font-mono text-[11px] text-muted hover:text-accent transition-colors">
                  {item.company} ↗
                </a>
              </p>
              <p className="mt-2.5 text-[15px] leading-relaxed text-ink/70">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 mt-6 border-t border-ink/12">
        <h2 className="font-serif text-3xl tracking-tight">Let&apos;s build something.</h2>
        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs text-muted">
          <a href="mailto:sar367@cornell.edu" className="hover:text-accent transition-colors">sar367@cornell.edu</a>
          <Out href="https://github.com/Archdiner">github</Out>
          <Out href="https://www.linkedin.com/in/asad-rizvi-02a1782a2/">linkedin</Out>
          <Out href="https://x.com/carne_asado">x</Out>
        </div>
        <p className="mt-10 font-mono text-[10px] text-faint">
          Specimen illustrations: E. Haeckel, Kunstformen der Natur (1904), public domain.
        </p>
      </footer>
    </main>
  </div>
);

export default App;
