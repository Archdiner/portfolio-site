import { useState, useEffect } from 'react';
import {
  Github,
  Linkedin,
  ExternalLink,
  Sun,
  Moon,
  Languages,
  ArrowUpRight,
  MoveRight,
  MoveLeft,
  Twitter,
  Briefcase,
  Code,
  Sparkles,
  Rocket,
  X,
  MapPin
} from 'lucide-react';
import * as simpleIcons from 'simple-icons';

const App = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [lang, setLang] = useState('en');
  const [selectedProject, setSelectedProject] = useState(null);

  // Translations
  const t = {
    en: {
      nav: { me: 'ME', works: 'PROJECTS', writing: 'WRITING', stack: 'STACK', timeline: 'EXPERIENCE', contact: 'CONTACT', resume: 'RESUME' },
      hero: {
        badge: 'OPEN TO SUMMER 2026',
        title: 'I build things that shouldn\'t exist yet.',
        sub: "CS freshman at Cornell. Originally from Bahrain. I care about where AI meets human life — language, nature, the physical world. Blockchain believer. Trees are great.",
        cta1: 'View my work',
        cta2: 'Read my writing'
      },
      career: { title: 'EXPERIENCE', subtitle: 'Where I\'ve built, learned, and grown.' },
      projects: { title: 'FEATURED PROJECTS', archive: 'VIEW ARCHIVE' },
      stack: { title: 'TECH CORE' },
      contact: { title: 'Let\'s make something real.', sub: 'Open to research, builds, and conversations that matter.' }
    },
    ar: {
      nav: { me: 'أنا', works: 'المشاريع', writing: 'كتابات', stack: 'التقنيات', timeline: 'الخبرة', contact: 'اتصل', resume: 'السيرة' },
      hero: {
        badge: 'متاح لصيف 2026',
        title: 'أبني أشياء لا ينبغي أن تكون موجودة بعد.',
        sub: 'طالب سنة أولى علوم حاسوب في كورنيل. أصلي من البحرين. أهتم بتقاطع الذكاء الاصطناعي مع حياة الإنسان — اللغة، الطبيعة، العالم المادي. مؤمن بالبلوك تشين. الأشجار رائعة.',
        cta1: 'شاهد أعمالي',
        cta2: 'اقرأ كتاباتي'
      },
      career: { title: 'الخبرة', subtitle: 'حيث بنيت وتعلمت ونمت.' },
      projects: { title: 'مشاريع مميزة', archive: 'الأرشيف' },
      stack: { title: 'التقنيات الأساسية' },
      contact: { title: 'لنصنع شيئًا ملموسًا.', sub: 'متاح للأبحاث والمشاريع البناءة والمحادثات الهامة.' }
    }
  };

  const careerTimeline = [
    {
      year: 'Jan 2026 - Present',
      role: lang === 'en' ? 'Student Ambassador' : 'سفير طلابي',
      company: 'Akash Network',
      companyUrl: 'https://akash.network',
      icon: Code,
      tags: ['Decentralized Cloud', 'Community'],
      desc:
        lang === 'en'
          ? 'Representing Akash Network on campus, promoting decentralized cloud compute solutions and organizing educational workshops for developers.'
          : 'تمثيل شبكة أكاش في الحرم الجامعي، وتعزيز حلول الحوسبة السحابية اللامركزية وتنظيم ورش عمل تعليمية للمطورين.',
    },
    {
      year: 'Oct 2025 - Present',
      role: lang === 'en' ? 'Accelerator Subteam Member' : 'عضو فريق التسريع',
      company: 'Cornell Blockchain',
      companyUrl: 'https://cornellblockchain.org',
      icon: Rocket,
      tags: ['Blockchain', 'Startups'],
      desc:
        lang === 'en'
          ? 'Full-time member working on blockchain accelerator initiatives and startup ventures.'
          : 'عضو بدوام كامل يعمل على مبادرات مسرع البلوك تشين والمشاريع الناشئة.',
    },
    {
      year: 'Oct 2025 - Present',
      role: lang === 'en' ? 'Vice President (prev. AI Engineer)' : 'نائب الرئيس (سابقاً مهندس ذكاء اصطناعي)',
      company: 'Generative AI at Cornell',
      companyUrl: 'https://cornellgenai.com',
      icon: Sparkles,
      tags: ['LLMs', 'AI Research', 'Leadership'],
      desc:
        lang === 'en'
          ? 'Leading AI initiatives and building solutions with focus on Large Language Models (LLM) and artificial intelligence applications. Previously started as an AI Engineer before stepping up as VP.'
          : 'قيادة مبادرات الذكاء الاصطناعي وبناء حلول مع التركيز على نماذج اللغة الكبيرة وتطبيقات الذكاء الاصطناعي. بدأت سابقاً كمهندس ذكاء اصطناعي قبل أن أصبح نائب الرئيس.',
    },
    {
      year: 'Jun 2024 - Present',
      role: lang === 'en' ? 'Co-Founder' : 'الشريك المؤسس',
      company: 'Gulf Intel AI',
      companyUrl: 'https://gulfintelai.com',
      icon: Briefcase,
      tags: ['AI Tools', 'SaaS'],
      desc:
        lang === 'en'
          ? 'Providing affordable and customizable AI-powered tools for small businesses in Bahrain. Products include chatbots, inventory management software, review analytics, and Instagram automation tools.'
          : 'تقديم أدوات ذكاء اصطناعي ميسورة التكلفة وقابلة للتخصيص للشركات الصغيرة في البحرين. تشمل المنتجات روبوتات المحادثة وبرمجيات إدارة المخزون وتحليلات المراجعات.',
    },
    {
      year: 'Jul 2024',
      role: lang === 'en' ? 'LLM Application Developer Intern' : 'متدرب مطور تطبيقات نماذج اللغة',
      company: 'RIIG - HOOTL',
      companyUrl: 'https://www.riigtech.com',
      icon: Code,
      tags: ['LLMs', 'FinTech'],
      desc:
        lang === 'en'
          ? 'Developed an AI system for financial regulatory analysis. Designed and implemented an automated system to generate high-quality summaries of financial documents and regulations.'
          : 'طور نظام ذكاء اصطناعي لتحليل اللوائح المالية. صمم ونفذ نظامًا آليًا لإنشاء ملخصات عالية الجودة للوثائق واللوائح المالية.',
    },
  ];

  const projects = [
    {
      title: 'Kite Credit',
      stack: ['Next.js', 'React', 'Solana', 'Reclaim ZK', 'Gemini 2.0'],
      image: '/kitecredit-screenshot.png',
      githubLink: 'https://github.com/Archdiner/kite-credit',
      projectLink: 'https://kitecredit.xyz',
      xLink: 'https://x.com/kitecredit',
      screenshots: ['/kitecredit-screenshot.png'],
      description: lang === 'en'
        ? 'A persistent, cross-border credit score that aggregates off-chain and on-chain identity data. Generates a dynamic credit score using Solana blockchain activity, GitHub developer history, and Zero-Knowledge (ZK) verified bank statements via Reclaim Protocol. Features natural language AI explanations powered by Gemini 2.0 Flash.'
        : 'درجة ائتمانية دائمة عابرة للحدود تجمع بين بيانات الهوية داخل وخارج السلسلة. تنشئ درجة ائتمانية ديناميكية باستخدام نشاط بلوك تشين سولانا، وسجل مطور غيت هاب، وكشوفات بنكية تم التحقق منها بتقنية المعرفة الصفرية (ZK). تتميز بتفسيرات ذكاء اصطناعي باللغة الطبيعية.'
    },
    {
      title: 'Forge Dashboard',
      stack: ['React', 'TypeScript', 'FastAPI', 'Gemini 2.0 Flash'],
      githubLink: 'https://github.com/Archdiner/forge-dashboard',
      description: lang === 'en'
        ? 'An autonomous A/B testing and optimization platform for growth teams. Runs thousands of experiments overnight using a multi-agent AI system. Features a React/TypeScript frontend, a FastAPI backend, and utilizes Google Gemini 2.0 Flash for generating and evaluating landing page, ad copy, and cold email variations.'
        : 'منصة مستقلة لاختبارات A/B والتحسين لفرق النمو. تجري آلاف التجارب ليلاً باستخدام نظام ذكاء اصطناعي متعدد الوكلاء. تتميز بواجهة React/TypeScript وخلفية FastAPI وتستخدم Gemini 2.0 Flash لإنشاء وتقييم وتحديد أفضل خيارات صفحات الهبوط والإعلانات.'
    },
    {
      title: 'Jest',
      stack: ['Python', 'MediaPipe', 'OpenCV', 'Google Gemini'],
      githubLink: 'https://github.com/Archdiner/gest',
      description: lang === 'en'
        ? 'A multimodal AI system that enables ergonomic hand gesture control and voice interaction, replacing traditional mouse and keyboard inputs. Built with MediaPipe for 60fps zero-lag hand tracking and the Gemini 3 Multimodal Live API for screen awareness and voice reasoning.'
        : 'نظام ذكاء اصطناعي متعدد الوسائط يتيح التحكم المريح بإيماءات اليد والتفاعل الصوتي، ليحل محل الماوس ولوحة المفاتيح. مبني باستخدام MediaPipe لتتبع اليد بدون تأخير وواجهة برمجة تطبيقات Gemini 3 للوعي بالشاشة والاستنتاج الصوتي.'
    },
    {
      title: 'ComputeSwarm',
      stack: ['React', 'TypeScript', 'FastAPI', 'Python', 'Supabase', 'Docker', 'x402', 'Web3.py', 'PyTorch'],
      image: '/compute-swarm-screenshot.png',
      githubLink: 'https://github.com/Archdiner/compute-swarm',
      screenshots: ['/compute-swarm-screenshot.png'],
      description: lang === 'en'
        ? 'A decentralized GPU compute marketplace that connects idle GPUs with compute demand through trustless micropayments. Built with React and TypeScript for the frontend, FastAPI for the backend, and x402 SDK for USDC payments on Base. Features include Docker sandboxing for secure execution, multi-GPU support, job templates for PyTorch and HuggingFace, and real-time earnings tracking. Enables affordable AI compute access at 75-90% cost reduction compared to cloud providers by utilizing idle GPU capacity globally.'
        : 'سوق GPU لامركزي للحوسبة يربط وحدات معالجة الرسومات الخاملة مع الطلب على الحوسبة من خلال المدفوعات الصغيرة الموثوقة. مبني بـ React وTypeScript للواجهة الأمامية وFastAPI للخلفية وx402 SDK للمدفوعات بـ USDC على Base. يتضمن عزل Docker للتنفيذ الآمن ودعم متعدد GPU وقوالب وظائف لـ PyTorch وHuggingFace وتتبع الأرباح في الوقت الفعلي.'
    },
    {
      title: 'CommitMint',
      stack: ['Solana', 'Anchor', 'Next.js', 'FastAPI', 'Supabase'],
      image: '/commitmint-screenshot.png',
      githubLink: 'https://github.com/Archdiner/commitment-parties',
      projectLink: 'https://commitmint.app',
      screenshots: ['/commitmint-screenshot.png'],
      description: lang === 'en'
        ? '🏆 3rd Place Global Solana Student Hackathon winner. A Solana-based commitment pool platform that helps users maintain accountability and build positive habits. Built with Anchor for smart contracts, Next.js for the frontend, and FastAPI for backend services. Users can create commitment pools, stake tokens, and track their progress toward goals with blockchain-based verification.'
        : 'منصة تجمع الالتزامات القائمة على Solana تساعد المستخدمين على الحفاظ على المساءلة وبناء عادات إيجابية. تم بناؤها باستخدام Anchor للعقود الذكية وNext.js للواجهة الأمامية وFastAPI لخدمات الخلفية.'
    },
    {
      title: 'GraphRAG Dodd-Frank',
      stack: ['Python', 'GraphRAG', 'LangChain', 'Microsoft'],
      image: '/graphrag_ss.png',
      githubLink: 'https://github.com/Archdiner/GraphRAG-Dodd-Frank',
      screenshots: ['/graphrag_ss.png'],
      description: lang === 'en'
        ? 'A research project implementing Microsoft\'s GraphRAG technique to analyze and summarize the Dodd-Frank financial regulations. Used graph-based retrieval augmented generation to create structured knowledge graphs from complex regulatory documents, enabling efficient querying and summarization of financial regulations using LangChain and advanced LLM orchestration.'
        : 'مشروع بحثي يطبق تقنية GraphRAG من Microsoft لتحليل وتلخيص لوائح Dodd-Frank المالية. استخدم الجيل المعزز بالاسترجاع القائم على الرسوم البيانية لإنشاء رسوم بيانية معرفية منظمة من الوثائق التنظيمية المعقدة.'
    },
    {
      title: 'Music Practice Tracker',
      stack: ['React', 'TypeScript', 'Supabase', 'OpenAI'],
      image: '/notelog-screenshot.png',
      githubLink: 'https://github.com/Archdiner/music-practice-tracker',
      projectLink: 'https://note-log-lac.vercel.app/login',
      screenshots: ['/notelog-screenshot.png'],
      description: lang === 'en'
        ? 'A web application for musicians to track their practice sessions and monitor progress. Built with React and TypeScript for a type-safe frontend, and Supabase for real-time data synchronization. Features include practice session logging, progress analytics, and goal setting to help musicians stay organized and motivated.'
        : 'تطبيق ويب للموسيقيين لتتبع جلسات التدريب ومراقبة التقدم. مبني بـ React وTypeScript للواجهة الأمامية الآمنة بالنوع وSupabase لمزامنة البيانات في الوقت الفعلي.'
    },
    {
      title: 'Reel Responder Bot',
      stack: ['Python', 'OpenAI', 'Apify', 'Instagram'],
      image: '/doomscroll_ss.jpeg',
      githubLink: 'https://github.com/Archdiner/reel-responder-bot',
      screenshots: ['/doomscroll_ss.jpeg'],
      description: lang === 'en'
        ? 'An AI-powered Instagram bot that automatically responds to reel messages from friends. Uses Apify to scrape comments from Instagram reels, then leverages OpenAI\'s GPT-4o-mini to generate contextual, humorous responses based on the reel\'s content. Includes duplicate detection to prevent repeated responses and continuous monitoring with configurable polling intervals.'
        : 'بوت إنستغرام مدعوم بالذكاء الاصطناعي يرد تلقائياً على رسائل الريل من الأصدقاء. يستخدم Apify لجمع التعليقات من ريلز إنستغرام ثم يستفيد من GPT-4o-mini من OpenAI لإنشاء ردود سياقية ومرحة بناءً على محتوى الريل.'
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
  /* eslint-disable react/prop-types */
  const TechIcon = ({ techName }) => {
    const iconKey = techIconMap[techName];

    if (!iconKey || !simpleIcons[iconKey]) {
      // Fallback to first two letters if icon not found
      return (
        <div className="w-7 h-7 bg-orange-500/20 rounded flex items-center justify-center font-black text-orange-500 text-base">
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
        className="w-7 h-7"
        fill={iconColor}
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>{icon.title}</title>
        <path d={svgPath} />
      </svg>
    );
  };

  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      const navHeight = 100;
      const elementPosition = element.offsetTop - navHeight;
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'projects', 'writing', 'skills', 'career', 'contact'];
      const scrollPos = window.scrollY + 150;
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetHeight = element.offsetHeight;
          if (scrollPos >= offsetTop && scrollPos < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);


  const toggleLang = () => setLang(lang === 'en' ? 'ar' : 'en');
  const content = t[lang];

  const addAnimatedUnderlines = (text, lang) => {
    // Group 1: Bahrain, Cornell, Trees
    const group1 = lang === 'en' ? ['Bahrain', 'Cornell', 'Trees'] : ['البحرين', 'كورنيل', 'الأشجار'];
    // Group 2: language, nature, physical world
    const group2 = lang === 'en' ? ['language', 'nature', 'physical world'] : ['اللغة', 'الطبيعة', 'العالم المادي'];
    // Group 3: blockchain, AI
    const group3 = lang === 'en' ? ['Blockchain', 'AI'] : ['البلوك تشين', 'الذكاء الاصطناعي'];

    let processedText = text;
    let delay = 0;

    group1.forEach((keyword) => {
      const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      processedText = processedText.replace(regex, (match) => {
        delay += 0.6;
        return `<span class="animated-underline underline-blue" style="animation-delay: ${delay}s">${match}</span>`;
      });
    });

    group2.forEach((keyword) => {
      const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      processedText = processedText.replace(regex, (match) => {
        delay += 0.6;
        return `<span class="animated-underline underline-purple" style="animation-delay: ${delay}s">${match}</span>`;
      });
    });

    group3.forEach((keyword) => {
      const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      processedText = processedText.replace(regex, (match) => {
        delay += 0.6;
        return `<span class="animated-underline underline-green" style="animation-delay: ${delay}s">${match}</span>`;
      });
    });

    return processedText;
  };

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
        @keyframes underline {
          0% {
            background-size: 0% 2px;
          }
          100% {
            background-size: 100% 2px;
          }
        }
        .animate-scroll { animation: scroll 30s linear infinite; }
        .animate-scroll-reverse { animation: scroll-reverse 30s linear infinite; }
        .pause-animation { animation-play-state: paused; }
        .animated-underline {
          background-repeat: no-repeat;
          background-position: left bottom;
          background-size: 0% 2px;
          animation: underline 1s ease-out forwards;
          padding-bottom: 2px;
        }
        .underline-blue {
          background-image: linear-gradient(to right, rgba(251, 113, 133, 0.8), rgba(251, 113, 133, 0.8));
        }
        .underline-purple {
          background-image: linear-gradient(to right, rgba(245, 158, 11, 0.8), rgba(245, 158, 11, 0.8));
        }
        .underline-green {
          background-image: linear-gradient(to right, rgba(234, 88, 12, 0.8), rgba(234, 88, 12, 0.8));
        }
      `}</style>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 p-6">
        <div className={`max-w-6xl mx-auto backdrop-blur-md ${isDarkMode ? 'bg-black/40 border-white/5' : 'bg-white/40 border-black/5'} border rounded-2xl px-6 py-4 flex items-center justify-between`}>
          <div className="text-xl font-black tracking-tighter">
            <span>{lang === 'en' ? "Hi, I'm Asad." : 'مرحباً، أنا أسد.'}</span>
          </div>

          <div className="hidden lg:flex items-center space-x-8 rtl:space-x-reverse text-[11px] font-black tracking-[0.2em]">
            {Object.entries(content.nav).map(([key, label]) => {
              let targetId = key;
              if (key === 'me') targetId = 'home';
              else if (key === 'stack') targetId = 'skills';
              else if (key === 'timeline') targetId = 'career';
              else if (key === 'works') targetId = 'projects';
              else if (key === 'writing') targetId = 'writing';

              // Handle resume link separately (opens PDF in new tab)
              if (key === 'resume') {
                return (
                  <a
                    key={key}
                    href="/Rizvi_Asad_Resume.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-orange-500"
                  >
                    {label}
                  </a>
                );
              }

              return (
                <a
                  key={key}
                  href={`#${targetId}`}
                  onClick={(e) => handleNavClick(e, targetId)}
                  className={`transition-colors hover:text-orange-500 ${activeSection === targetId ? 'text-orange-500' : ''}`}
                >
                  {label}
                </a>
              );
            })}
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-lg hover:bg-orange-500/10 transition-colors">
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button onClick={toggleLang} className="p-2 rounded-lg hover:bg-orange-500/10 transition-colors flex items-center gap-1 font-bold text-xs">
              <Languages size={18} />
              <span>{lang.toUpperCase()}</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header
        id="home"
        className="min-h-[85vh] flex items-center px-6 pt-32 pb-16 max-w-7xl mx-auto relative"
      >
        <div className="grid lg:grid-cols-2 gap-12 items-center w-full relative z-10">
          {/* Left: Picture Place */}
          <div className="relative">
            <div className={`aspect-[4/5] w-full max-w-md mx-auto rounded-3xl overflow-hidden border ${isDarkMode ? 'border-white/10 bg-white/5' : 'border-black/5 bg-black/5'} relative transition-all duration-700`}>
              <img src="/portrait.JPG" alt="Portrait" className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Right: Title Thing */}
          <div className="space-y-6 text-center lg:text-start">
            <div className={`inline-block px-4 py-1.5 rounded-full border text-[10px] font-bold tracking-widest uppercase ${isDarkMode ? 'border-orange-500/30 text-orange-500 bg-orange-500/5' : 'border-orange-500/30 text-orange-600 bg-orange-500/5'}`}>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full bg-orange-500`}></span>
                {content.hero.badge}
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[0.95] lg:max-w-xl">
              {content.hero.title}
            </h1>
            <p
              className={`text-lg max-w-lg mx-auto lg:mx-0 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
              dangerouslySetInnerHTML={{ __html: addAnimatedUnderlines(content.hero.sub, lang) }}
            />
            <div className={`flex items-center gap-2 justify-center lg:justify-start text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              <MapPin size={16} className="text-orange-500" />
              <span>Ithaca, NY</span>
            </div>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4">
              <a
                href="#projects"
                onClick={(e) => handleNavClick(e, 'projects')}
                className={`px-10 py-5 font-black uppercase text-xs tracking-widest rounded-xl transition-all flex items-center gap-3 group bg-orange-500 text-black hover:bg-orange-400`}
              >
                {content.hero.cta1}
                {lang === 'en' ? <MoveRight className="group-hover:translate-x-1 transition-transform" /> : <MoveLeft className="group-hover:-translate-x-1 transition-transform" />}
              </a>
              <a
                href="#writing"
                onClick={(e) => handleNavClick(e, 'writing')}
                className={`px-10 py-5 font-black uppercase text-xs tracking-widest rounded-xl transition-all flex items-center gap-3 group border ${isDarkMode ? 'border-white/20 text-white hover:border-orange-500 hover:text-orange-500' : 'border-black/20 text-black hover:border-orange-500 hover:text-orange-500'}`}
              >
                {content.hero.cta2}
                <div className="group-hover:translate-y-1 transition-transform">↓</div>
              </a>
            </div>
          </div>
        </div>
      </header>



      {/* Projects - Moved up to be more prominent */}
      <section id="projects" className="py-20 px-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-4xl font-bold tracking-tighter">{content.projects.title}</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
          {projects.map((project, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedProject(project)}
              className="group cursor-pointer block"
            >
              <div className="aspect-square rounded-3xl overflow-hidden mb-6 relative hover:scale-105 transition-transform duration-700">
                {project.image ? (
                  <img src={project.image} alt={project.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                  <div className={`w-full h-full flex flex-col items-center justify-center transition-transform duration-700 group-hover:scale-110 ${isDarkMode ? 'bg-white/5' : 'bg-black/5'}`}>
                    <Code size={48} className={`mb-4 ${isDarkMode ? 'text-white/20' : 'text-black/20'}`} />
                    <span className={`font-bold tracking-widest uppercase text-xs ${isDarkMode ? 'text-white/30' : 'text-black/30'}`}>{project.title}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-orange-500/90 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-center items-center p-8 text-center">
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
                <ArrowUpRight className="text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))}
        </div>

        {/* Project Modal */}
        {selectedProject && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedProject(null)}
          >
            <div
              className={`max-w-6xl w-full max-h-[90vh] overflow-auto rounded-3xl ${isDarkMode ? 'bg-[#050505] border border-white/10' : 'bg-white border border-black/10'} shadow-2xl`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 z-10 flex justify-between items-center p-6 border-b border-current/10">
                <h2 className="text-3xl font-bold">{selectedProject.title}</h2>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="p-2 rounded-lg hover:bg-orange-500/10 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-8 p-8">
                {/* Left: Screenshots */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold uppercase tracking-wider">Screenshots</h3>
                  {selectedProject.screenshots?.map((screenshot, idx) => (
                    <div key={idx} className="rounded-2xl overflow-hidden border border-current/10">
                      <img
                        src={screenshot}
                        alt={`${selectedProject.title} screenshot ${idx + 1}`}
                        className="w-full h-auto object-contain"
                      />
                    </div>
                  ))}
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
                        className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-colors ${isDarkMode ? 'bg-white/10 text-white border border-white/20 hover:bg-white/20' : 'bg-black/10 text-black border border-black/20 hover:bg-black/20'}`}
                      >
                        <Twitter size={18} />
                        X
                      </a>
                    )}
                    <a
                      href={selectedProject.githubLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-colors ${isDarkMode ? 'bg-white/10 hover:bg-white/20 border border-white/20' : 'bg-black/10 hover:bg-black/20 border border-black/20'}`}
                    >
                      <Github size={18} />
                      View on GitHub
                    </a>
                  </div>
                </div>

                {/* Right: Description */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold uppercase tracking-wider mb-4">About</h3>
                    <p className={`leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {selectedProject.description}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold uppercase tracking-wider mb-4">Tech Stack</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.stack.map((tech, idx) => (
                        <span
                          key={idx}
                          className={`px-4 py-2 rounded-lg font-bold text-sm ${isDarkMode ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-orange-500/10 text-orange-600 border border-orange-500/20'}`}
                        >
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

      {/* Writing Section */}
      <section id="writing" className="py-20 px-6 max-w-7xl mx-auto">
        <div className="mb-12">
          <h2 className="text-4xl font-bold tracking-tighter">{lang === 'en' ? 'WRITING & RESEARCH' : 'كتابات وأبحاث'}</h2>
        </div>
        <a href="/research/arteta_ball_post.html" className={`group block p-8 md:p-12 rounded-3xl border transition-colors ${isDarkMode ? 'bg-[#050505] border-white/10 hover:border-orange-500' : 'bg-white border-black/5 hover:border-orange-500 shadow-sm'}`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <p className="text-[10px] font-black tracking-widest text-orange-500 uppercase mb-2">Latest Post • Mar 2025</p>
              <h3 className={`text-2xl font-bold mb-2 transition-colors group-hover:text-orange-500`}>Arteta-Ball: Modeling Arsenal's Possession with Markov Chains</h3>
              <p className={`max-w-2xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>A mathematical breakdown of Arsenal's 2024–25 open-play possession sequences using an absorbing Markov chain, complete with interactive Mermaid diagrams.</p>
            </div>
            <div className={`p-4 rounded-full transition-colors ${isDarkMode ? 'bg-white/5 group-hover:bg-orange-500 group-hover:text-black text-white' : 'bg-black/5 group-hover:bg-orange-500 group-hover:text-white text-black'}`}>
              <ArrowUpRight size={24} />
            </div>
          </div>
        </a>
      </section>

      {/* Rotating Tech Ticker with fade-out */}
      <section id="skills" className="py-20 bg-orange-500/[0.02]">
        <div className="max-w-6xl mx-auto px-6 mb-12">
          <h2 className="text-center text-4xl font-bold tracking-tighter">{content.stack.title}</h2>
        </div>

        <div className="relative mx-6 md:mx-12" dir="ltr">
          {/* Fade gradients */}
          <div className={`absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none ${isDarkMode ? 'bg-gradient-to-r from-[#050505] to-transparent' : 'bg-gradient-to-r from-[#fafafa] to-transparent'}`}></div>
          <div className={`absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none ${isDarkMode ? 'bg-gradient-to-l from-[#050505] to-transparent' : 'bg-gradient-to-l from-[#fafafa] to-transparent'}`}></div>

          <div className="space-y-3">
            {/* Row 1 */}
            <div className="flex whitespace-nowrap overflow-hidden group/pause" onMouseEnter={(e) => e.currentTarget.querySelector('.animate-scroll')?.classList.add('pause-animation')} onMouseLeave={(e) => e.currentTarget.querySelector('.animate-scroll')?.classList.remove('pause-animation')}>
              <div className="flex gap-4 animate-scroll">
                {[...techRow1, ...techRow1].map((tech, i) => (
                  <div key={i} className={`flex items-center gap-3 px-6 py-3.5 border ${isDarkMode ? 'bg-black border-white/5' : 'bg-white border-black/5'} rounded-lg flex-shrink-0`}>
                    <TechIcon techName={tech} />
                    <span className="font-bold text-base">{tech}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Row 2 */}
            <div className="flex whitespace-nowrap overflow-hidden group/pause" onMouseEnter={(e) => e.currentTarget.querySelector('.animate-scroll-reverse')?.classList.add('pause-animation')} onMouseLeave={(e) => e.currentTarget.querySelector('.animate-scroll-reverse')?.classList.remove('pause-animation')}>
              <div className="flex gap-4 animate-scroll-reverse">
                {[...techRow2, ...techRow2].map((tech, i) => (
                  <div key={i} className={`flex items-center gap-3 px-6 py-3.5 border ${isDarkMode ? 'bg-black border-white/5' : 'bg-white border-black/5'} rounded-lg flex-shrink-0`}>
                    <TechIcon techName={tech} />
                    <span className="font-bold text-base">{tech}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Career Timeline - Enhanced with visuals */}
      <section id="career" className="py-20 px-6 max-w-5xl mx-auto relative">
        <div className="mb-12">
          <h2 className="text-4xl font-bold tracking-tighter mb-3">{content.career.title}</h2>
          <p className={`${isDarkMode ? 'text-gray-500' : 'text-gray-400'} font-medium uppercase tracking-widest text-xs`}>{content.career.subtitle}</p>
        </div>

        <div className={`relative border-l-2 ${isDarkMode ? 'border-orange-500/20' : 'border-orange-500/10'} ml-6 space-y-8 rtl:border-l-0 rtl:border-r-2 rtl:mr-6`}>
          {careerTimeline.map((item, idx) => {
            return (
              <div
                key={idx}
                className="relative pl-12 rtl:pl-0 rtl:pr-12 group cursor-default"
              >
                {/* Animated dot */}
                <div className={`absolute left-[-13px] rtl:left-auto rtl:right-[-13px] top-2 w-6 h-6 rounded-full bg-orange-500 border-4 ${isDarkMode ? 'border-[#050505]' : 'border-[#fafafa]'} transition-all duration-300 group-hover:scale-125 group-hover:bg-orange-400`}>
                </div>

                {/* Card content */}
                <div className={`rounded-2xl p-6 transition-all duration-300 group-hover:scale-[1.02] ${isDarkMode ? 'bg-white/5 hover:bg-white/10 border border-white/5' : 'bg-black/5 hover:bg-black/10 border border-black/5'}`}>
                  <div className="space-y-3">
                    <span className="text-xs font-black text-orange-500 uppercase tracking-[0.2em]">
                      {item.year}
                    </span>
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
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {item.tags.map((tag, tagIdx) => (
                          <span
                            key={tagIdx}
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-md ${isDarkMode ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-orange-500/10 text-orange-600 border border-orange-500/20'}`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <p
                      className={`max-w-2xl leading-relaxed pt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}
                    >
                      {item.desc}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20 px-6">
        <div className={`max-w-4xl mx-auto p-12 md:p-24 rounded-[3rem] text-center overflow-hidden relative ${isDarkMode ? 'bg-white text-black' : 'bg-black text-white'}`}>
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-8 leading-none">{content.contact.title}</h2>
            <p className={`text-lg mb-12 max-w-xl mx-auto ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
              {content.contact.sub}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <a href="mailto:sar367@cornell.edu" className={`px-12 py-6 rounded-2xl font-black uppercase text-xs tracking-widest transition-all hover:scale-105 ${isDarkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
                Email Me
              </a>
              <div className="flex items-center gap-4">
                <a href="https://github.com/Archdiner" target="_blank" rel="noopener noreferrer" className="p-4 rounded-xl border border-current opacity-50 hover:opacity-100"><Github /></a>
                <a href="https://www.linkedin.com/in/asad-rizvi-02a1782a2/" target="_blank" rel="noopener noreferrer" className="p-4 rounded-xl border border-current opacity-50 hover:opacity-100"><Linkedin /></a>
                <a href="https://x.com/carne_asado" target="_blank" rel="noopener noreferrer" className="p-4 rounded-xl border border-current opacity-50 hover:opacity-100"><Twitter /></a>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default App;