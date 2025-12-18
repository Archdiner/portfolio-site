import React, { useState, useEffect } from 'react';
import { 
  Github, 
  Linkedin, 
  Mail, 
  ExternalLink, 
  Sun, 
  Moon, 
  Languages,
  ArrowUpRight,
  MoveRight,
  MoveLeft
} from 'lucide-react';
import * as simpleIcons from 'simple-icons';

const App = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [lang, setLang] = useState('en');

  // Translations
  const t = {
    en: {
      nav: { me: 'ME', timeline: 'TIMELINE', works: 'WORKS', stack: 'STACK', contact: 'CONTACT' },
      hero: {
        badge: 'AVAILABLE FOR NEW VENTURES',
        title: 'Bridging Web3 & Generative Intelligence.',
        sub: "I'm a Full Stack Developer specializing in decentralized protocols and autonomous AI applications.",
        cta1: 'View My Work',
        cta2: 'Get In Touch'
      },
      career: { title: 'JOURNEY', subtitle: 'A timeline of my professional evolution.' },
      projects: { title: 'SELECTED WORKS', archive: 'VIEW ARCHIVE' },
      stack: { title: 'TECH CORE' },
      contact: { title: 'LET\'S BUILD THE FUTURE.', sub: 'Currently open to innovative projects in the decentralized space and AI orchestration.' }
    },
    ar: {
      nav: { me: 'أنا', timeline: 'المسار', works: 'الأعمال', stack: 'التقنيات', contact: 'اتصل' },
      hero: {
        badge: 'متاح للمشاريع الجديدة',
        title: 'الربط بين الـ Web3 والذكاء الاصطناعي التوليدي.',
        sub: 'مطور واجهات متكاملة متخصص في البروتوكولات اللامركزية وتطبيقات الذكاء الاصطناعي ذاتية التشغيل.',
        cta1: 'مشاهدة أعمالي',
        cta2: 'تواصل معي'
      },
      career: { title: 'المسار المهني', subtitle: 'جدول زمني لتطوري المهني.' },
      projects: { title: 'أعمال مختارة', archive: 'الأرشيف' },
      stack: { title: 'التقنيات الأساسية' },
      contact: { title: 'لنصنع المستقبل معاً.', sub: 'متاح حالياً للمشاريع المبتكرة في المجال اللامركزي وتنسيق الذكاء الاصطناعي.' }
    }
  };

  const careerTimeline = [
    {
      year: '2023 - 2025',
      role: lang === 'en' ? 'Senior Full Stack & AI Engineer' : 'كبير مهندسي الذكاء الاصطناعي',
      company: 'Nexus AI Solutions',
      desc: lang === 'en' ? 'Leading LLM-integrated dashboards and autonomous agent architectures.' : 'قيادة لوحات التحكم المدمجة بنماذج اللغة الكبيرة وبنيات الوكلاء الذاتيين.'
    },
    {
      year: '2021 - 2023',
      role: lang === 'en' ? 'Web3 Lead Developer' : 'مطور Web3 رئيسي',
      company: 'EtherFlow Protocol',
      desc: lang === 'en' ? 'Architected DeFi lending smart contracts and governance portals.' : 'هندسة العقود الذكية للإقراض اللامركزي وبوابات الحوكمة.'
    }
  ];

  const projects = [
    {
      title: 'CommitMint',
      stack: ['Solana', 'Anchor', 'Next.js', 'FastAPI', 'Supabase'],
      image: '/commitmint-screenshot.png',
      link: 'https://commitmint.com'
    },
    {
      title: 'GraphRAG Dodd-Frank',
      stack: ['Python', 'GraphRAG', 'LangChain', 'Microsoft'],
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=800',
      link: 'https://github.com/Archdiner/GraphRAG-Dodd-Frank'
    },
    {
      title: 'Music Practice Tracker',
      stack: ['React', 'TypeScript', 'Supabase'],
      image: '/notelog-screenshot.png',
      link: 'https://note-log-lac.vercel.app/login'
    },
    {
      title: 'Reel Responder Bot',
      stack: ['Python', 'OpenAI', 'Apify', 'Instagram'],
      image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=800',
      link: 'https://github.com/Archdiner/reel-responder-bot'
    }
  ];

  const techRow1 = ['Python', 'React', 'TypeScript', 'Node.js', 'Supabase', 'PostgreSQL', 'Docker', 'Git'];
  const techRow2 = ['LangChain', 'LangGraph', 'Crew', 'FastAPI', 'Pinecone', 'Solana', 'Anchor', 'Next.js'];

  // Map tech names to simple-icons export names (si + PascalCase)
  const techIconMap = {
    'Python': 'siPython',
    'React': 'siReact',
    'TypeScript': 'siTypescript',
    'Node.js': 'siNodedotjs',
    'Supabase': 'siSupabase',
    'PostgreSQL': 'siPostgresql',
    'Docker': 'siDocker',
    'Git': 'siGit',
    'LangChain': 'siLangchain',
    'LangGraph': 'siLanggraph',
    'Crew': 'siCrewai', // Using CrewAI as closest match
    'FastAPI': 'siFastapi',
    'Pinecone': 'siPinecone',
    'Solana': 'siSolana',
    'Anchor': 'siAnchorprotocol', // Anchor Protocol is the closest match
    'Next.js': 'siNextdotjs',
  };

  // TechIcon component to render the icon
  const TechIcon = ({ techName }) => {
    const iconKey = techIconMap[techName];
    
    if (!iconKey || !simpleIcons[iconKey]) {
      // Fallback to first two letters if icon not found
      return (
        <div className="w-8 h-8 bg-emerald-500/20 rounded flex items-center justify-center font-black text-emerald-500 text-xs">
          {techName.substring(0, 2).toUpperCase()}
        </div>
      );
    }
    
    const icon = simpleIcons[iconKey];
    const svgPath = icon.path;
    const iconColor = `#${icon.hex}`;
    
    return (
      <svg
        role="img"
        viewBox="0 0 24 24"
        className="w-8 h-8"
        fill={iconColor}
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>{icon.title}</title>
        <path d={svgPath} />
      </svg>
    );
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'career', 'projects', 'skills', 'contact'];
      const scrollPos = window.scrollY + 100;
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element && scrollPos >= element.offsetTop && scrollPos < element.offsetTop + element.offsetHeight) {
          setActiveSection(section);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleLang = () => setLang(lang === 'en' ? 'ar' : 'en');
  const content = t[lang];

  return (
    <div 
      className={`${isDarkMode ? 'dark bg-[#050505] text-gray-100' : 'bg-[#fafafa] text-gray-900'} min-h-screen transition-colors duration-300 font-sans`}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes scroll-reverse {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .animate-scroll { animation: scroll 30s linear infinite; }
        .animate-scroll-reverse { animation: scroll-reverse 30s linear infinite; }
      `}</style>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 p-6">
        <div className={`max-w-6xl mx-auto backdrop-blur-md ${isDarkMode ? 'bg-black/40 border-white/5' : 'bg-white/40 border-black/5'} border rounded-2xl px-6 py-4 flex items-center justify-between`}>
          <div className="text-xl font-black tracking-tighter flex items-center gap-2">
            <div className="w-6 h-6 bg-emerald-500 rounded-sm"></div>
            <span>DEV.</span>
          </div>

          <div className="hidden lg:flex items-center space-x-8 rtl:space-x-reverse text-[11px] font-black tracking-[0.2em]">
            {Object.entries(content.nav).map(([key, label]) => (
              <a 
                key={key} 
                href={`#${key === 'me' ? 'home' : key === 'stack' ? 'skills' : key}`}
                className={`transition-colors hover:text-emerald-500 ${activeSection === (key === 'me' ? 'home' : key === 'stack' ? 'skills' : key) ? 'text-emerald-500' : ''}`}
              >
                {label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-lg hover:bg-emerald-500/10 transition-colors">
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button onClick={toggleLang} className="p-2 rounded-lg hover:bg-emerald-500/10 transition-colors flex items-center gap-1 font-bold text-xs">
              <Languages size={18} />
              <span>{lang.toUpperCase()}</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header id="home" className="min-h-screen flex items-center px-6 pt-20 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center w-full">
          {/* Left: Picture Place */}
          <div className="relative group">
            <div className={`absolute -inset-4 bg-emerald-500/20 blur-3xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity`}></div>
            <div className={`aspect-[4/5] w-full max-w-md mx-auto rounded-3xl overflow-hidden border ${isDarkMode ? 'border-white/10 bg-white/5' : 'border-black/5 bg-black/5'} relative transition-all duration-700`}>
               <img src="/portrait.JPG" alt="Portrait" className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Right: Title Thing */}
          <div className="space-y-8 text-center lg:text-start">
            <div className="inline-block px-4 py-1 rounded-full border border-emerald-500/30 text-emerald-500 text-[10px] font-bold tracking-widest uppercase">
              {content.hero.badge}
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[0.95] lg:max-w-xl">
              {content.hero.title}
            </h1>
            <p className={`text-lg max-w-lg mx-auto lg:mx-0 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {content.hero.sub}
            </p>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <a href="#projects" className="px-10 py-5 bg-emerald-500 text-black font-black uppercase text-xs tracking-widest rounded-xl hover:bg-emerald-400 transition-all flex items-center gap-3 group">
                {content.hero.cta1}
                {lang === 'en' ? <MoveRight className="group-hover:translate-x-1 transition-transform" /> : <MoveLeft className="group-hover:-translate-x-1 transition-transform" />}
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Career Timeline */}
      <section id="career" className="py-32 px-6 max-w-5xl mx-auto">
        <div className="mb-20">
          <h2 className="text-4xl font-bold tracking-tighter mb-4">{content.career.title}</h2>
          <p className={`${isDarkMode ? 'text-gray-500' : 'text-gray-400'} font-medium uppercase tracking-widest text-xs`}>{content.career.subtitle}</p>
        </div>

        <div className={`relative border-l-2 ${isDarkMode ? 'border-white/5' : 'border-black/5'} ml-4 space-y-16 rtl:border-l-0 rtl:border-r-2 rtl:mr-4`}>
          {careerTimeline.map((item, idx) => (
            <div key={idx} className="relative pl-12 rtl:pl-0 rtl:pr-12 group">
              <div className="absolute left-[-9px] rtl:left-auto rtl:right-[-9px] top-1.5 w-4 h-4 bg-emerald-500 rounded-full border-4 border-[#050505]" />
              <div className="space-y-4">
                <span className="text-xs font-black text-emerald-500 uppercase tracking-[0.2em]">{item.year}</span>
                <h3 className="text-2xl font-bold">{item.role}</h3>
                <p className="text-gray-500 font-bold">{item.company}</p>
                <p className={`max-w-2xl leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Rotating Tech Ticker */}
      <section id="skills" className="py-32 bg-emerald-500/[0.02] overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 mb-16">
          <h2 className="text-center text-4xl font-bold tracking-tighter">{content.stack.title}</h2>
        </div>

        <div className="space-y-4">
          {/* Row 1 */}
          <div className="flex whitespace-nowrap overflow-hidden">
            <div className="flex gap-4 animate-scroll">
              {[...techRow1, ...techRow1].map((tech, i) => (
                <div key={i} className={`flex items-center gap-4 px-8 py-6 border ${isDarkMode ? 'bg-black border-white/5' : 'bg-white border-black/5'} rounded-2xl`}>
                  <TechIcon techName={tech} />
                  <span className="font-bold text-lg">{tech}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Row 2 */}
          <div className="flex whitespace-nowrap overflow-hidden">
            <div className="flex gap-4 animate-scroll-reverse">
              {[...techRow2, ...techRow2].map((tech, i) => (
                <div key={i} className={`flex items-center gap-4 px-8 py-6 border ${isDarkMode ? 'bg-black border-white/5' : 'bg-white border-black/5'} rounded-2xl`}>
                  <TechIcon techName={tech} />
                  <span className="font-bold text-lg">{tech}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Projects */}
      <section id="projects" className="py-32 px-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-20">
          <h2 className="text-4xl font-bold tracking-tighter">{content.projects.title}</h2>
          <a href="#" className="flex items-center gap-2 text-[10px] font-black tracking-widest uppercase hover:text-emerald-500 transition-colors">
            {content.projects.archive} <ArrowUpRight size={14} />
          </a>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {projects.map((project, idx) => (
            <a 
              key={idx} 
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group cursor-pointer block"
            >
              <div className="aspect-square rounded-3xl overflow-hidden mb-6 relative">
                <img src={project.image} alt={project.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-emerald-500/90 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-center items-center p-8 text-center">
                  <p className="text-black text-xs font-black tracking-widest uppercase mb-4">Stack</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {project.stack.map((s, i) => (
                      <span key={i} className="bg-black text-white text-[10px] font-bold px-3 py-1 rounded-md">{s}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">{project.title}</h3>
                <ArrowUpRight className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-32 px-6">
        <div className={`max-w-4xl mx-auto p-12 md:p-24 rounded-[3rem] text-center overflow-hidden relative ${isDarkMode ? 'bg-white text-black' : 'bg-black text-white'}`}>
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-8 leading-none">{content.contact.title}</h2>
            <p className={`text-lg mb-12 max-w-xl mx-auto ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
              {content.contact.sub}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <a href="mailto:hello@dev.com" className={`px-12 py-6 rounded-2xl font-black uppercase text-xs tracking-widest transition-all hover:scale-105 ${isDarkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
                Email Me
              </a>
              <div className="flex items-center gap-4">
                <a href="#" className="p-4 rounded-xl border border-current opacity-50 hover:opacity-100"><Github /></a>
                <a href="#" className="p-4 rounded-xl border border-current opacity-50 hover:opacity-100"><Linkedin /></a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className={`py-12 border-t ${isDarkMode ? 'border-white/5' : 'border-black/5'} text-center`}>
        <p className="text-[10px] font-black tracking-[0.4em] opacity-40 uppercase">
          {lang === 'en' ? 'Built by Developer 2025' : 'تم التطوير بواسطة المبرمج ٢٠٢٥'}
        </p>
      </footer>
    </div>
  );
};

export default App;