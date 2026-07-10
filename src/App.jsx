import projectsData from './data/projects.json';
import repoMeta from './data/repo-meta.json';
import readingData from './data/reading.json';

// --- content --------------------------------------------------------------

const TECH = [
  'Python', 'TypeScript', 'React', 'Next.js', 'Node.js', 'FastAPI',
  'PostgreSQL', 'Supabase', 'Docker', 'Solana / Anchor', 'LangChain', 'OCaml',
];

const careerTimeline = [
  { year: '2026', role: 'Student Ambassador', company: 'Akash Network', companyUrl: 'https://akash.network', desc: 'Representing Akash on campus and running workshops on decentralized compute.' },
  { year: '2025', role: 'Accelerator Subteam', company: 'Cornell Blockchain', companyUrl: 'https://cornellblockchain.org', desc: 'Working on accelerator initiatives and early-stage ventures.' },
  { year: '2025', role: 'Vice President, prev. AI Engineer', company: 'Generative AI at Cornell', companyUrl: 'https://cornellgenai.com', desc: 'Leading LLM-focused initiatives. Started as an engineer, stepped up to VP.' },
  { year: '2024', role: 'LLM Application Developer Intern', company: 'RIIG / HOOTL', companyUrl: 'https://www.riigtech.com', desc: 'Built an AI pipeline for financial regulatory analysis and document summarization.' },
];

const writing = [
  { tag: 'Research, 2025', title: "Arteta-Ball: Modeling Arsenal's Possession with Markov Chains", href: '/research/arteta_wharton-2.pdf' },
  { tag: 'Research, 2025', title: 'Gradient Integrity: Verifying Honest Computation on Decentralized GPU Networks', href: '/research/gradient-integrity.pdf' },
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
const Specimen = ({ name, style }) => (
  <img src={`/art/specimens/${name}.png`} alt="" aria-hidden="true" loading="lazy"
    className="pointer-events-none select-none absolute z-0" style={style} />
);

const Section = ({ id, specimen, children, className = '' }) => (
  <section id={id} className={`relative overflow-hidden ${className}`}>
    {specimen && <Specimen name={specimen.name} style={specimen.style} />}
    <div className="relative z-10 max-w-2xl mx-auto px-6 py-16 md:py-24">{children}</div>
  </section>
);

const Eyebrow = ({ children }) => (
  <p className="eyebrow text-muted mb-8">{children}</p>
);

const Link = ({ href, children }) => (
  <a href={href} target="_blank" rel="noopener noreferrer"
    className="hover:underline underline-offset-4 decoration-ink/40">{children}</a>
);

const App = () => (
  <div className="grain relative min-h-screen bg-paper text-ink overflow-x-hidden">

    {/* Header */}
    <header className="sticky top-0 z-30 bg-paper/85 backdrop-blur-[2px] border-b border-ink/10">
      <div className="max-w-2xl mx-auto px-6 h-14 flex items-center justify-between">
        <span className="text-[19px]">Asad Rizvi</span>
        <nav className="flex gap-6 eyebrow text-muted" style={{ marginBottom: 0 }}>
          <a href="#projects" className="hidden sm:inline hover:text-ink">Projects</a>
          <a href="#writing" className="hidden sm:inline hover:text-ink">Writing</a>
          <a href="/Rizvi_Asad_Resume.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-ink">Résumé</a>
        </nav>
      </div>
    </header>

    {/* Hero */}
    <Section specimen={{ name: 'medusa-orange', style: { top: '-40px', right: '-140px', width: '480px', opacity: 0.22 } }}>
      <Eyebrow><span className="inline-block w-1.5 h-1.5 rounded-full bg-ink align-middle mr-2" />Open to Summer 2027</Eyebrow>
      <h1 className="text-[2.7rem] sm:text-[3.4rem] md:text-[4rem] leading-[1.05] tracking-tight">
        I build AI for health, finance, and compute.
      </h1>
      <p className="mt-8 text-[19px] leading-[1.7] text-ink/80 max-w-xl">
        CS student at Cornell, from Bahrain. Right now I&apos;m founding <span className="italic">Zybit</span>,
        voice AI that charts for dentists. Before that: credit scoring, GPU marketplaces, and regulatory RAG.
      </p>
      <div className="mt-9 flex flex-wrap gap-x-6 gap-y-2 text-[15px] text-muted">
        <span>Ithaca, NY</span>
        <Link href="https://github.com/Archdiner">GitHub</Link>
        <Link href="https://www.linkedin.com/in/asad-rizvi-02a1782a2/">LinkedIn</Link>
        <Link href="https://x.com/carne_asado">X</Link>
        <a href="mailto:sar367@cornell.edu" className="hover:underline underline-offset-4 decoration-ink/40">Email</a>
      </div>
    </Section>

    {/* Projects */}
    <Section id="projects" specimen={{ name: 'rad-sphere', style: { top: '80px', right: '-150px', width: '400px', opacity: 0.08 } }} className="scroll-mt-16">
      <Eyebrow>Projects</Eyebrow>
      <div>
        {projects.map((p, i) => {
          const href = p.projectLink || p.githubLink;
          return (
            <div key={i} className="py-6 border-t border-ink/12 first:border-t-0">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-[1.6rem] leading-tight tracking-tight">
                  {href ? <Link href={href}>{p.title}</Link> : p.title}
                </h3>
                <div className="flex gap-4 text-[13px] text-muted shrink-0">
                  {p.projectLink && <Link href={p.projectLink}>live</Link>}
                  {p.githubLink && <Link href={p.githubLink}>code</Link>}
                </div>
              </div>
              {(p.tag || p.hackathonWinner) && (
                <p className="italic text-[15px] text-muted mt-1.5">{p.tag || p.hackathonWinner}</p>
              )}
              <p className="mt-2.5 text-[18px] leading-[1.6] text-ink/80">{p.blurb}</p>
              <p className="mt-3 eyebrow text-faint" style={{ letterSpacing: '0.14em' }}>
                {p.stack.join(' · ')}
                {p.stars != null && <span>{'  ·  '}{p.stars}★</span>}
                {p.updated && <span>{'  ·  '}{p.updated}</span>}
              </p>
            </div>
          );
        })}
      </div>
    </Section>

    {/* Writing */}
    <Section id="writing" specimen={{ name: 'rad-star', style: { top: '60px', left: '-170px', width: '380px', opacity: 0.08 } }} className="scroll-mt-16">
      <Eyebrow>Writing &amp; Research</Eyebrow>
      <div>
        {writing.map((w, i) => (
          <a key={i} href={w.href} target="_blank" rel="noopener noreferrer" className="group block py-6 border-t border-ink/12 first:border-t-0">
            <p className="eyebrow text-faint mb-2" style={{ letterSpacing: '0.2em' }}>{w.tag}</p>
            <h3 className="text-[1.4rem] leading-snug group-hover:underline underline-offset-4 decoration-ink/40">{w.title}</h3>
          </a>
        ))}
      </div>
    </Section>

    {/* Reading */}
    {reading.length > 0 && (
      <Section specimen={{ name: 'rad-tree', style: { bottom: '-40px', right: '-120px', width: '340px', opacity: 0.08 } }}>
        <Eyebrow>On My Shelf</Eyebrow>
        <div className="flex flex-wrap gap-8">
          {reading.map((r, i) => (
            <div key={i} className="w-24">
              <div className="aspect-[2/3] overflow-hidden bg-ink/5 shadow-[0_2px_16px_rgba(25,21,16,0.12)]">
                {r.cover ? (
                  <img src={r.cover} alt={r.title} loading="lazy"
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition duration-700" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center p-2 text-center text-[13px] italic text-faint">{r.title}</div>
                )}
              </div>
              <p className="text-[14px] mt-2 leading-tight">{r.title}</p>
              {r.author && <p className="text-[13px] italic text-faint">{r.author}</p>}
            </div>
          ))}
        </div>
      </Section>
    )}

    {/* Stack */}
    <Section specimen={{ name: 'rad-cylinder', style: { top: '10px', left: '-120px', width: '280px', opacity: 0.09 } }}>
      <Eyebrow>Stack</Eyebrow>
      <p className="text-[18px] leading-[1.9] text-ink/80">{TECH.join('   ·   ')}</p>
    </Section>

    {/* Experience */}
    <Section specimen={{ name: 'rad-burst', style: { top: '40px', right: '-160px', width: '420px', opacity: 0.07 } }}>
      <Eyebrow>Experience</Eyebrow>
      <div>
        {careerTimeline.map((item, i) => (
          <div key={i} className="py-6 border-t border-ink/12 first:border-t-0">
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="text-[1.35rem] tracking-tight">{item.role}</h3>
              <span className="text-[14px] text-faint shrink-0">{item.year}</span>
            </div>
            <p className="mt-1 text-[15px] text-muted">
              <Link href={item.companyUrl}>{item.company}</Link>
            </p>
            <p className="mt-2.5 text-[18px] leading-[1.6] text-ink/80">{item.desc}</p>
          </div>
        ))}
      </div>
    </Section>

    {/* Footer */}
    <section className="relative overflow-hidden border-t border-ink/12">
      <Specimen name="medusa-blue" style={{ bottom: '-80px', left: '50%', transform: 'translateX(-50%)', width: '560px', opacity: 0.06 }} />
      <div className="relative z-10 max-w-2xl mx-auto px-6 py-24">
        <h2 className="text-[2.4rem] tracking-tight">Let&apos;s build something.</h2>
        <div className="mt-6 flex flex-wrap gap-x-7 gap-y-2 text-[15px] text-muted">
          <a href="mailto:sar367@cornell.edu" className="hover:underline underline-offset-4 decoration-ink/40">sar367@cornell.edu</a>
          <Link href="https://github.com/Archdiner">GitHub</Link>
          <Link href="https://www.linkedin.com/in/asad-rizvi-02a1782a2/">LinkedIn</Link>
          <Link href="https://x.com/carne_asado">X</Link>
        </div>
        <p className="mt-12 text-[13px] italic text-faint">
          Specimen studies after E. Haeckel, Kunstformen der Natur (1904), public domain.
        </p>
      </div>
    </section>
  </div>
);

export default App;
