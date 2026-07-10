import { useState, useEffect } from 'react';
import {
  Github,
  Linkedin,
  ExternalLink,
  ArrowUpRight,
  MoveRight,
  Twitter,
  Briefcase,
  Code,
  Sparkles,
  Rocket,
  X,
  MapPin,
  Star,
  BookOpen,
} from 'lucide-react';
import {
  siPython,
  siTypescript,
  siReact,
  siNextdotjs,
  siNodedotjs,
  siFastapi,
  siPostgresql,
  siSupabase,
  siDocker,
  siSolana,
  siLangchain,
  siAnthropic,
} from 'simple-icons';

import projectsData from './data/projects.json';
import repoMeta from './data/repo-meta.json';
import readingData from './data/reading.json';

// --- static content -------------------------------------------------------

const TECH = [
  { name: 'Python', icon: siPython },
  { name: 'TypeScript', icon: siTypescript },
  { name: 'React', icon: siReact },
  { name: 'Next.js', icon: siNextdotjs },
  { name: 'Node.js', icon: siNodedotjs },
  { name: 'FastAPI', icon: siFastapi },
  { name: 'PostgreSQL', icon: siPostgresql },
  { name: 'Supabase', icon: siSupabase },
  { name: 'Docker', icon: siDocker },
  { name: 'Solana', icon: siSolana },
  { name: 'LangChain', icon: siLangchain },
  { name: 'Claude / LLMs', icon: siAnthropic },
];

const careerTimeline = [
  {
    year: 'Jan 2026 - Present',
    role: 'Student Ambassador',
    company: 'Akash Network',
    companyUrl: 'https://akash.network',
    icon: Code,
    tags: ['Decentralized Cloud', 'Community'],
    desc: 'Representing Akash Network on campus — promoting decentralized cloud compute and running educational workshops for developers.',
  },
  {
    year: 'Oct 2025 - Present',
    role: 'Accelerator Subteam Member',
    company: 'Cornell Blockchain',
    companyUrl: 'https://cornellblockchain.org',
    icon: Rocket,
    tags: ['Blockchain', 'Startups'],
    desc: 'Working on blockchain accelerator initiatives and early-stage startup ventures within Cornell Blockchain.',
  },
  {
    year: 'Oct 2025 - Present',
    role: 'Vice President (prev. AI Engineer)',
    company: 'Generative AI at Cornell',
    companyUrl: 'https://cornellgenai.com',
    icon: Sparkles,
    tags: ['LLMs', 'AI Research', 'Leadership'],
    desc: 'Leading AI initiatives with a focus on LLM applications. Started as an AI Engineer before stepping up to VP.',
  },
  {
    year: 'Jun 2024 - Present',
    role: 'Co-Founder',
    company: 'Gulf Intel AI',
    companyUrl: 'https://gulfintelai.com',
    icon: Briefcase,
    tags: ['AI Tools', 'SaaS'],
    desc: 'Affordable, customizable AI tools for small businesses in Bahrain — chatbots, inventory software, review analytics, and Instagram automation.',
  },
  {
    year: 'Jul 2024',
    role: 'LLM Application Developer Intern',
    company: 'RIIG - HOOTL',
    companyUrl: 'https://www.riigtech.com',
    icon: Code,
    tags: ['LLMs', 'FinTech'],
    desc: 'Built an AI system for financial regulatory analysis — an automated pipeline generating high-quality summaries of financial documents and regulations.',
  },
];

const writing = [
  {
    tag: 'Research Paper • Mar 2025',
    title: "Arteta-Ball: Modeling Arsenal's Possession with Markov Chains",
    desc: "A mathematical breakdown of Arsenal's 2024–25 open-play possession sequences using an absorbing Markov chain, with interactive diagrams.",
    href: '/research/arteta_wharton-2.pdf',
  },
  {
    tag: 'Research Paper • 2025',
    title: 'Gradient Integrity: Verifying Honest Computation on Decentralized GPU Networks',
    desc: 'Methods to verify that decentralized GPU providers on the Akash Network perform honest computation — protecting gradient integrity in distributed AI training.',
    href: '/research/gradient-integrity.pdf',
  },
  {
    tag: 'Write-up • Case study',
    title: "Why You Can't Trust the Volume Numbers You See Online",
    desc: 'A hands-on experiment building a blockchain trading-volume generator — and what it reveals about how easily on-chain "activity" metrics can be manufactured.',
    href: 'https://github.com/Archdiner/blockchain_trading_volume_generator',
  },
];

// --- helpers --------------------------------------------------------------

function timeAgo(iso) {
  if (!iso) return null;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;
  const days = Math.floor((Date.now() - then) / 86_400_000);
  if (days <= 1) return 'updated today';
  if (days < 30) return `updated ${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `updated ${months}mo ago`;
  return `updated ${Math.floor(days / 365)}y ago`;
}

// Merge curated project copy with live repo metadata (stars / last-pushed).
const projects = projectsData.map((p) => {
  const meta = p.repo ? repoMeta[p.repo] : null;
  return { ...p, stars: meta?.stars ?? null, updated: timeAgo(meta?.pushedAt) };
});

const reading = readingData.filter((r) => !r.title.startsWith('Replace me'));

/* eslint-disable react/prop-types */
const TechIcon = ({ icon }) => (
  <svg role="img" viewBox="0 0 24 24" className="w-6 h-6" fill={`#${icon.hex}`} xmlns="http://www.w3.org/2000/svg">
    <title>{icon.title}</title>
    <path d={icon.path} />
  </svg>
);

const NAV = [
  { label: 'PROJECTS', target: 'projects' },
  { label: 'WRITING', target: 'writing' },
  ...(reading.length ? [{ label: 'READING', target: 'reading' }] : []),
  { label: 'STACK', target: 'skills' },
  { label: 'EXPERIENCE', target: 'career' },
  { label: 'CONTACT', target: 'contact' },
];

const HERO_SUB =
  "CS student at Cornell, from Bahrain. Right now I'm founding Zybit, voice AI that charts for dentists. Before that: credit scoring, GPU marketplaces, and regulatory RAG.";

const App = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [selectedProject, setSelectedProject] = useState(null);

  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      window.scrollTo({ top: element.offsetTop - 100, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'projects', 'writing', 'reading', 'skills', 'career', 'contact'];
      const scrollPos = window.scrollY + 150;
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el && scrollPos >= el.offsetTop && scrollPos < el.offsetTop + el.offsetHeight) {
          setActiveSection(section);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const addAnimatedUnderlines = (text) => {
    const groups = [
      { words: ['Cornell', 'Bahrain'], cls: 'underline-rose' },
      { words: ['Zybit'], cls: 'underline-amber' },
      { words: ['dentists'], cls: 'underline-orange' },
    ];
    let processed = text;
    let delay = 0;
    for (const { words, cls } of groups) {
      for (const kw of words) {
        const regex = new RegExp(`(${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'g');
        processed = processed.replace(regex, (m) => {
          delay += 0.5;
          return `<span class="animated-underline ${cls}" style="animation-delay:${delay}s">${m}</span>`;
        });
      }
    }
    return processed;
  };

  return (
    <div className="bg-[#fafafa] text-gray-900 min-h-screen font-sans">
      <style>{`
        @keyframes underline { 0% { background-size: 0% 2px; } 100% { background-size: 100% 2px; } }
        .animated-underline {
          background-repeat: no-repeat; background-position: left bottom;
          background-size: 0% 2px; animation: underline 1s ease-out forwards; padding-bottom: 2px;
        }
        .underline-rose   { background-image: linear-gradient(to right, rgba(251,113,133,0.8), rgba(251,113,133,0.8)); }
        .underline-amber  { background-image: linear-gradient(to right, rgba(245,158,11,0.8), rgba(245,158,11,0.8)); }
        .underline-orange { background-image: linear-gradient(to right, rgba(234,88,12,0.8), rgba(234,88,12,0.8)); }
      `}</style>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 p-6">
        <div className="max-w-6xl mx-auto backdrop-blur-md bg-white/40 border border-black/5 rounded-2xl px-6 py-4 flex items-center justify-between">
          <div className="text-xl font-black tracking-tighter">Hi, I&apos;m Asad.</div>
          <div className="hidden lg:flex items-center space-x-8 text-[11px] font-black tracking-[0.2em]">
            {NAV.map(({ label, target }) => (
              <a
                key={target}
                href={`#${target}`}
                onClick={(e) => handleNavClick(e, target)}
                className={`transition-colors hover:text-orange-500 ${activeSection === target ? 'text-orange-500' : ''}`}
              >
                {label}
              </a>
            ))}
            <a
              href="/Rizvi_Asad_Resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-orange-500"
            >
              RESUME
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header id="home" className="min-h-[85vh] flex items-center px-6 pt-32 pb-16 max-w-7xl mx-auto relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center w-full relative z-10">
          <div className="relative">
            <div className="aspect-[4/5] w-full max-w-md mx-auto rounded-3xl overflow-hidden border border-black/5 bg-black/5">
              <img src="/portrait.JPG" alt="Portrait of Asad Rizvi" className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="space-y-6 text-center lg:text-start">
            <div className="inline-block px-4 py-1.5 rounded-full border border-orange-500/30 text-orange-600 bg-orange-500/5 text-[10px] font-bold tracking-widest uppercase">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                OPEN TO SUMMER 2027
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[0.95] lg:max-w-xl">
              I build AI for health, finance, and compute.
            </h1>
            <p
              className="text-lg max-w-lg mx-auto lg:mx-0 text-gray-600"
              dangerouslySetInnerHTML={{ __html: addAnimatedUnderlines(HERO_SUB) }}
            />
            <div className="flex items-center gap-2 justify-center lg:justify-start text-sm text-gray-500">
              <MapPin size={16} className="text-orange-500" />
              <span>Ithaca, NY</span>
            </div>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4">
              <a
                href="#projects"
                onClick={(e) => handleNavClick(e, 'projects')}
                className="px-10 py-5 font-black uppercase text-xs tracking-widest rounded-xl transition-all flex items-center gap-3 group bg-orange-500 text-black hover:bg-orange-400"
              >
                View my work
                <MoveRight className="group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="#writing"
                onClick={(e) => handleNavClick(e, 'writing')}
                className="px-10 py-5 font-black uppercase text-xs tracking-widest rounded-xl transition-all flex items-center gap-3 group border border-black/20 text-black hover:border-orange-500 hover:text-orange-500"
              >
                Read my writing
                <div className="group-hover:translate-y-1 transition-transform">↓</div>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Projects */}
      <section id="projects" className="py-20 px-6 max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold tracking-tighter mb-12">FEATURED PROJECTS</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {projects.map((project, idx) => (
            <div key={idx} onClick={() => setSelectedProject(project)} className="group cursor-pointer block">
              <div
                className={`aspect-square rounded-3xl overflow-hidden mb-6 relative hover:scale-[1.02] transition-transform duration-500 ${project.hackathonWinner ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-transparent' : ''}`}
              >
                {project.image ? (
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-black/5">
                    <Code size={48} className="mb-4 text-black/20" />
                    <span className="font-bold tracking-widest uppercase text-xs text-black/30">{project.title}</span>
                  </div>
                )}
                {project.hackathonWinner && (
                  <div className="absolute top-3 left-3 z-10 bg-yellow-400 text-black text-[10px] font-black px-2.5 py-1 rounded-full tracking-wide shadow-lg">
                    {project.hackathonWinner}
                  </div>
                )}
                <div className="absolute inset-0 bg-orange-500/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center p-8 text-center">
                  <p className="text-black text-xs font-black tracking-widest uppercase mb-4">Stack</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {project.stack.map((s, i) => (
                      <span key={i} className="bg-black text-white text-[10px] font-bold px-3 py-1 rounded-md">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">{project.title}</h3>
                <ArrowUpRight className="text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              {project.tag && <p className="mt-1.5 text-xs font-bold tracking-wide text-orange-500">{project.tag}</p>}
              {(project.stars != null || project.updated) && (
                <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500 font-medium">
                  {project.stars != null && (
                    <span className="inline-flex items-center gap-1">
                      <Star size={12} className="text-orange-500" />
                      {project.stars}
                    </span>
                  )}
                  {project.updated && <span>{project.updated}</span>}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Modal */}
        {selectedProject && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedProject(null)}
          >
            <div
              className="max-w-6xl w-full max-h-[90vh] overflow-auto rounded-3xl bg-white border border-black/10 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 z-10 flex justify-between items-center p-6 border-b border-black/10 bg-white">
                <div className="flex items-center gap-4 flex-wrap">
                  <h2 className="text-3xl font-bold">{selectedProject.title}</h2>
                  {selectedProject.tag && (
                    <span className="text-xs font-black tracking-widest text-orange-500 uppercase">{selectedProject.tag}</span>
                  )}
                  {selectedProject.hackathonWinner && (
                    <span className="bg-yellow-400 text-black text-[10px] font-black px-3 py-1.5 rounded-full tracking-wide">
                      {selectedProject.hackathonWinner}
                    </span>
                  )}
                  {selectedProject.stars != null && (
                    <span className="inline-flex items-center gap-1 text-sm text-gray-500 font-semibold">
                      <Star size={14} className="text-orange-500" />
                      {selectedProject.stars}
                      {selectedProject.updated && <span className="ml-2 font-normal">· {selectedProject.updated}</span>}
                    </span>
                  )}
                </div>
                <button onClick={() => setSelectedProject(null)} className="p-2 rounded-lg hover:bg-orange-500/10 transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-8 p-8">
                <div className="space-y-4">
                  {selectedProject.image && (
                    <div className="rounded-2xl overflow-hidden border border-black/10">
                      <img src={selectedProject.image} alt={`${selectedProject.title} screenshot`} className="w-full h-auto object-contain" />
                    </div>
                  )}
                  <div className="flex flex-col gap-3">
                    {selectedProject.projectLink && (
                      <a
                        href={selectedProject.projectLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 text-black font-bold rounded-xl hover:bg-orange-400 transition-colors"
                      >
                        View Project <ExternalLink size={18} />
                      </a>
                    )}
                    {selectedProject.xLink && (
                      <a
                        href={selectedProject.xLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-colors bg-black/10 text-black border border-black/20 hover:bg-black/20"
                      >
                        <Twitter size={18} /> X
                      </a>
                    )}
                    {selectedProject.githubLink && (
                      <a
                        href={selectedProject.githubLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-colors bg-black/10 hover:bg-black/20 border border-black/20"
                      >
                        <Github size={18} /> View on GitHub
                      </a>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold uppercase tracking-wider mb-4">About</h3>
                    <p className="leading-relaxed text-gray-700">{selectedProject.blurb}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold uppercase tracking-wider mb-4">Tech Stack</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.stack.map((tech, i) => (
                        <span key={i} className="px-4 py-2 rounded-lg font-bold text-sm bg-orange-500/10 text-orange-600 border border-orange-500/20">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Writing */}
      <section id="writing" className="py-20 px-6 max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold tracking-tighter mb-12">WRITING &amp; RESEARCH</h2>
        <div className="space-y-4">
          {writing.map((w, i) => (
            <a
              key={i}
              href={w.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group block p-8 md:p-12 rounded-3xl border bg-white border-black/5 hover:border-orange-500 shadow-sm transition-colors"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <p className="text-[10px] font-black tracking-widest text-orange-500 uppercase mb-2">{w.tag}</p>
                  <h3 className="text-2xl font-bold mb-2 group-hover:text-orange-500 transition-colors">{w.title}</h3>
                  <p className="max-w-2xl text-gray-600">{w.desc}</p>
                </div>
                <div className="p-4 rounded-full bg-black/5 group-hover:bg-orange-500 group-hover:text-white text-black transition-colors flex-shrink-0">
                  <ArrowUpRight size={24} />
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Reading (only renders once you fill reading.json) */}
      {reading.length > 0 && (
        <section id="reading" className="py-20 px-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="text-orange-500" />
            <h2 className="text-4xl font-bold tracking-tighter">ON MY SHELF</h2>
          </div>
          <p className="text-gray-500 mb-12">A few all-time favorites.</p>
          <div className="flex flex-wrap justify-center sm:justify-start gap-x-10 gap-y-12">
            {reading.map((r, i) => (
              <div key={i} className="group w-36 sm:w-44">
                <div className="aspect-[2/3] rounded-lg overflow-hidden bg-black/5 ring-1 ring-black/10 shadow-md shadow-black/20 transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-xl group-hover:shadow-black/30">
                  {r.cover ? (
                    <img src={r.cover} alt={`${r.title} cover`} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center p-4 text-center">
                      <span className="font-bold text-sm text-black/40">{r.title}</span>
                    </div>
                  )}
                </div>
                <h3 className="mt-4 text-base font-bold leading-snug">{r.title}</h3>
                {r.author && <p className="text-sm text-gray-500">{r.author}</p>}
                {r.note && <p className="text-gray-600 text-sm mt-2 leading-relaxed">{r.note}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Stack */}
      <section id="skills" className="py-20 bg-orange-500/[0.02]">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-center text-4xl font-bold tracking-tighter mb-12">CORE STACK</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {TECH.map(({ name, icon }) => (
              <div key={name} className="flex items-center gap-3 px-6 py-3.5 border bg-white border-black/5 rounded-lg">
                <TechIcon icon={icon} />
                <span className="font-bold text-base">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Experience */}
      <section id="career" className="py-20 px-6 max-w-5xl mx-auto relative">
        <div className="mb-12">
          <h2 className="text-4xl font-bold tracking-tighter mb-3">EXPERIENCE</h2>
          <p className="text-gray-400 font-medium uppercase tracking-widest text-xs">Where I&apos;ve built, learned, and grown.</p>
        </div>
        <div className="relative border-l-2 border-orange-500/10 ml-6 space-y-8">
          {careerTimeline.map((item, idx) => (
            <div key={idx} className="relative pl-12 group cursor-default">
              <div className="absolute left-[-13px] top-2 w-6 h-6 rounded-full bg-orange-500 border-4 border-[#fafafa] transition-all duration-300 group-hover:bg-orange-400" />
              <div className="rounded-2xl p-6 transition-colors duration-300 bg-black/5 hover:bg-black/10 border border-black/5">
                <div className="space-y-3">
                  <span className="text-xs font-black text-orange-500 uppercase tracking-[0.2em]">{item.year}</span>
                  <h3 className="text-xl font-bold">{item.role}</h3>
                  {item.companyUrl ? (
                    <a
                      href={item.companyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 font-bold underline-offset-4 hover:underline hover:text-orange-500 transition-colors inline-block"
                    >
                      {item.company} <ArrowUpRight className="inline w-3 h-3 ml-1" />
                    </a>
                  ) : (
                    <p className="text-gray-500 font-bold">{item.company}</p>
                  )}
                  {item.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {item.tags.map((tag, i) => (
                        <span key={i} className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-orange-500/10 text-orange-600 border border-orange-500/20">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="max-w-2xl leading-relaxed pt-1 text-gray-600">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20 px-6">
        <div className="max-w-4xl mx-auto p-12 md:p-24 rounded-[3rem] text-center overflow-hidden relative bg-black text-white">
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-8 leading-none">Let&apos;s make something real.</h2>
            <p className="text-lg mb-12 max-w-xl mx-auto text-gray-400">Open to internships, research, builds, and conversations that matter.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <a href="mailto:sar367@cornell.edu" className="px-12 py-6 rounded-2xl font-black uppercase text-xs tracking-widest transition-all hover:scale-105 bg-white text-black">
                Email Me
              </a>
              <div className="flex items-center gap-4">
                <a href="https://github.com/Archdiner" target="_blank" rel="noopener noreferrer" className="p-4 rounded-xl border border-current opacity-50 hover:opacity-100">
                  <Github />
                </a>
                <a href="https://www.linkedin.com/in/asad-rizvi-02a1782a2/" target="_blank" rel="noopener noreferrer" className="p-4 rounded-xl border border-current opacity-50 hover:opacity-100">
                  <Linkedin />
                </a>
                <a href="https://x.com/carne_asado" target="_blank" rel="noopener noreferrer" className="p-4 rounded-xl border border-current opacity-50 hover:opacity-100">
                  <Twitter />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default App;
