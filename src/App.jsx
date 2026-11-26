import { useState, useEffect } from 'react';
import { Mail, ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import projectsData from './data/projects.json';
import repoMeta from './data/repo-meta.json';

// --- content --------------------------------------------------------------

const careerTimeline = [
  { year: 'Since 2026', role: 'Founder & CTO', company: 'Zybit', logo: '/logos/zybit.png', mark: 'Z', companyUrl: 'https://getzybit.com', desc: <>Voice AI for dentists, live in 3 clinics. Part of <a href="https://www.elabstartup.com/2027-companies/" target="_blank" rel="noopener noreferrer" className="text-blood link-ul">eLab</a>, Cornell&apos;s startup accelerator.</> },
  { year: 'Since 2025', role: 'Vice President', company: 'Generative AI at Cornell', logo: '/logos/genai.ico', mark: 'GA', companyUrl: 'https://cornellgenai.dev', desc: 'Leading LLM projects.' },
  { year: 'Since 2025', role: 'Engineering Subteam', company: 'Cornell Blockchain', logo: '/logos/cornellblockchain.png', mark: 'CB', companyUrl: 'https://cornellblockchain.org', desc: 'Building on-chain projects.' },
  { year: '2024', role: 'LLM Application Developer Intern', company: 'RIIG / HOOTL', logo: '/logos/riig.png', mark: 'R', companyUrl: 'https://www.riigtech.com', desc: 'Built AI for financial regulation.' },
];

const awards = [
  { title: 'CERN Beamline for Schools', note: 'Team Aurora, shortlisted: top 49 of 461 (78 countries)', year: '2024', href: 'https://beamlineforschools.cern/wp-content/uploads/2025/12/BL4S_all-winners_2024_final-1.pdf' },
  { title: 'Global Solana Student Hackathon', note: '3rd place, with CommitMint' },
  { title: 'British Online Physics Olympiad', note: 'Gold award' },
  { title: 'Perse Coding Challenge', note: 'Finalist' },
  { title: 'Bebras Challenge', note: 'High Distinction, twice' },
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

/* eslint-disable react/prop-types */
const CONTACTS = [
  { label: 'GitHub', href: 'https://github.com/Archdiner' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/asad-rizvi-02a1782a2/' },
  // { label: 'Résumé', href: '/Rizvi_Asad_Resume.pdf' }, // hidden for now
  { label: 'X', href: 'https://x.com/carne_asado' },
];

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

const SectionHead = ({ title, id }) => (
  <h2 id={id} className="mb-8 font-display text-2xl md:text-[28px] font-semibold tracking-tight">{title}</h2>
);

// external text link with a small rising arrow
const NavLink = ({ href, children }) => (
  <a href={href} target="_blank" rel="noopener noreferrer"
    className="group inline-flex items-center gap-1 text-[14px] text-ink/80 hover:text-blood transition-colors">
    <span className="link-ul">{children}</span>
    <ArrowUpRight size={13} className="text-muted group-hover:text-blood transition-colors" />
  </a>
);

const statusFor = (p) => (p.status || (p.projectLink ? 'Live' : 'Source'));

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

const ProjectCard = ({ p }) => {
  const href = p.projectLink || p.githubLink;
  const Wrap = href ? 'a' : 'div';
  return (
    <Wrap
      {...(href ? { href, target: '_blank', rel: 'noopener noreferrer' } : {})}
      className="group block"
    >
      {p.image && (
        <div className="aspect-[16/10] overflow-hidden bg-faint border border-line">
          <img src={p.image} alt={p.title} style={p.imagePos ? { objectPosition: p.imagePos } : undefined} className="w-full h-full object-cover object-top group-hover:scale-[1.03] transition-transform duration-500" />
        </div>
      )}
      <div className={`${p.image ? 'mt-3' : ''} flex items-baseline justify-between gap-2`}>
        <h3 className="font-display font-semibold text-lg leading-tight group-hover:text-blood transition-colors">{p.title}</h3>
        <span className="font-mono text-[11px] text-muted shrink-0">{statusFor(p)}</span>
      </div>
      <p className="mt-1.5 text-[14px] leading-snug text-ink/75">{p.blurb}</p>
    </Wrap>
  );
};

// --- page -----------------------------------------------------------------

const App = () => (
  <div className="bg-paper text-ink min-h-screen">

    <div className="max-w-2xl mx-auto px-6 pb-16">

      {/* Hero */}
      <section className="pt-14 md:pt-16 pb-12">
        <div className="flex items-center gap-5">
          <img src="/portrait-2026.jpg" alt="Asad Rizvi" className="w-32 h-32 md:w-40 md:h-40 rounded-xl object-cover shrink-0 border border-line" />
          <div>
            <h1 className="font-display text-4xl md:text-5xl font-semibold leading-[0.95] tracking-tight">Asad Rizvi</h1>
            <p className="mt-2 font-display text-xl md:text-[22px] text-ink/85 leading-snug">
              CS at Cornell, from Bahrain. Founder of{' '}
              <a href="https://getzybit.com" target="_blank" rel="noopener noreferrer" className="text-blood link-ul">Zybit</a>.
            </p>
          </div>
        </div>
        <p className="mt-7 text-[17px] leading-relaxed text-ink/80">
          I like making things people actually use every day, that take out friction and make
          everyday experiences a little more human.
        </p>
        <p className="mt-4 text-[17px] leading-relaxed text-ink/70">
          I also played bass in jazz band, do some boxing, and peaked at top&nbsp;50 in competitive Pok&eacute;mon VGC.
        </p>
        <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
          <a href="mailto:sar367@cornell.edu" className="group inline-flex items-center gap-1.5 text-[15px] font-medium text-blood">
            <Mail size={15} /> <span className="link-ul">sar367@cornell.edu</span>
          </a>
          <a href="/writing/" className="inline-flex items-center gap-1 text-[14px] text-ink/80 hover:text-blood transition-colors">
            <span className="link-ul">Writing</span>
          </a>
          {CONTACTS.map(({ label, href }) => (
            <NavLink key={label} href={href}>{label}</NavLink>
          ))}
        </div>
      </section>

      {/* Home */}
      <figure className="pb-12">
        <img src="/jarada.jpg" alt="A boat at sunset off Jarada Island, Bahrain" loading="lazy"
          className="w-full aspect-[4/3] sm:aspect-[16/10] object-cover object-[center_45%] border border-line" />
        <figcaption className="mt-2.5 flex items-baseline justify-between gap-4 font-mono text-[11px] text-muted">
          <span>Jarada Island, Bahrain</span>
          <span>home</span>
        </figcaption>
      </figure>

      {/* Work */}
      <section className="py-10">
        <SectionHead title="Selected work" id="work" />
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-9 sm:gap-y-10">
          {projects.map((p, i) => <ProjectCard key={i} p={p} />)}
        </div>
      </section>

      {/* Experience */}
      <section className="py-10">
        <SectionHead title="Where I've worked" id="experience" />
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

      {/* Awards */}
      <section className="py-10">
        <SectionHead title="Awards" id="awards" />
        <ul className="space-y-4">
          {awards.map((a) => {
            const Title = a.href ? 'a' : 'span';
            return (
              <li key={a.title} className="grid grid-cols-[1fr,auto] gap-x-4 items-baseline">
                <div>
                  <Title {...(a.href ? { href: a.href, target: '_blank', rel: 'noopener noreferrer' } : {})}
                    className={`font-semibold text-[16px] ${a.href ? 'link-ul hover:text-blood transition-colors' : ''}`}>{a.title}</Title>
                  <p className="text-[14px] text-ink/70 mt-0.5 leading-relaxed">{a.note}</p>
                </div>
                <span className="font-mono text-[11px] text-muted tabular-nums">{a.year}</span>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Reading */}
      <section className="py-10">
        <SectionHead title="On the shelf" id="reading" />
        <ReadingCarousel />
      </section>
    </div>

  </div>
);

export default App;
