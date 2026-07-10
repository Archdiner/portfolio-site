import projectsData from './data/projects.json';
import repoMeta from './data/repo-meta.json';
import readingData from './data/reading.json';

// --- static content -------------------------------------------------------

const TECH = [
  'Python', 'TypeScript', 'React', 'Next.js', 'Node.js', 'FastAPI',
  'PostgreSQL', 'Supabase', 'Docker', 'Solana / Anchor', 'LangChain', 'OCaml',
];

const careerTimeline = [
  {
    year: 'Jan 2026 — now',
    role: 'Student Ambassador',
    company: 'Akash Network',
    companyUrl: 'https://akash.network',
    desc: 'Representing Akash on campus and running workshops on decentralized compute.',
  },
  {
    year: 'Oct 2025 — now',
    role: 'Accelerator Subteam',
    company: 'Cornell Blockchain',
    companyUrl: 'https://cornellblockchain.org',
    desc: 'Working on accelerator initiatives and early-stage ventures.',
  },
  {
    year: 'Oct 2025 — now',
    role: 'VP (prev. AI Engineer)',
    company: 'Generative AI at Cornell',
    companyUrl: 'https://cornellgenai.com',
    desc: 'Leading LLM-focused initiatives. Started as an engineer, stepped up to VP.',
  },
  {
    year: 'Jul 2024',
    role: 'LLM Application Developer Intern',
    company: 'RIIG — HOOTL',
    companyUrl: 'https://www.riigtech.com',
    desc: 'Built an AI pipeline for financial regulatory analysis and document summarization.',
  },
];

const writing = [
  {
    tag: 'Research · Mar 2025',
    title: "Arteta-Ball: Modeling Arsenal's Possession with Markov Chains",
    href: '/research/arteta_wharton-2.pdf',
  },
  {
    tag: 'Research · 2025',
    title: 'Gradient Integrity: Verifying Honest Computation on Decentralized GPU Networks',
    href: '/research/gradient-integrity.pdf',
  },
  {
    tag: 'Write-up',
    title: "Why You Can't Trust the Volume Numbers You See Online",
    href: 'https://github.com/Archdiner/blockchain_trading_volume_generator',
  },
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
const Label = ({ children }) => (
  <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#8a877e] mb-6">{children}</h2>
);

const Out = ({ href, children }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="hover:text-[#b8451f] transition-colors">
    {children} <span className="text-[#b8451f]">↗</span>
  </a>
);

const App = () => (
  <div className="bg-[#f2f0ea] text-[#1b1a17] min-h-screen font-sans antialiased">
    <style>{`html { scroll-behavior: smooth; }`}</style>

    {/* Header */}
    <header className="sticky top-0 z-40 bg-[#f2f0ea]/85 backdrop-blur border-b border-black/5">
      <div className="max-w-2xl mx-auto px-6 h-14 flex items-center justify-between">
        <span className="text-sm font-medium tracking-tight">asad rizvi</span>
        <nav className="flex gap-5 font-mono text-[11px] text-[#6b6862]">
          <a href="#projects" className="hover:text-[#1b1a17] transition-colors">projects</a>
          <a href="#writing" className="hover:text-[#1b1a17] transition-colors">writing</a>
          <a href="/Rizvi_Asad_Resume.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-[#1b1a17] transition-colors">résumé</a>
        </nav>
      </div>
    </header>

    <main className="max-w-2xl mx-auto px-6">

      {/* Hero */}
      <section className="pt-16 pb-20">
        <img
          src="/portrait-dither.png"
          alt="Asad Rizvi"
          className="w-28 h-28 object-cover border border-black/10 mb-8 grayscale"
        />
        <div className="flex items-center gap-2 font-mono text-[11px] text-[#6b6862] mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-[#b8451f]" />
          OPEN TO SUMMER 2027
        </div>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">
          I build AI for health, finance, and compute.
        </h1>
        <p className="text-[#57544d] mt-5 leading-relaxed max-w-xl">
          CS student at Cornell, from Bahrain. Right now I&apos;m founding Zybit, voice AI that charts for
          dentists. Before that: credit scoring, GPU marketplaces, and regulatory RAG.
        </p>
        <div className="flex flex-wrap gap-x-5 gap-y-2 mt-6 font-mono text-xs text-[#6b6862]">
          <span>Ithaca, NY</span>
          <Out href="https://github.com/Archdiner">github</Out>
          <Out href="https://www.linkedin.com/in/asad-rizvi-02a1782a2/">linkedin</Out>
          <Out href="https://x.com/carne_asado">x</Out>
          <a href="mailto:sar367@cornell.edu" className="hover:text-[#b8451f] transition-colors">email</a>
        </div>
      </section>

      {/* Projects */}
      <section id="projects" className="py-14 scroll-mt-20">
        <Label>Projects</Label>
        <div>
          {projects.map((p, i) => {
            const Title = () =>
              p.githubLink || p.projectLink ? (
                <a
                  href={p.projectLink || p.githubLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#b8451f] transition-colors"
                >
                  {p.title}
                </a>
              ) : (
                <span>{p.title}</span>
              );
            return (
              <div key={i} className="py-5 border-t border-black/10">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="text-base font-semibold tracking-tight">
                    <Title />
                  </h3>
                  <div className="flex gap-3 font-mono text-[11px] text-[#6b6862] shrink-0">
                    {p.projectLink && <Out href={p.projectLink}>live</Out>}
                    {p.githubLink && <Out href={p.githubLink}>code</Out>}
                  </div>
                </div>
                {(p.tag || p.hackathonWinner) && (
                  <p className="font-mono text-[11px] text-[#b8451f] mt-1">{p.tag || p.hackathonWinner}</p>
                )}
                <p className="text-[#57544d] mt-2 leading-relaxed text-[15px]">{p.blurb}</p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3 font-mono text-[11px] text-[#8a877e]">
                  <span>{p.stack.join(' · ')}</span>
                  {(p.stars != null || p.updated) && <span className="text-black/20">|</span>}
                  {p.stars != null && <span>{p.stars}★</span>}
                  {p.updated && <span>updated {p.updated}</span>}
                </div>
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
            <a
              key={i}
              href={w.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group block py-5 border-t border-black/10"
            >
              <p className="font-mono text-[11px] text-[#8a877e] mb-1">{w.tag}</p>
              <h3 className="text-base font-medium tracking-tight leading-snug group-hover:text-[#b8451f] transition-colors">
                {w.title} <span className="text-[#b8451f]">↗</span>
              </h3>
            </a>
          ))}
        </div>
      </section>

      {/* Reading */}
      {reading.length > 0 && (
        <section className="py-14">
          <Label>On My Shelf</Label>
          <div className="flex flex-wrap gap-6">
            {reading.map((r, i) => (
              <div key={i} className="w-24">
                <div className="aspect-[2/3] overflow-hidden border border-black/10 bg-black/5">
                  {r.cover ? (
                    <img src={r.cover} alt={r.title} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center p-2 text-center font-mono text-[10px] text-black/40">
                      {r.title}
                    </div>
                  )}
                </div>
                <p className="font-mono text-[10px] mt-2 leading-tight">{r.title}</p>
                {r.author && <p className="font-mono text-[10px] text-[#8a877e]">{r.author}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Stack */}
      <section className="py-14">
        <Label>Stack</Label>
        <p className="font-mono text-sm text-[#57544d] leading-relaxed">{TECH.join('  ·  ')}</p>
      </section>

      {/* Experience */}
      <section className="py-14">
        <Label>Experience</Label>
        <div>
          {careerTimeline.map((item, i) => (
            <div key={i} className="py-5 border-t border-black/10">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-base font-semibold tracking-tight">{item.role}</h3>
                <span className="font-mono text-[11px] text-[#8a877e] shrink-0">{item.year}</span>
              </div>
              <p className="font-mono text-[11px] mt-1">
                <a href={item.companyUrl} target="_blank" rel="noopener noreferrer" className="text-[#6b6862] hover:text-[#b8451f] transition-colors">
                  {item.company} ↗
                </a>
              </p>
              <p className="text-[#57544d] mt-2 leading-relaxed text-[15px]">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-black/10">
        <p className="text-lg font-medium tracking-tight">Let&apos;s build something.</p>
        <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4 font-mono text-xs text-[#6b6862]">
          <a href="mailto:sar367@cornell.edu" className="hover:text-[#b8451f] transition-colors">sar367@cornell.edu</a>
          <Out href="https://github.com/Archdiner">github</Out>
          <Out href="https://www.linkedin.com/in/asad-rizvi-02a1782a2/">linkedin</Out>
          <Out href="https://x.com/carne_asado">x</Out>
        </div>
      </footer>
    </main>
  </div>
);

export default App;
