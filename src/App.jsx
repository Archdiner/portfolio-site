import { useState, useEffect } from 'react';
import { Github, Linkedin, Twitter, FileText, Mail, ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import projectsData from './data/projects.json';
import repoMeta from './data/repo-meta.json';

// --- content --------------------------------------------------------------

const STACK = ['Python', 'TypeScript', 'Java', 'OCaml', 'React', 'Next.js', 'FastAPI', 'PostgreSQL', 'PyTorch', 'LangChain', 'Solana / Anchor', 'Docker'];

const careerTimeline = [
  { year: 'Since 2026', role: 'Founder & CTO', company: 'Zybit', logo: '/logos/zybit.png', mark: 'Z', companyUrl: 'https://getzybit.com', desc: 'Voice AI that charts for dentists. Live in 3 dental clinics today, onboarding more by hand.' },
  { year: 'Since 2026', role: 'Student Ambassador', company: 'Akash Network', logo: '/logos/akash.ico', mark: 'AK', companyUrl: 'https://akash.network', desc: 'Running campus workshops on decentralized compute.' },
  { year: 'Since 2025', role: 'Vice President', company: 'Generative AI at Cornell', logo: '/logos/genai.ico', mark: 'GA', companyUrl: 'https://cornellgenai.dev', desc: 'Leading LLM initiatives after starting as an engineer.' },
  { year: 'Since 2025', role: 'Engineering Subteam', company: 'Cornell Blockchain', logo: '/logos/cornellblockchain.png', mark: 'CB', companyUrl: 'https://cornellblockchain.org', desc: 'Building on-chain projects with the engineering subteam.' },
  { year: '2024', role: 'LLM Application Developer Intern', company: 'RIIG / HOOTL', logo: '/logos/riig.png', mark: 'R', companyUrl: 'https://www.riigtech.com', desc: 'Built an AI pipeline for financial regulatory analysis.' },
];

const writing = [
  { tag: 'Research · 2025', title: "Arteta-Ball: Modeling Arsenal's Possession with Markov Chains", href: '/research/arteta_wharton-2.pdf' },
  { tag: 'Research · 2025', title: 'Gradient Integrity: Verifying Honest Computation on GPU Networks', href: '/research/gradient-integrity.pdf' },
  { tag: 'Write-up', title: "Why You Can't Trust the Volume Numbers You See Online", href: 'https://github.com/Archdiner/blockchain_trading_volume_generator' },
];

const reading = [
  { title: 'The Alchemist', author: 'Paulo Coelho', cover: '/books/alchemist.jpg' },
  { title: 'Kafka on the Shore', author: 'Haruki Murakami', cover: '/books/kafka-shore.jpg' },
  { title: 'The Count of Monte Cristo', author: 'Alexandre Dumas', cover: '/books/monte-cristo.jpg' },
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
const [featured, ...restProjects] = projects;

/* eslint-disable react/prop-types */
const CONTACTS = [
  { label: 'GitHub', href: 'https://github.com/Archdiner', Icon: Github },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/asad-rizvi-02a1782a2/', Icon: Linkedin },
  { label: 'Résumé', href: '/Rizvi_Asad_Resume.pdf', Icon: FileText },
  { label: 'X', href: 'https://x.com/carne_asado', Icon: Twitter },
];

// Pokéball logo trinket
const Pokeball = ({ size = 19 }) => (
  <img src="/pokeball.svg" alt="Pokéball" width={size} height={size} className="inline-block align-[-0.22em] mx-[1px]" />
);

const Trinket = ({ children }) => (
  <span className="text-[1.02em] align-[-0.12em] mx-[1px]" aria-hidden="true">{children}</span>
);

const OrgLogo = ({ logo, mark }) => {
  const [failed, setFailed] = useState(false);
  if (failed || !logo) {
    return <div className="w-9 h-9 shrink-0 bg-faint border border-line flex items-center justify-center font-mono text-[11px] font-semibold text-blood">{mark}</div>;
  }
  return (
    <div className="w-9 h-9 shrink-0 bg-white border border-line flex items-center justify-center overflow-hidden">
      <img src={logo} alt="" className="w-6 h-6 object-contain" onError={() => setFailed(true)} />
    </div>
  );
};

const SectionHead = ({ n, title, id }) => (
  <div id={id} className="flex items-baseline justify-between gap-4 mb-9 pb-2.5 border-b border-ink/25">
    <h2 className="font-display text-2xl md:text-[28px] font-semibold tracking-tight">{title}</h2>
    <span className="font-mono text-[11px] text-muted tabular-nums shrink-0">{n} / 05</span>
  </div>
);

// external text link with a small rising arrow
const NavLink = ({ href, children }) => (
  <a href={href} target="_blank" rel="noopener noreferrer"
    className="group inline-flex items-center gap-1 text-[14px] text-ink/80 hover:text-blood transition-colors">
    <span className="link-ul">{children}</span>
    <ArrowUpRight size={13} className="text-muted group-hover:text-blood transition-colors" />
  </a>
);

const statusFor = (p) => (p.hackathonWinner ? '★ 3rd place' : p.projectLink ? 'Live' : 'Source');

const ReadingCarousel = () => {
  const [idx, setIdx] = useState(0);
  const n = reading.length;
  useEffect(() => {
    reading.forEach((b) => { const im = new Image(); im.src = b.cover; });
  }, []);
  const at = (o) => reading[((idx + o) % n + n) % n];
  const go = (d) => setIdx((i) => ((i + d) % n + n) % n);
  const center = at(0);
  return (
    <div className="select-none">
      <div className="flex items-center justify-center gap-2 sm:gap-6 h-[220px] sm:h-[268px]">
        <button aria-label="Previous" onClick={() => go(-1)} className="p-1.5 sm:p-2 border border-line hover:border-blood hover:text-blood transition-colors shrink-0"><ChevronLeft size={18} /></button>
        {[-1, 0, 1].map((o) => {
          const b = at(o);
          const isCenter = o === 0;
          return (
            <button
              key={o}
              aria-label={isCenter ? b.title : `Go to ${b.title}`}
              onClick={() => !isCenter && go(o)}
              className={`shrink-0 transition-opacity duration-300 ${isCenter ? '' : 'opacity-35 hover:opacity-70 cursor-pointer'}`}
            >
              <img src={b.cover} alt={b.title} draggable="false" className={`${isCenter ? 'w-28 sm:w-40' : 'w-16 sm:w-24'} aspect-[2/3] object-cover border border-line shadow-[0_10px_30px_rgba(31,26,19,0.22)]`} />
            </button>
          );
        })}
        <button aria-label="Next" onClick={() => go(1)} className="p-1.5 sm:p-2 border border-line hover:border-blood hover:text-blood transition-colors shrink-0"><ChevronRight size={18} /></button>
      </div>
      <div className="h-14 mt-4 flex flex-col items-center justify-start text-center px-4">
        <p className="font-display font-semibold text-[16px] leading-tight">{center.title}</p>
        <p className="text-[13px] text-muted mt-1">{center.author}</p>
      </div>
    </div>
  );
};

// --- project cards --------------------------------------------------------

const FeaturedProject = ({ p }) => {
  const href = p.projectLink || p.githubLink;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="group block mb-10">
      <div className="aspect-[16/9] overflow-hidden bg-faint border border-line">
        {p.image && <img src={p.image} alt={p.title} className="w-full h-full object-cover object-top group-hover:scale-[1.02] transition-transform duration-700" />}
      </div>
      <p className="mt-4 font-mono text-[11px] text-blood uppercase tracking-[0.12em]">Currently building · {statusFor(p)}</p>
      <h3 className="mt-1 font-display text-3xl font-semibold leading-tight tracking-tight group-hover:text-blood transition-colors">{p.title}</h3>
      <p className="mt-2 text-[15px] leading-relaxed text-ink/75">{p.blurb}</p>
      <p className="mt-3 font-mono text-[11px] text-muted">{p.stack.join('  ·  ')}</p>
    </a>
  );
};

const ProjectCard = ({ p }) => {
  const href = p.projectLink || p.githubLink;
  const Wrap = href ? 'a' : 'div';
  return (
    <Wrap
      {...(href ? { href, target: '_blank', rel: 'noopener noreferrer' } : {})}
      className="group block"
    >
      <div className="hidden sm:block aspect-[16/10] overflow-hidden bg-faint border border-line">
        {p.image ? (
          <img src={p.image} alt={p.title} className="w-full h-full object-cover object-top group-hover:scale-[1.03] transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center font-mono text-[11px] text-muted p-4 text-center">{p.stack.join(' · ')}</div>
        )}
      </div>
      <div className="sm:mt-3 flex items-baseline justify-between gap-2 border-b border-line pb-1.5 sm:border-0 sm:pb-0">
        <h3 className="font-display font-semibold text-lg leading-tight group-hover:text-blood transition-colors">{p.title}</h3>
        <span className="font-mono text-[11px] text-muted shrink-0">{statusFor(p)}</span>
      </div>
      <p className="mt-1.5 text-[14px] leading-snug text-ink/75">{p.blurb}</p>
      <p className="mt-2 font-mono text-[11px] text-muted">{p.stack.join(' · ')}</p>
    </Wrap>
  );
};

// --- page -----------------------------------------------------------------

const App = () => (
  <div className="bg-paper text-ink min-h-screen">

    <div className="max-w-2xl mx-auto px-6">

      {/* Hero */}
      <section className="pt-14 md:pt-16 pb-12">
        <div className="flex items-center gap-5">
          <img src="/art/zine/avatar-color.jpg" alt="Asad Rizvi" className="w-24 h-24 md:w-28 md:h-28 rounded-xl object-cover shrink-0 border border-line" />
          <div>
            <h1 className="font-display text-5xl md:text-6xl font-semibold leading-[0.95] tracking-tight">Asad Rizvi</h1>
            <p className="mt-2 font-display text-xl md:text-[22px] text-ink/85 leading-snug">
              CS at Cornell, from Bahrain. Founder of{' '}
              <a href="https://getzybit.com" target="_blank" rel="noopener noreferrer" className="text-blood link-ul">Zybit</a>.
            </p>
          </div>
        </div>
        <p className="mt-7 text-[17px] leading-relaxed text-ink/80">
          I build AI products and ship them. Right now that&apos;s Zybit, voice AI that charts for dentists, live
          in three practices. Before it: an agent that audits whether tokenized real-world assets are actually
          backed, a GPU marketplace, and an app that lets you stake money on your screen-time goals.
        </p>
        <p className="mt-4 text-[17px] leading-relaxed text-ink/70">
          Away from the keyboard I play <span className="text-blood font-medium">bass</span> in a jazz band <Trinket>🎸</Trinket>,{' '}
          <span className="text-blood font-medium">box</span> a little <Trinket>🥊</Trinket>, and I peaked at
          top&nbsp;20 in competitive <span className="text-blood font-medium">Pok&eacute;mon</span> (vgc) <Pokeball />.
        </p>
        <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
          <a href="mailto:sar367@cornell.edu" className="group inline-flex items-center gap-1.5 text-[15px] font-medium text-blood">
            <Mail size={15} /> <span className="link-ul">sar367@cornell.edu</span>
          </a>
          {CONTACTS.map(({ label, href }) => (
            <NavLink key={label} href={href}>{label}</NavLink>
          ))}
        </div>
      </section>

      {/* Work */}
      <section className="py-12 border-t border-line">
        <SectionHead n="01" title="Selected work" id="work" />
        <FeaturedProject p={featured} />
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-5 sm:gap-y-10">
          {restProjects.map((p, i) => <ProjectCard key={i} p={p} />)}
        </div>
      </section>

      {/* Experience */}
      <section className="py-12 border-t border-line">
        <SectionHead n="02" title="Where I've worked" id="experience" />
        <div className="space-y-7">
          {careerTimeline.map((item, i) => (
            <div key={i} className="grid grid-cols-[auto,1fr] sm:grid-cols-[7rem,auto,1fr] gap-x-4 gap-y-1 items-start">
              <span className="hidden sm:block font-mono text-[11px] text-muted pt-1 tabular-nums">{item.year}</span>
              <OrgLogo logo={item.logo} mark={item.mark} />
              <div className="flex-1">
                <div className="flex items-baseline justify-between gap-3 flex-wrap">
                  <h3 className="font-semibold text-[16px]">{item.role}</h3>
                  <span className="sm:hidden font-mono text-xs text-muted">{item.year}</span>
                </div>
                <a href={item.companyUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blood link-ul">{item.company}</a>
                <p className="text-[14px] text-ink/70 mt-1 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Reading */}
      <section className="py-12 border-t border-line">
        <SectionHead n="03" title="On the shelf" id="reading" />
        <ReadingCarousel />
      </section>

      {/* Toolkit + Writing */}
      <section className="py-12 border-t border-line grid md:grid-cols-2 gap-12">
        <div>
          <SectionHead n="04" title="Toolkit" />
          <div className="flex flex-wrap gap-2">
            {STACK.map((t) => (
              <span key={t} className="font-mono text-[12px] text-ink/75 border border-line px-2.5 py-1">{t}</span>
            ))}
          </div>
        </div>
        <div>
          <SectionHead n="05" title="Writing" />
          <div className="space-y-5">
            {writing.map((w, i) => (
              <a key={i} href={w.href} target="_blank" rel="noopener noreferrer" className="group block">
                <h3 className="font-display text-[16px] leading-snug group-hover:text-blood transition-colors">{w.title}</h3>
                <span className="font-mono text-[11px] text-muted">{w.tag}</span>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>

    {/* Footer — full-bleed, dark, with a colophon */}
    <footer className="mt-8 bg-ink text-paper">
      <div className="max-w-2xl mx-auto px-6 py-16 md:py-20">
        <h2 className="font-display text-4xl md:text-5xl font-semibold leading-[1.02] tracking-tight max-w-xl">
          Building something, or hiring someone who does? <span className="text-clay italic">Say hi.</span>
        </h2>
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
          <a href="mailto:sar367@cornell.edu" className="inline-flex items-center gap-1.5 text-[15px] font-medium text-clay hover:text-paper transition-colors">
            <Mail size={16} /> sar367@cornell.edu
          </a>
          {CONTACTS.map(({ label, href, Icon }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[14px] text-paper/70 hover:text-clay transition-colors">
              <Icon size={15} /> {label}
            </a>
          ))}
        </div>
        <p className="mt-14 pt-6 border-t border-paper/15 font-mono text-[11px] text-paper/45 leading-relaxed">
          Set in EB Garamond. Built by hand with React, not a template.<br />
          Ithaca, NY · © 2026 Asad Rizvi.
        </p>
      </div>
    </footer>
  </div>
);

export default App;
