import React, { useState } from 'react';
import { ALL_COURSES, INITIAL_MAP_NODES } from '../data/mockData';
import { AppScreen, Companion, HobbyCourse, MapNode, UserProfile } from '../types';
import { sound } from '../utils/audio';
import { PremiumPaywallModal } from './PremiumPaywallModal';

interface AdventureMapScreenProps {
  userProfile: UserProfile;
  companion: Companion;
  onNavigate: (screen: AppScreen) => void;
  onSelectLesson?: (stepKey: string) => void;
  nodes?: MapNode[];
  selectedCourseId?: string;
  onSelectCourse?: (courseId: string) => void;
  onSelectNode?: (nodeId: string) => void;
  isRewardUnlocked?: boolean;
}

export const AdventureMapScreen: React.FC<AdventureMapScreenProps> = ({
  userProfile,
  companion,
  onNavigate,
  onSelectLesson,
  nodes: propNodes,
  selectedCourseId = 'origami',
  onSelectCourse,
  onSelectNode,
  isRewardUnlocked = false
}) => {
  const nodes = propNodes || INITIAL_MAP_NODES;
  const [mapMode, setMapMode] = useState<'track' | 'island'>('track');
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [lockNotice, setLockNotice] = useState<string | null>(null);
  const [paywallModalOpen, setPaywallModalOpen] = useState(false);
  const [paywallCourse, setPaywallCourse] = useState<{ title: string; category: string }>({
    title: 'Hiwaya Course',
    category: 'Creative Quest'
  });

  const currentCourse: HobbyCourse =
    ALL_COURSES.find((c) => c.id === selectedCourseId) || ALL_COURSES[0];

  const isTeen = userProfile.userRole === 'learner_teen' || userProfile.ageGroup === 'teen_13_plus';
  const unlockedList = userProfile.unlockedCourseIds || ['origami', 'crochet'];
  const isCurrentCourseUnlocked = unlockedList.includes(selectedCourseId);
  const completedCount = nodes.filter(n => n.status === 'completed' && n.stepNumber <= 4).length;
  const activeNode = nodes.find(n => n.status === 'active') || nodes[0];

  const handleNodeClick = (node: MapNode) => {
    if (!isCurrentCourseUnlocked) {
      sound.playPop();
      setPaywallCourse({ title: currentCourse.title, category: currentCourse.category });
      setPaywallModalOpen(true);
      return;
    }

    if (node.status === 'locked') {
      sound.playPop();
      setLockNotice(`🔒 ${node.title} is locked! Complete ${node.prerequisiteTitle || 'the previous quest'} first.`);
      setTimeout(() => setLockNotice(null), 3500);
      return;
    }

    sound.playPop();
    if (node.stepKey === 'CELEBRATE') {
      onNavigate('celebration');
    } else {
      if (onSelectNode) {
        onSelectNode(node.id);
      } else if (onSelectLesson) {
        onSelectLesson(node.stepKey);
      }
      onNavigate('project-module');
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-4 pb-32">
      {/* Course Switcher Bar */}
      {onSelectCourse && (
        <div className="mb-6 bg-white/10 backdrop-blur-xl p-3.5 rounded-3xl border border-white/20 flex items-center justify-between gap-4 overflow-x-auto">
          <div className="flex items-center gap-2 shrink-0">
            <span className="w-8 h-8 rounded-xl bg-yellow-400 text-indigo-950 flex items-center justify-center font-black">
              <span className="material-symbols-outlined text-lg">explore</span>
            </span>
            <span className="text-xs font-black text-white uppercase tracking-wider hidden sm:inline">
              Choose Hobby Quest:
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {ALL_COURSES.map((c) => {
              const isSelected = selectedCourseId === c.id;
              const isCourseUnlocked = unlockedList.includes(c.id);

              return (
                <button
                  key={c.id}
                  onClick={() => {
                    sound.playPop();
                    if (!isCourseUnlocked) {
                      setPaywallCourse({ title: c.title, category: c.category });
                      setPaywallModalOpen(true);
                    }
                    if (onSelectCourse) onSelectCourse(c.id);
                  }}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-black flex items-center gap-2 shrink-0 transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-yellow-400 text-indigo-950 border-white shadow-lg scale-105'
                      : isCourseUnlocked
                      ? 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                      : 'bg-black/40 hover:bg-black/60 text-white/60 border-white/10'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">{c.iconName}</span>
                  <span>{c.category}</span>
                  {!isCourseUnlocked && (
                    <span className="material-symbols-outlined text-xs text-yellow-400">lock</span>
                  )}
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-indigo-950 animate-ping" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
      {/* Lock Notice Toast */}
      {lockNotice && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-indigo-950/95 border-2 border-yellow-400 text-yellow-300 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md animate-bounce-in max-w-md text-center">
          <span className="material-symbols-outlined text-2xl shrink-0">lock</span>
          <span className="text-xs md:text-sm font-bold text-white">{lockNotice}</span>
          <button
            onClick={() => setLockNotice(null)}
            className="text-white/60 hover:text-white font-black ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Immersive App Shell Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Center Main: Interactive Quest Track OR Locked Paywall Card */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {!isCurrentCourseUnlocked ? (
            <div className="bg-indigo-950/90 backdrop-blur-2xl rounded-[36px] md:rounded-[40px] border-2 border-yellow-400/40 p-8 md:p-12 flex flex-col items-center text-center gap-6 shadow-2xl relative overflow-hidden">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-yellow-400/20 border-2 border-yellow-400 text-yellow-300 flex items-center justify-center text-5xl shadow-[0_0_40px_rgba(250,204,21,0.3)] animate-pulse">
                <span className="material-symbols-outlined text-5xl md:text-6xl">lock</span>
              </div>

              <div className="max-w-lg space-y-3">
                <div className="inline-flex items-center gap-1.5 bg-yellow-400/20 border border-yellow-400/40 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider text-yellow-300">
                  <span className="material-symbols-outlined text-sm">lock</span>
                  <span>Premium Course</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-white italic tracking-tight drop-shadow-md">
                  {currentCourse.title}
                </h2>
                
                {/* Exact Intentional Notice */}
                <div className="p-4 rounded-2xl bg-black/40 border border-yellow-400/30 text-indigo-100 space-y-1.5 text-sm md:text-base leading-relaxed text-center">
                  <p className="font-bold text-white text-base">
                    This course is part of Hiwaya Premium.
                  </p>
                  <p className="text-yellow-200/90 font-medium">
                    Premium access is not currently available in this MVP.
                  </p>
                  <p className="text-xs sm:text-sm text-indigo-200">
                    This demo does not process real payments.
                  </p>
                </div>
              </div>

              <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-4 text-left space-y-2">
                <div className="text-xs font-black text-white/80 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-yellow-400 text-sm">info</span>
                  <span>Course Highlights (Coming in Future Release):</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs md:text-sm text-indigo-100 font-semibold">
                  <span className="text-yellow-400 font-black">★</span>
                  <span>4 Full-Length HD Masterclass Video Lessons</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs md:text-sm text-indigo-100 font-semibold">
                  <span className="text-yellow-400 font-black">★</span>
                  <span>Interactive AI Submission & Dexterity Analysis</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs md:text-sm text-indigo-100 font-semibold">
                  <span className="text-yellow-400 font-black">★</span>
                  <span>{currentCourse.voucherValue} Voucher at {currentCourse.voucherPartner}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full max-w-md pt-2">
                <button
                  onClick={() => {
                    sound.playFanfare();
                    if (onSelectCourse) onSelectCourse('origami');
                  }}
                  className="btn-yellow-tactile w-full py-4 rounded-2xl font-black text-base md:text-lg flex items-center justify-center gap-2 cursor-pointer shadow-xl text-indigo-950"
                >
                  <span className="material-symbols-outlined font-black">explore</span>
                  <span>Explore Free Quests (Origami)</span>
                </button>
                <button
                  onClick={() => {
                    sound.playPop();
                    setPaywallCourse({ title: currentCourse.title, category: currentCourse.category });
                    setPaywallModalOpen(true);
                  }}
                  className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs md:text-sm border border-white/20 transition-all cursor-pointer text-center"
                >
                  View Details
                </button>
              </div>
            </div>
          ) : (
            /* Main Quest Container */
            <div className="bg-white/5 rounded-[36px] md:rounded-[40px] border border-white/10 p-5 md:p-8 flex flex-col gap-6 md:gap-8 relative shadow-inner overflow-hidden backdrop-blur-xl">
            {/* Ambient dot pattern texture */}
            <div className="pattern-dots absolute inset-0 opacity-20 pointer-events-none" />

            {/* Header with Title & Active Status Pills */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-amber-300 text-xs font-black uppercase tracking-wider bg-amber-400/20 px-2.5 py-0.5 rounded-full border border-amber-300/30">
                    {currentCourse.category}
                  </span>
                  <span className="text-white/60 text-xs font-bold">{currentCourse.difficulty} • Season 1</span>
                </div>
                <h2 className="text-2xl md:text-4xl font-black text-white italic drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
                  {currentCourse.title}
                </h2>
                <p className="text-xs text-indigo-200 mt-1 font-semibold">
                  Progress: <span className="text-yellow-300 font-black">{completedCount} of 4 Quests Completed</span> ({Math.round(completedCount/4 * 100)}%)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="px-3.5 py-1.5 bg-emerald-400 text-emerald-950 font-black rounded-xl text-xs uppercase tracking-widest shadow-md">
                  Active
                </div>
                <div className="px-3.5 py-1.5 bg-white/10 text-white font-bold rounded-xl text-xs uppercase tracking-widest border border-white/20">
                  Step {activeNode ? activeNode.stepNumber : 1} / 4
                </div>

                {/* View toggle (Track vs Map) */}
                <div className="hidden sm:flex bg-black/30 p-1 rounded-xl border border-white/10">
                  <button
                    onClick={() => setMapMode('track')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      mapMode === 'track' ? 'bg-white text-indigo-900 shadow' : 'text-white/70 hover:text-white'
                    }`}
                  >
                    Track
                  </button>
                  <button
                    onClick={() => setMapMode('island')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      mapMode === 'island' ? 'bg-white text-indigo-900 shadow' : 'text-white/70 hover:text-white'
                    }`}
                  >
                    Island
                  </button>
                </div>
              </div>
            </div>

            {/* Mode 1: Linear Immersive Step Node Track */}
            {mapMode === 'track' && (
              <div className="relative py-6 flex items-center justify-between overflow-x-auto no-scrollbar gap-3 z-10 px-2">
                {/* Connecting Track Background Bar */}
                <div className="absolute top-1/2 left-8 right-8 h-3 bg-white/10 -translate-y-1/2 rounded-full -z-0" />
                <div
                  className="absolute top-1/2 left-8 h-3 bg-gradient-to-r from-emerald-400 to-yellow-400 -translate-y-1/2 rounded-full -z-0 shadow-[0_0_12px_rgba(52,211,153,0.8)] transition-all duration-700"
                  style={{ width: `${Math.max(10, Math.min(90, (completedCount / 4) * 85))}%` }}
                />

                {nodes.map((node) => {
                  const isDone = node.status === 'completed';
                  const isActive = node.status === 'active';
                  const isLocked = node.status === 'locked';
                  const isRewardNode = node.stepKey === 'CELEBRATE';

                  return (
                    <div
                      key={node.id}
                      className="relative flex flex-col items-center group shrink-0"
                      onMouseEnter={() => setHoveredNode(node.id)}
                      onMouseLeave={() => setHoveredNode(null)}
                    >
                      <button
                        onClick={() => handleNodeClick(node)}
                        className="flex flex-col items-center gap-2 cursor-pointer relative z-10 focus:outline-none transition-transform"
                      >
                        {/* Node Bubble */}
                        <div
                          className={`w-14 h-14 md:w-18 md:h-18 rounded-full flex items-center justify-center transition-all ${
                            isDone
                              ? 'bg-emerald-500 border-4 border-white shadow-lg text-white group-hover:scale-110'
                              : isActive
                              ? 'bg-yellow-400 border-4 border-white text-indigo-950 shadow-[0_0_30px_rgba(250,204,21,0.8)] ring-4 ring-yellow-400/50 scale-110 animate-pulse-glow'
                              : isRewardNode
                              ? 'bg-indigo-950/80 border-2 border-yellow-400/50 text-yellow-300 opacity-60 group-hover:opacity-100'
                              : 'bg-indigo-950/90 border-2 border-white/20 text-white/40 opacity-70 group-hover:opacity-90'
                          }`}
                        >
                          {isDone ? (
                            <span className="material-symbols-outlined text-2xl md:text-3xl font-black">
                              check
                            </span>
                          ) : isActive ? (
                            <span className="material-symbols-outlined text-2xl md:text-3xl font-black" style={{ fontVariationSettings: "'FILL' 1" }}>
                              play_arrow
                            </span>
                          ) : isRewardNode ? (
                            <span className="material-symbols-outlined text-xl md:text-2xl font-black">
                              lock
                            </span>
                          ) : (
                            <span className="material-symbols-outlined text-xl md:text-2xl">
                              lock
                            </span>
                          )}
                        </div>

                        {/* Pill Label */}
                        <span
                          className={`font-black uppercase text-[10px] md:text-xs tracking-wider px-2.5 py-1 rounded-full border transition-all ${
                            isDone
                              ? 'bg-emerald-600/80 text-white border-emerald-400/50'
                              : isActive
                              ? 'bg-yellow-400 text-indigo-950 border-white shadow-md'
                              : 'bg-black/40 text-white/50 border-white/10'
                          }`}
                        >
                          {node.stepNumber} • {node.stepKey}
                        </span>
                      </button>

                      {/* Tooltip on Hover */}
                      {hoveredNode === node.id && (
                        <div className="absolute -top-12 z-30 bg-indigo-950 border border-white/30 text-white text-[11px] font-bold py-1 px-3 rounded-xl shadow-2xl whitespace-nowrap animate-fade-in pointer-events-none">
                          {isDone
                            ? `✓ ${node.title} (Completed)`
                            : isActive
                            ? `👉 Active Quest: ${node.title}`
                            : `🔒 Complete ${node.prerequisiteTitle || 'Previous Quest'} first!`}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Mode 2: Island Snaking Map View */}
            {mapMode === 'island' && (
              <div className="relative w-full h-[380px] rounded-3xl p-4 overflow-hidden border-2 border-white/20 bg-black/20">
                <svg
                  className="absolute top-0 left-0 w-full h-full pointer-events-none z-0"
                  preserveAspectRatio="none"
                  viewBox="0 0 100 100"
                >
                  <path className="path-line path-completed" d="M 15 20 C 35 5, 55 45, 80 30" />
                  <path className="path-line path-locked" d="M 80 30 C 95 60, 45 65, 30 80" />
                  <path className="path-line path-locked" d="M 30 80 C 45 95, 75 90, 85 85" />
                </svg>

                {/* Nodes on Island Canvas */}
                <div className="relative z-10 w-full h-full">
                  {nodes.map((node, index) => {
                    const positions = [
                      { top: '15%', left: '12%' },
                      { top: '25%', left: '76%' },
                      { top: '55%', left: '30%' },
                      { top: '75%', left: '60%' },
                      { top: '80%', left: '84%' }
                    ];
                    const pos = positions[index] || { top: '50%', left: '50%' };
                    const isDone = node.status === 'completed';
                    const isActive = node.status === 'active';

                    return (
                      <div key={node.id} style={pos} className="absolute">
                        <button
                          onClick={() => handleNodeClick(node)}
                          className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center font-bold shadow-xl border-2 transition-transform hover:scale-110 cursor-pointer ${
                            isDone
                              ? 'bg-emerald-500 border-white text-white'
                              : isActive
                              ? 'bg-yellow-400 border-white text-indigo-950 animate-bounce'
                              : 'bg-indigo-950/80 border-white/20 text-white/50'
                          }`}
                          title={node.status === 'locked' ? `Complete ${node.prerequisiteTitle || 'prior quest'} first` : node.title}
                        >
                          {isDone ? '✓' : isActive ? '▶' : '🔒'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Active Quest Action Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
              {/* Left Video Preview Card */}
              <div className="bg-white/10 border border-white/20 p-4 rounded-3xl flex flex-col justify-between backdrop-blur-md">
                <div
                  className="relative rounded-2xl overflow-hidden aspect-video bg-black/40 mb-3 group cursor-pointer"
                  onClick={() => {
                    if (onSelectNode && activeNode) onSelectNode(activeNode.id);
                    onNavigate('project-module');
                  }}
                >
                  <img
                    src={activeNode.previewImage || currentCourse.thumbnailUrl}
                    alt={`${activeNode.title} preview`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-indigo-950/30 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/90 text-indigo-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-2xl font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>
                        play_arrow
                      </span>
                    </div>
                  </div>
                  <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-md font-mono font-bold">
                    {activeNode.videoDurationLabel || '03:45'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-black text-sm text-white">Quest: {activeNode.title}</h4>
                    <p className="text-[11px] text-white/70">Step {activeNode.stepNumber} of 4</p>
                  </div>
                  <button
                    onClick={() => {
                      sound.playPop();
                      if (onSelectNode && activeNode) onSelectNode(activeNode.id);
                      onNavigate('project-module');
                    }}
                    className="btn-indigo-tactile text-xs font-black px-3.5 py-2 rounded-xl cursor-pointer"
                  >
                    Resume
                  </button>
                </div>
              </div>

              {/* Right 2-Col AI Feedback Banner */}
              <div className="md:col-span-2 bg-indigo-400/20 border border-indigo-300/30 p-5 md:p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-5 backdrop-blur-md relative overflow-hidden">
                <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-yellow-400 text-indigo-950 flex items-center justify-center font-black shadow-lg shrink-0">
                    <span className="material-symbols-outlined text-3xl">photo_camera</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-yellow-300 bg-yellow-400/20 px-2 py-0.5 rounded-full">
                      Sequential Gating Active
                    </span>
                    <h3 className="text-lg md:text-xl font-black text-white mt-1">
                      {activeNode.title}
                    </h3>
                    <p className="text-xs text-white/80 max-w-sm mt-0.5">
                      Finish video & upload photo to verify this quest and unlock the next step in the journey!
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    sound.playPop();
                    if (onSelectNode && activeNode) onSelectNode(activeNode.id);
                    onNavigate('project-module');
                    setTimeout(() => {
                      const uploadEl = document.getElementById('quest-upload-section');
                      if (uploadEl) {
                        uploadEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    }, 120);
                  }}
                  className="w-full sm:w-auto btn-yellow-tactile px-6 py-3.5 rounded-2xl font-black text-xs md:text-sm uppercase tracking-tight shadow-lg shrink-0 cursor-pointer flex items-center justify-center gap-2 hover:scale-105 transition-transform"
                >
                  <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    photo_camera
                  </span>
                  Upload Quest Photo
                </button>
              </div>
            </div>
          </div>
          )}
        </div>

        {/* Right Side: Parent Hub or Teen Studio & Rewards Bento Sidebar */}
        <aside className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Parent Hub Card for Parents / Kids OR Teen Maker Studio for 13+ */}
          {!isTeen ? (
            <div className="bg-white rounded-[32px] p-6 shadow-2xl flex flex-col gap-5 text-indigo-900 border border-indigo-100">
              <div className="flex justify-between items-center pb-2 border-b border-indigo-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-lg">family_restroom</span>
                  </div>
                  <h3 className="font-black text-base text-indigo-950 uppercase tracking-tight">
                    Parent Hub
                  </h3>
                </div>
                <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Safe & Monitored
                </span>
              </div>

              {/* Streak Tracker */}
              <div className="bg-indigo-50/70 p-4 rounded-2xl border border-indigo-100/80">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-orange-500 font-black text-base">🔥</span>
                    <span className="text-xs font-black text-indigo-950">14-Day Learning Streak</span>
                  </div>
                  <span className="text-[11px] font-bold text-indigo-600">Great pace!</span>
                </div>
                
                {/* Mini streak bars */}
                <div className="grid grid-cols-7 gap-1.5 mt-2">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-1">
                      <div className={`w-full h-6 rounded-md flex items-center justify-center text-[10px] font-black ${
                        idx <= 4 ? 'bg-orange-500 text-white shadow-sm' : idx === 5 ? 'bg-amber-300 text-amber-900' : 'bg-indigo-200/60 text-indigo-400'
                      }`}>
                        {idx <= 4 ? '✓' : ''}
                      </div>
                      <span className="text-[9px] font-bold text-indigo-400">{day}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skill Development Progress */}
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between font-bold text-indigo-950 mb-1">
                    <span>{currentCourse.category} Precision</span>
                    <span className="text-indigo-600 font-extrabold">{completedCount * 25}%</span>
                  </div>
                  <div className="w-full h-2 bg-indigo-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full transition-all" style={{ width: `${completedCount * 25}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-bold text-indigo-950 mb-1">
                    <span>Creative Dexterity</span>
                    <span className="text-purple-600 font-extrabold">{Math.min(100, 20 + completedCount * 20)}%</span>
                  </div>
                  <div className="w-full h-2 bg-indigo-100 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${Math.min(100, 20 + completedCount * 20)}%` }} />
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  sound.playPop();
                  onNavigate('parent-hub');
                }}
                className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-black text-xs py-3 rounded-2xl border border-indigo-200 transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Open Parent Analytics & Controls</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          ) : (
            <div className="bg-indigo-950/85 backdrop-blur-2xl rounded-[32px] p-6 shadow-2xl flex flex-col gap-5 text-white border-2 border-purple-400/30">
              <div className="flex justify-between items-center pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/30 text-purple-300 flex items-center justify-center border border-purple-400/40">
                    <span className="material-symbols-outlined text-lg">terminal</span>
                  </div>
                  <h3 className="font-black text-base text-white uppercase tracking-tight">
                    Teen Maker Studio
                  </h3>
                </div>
                <span className="text-[10px] font-black bg-purple-500/30 text-purple-300 px-2.5 py-1 rounded-full uppercase tracking-wider border border-purple-400/40">
                  Direct Publishing
                </span>
              </div>

              {/* Streak Tracker */}
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-orange-400 font-black text-base">🔥</span>
                    <span className="text-xs font-black text-white">14-Day Maker Streak</span>
                  </div>
                  <span className="text-[11px] font-bold text-yellow-300">Level {userProfile.level}</span>
                </div>
                
                {/* Mini streak bars */}
                <div className="grid grid-cols-7 gap-1.5 mt-2">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-1">
                      <div className={`w-full h-6 rounded-md flex items-center justify-center text-[10px] font-black ${
                        idx <= 4 ? 'bg-purple-500 text-white shadow-sm' : idx === 5 ? 'bg-amber-400 text-amber-950' : 'bg-white/10 text-white/40'
                      }`}>
                        {idx <= 4 ? '✓' : ''}
                      </div>
                      <span className="text-[9px] font-bold text-white/50">{day}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skill Development Progress */}
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between font-bold text-white/90 mb-1">
                    <span>{currentCourse.category} Mastery</span>
                    <span className="text-purple-300 font-extrabold">{completedCount * 25}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${completedCount * 25}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-bold text-white/90 mb-1">
                    <span>Maker Portfolio XP</span>
                    <span className="text-yellow-300 font-extrabold">{userProfile.currentXp} XP</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-400 rounded-full transition-all" style={{ width: `${(userProfile.currentXp / userProfile.xpToNextLevel) * 100}%` }} />
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  sound.playPop();
                  onNavigate('gallery');
                }}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-black text-xs py-3 rounded-2xl border border-purple-400/40 transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer shadow-lg"
              >
                <span>View Community Showcase Gallery</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          )}

          {/* Rewards Chest Card (Gated) */}
          <div
            onClick={() => {
              sound.playPop();
              onNavigate('celebration');
            }}
            className={`rounded-[32px] border p-6 flex flex-col gap-4 backdrop-blur-xl shadow-2xl cursor-pointer transition-all hover:scale-[1.02] ${
              isRewardUnlocked
                ? 'bg-amber-500/20 border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.3)]'
                : 'bg-indigo-950/60 border-white/20'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-yellow-400/20 text-yellow-300 flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                    redeem
                  </span>
                </div>
                <h3 className="font-black text-sm text-white uppercase tracking-tight">
                  Partner Reward
                </h3>
              </div>
              <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                isRewardUnlocked ? 'bg-emerald-400 text-indigo-950' : 'bg-amber-400/20 text-amber-300'
              }`}>
                {isRewardUnlocked ? '🎉 UNLOCKED' : `🔒 ${completedCount}/4 Done`}
              </span>
            </div>

            {/* Glowing Voucher Preview */}
            <div className={`rounded-2xl p-4 flex flex-col items-center text-center shadow-xl relative overflow-hidden ${
              isRewardUnlocked
                ? 'bg-yellow-400 text-indigo-950'
                : 'bg-black/40 text-white border border-white/10'
            }`}>
              <div className="w-10 h-10 rounded-full bg-indigo-950 text-yellow-400 flex items-center justify-center font-black mb-2 shadow">
                {isRewardUnlocked ? '🎁' : '🔒'}
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-yellow-300">
                Jarir Bookstore
              </span>
              <h4 className="text-base font-black tracking-tight mt-0.5">
                QAR 10 Reward Voucher
              </h4>
              <p className="text-xs text-white/80 font-medium">
                Art & Origami Craft Supplies
              </p>
              
              <div className="mt-3 w-full bg-white/10 rounded-xl p-2 text-[11px] font-bold">
                {isRewardUnlocked
                  ? '⭐ Click to reveal code JARIR-HWY-5829!'
                  : `🔒 Gated: Finish all 4 Quests to unlock (${completedCount}/4 done)`}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Mobile Bottom Bar for Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-5 pt-3 glass-panel-deep border-t-2 border-white/20 rounded-t-3xl shadow-2xl">
        <button
          onClick={() => {
            sound.playPop();
            onNavigate('adventure-map');
          }}
          className="flex flex-col items-center text-white p-2 cursor-pointer"
        >
          <span className="material-symbols-outlined text-2xl text-yellow-400" style={{ fontVariationSettings: "'FILL' 1" }}>
            explore
          </span>
          <span className="text-[10px] font-bold mt-1">Map</span>
        </button>

        <button
          onClick={() => {
            sound.playPop();
            if (onSelectNode && activeNode) onSelectNode(activeNode.id);
            onNavigate('project-module');
          }}
          className="flex flex-col items-center bg-yellow-400 text-indigo-950 rounded-2xl px-6 py-2.5 -translate-y-4 shadow-[0_4px_0_#A16207] cursor-pointer"
        >
          <span className="material-symbols-outlined text-2xl font-black">auto_stories</span>
          <span className="text-[10px] font-black mt-0.5">Quest</span>
        </button>

        <button
          onClick={() => {
            sound.playPop();
            onNavigate('celebration');
          }}
          className="flex flex-col items-center text-white/70 p-2 hover:text-white cursor-pointer"
        >
          <span className="material-symbols-outlined text-2xl">military_tech</span>
          <span className="text-[10px] font-bold mt-1">Rewards</span>
        </button>

        {!isTeen ? (
          <button
            onClick={() => {
              sound.playPop();
              onNavigate('parent-hub');
            }}
            className="flex flex-col items-center text-pink-300 p-2 hover:text-pink-200 cursor-pointer"
          >
            <span className="material-symbols-outlined text-2xl">family_restroom</span>
            <span className="text-[10px] font-bold mt-1">Parents</span>
          </button>
        ) : (
          <button
            onClick={() => {
              sound.playPop();
              onNavigate('gallery');
            }}
            className="flex flex-col items-center text-purple-300 p-2 hover:text-purple-200 cursor-pointer"
          >
            <span className="material-symbols-outlined text-2xl">palette</span>
            <span className="text-[10px] font-bold mt-1">Gallery</span>
          </button>
        )}
      </nav>

      {/* Dedicated Intentional Premium Paywall Modal */}
      <PremiumPaywallModal
        isOpen={paywallModalOpen}
        onClose={() => setPaywallModalOpen(false)}
        courseTitle={paywallCourse.title}
        courseCategory={paywallCourse.category}
        onExploreFreeCourses={() => {
          if (onSelectCourse) onSelectCourse('origami');
          setPaywallModalOpen(false);
        }}
      />
    </div>
  );
};
