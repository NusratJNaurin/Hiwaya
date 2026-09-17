import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Rocket,
  Palette,
  Scissors,
  CheckCircle2,
  Trophy,
  ShieldCheck,
  Gift,
  ArrowRight,
  Play,
  Heart,
  Star,
  Users,
  Calendar,
  Clock,
  BookOpen,
  Eye,
  Video,
  Hammer,
  Award,
  ChevronRight,
  Lock,
  Zap,
  Smile,
  Check,
  HelpCircle,
  ShoppingBag
} from 'lucide-react';
import { ALL_COURSES, COMPANIONS, INITIAL_CREATIONS } from '../data/mockData';
import { CreationUpload, HobbyCourse, Companion } from '../types';
import heroSkillsImg from '../assets/images/kids_crafts_skill_time_1787431059013.jpg';
import origamiPhoenixEventImg from '../assets/images/origami_phoenix_event_1787436783999.jpg';
import rocketLaunchCampImg from '../assets/images/rocket_launch_camp_1787436797509.jpg';
import crochetAmigurumiCampImg from '../assets/images/crochet_amigurumi_camp_1787436810084.jpg';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
  onSelectCourse?: (courseId: string) => void;
}

export function LandingPage({ onGetStarted, onLogin, onSelectCourse }: LandingPageProps) {
  const [activeNav, setActiveNav] = useState<'home' | 'learn' | 'communities' | 'events'>('home');
  const [selectedCompanion, setSelectedCompanion] = useState<Companion>(COMPANIONS[0]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [reactionCounts, setReactionCounts] = useState<Record<string, Record<string, number>>>({
    'c1': { '👍': 42, '✨': 68, '💯': 35, '💛': 51, '😆': 12 },
    'c2': { '👍': 38, '✨': 74, '💯': 29, '💛': 62, '😆': 9 },
    'c3': { '👍': 55, '✨': 89, '💯': 44, '💛': 40, '😆': 15 },
    'c4': { '👍': 31, '✨': 53, '💯': 22, '💛': 48, '😆': 8 },
  });
  const [userReacted, setUserReacted] = useState<Record<string, string[]>>({});
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const scrollToSection = (id: string, navItem: 'home' | 'learn' | 'communities' | 'events') => {
    setActiveNav(navItem);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleEmojiReact = (cardId: string, emoji: string) => {
    const currentList = userReacted[cardId] || [];
    const hasReacted = currentList.includes(emoji);
    const newList = hasReacted ? currentList.filter(e => e !== emoji) : [...currentList, emoji];

    setUserReacted(prev => ({ ...prev, [cardId]: newList }));
    setReactionCounts(prev => {
      const cardReactions = prev[cardId] || { '👍': 10, '✨': 15, '💯': 8, '💛': 12, '😆': 4 };
      const currentVal = cardReactions[emoji] || 0;
      return {
        ...prev,
        [cardId]: {
          ...cardReactions,
          [emoji]: hasReacted ? Math.max(0, currentVal - 1) : currentVal + 1
        }
      };
    });
  };

  const categories = [
    { id: 'all', label: 'All Hobbies' },
    { id: 'Paper Craft', label: 'Origami & Paper' },
    { id: 'Fiber Arts', label: 'Crochet & Yarn' },
    { id: 'STEM & Rocketry', label: 'STEM & Rockets' },
    { id: 'Fine Arts', label: 'Painting & Arts' },
    { id: 'Life Skills', label: 'Finance & Money' },
  ];

  const filteredCourses = activeCategory === 'all'
    ? ALL_COURSES
    : ALL_COURSES.filter(c => c.category === activeCategory);

  const upcomingEvents = [
    {
      id: 'ev-1',
      title: 'Origami World Cup: The Legendary Phoenix',
      category: 'Paper Craft',
      date: 'This Saturday, 4:00 PM GST',
      host: 'Sparky & Coach Kenji',
      spotsLeft: 14,
      image: origamiPhoenixEventImg,
      description: 'Fold an incredible mythical Phoenix step-by-step with live video guidance and real-time cheering!',
      badge: 'Live Workshop'
    },
    {
      id: 'ev-2',
      title: 'Junior Rocket Launch & Aerodynamics Camp',
      category: 'STEM & Rocketry',
      date: 'Next Friday, 3:30 PM GST',
      host: 'Rex & Dr. Faisal',
      spotsLeft: 8,
      image: rocketLaunchCampImg,
      description: 'Learn how fin angles and center-of-pressure send water rockets 50+ feet into the Doha sky.',
      badge: 'STEM Challenge'
    },
    {
      id: 'ev-3',
      title: 'Cozy Amigurumi Plushie Weekend',
      category: 'Fiber Arts',
      date: 'Next Sunday, 5:00 PM GST',
      host: 'Glow & Master Amira',
      spotsLeft: 22,
      image: crochetAmigurumiCampImg,
      description: 'Master the magic ring loop and create an adorable pocket companion with colorful soft yarn.',
      badge: 'Craft Camp'
    },
    {
      id: 'ev-4',
      title: 'Doha Young Creators Exhibition 2026',
      category: 'Community Fair',
      date: 'End of Month Festival',
      host: 'All Companions',
      spotsLeft: 50,
      image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&auto=format&fit=crop&q=80',
      description: 'Monthly showcase where top learner creations win official Jarir Bookstore QAR 100 gift hampers!',
      badge: 'Grand Festival'
    }
  ];

  const faqs = [
    {
      q: 'How does Hiwaya help reduce passive screen time?',
      a: 'Unlike video games or infinite video feeds, Hiwaya uses micro-lessons (under 3 minutes) that instruct kids to put the screen down, pick up real paper, yarn, paints, or tools, and build tangible projects with their hands. Kids then photograph their physical creation to earn XP and rewards!'
    },
    {
      q: 'Is the platform safe and parent-moderated?',
      a: 'Yes, 100%. Hiwaya has zero private messaging, zero external ads, and no open web links. In the Community Gallery, kids can only share approved photos of crafts (no selfies) with one-click parental PIN approval. Kids interact exclusively through positive reaction stickers.'
    },
    {
      q: 'How do the Jarir Bookstore gift vouchers work?',
      a: 'As learners complete full 4-step hobby quest lines and earn XP, they unlock official reward vouchers (such as QAR 10 to QAR 50) redeemable at partner stores like Jarir Bookstore in Qatar and GCC to purchase real crafting materials, origami paper, and books.'
    },
    {
      q: 'What age group is Hiwaya designed for?',
      a: 'Hiwaya is tailor-made for young makers aged 6 to 16. We offer two tailored learning interfaces: "Kids Mode" (simplified text, friendly big buttons, warm voice encouragement) and "Teen Mode" (advanced STEM details, direct publishing, and deeper project challenges).'
    },
    {
      q: 'Can I start for free?',
      a: 'Yes! Both the Origami Mastery and Crochet Starter hobby courses are 100% free forever with no credit card required. Parents can upgrade to the Lifetime All-Access pass anytime for a single one-time fee of QAR 75.'
    }
  ];

  return (
    <div className="relative min-h-screen bg-slate-950/40 text-white selection:bg-[#fd9d1a] selection:text-white font-sans">
      {/* Ambient Radial Highlights */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-orange-500/15 blur-[120px]" />
        <div className="absolute top-[30%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-indigo-500/15 blur-[130px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[55vw] h-[55vw] rounded-full bg-pink-500/15 blur-[140px]" />
      </div>

      {/* TOPBAR NAVIGATION */}
      <header
        id="landing-topbar"
        className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/60 border-b border-white/10 transition-all"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <div
            id="brand-logo-btn"
            onClick={() => scrollToSection('hero-section', 'home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-11 h-11 bg-gradient-to-b from-yellow-300 via-yellow-400 to-amber-400 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(250,204,21,0.5)] border-2 border-white group-hover:scale-105 transition-transform shrink-0">
              <span className="text-2xl font-black text-indigo-950 italic tracking-tight">H!</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-extrabold tracking-tight text-white drop-shadow-sm">
                  Hiwaya
                </span>
                <span className="text-xs font-bold px-1.5 py-0.5 rounded-md bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  هواية
                </span>
              </div>
              <span className="text-[10px] text-slate-300 font-medium tracking-wide">
                Gamified Creative Quests
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav id="landing-nav-links" className="hidden md:flex items-center gap-1 bg-white/5 p-1.5 rounded-2xl border border-white/10 shadow-inner">
            <button
              id="nav-home-btn"
              onClick={() => scrollToSection('hero-section', 'home')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeNav === 'home'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/25'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Home
            </button>
            <button
              id="nav-learn-btn"
              onClick={() => scrollToSection('learn-section', 'learn')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeNav === 'learn'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/25'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Learn
            </button>
            <button
              id="nav-communities-btn"
              onClick={() => scrollToSection('communities-section', 'communities')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeNav === 'communities'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/25'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Communities
            </button>
            <button
              id="nav-events-btn"
              onClick={() => scrollToSection('events-section', 'events')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeNav === 'events'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/25'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Events
            </button>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <button
              id="topbar-login-btn"
              onClick={onLogin}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-colors border border-transparent hover:border-white/10"
            >
              Log In
            </button>
            <button
              id="topbar-get-started-btn"
              onClick={onGetStarted}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-orange-500 via-amber-500 to-pink-500 text-white shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* 1. HERO SECTION */}
      <section id="hero-section" className="relative z-10 pt-10 pb-16 md:pt-16 md:pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Content Column: Quote & Core Mission */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              {/* Pill Banner */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-300 text-xs sm:text-sm font-semibold shadow-inner backdrop-blur-md">
                <span className="flex h-2 w-2 rounded-full bg-orange-400 animate-pulse" />
                <span>The Gamified Creative Learning Universe for Kids & Teens</span>
              </div>

              {/* Main Headline Quote */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.12]">
                Turn Screen Time Into{' '}
                <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-pink-500 bg-clip-text text-transparent underline decoration-orange-400/40 decoration-wavy decoration-2">
                  Skill Time
                </span>
              </h1>

              {/* Subheadline */}
              <p className="text-base sm:text-lg text-slate-200 max-w-xl font-normal leading-relaxed">
                Kids choose an AI companion coach, master tactile arts like origami, crochet, rocketry, pottery, painting & chess through 4-step quests, photograph real crafts, and earn official reward vouchers from <strong className="text-amber-300 font-semibold">Jarir Bookstore</strong>.
              </p>

              {/* Primary Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-1">
                <button
                  id="hero-primary-start-btn"
                  onClick={onGetStarted}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl text-base font-bold bg-gradient-to-r from-orange-500 via-amber-500 to-pink-500 text-white shadow-xl shadow-orange-500/35 hover:shadow-orange-500/60 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <Sparkles className="w-5 h-5 text-amber-200" />
                  <span>Start Adventure Free</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  id="hero-explore-hobbies-btn"
                  onClick={() => scrollToSection('learn-section', 'learn')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl text-base font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/20 backdrop-blur-md transition-all cursor-pointer shadow-lg"
                >
                  <Play className="w-4 h-4 text-orange-400 fill-orange-400" />
                  <span>Explore 50+ Quests</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 text-xs sm:text-sm text-slate-200">
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/15 backdrop-blur-md shadow-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>100% Parent Safe & Gated</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/15 backdrop-blur-md shadow-sm">
                  <Gift className="w-4 h-4 text-amber-400" />
                  <span>Real Jarir Gift Rewards</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/15 backdrop-blur-md shadow-sm">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span>4.9 / 5 Parent Rating</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Tactile Crafts Image beside Quote */}
            <div className="lg:col-span-6 relative">
              <div className="relative mx-auto rounded-3xl overflow-hidden bg-slate-900/60 border border-white/20 shadow-2xl backdrop-blur-xl p-3 sm:p-4 group hover:border-orange-500/40 transition-all">
                {/* Artwork Container */}
                <div className="relative rounded-2xl overflow-hidden aspect-[4/3] sm:aspect-[16/11] w-full">
                  <img
                    src={heroSkillsImg}
                    alt="Turn Screen Time Into Skill Time - Kids tactile crafts, knitting, chess, painting, pottery and jewelry"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30 pointer-events-none" />

                  {/* Top Floating Badge */}
                  <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-bold text-amber-300 border border-amber-400/30 flex items-center gap-1.5 shadow-lg">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Real-World Offline Mastery</span>
                  </div>

                  {/* Top Right Live Count */}
                  <div className="absolute top-3 right-3 bg-emerald-500/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] font-extrabold text-slate-950 flex items-center gap-1 shadow-md">
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />
                    <span>Hands-On Quests</span>
                  </div>

                  {/* Bottom Image Overlay Description */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <div className="bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs text-slate-200 border border-white/10 font-medium">
                      🧶 Knitting • ♟️ Chess • 🎨 Painting • 🏺 Pottery • 📿 Jewelry
                    </div>
                  </div>
                </div>

                {/* Micro Companion Speech Bar below image */}
                <div className="mt-3 p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                  <img
                    src={selectedCompanion.avatarUrl}
                    alt={selectedCompanion.name}
                    referrerPolicy="no-referrer"
                    className="w-9 h-9 rounded-xl object-cover border border-orange-400 shadow-md shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white">{selectedCompanion.name}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-orange-500/30 text-orange-300 font-semibold">Coach</span>
                    </div>
                    <p className="text-[11px] text-slate-300 truncate">"{selectedCompanion.greeting}"</p>
                  </div>
                  <button
                    onClick={onGetStarted}
                    className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md hover:scale-105 transition-transform"
                  >
                    Start Quest
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Interactive Companion Coach & Quest Simulator Card */}
          <div className="mt-12 bg-slate-900/60 rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl backdrop-blur-xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              
              {/* Companion Details & Switcher */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center gap-4">
                  <img
                    src={selectedCompanion.avatarUrl}
                    alt={selectedCompanion.name}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-orange-400 shadow-lg"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-extrabold text-white">{selectedCompanion.name}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-md bg-orange-500/20 text-orange-300 font-bold border border-orange-500/30">
                        Companion Mentor
                      </span>
                    </div>
                    <p className="text-xs text-amber-300 font-semibold mt-0.5">{selectedCompanion.role}</p>
                    <p className="text-xs text-slate-300 mt-1">{selectedCompanion.personality}</p>
                  </div>
                </div>

                {/* Companion Selector Pills */}
                <div className="pt-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Pick Your Quest Guide:
                  </span>
                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    {COMPANIONS.map((companion) => {
                      const isSelected = selectedCompanion.id === companion.id;
                      return (
                        <button
                          key={companion.id}
                          id={`companion-pick-${companion.id}`}
                          onClick={() => setSelectedCompanion(companion)}
                          className={`flex items-center gap-1.5 p-1.5 pr-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            isSelected
                              ? 'scale-105 ring-2 ring-orange-400 bg-orange-500/25 text-white shadow-md'
                              : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                          }`}
                        >
                          <img
                            src={companion.avatarUrl}
                            alt={companion.name}
                            referrerPolicy="no-referrer"
                            className="w-6 h-6 rounded-lg object-cover"
                          />
                          <span>{companion.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Live Quest Simulation */}
              <div className="lg:col-span-7 bg-white/5 rounded-2xl p-5 border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
                      Active Questline: Japanese Origami Art
                    </span>
                    <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-md font-bold border border-amber-400/30">
                      +2,000 XP
                    </span>
                  </div>
                  <span className="text-xs text-slate-300 font-semibold">Step 3 of 4</span>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-white">Classic Japanese Paper Crane</h4>
                  <p className="text-xs text-slate-300 mt-1">Fold precision diagonal creases and wings with {selectedCompanion.name}'s step-by-step guidance.</p>
                </div>

                <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-gradient-to-r from-orange-500 via-amber-400 to-pink-500 h-full w-3/4 rounded-full transition-all duration-500" />
                </div>

                <div className="grid grid-cols-4 gap-2 pt-1 text-[11px] text-center font-bold">
                  <div className="bg-emerald-500/20 text-emerald-300 py-1.5 rounded-lg border border-emerald-500/30 flex items-center justify-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>1. SEE</span>
                  </div>
                  <div className="bg-emerald-500/20 text-emerald-300 py-1.5 rounded-lg border border-emerald-500/30 flex items-center justify-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>2. WATCH</span>
                  </div>
                  <div className="bg-orange-500/30 text-orange-300 py-1.5 rounded-lg border border-orange-500/50 animate-pulse flex items-center justify-center gap-1 shadow-inner">
                    <Scissors className="w-3 h-3" />
                    <span>3. DO</span>
                  </div>
                  <div className="bg-white/5 text-slate-400 py-1.5 rounded-lg border border-white/5">
                    4. CREATE
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    Reward on completion: <strong className="text-emerald-400">Jarir QAR 25 Voucher</strong>
                  </span>
                  <button
                    id="simulate-quest-btn"
                    onClick={onGetStarted}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md hover:scale-105 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Play Quest Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* METRIC HIGHLIGHTS STRIP */}
      <section className="relative z-10 border-y border-white/10 bg-slate-900/60 backdrop-blur-md py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-transparent bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text">
                12,500+
              </div>
              <p className="text-xs sm:text-sm text-slate-400 font-medium">Physical Crafts Created</p>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-transparent bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text">
                6 Companions
              </div>
              <p className="text-xs sm:text-sm text-slate-400 font-medium">AI Guides & STEM Mentors</p>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-transparent bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text">
                QAR 45,000+
              </div>
              <p className="text-xs sm:text-sm text-slate-400 font-medium">Partner Rewards Unlocked</p>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-transparent bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text">
                100%
              </div>
              <p className="text-xs sm:text-sm text-slate-400 font-medium">Parent Approval & Safe Space</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE 5-STEP QUEST FRAMEWORK */}
      <section className="relative z-10 py-20 bg-[#0d1322]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" />
              <span>Pedagogy & Design</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              The 5-Step Hiwaya Quest Framework
            </h2>
            <p className="text-slate-300 text-base sm:text-lg">
              Designed with child development psychologists to turn passive entertainment into active craftsmanship.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Step 1 */}
            <div className="bg-white/5 rounded-2xl p-5 border border-white/10 hover:border-orange-500/50 transition-all flex flex-col justify-between space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-400 flex items-center justify-center">
                <Eye className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">Step 1</span>
                <h3 className="text-lg font-bold text-white mt-1">SEE</h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Inspiring showcase of the finished craft to trigger curiosity and tactile ambition.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white/5 rounded-2xl p-5 border border-white/10 hover:border-orange-500/50 transition-all flex flex-col justify-between space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-400 flex items-center justify-center">
                <Video className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">Step 2</span>
                <h3 className="text-lg font-bold text-white mt-1">WATCH</h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Micro, zero-fluff video tutorials breaking down precise techniques step-by-step.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white/5 rounded-2xl p-5 border border-white/10 hover:border-orange-500/50 transition-all flex flex-col justify-between space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
                <Hammer className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Step 3</span>
                <h3 className="text-lg font-bold text-white mt-1">DO</h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Interactive checklist where kids put screen away and work with real materials.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-white/5 rounded-2xl p-5 border border-white/10 hover:border-orange-500/50 transition-all flex flex-col justify-between space-y-3">
              <div className="w-12 h-12 rounded-xl bg-pink-500/20 border border-pink-500/40 text-pink-400 flex items-center justify-center">
                <Palette className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-pink-400 uppercase tracking-wider">Step 4</span>
                <h3 className="text-lg font-bold text-white mt-1">CREATE</h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Photo upload with instant positive feedback from AI Companion coaches.
                </p>
              </div>
            </div>

            {/* Step 5 */}
            <div className="bg-white/5 rounded-2xl p-5 border border-white/10 hover:border-orange-500/50 transition-all flex flex-col justify-between space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Step 5</span>
                <h3 className="text-lg font-bold text-white mt-1">CELEBRATE</h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  XP rewards, digital badges, and real-world Jarir Bookstore vouchers!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. LEARN SECTION (EXPLORE HOBBIES & COURSES) */}
      <section id="learn-section" className="relative z-10 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-wider">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Curriculum & Hobbies</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                Explore Real-World Creative Adventures
              </h2>
              <p className="text-slate-300 text-base">
                Each hobby is crafted by master artisans and educators with 4 progressive quests, tangible milestones, and verified certificates.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  id={`cat-filter-${cat.id}`}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    activeCategory === cat.id
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/30'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => {
              const isFree = course.id === 'origami' || course.id === 'crochet';
              return (
                <div
                  key={course.id}
                  id={`course-card-${course.id}`}
                  className="group bg-slate-800/60 hover:bg-slate-800/90 rounded-3xl overflow-hidden border border-white/10 hover:border-orange-500/40 transition-all flex flex-col justify-between shadow-xl"
                >
                  <div>
                    {/* Course Image & Badge */}
                    <div className="relative h-48 sm:h-52 overflow-hidden">
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-black/40" />

                      {/* Free vs Premium Tag */}
                      <div className="absolute top-4 left-4">
                        {isFree ? (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/90 text-white backdrop-blur-md shadow-md">
                            Free Starter Quest
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/90 text-slate-950 backdrop-blur-md shadow-md flex items-center gap-1">
                            <Star className="w-3 h-3 fill-slate-950" />
                            Premium Track
                          </span>
                        )}
                      </div>

                      {/* Difficulty */}
                      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-200 border border-white/10">
                        {course.difficulty}
                      </div>

                      {/* Category Pill */}
                      <div className="absolute bottom-3 left-4">
                        <span className="text-xs font-semibold text-orange-300 bg-orange-500/20 px-2.5 py-1 rounded-lg backdrop-blur-md border border-orange-500/30">
                          {course.category}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-4">
                      <h3 className="text-xl font-bold text-white group-hover:text-amber-300 transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        {course.tagline}
                      </p>

                      {/* Key Course Stats */}
                      <div className="pt-2 grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                          <span className="text-[10px] text-slate-400 block">Quests</span>
                          <span className="font-bold text-white">4 Steps</span>
                        </div>
                        <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                          <span className="text-[10px] text-slate-400 block">Reward XP</span>
                          <span className="font-bold text-amber-400">+2,000 XP</span>
                        </div>
                        <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                          <span className="text-[10px] text-slate-400 block">Voucher</span>
                          <span className="font-bold text-emerald-400">{course.voucherValue}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="p-6 pt-0">
                    <button
                      id={`enroll-course-${course.id}`}
                      onClick={() => {
                        if (onSelectCourse) onSelectCourse(course.id);
                        onGetStarted();
                      }}
                      className="w-full py-3 rounded-xl font-bold text-sm bg-white/10 hover:bg-gradient-to-r hover:from-orange-500 hover:to-amber-500 text-white hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/10 group-hover:border-transparent"
                    >
                      <span>{isFree ? 'Start Free Quest' : 'Unlock Adventure'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. COMMUNITIES SECTION (GALLERY & SAFE SOCIAL CIRCLE) */}
      <section id="communities-section" className="relative z-10 py-24 bg-[#0d1322] border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-400 text-xs font-bold uppercase tracking-wider">
              <Users className="w-3.5 h-3.5" />
              <span>Safe Creator Circle</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Explore What Young Creators Are Making
            </h2>
            <p className="text-slate-300 text-base sm:text-lg">
              A 100% moderated space where kids cheer each other on with positive sticker reactions. No toxic feeds, no comments, no ads.
            </p>
          </div>

          {/* Gallery Showcase Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {INITIAL_CREATIONS.slice(0, 4).map((item, idx) => {
              const cardId = `c${idx + 1}`;
              const counts = reactionCounts[cardId] || { '👍': 20, '✨': 30, '💯': 15, '💛': 25, '😆': 5 };
              const currentReactions = userReacted[cardId] || [];

              return (
                <div
                  key={item.id}
                  id={`community-card-${item.id}`}
                  className="bg-slate-800/80 rounded-3xl overflow-hidden border border-white/10 shadow-xl flex flex-col justify-between"
                >
                  <div>
                    {/* Creation Photo */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-black/30" />
                      <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[11px] font-bold text-orange-300 border border-white/10">
                        {item.hobbyName}
                      </div>
                      <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-xs text-slate-300">
                        <span className="font-semibold text-white">{item.authorName || 'Young Maker'}</span>
                        <span className="text-[11px] text-slate-400">{item.authorCity || 'Qatar'}</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-2">
                      <h4 className="font-bold text-white text-base truncate">{item.title}</h4>
                      <p className="text-xs text-slate-300 line-clamp-2 italic bg-white/5 p-2 rounded-xl border border-white/5">
                        "{item.aiFeedback}"
                      </p>
                    </div>
                  </div>

                  {/* Interactive Emoji Reaction Bar */}
                  <div className="p-4 pt-0">
                    <div className="flex items-center justify-between gap-1 bg-black/40 p-2 rounded-2xl border border-white/5">
                      {(['👍', '✨', '💯', '💛', '😆'] as const).map((emoji) => {
                        const hasReacted = currentReactions.includes(emoji);
                        const count = counts[emoji] || 0;

                        return (
                          <button
                            key={emoji}
                            id={`react-${item.id}-${emoji}`}
                            onClick={() => handleEmojiReact(cardId, emoji)}
                            className={`flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                              hasReacted
                                ? 'bg-orange-500/30 text-orange-300 scale-105 border border-orange-500/40'
                                : 'hover:bg-white/10 text-slate-400'
                            }`}
                          >
                            <span>{emoji}</span>
                            <span className="text-[10px]">{count}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Safety Promise Banner */}
          <div className="mt-16 bg-gradient-to-r from-indigo-900/40 via-purple-900/40 to-slate-900/40 p-8 rounded-3xl border border-indigo-500/20 backdrop-blur-xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">Parent PIN Gated</h4>
                  <p className="text-xs text-slate-300">All public submissions require parent PIN review</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">Zero Direct Messaging</h4>
                  <p className="text-xs text-slate-300">No chat rooms, strangers, or external links</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                  <Heart className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">Positive Reinforcement</h4>
                  <p className="text-xs text-slate-300">Only friendly stickers & AI encouragement</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. EVENTS SECTION (LIVE WORKSHOPS & CHALLENGES) */}
      <section id="events-section" className="relative z-10 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5" />
                <span>Live Community Events</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                Upcoming Maker Workshops & Live Tournaments
              </h2>
              <p className="text-slate-300 text-base">
                Join weekend stream build-alongs, companion-hosted challenges, and win exclusive reward packs.
              </p>
            </div>

            <button
              id="view-all-events-btn"
              onClick={onGetStarted}
              className="inline-flex items-center gap-2 text-sm font-bold text-orange-400 hover:text-orange-300 cursor-pointer"
            >
              <span>View Full Calendar</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Events Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {upcomingEvents.map((ev) => (
              <div
                key={ev.id}
                id={`event-card-${ev.id}`}
                className="bg-slate-800/60 rounded-3xl p-6 border border-white/10 hover:border-amber-500/40 transition-all flex flex-col sm:flex-row gap-6 shadow-xl"
              >
                <div className="sm:w-44 sm:h-auto h-40 rounded-2xl overflow-hidden shrink-0 relative">
                  <img
                    src={ev.image}
                    alt={ev.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md">
                    {ev.badge}
                  </div>
                </div>

                <div className="flex flex-col justify-between space-y-3 flex-1">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{ev.date}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white leading-snug">{ev.title}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">{ev.description}</p>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-white/10">
                    <div className="text-[11px] text-slate-400">
                      Host: <span className="text-slate-200 font-semibold">{ev.host}</span>
                    </div>
                    <button
                      id={`rsvp-event-${ev.id}`}
                      onClick={onGetStarted}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:shadow-lg shadow-orange-500/20 cursor-pointer"
                    >
                      RSVP / Join
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. PARENT HUB & PEACE OF MIND */}
      <section className="relative z-10 py-20 bg-gradient-to-b from-[#0d1322] to-[#0b0f19]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Dedicated Parent Portal</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                Complete Parental Oversight & Screen Balance Controls
              </h2>
              <p className="text-slate-300 text-base leading-relaxed">
                Parents get their own dedicated PIN-protected dashboard to celebrate their child’s progress, manage daily time allowances, and inspect every photo uploaded before it reaches the gallery.
              </p>

              <div className="space-y-3.5 pt-2">
                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400 mt-0.5">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Daily Screen Time Limits</h4>
                    <p className="text-xs text-slate-300">Set 15, 30, or 60 minute healthy crafting allowances with automatic wrap-up alerts.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400 mt-0.5">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">1-Click Creation Moderation</h4>
                    <p className="text-xs text-slate-300">Review photos taken by your child, leave private encouragement notes, or keep private.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400 mt-0.5">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">AI Weekly Insights & Milestone Reports</h4>
                    <p className="text-xs text-slate-300">Receive summary reports on fine motor skill growth, patience, and problem solving.</p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  id="parent-portal-btn"
                  onClick={onLogin}
                  className="px-6 py-3.5 rounded-2xl text-sm font-bold bg-white/10 hover:bg-white/15 text-white border border-white/20 transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span>Access Parent Portal Demo</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="bg-slate-800/80 rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl backdrop-blur-xl space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold">
                      SH
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">Parent Hub: Sarah</h4>
                      <p className="text-xs text-slate-400">Child: Alex (9 yrs old)</p>
                    </div>
                  </div>
                  <span className="text-xs bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full font-bold border border-emerald-500/30">
                    Active & Safe
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                    <span className="text-[11px] text-slate-400 block">Today's Focus</span>
                    <span className="text-base font-bold text-amber-300">Origami Crane</span>
                  </div>
                  <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                    <span className="text-[11px] text-slate-400 block">Tactile Time</span>
                    <span className="text-base font-bold text-emerald-400">35 mins hands-on</span>
                  </div>
                </div>

                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300">Pending Creation Approval</span>
                    <span className="text-orange-400 font-bold">1 photo</span>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-900/60 p-2.5 rounded-xl">
                    <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center font-bold text-orange-400 shrink-0">
                      📸
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">Paper Crane Masterpiece</p>
                      <p className="text-[11px] text-slate-400">Uploaded 12 mins ago</p>
                    </div>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded font-bold">
                      Approve ✓
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. PRICING PREVIEW */}
      <section className="relative z-10 py-24 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Transparent Pricing</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              No Subscriptions. Lifetime Value.
            </h2>
            <p className="text-slate-300 text-base sm:text-lg">
              Start with free included hobbies or upgrade once for lifetime access across the entire creative universe.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="bg-slate-800/60 rounded-3xl p-8 border border-white/10 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Free Starter Pack</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-white">QAR 0</span>
                  <span className="text-sm text-slate-400 font-normal">forever</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300">
                  Perfect to spark initial curiosity and test out hands-on quests.
                </p>

                <div className="space-y-2.5 pt-4 border-t border-white/10 text-xs sm:text-sm">
                  <div className="flex items-center gap-2.5 text-slate-200">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Full Origami & Crochet Starter courses</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-200">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Choose 1 AI Companion Coach</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-200">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Parent PIN Hub & Photo Review</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-200">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Community Gallery sticker reactions</span>
                  </div>
                </div>
              </div>

              <button
                id="pricing-free-btn"
                onClick={onGetStarted}
                className="w-full py-3.5 rounded-2xl font-bold text-sm bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all cursor-pointer"
              >
                Start Free Adventure
              </button>
            </div>

            {/* Premium Plan */}
            <div className="bg-gradient-to-b from-orange-500/20 via-slate-800 to-slate-900 rounded-3xl p-8 border-2 border-orange-500 shadow-2xl flex flex-col justify-between space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-gradient-to-l from-orange-500 to-amber-500 text-white text-[11px] font-extrabold px-4 py-1 rounded-bl-xl shadow-md">
                POPULAR FOR FAMILIES
              </div>

              <div className="space-y-4">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Premium All-Access</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-white">QAR 75</span>
                  <span className="text-sm text-slate-400 font-normal">one-time payment</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300">
                  Lifetime access to rocket science, acrylic arts, finance, and partner vouchers.
                </p>

                <div className="space-y-2.5 pt-4 border-t border-white/10 text-xs sm:text-sm">
                  <div className="flex items-center gap-2.5 text-slate-200">
                    <Check className="w-4 h-4 text-amber-400" />
                    <span>All Current & Future STEM and Craft courses</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-200">
                    <Check className="w-4 h-4 text-amber-400" />
                    <span>All 6 3D Companion Guides unlocked</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-200">
                    <Check className="w-4 h-4 text-amber-400" />
                    <span>Official Jarir Bookstore voucher unlocks</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-200">
                    <Check className="w-4 h-4 text-amber-400" />
                    <span>Verified Printable Achievement Certificates</span>
                  </div>
                </div>
              </div>

              <button
                id="pricing-premium-btn"
                onClick={onGetStarted}
                className="w-full py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-orange-500 via-amber-500 to-pink-500 text-white shadow-xl shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-[1.02] transition-all cursor-pointer"
              >
                Get Lifetime All-Access
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FAQ SECTION */}
      <section className="relative z-10 py-20 bg-[#0d1322]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Questions & Answers</span>
            </div>
            <h2 className="text-3xl font-extrabold text-white">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = expandedFaq === idx;
              return (
                <div
                  key={idx}
                  id={`faq-item-${idx}`}
                  className="bg-slate-800/60 rounded-2xl border border-white/10 overflow-hidden transition-all"
                >
                  <button
                    id={`faq-toggle-${idx}`}
                    onClick={() => setExpandedFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left font-bold text-white flex items-center justify-between gap-4 hover:text-amber-300 transition-colors cursor-pointer"
                  >
                    <span className="text-sm sm:text-base">{faq.q}</span>
                    <span className="text-xl text-orange-400 font-mono">{isOpen ? '−' : '+'}</span>
                  </button>
                  {isOpen && (
                    <div className="p-5 pt-0 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-white/5">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 9. BOTTOM CALL TO ACTION */}
      <section className="relative z-10 py-20 overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-pink-600 rounded-3xl p-8 sm:p-14 text-center space-y-6 shadow-2xl relative overflow-hidden">
            <div className="relative z-10 space-y-4">
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                Ready to Spark Your Child's Creative Superpower?
              </h2>
              <p className="text-orange-100 text-base sm:text-lg max-w-2xl mx-auto">
                Join thousands of young creators across Qatar and the GCC discovering real tactile passions today.
              </p>
              <div className="pt-4">
                <button
                  id="bottom-cta-get-started"
                  onClick={onGetStarted}
                  className="inline-flex items-center gap-3 px-9 py-4 rounded-2xl text-base font-bold bg-slate-950 text-white hover:bg-slate-900 shadow-2xl hover:scale-105 transition-all cursor-pointer"
                >
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <span>Start Your Adventure Free</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/10 bg-[#080b12] py-12 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-white/10">
            {/* Col 1: Brand */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-gradient-to-b from-yellow-300 via-yellow-400 to-amber-400 rounded-xl flex items-center justify-center shadow-[0_0_12px_rgba(250,204,21,0.4)] border border-white shrink-0">
                  <span className="text-base font-black text-indigo-950 italic tracking-tight">H!</span>
                </div>
                <span className="text-xl font-extrabold text-white">Hiwaya</span>
                <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  هواية
                </span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Gamified tactile creative learning platform for kids and teens with companion coaches and Jarir rewards.
              </p>
            </div>

            {/* Col 2: Navigation */}
            <div className="space-y-2">
              <h4 className="font-bold text-white text-sm">Explore</h4>
              <ul className="space-y-1.5">
                <li><button onClick={() => scrollToSection('hero-section', 'home')} className="hover:text-white">Home</button></li>
                <li><button onClick={() => scrollToSection('learn-section', 'learn')} className="hover:text-white">Learn Hobbies</button></li>
                <li><button onClick={() => scrollToSection('communities-section', 'communities')} className="hover:text-white">Communities</button></li>
                <li><button onClick={() => scrollToSection('events-section', 'events')} className="hover:text-white">Events</button></li>
              </ul>
            </div>

            {/* Col 3: Safe Platform */}
            <div className="space-y-2">
              <h4 className="font-bold text-white text-sm">For Families</h4>
              <ul className="space-y-1.5">
                <li><button onClick={onLogin} className="hover:text-white">Parent Portal Login</button></li>
                <li><span className="text-slate-400">Screen Balance Guide</span></li>
                <li><span className="text-slate-400">Jarir Voucher Redemption</span></li>
                <li><span className="text-slate-400">COPPA Safety Standards</span></li>
              </ul>
            </div>

            {/* Col 4: Region */}
            <div className="space-y-2">
              <h4 className="font-bold text-white text-sm">Qatar & GCC</h4>
              <p className="text-slate-400">
                Crafted for curious minds across Doha, Riyadh, Dubai, Kuwait, and the wider Arab world.
              </p>
              <div className="flex items-center gap-2 text-emerald-400 text-[11px] font-semibold pt-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>COPPA & Child Safety Verified</span>
              </div>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-300">
            <p>© {new Date().getFullYear()} Hiwaya. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <span className="hover:text-white cursor-pointer">Privacy Policy</span>
              <span className="hover:text-white cursor-pointer">Parental Controls</span>
              <span className="hover:text-white cursor-pointer">Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
