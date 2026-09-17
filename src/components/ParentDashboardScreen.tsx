import React, { useState } from 'react';
import { ALL_COURSES, COMPANIONS, FREE_STARTER_COURSE_IDS, INITIAL_CREATIONS, PREMIUM_ONE_TIME_PRICE_QAR, ADDITIONAL_HOBBY_PRICE_QAR } from '../data/mockData';
import { AppScreen, CreationUpload, MapNode, ParentSettings, UserProfile } from '../types';
import { sound } from '../utils/audio';
import { ShareableAchievementCardModal } from './ShareableAchievementCardModal';

interface ParentDashboardScreenProps {
  userProfile: UserProfile;
  onNavigate: (screen: AppScreen) => void;
  creations?: CreationUpload[];
  allModules?: MapNode[];
  isRewardUnlocked?: boolean;
  onToggleApproveCreation?: (id: string) => void;
  onTogglePublishGallery?: (id: string) => void;
  onUpdateParentNote?: (id: string, note: string) => void;
  onUpgradeToPremium?: (chosenHobbyId?: string) => void;
  onUnlockAdditionalHobby?: (hobbyId: string) => void;
}

export const ParentDashboardScreen: React.FC<ParentDashboardScreenProps> = ({
  userProfile,
  onNavigate,
  creations = INITIAL_CREATIONS,
  allModules = [],
  isRewardUnlocked = false,
  onToggleApproveCreation,
  onTogglePublishGallery,
  onUpdateParentNote,
  onUpgradeToPremium,
  onUnlockAdditionalHobby
}) => {
  const [settings, setSettings] = useState<ParentSettings>({
    safetyMode: true,
    timeLimitMinutes: 45,
    communityAccess: true,
    dailyNotification: true,
    aiParentInsights: true
  });

  const [claimedVoucherId, setClaimedVoucherId] = useState<string | null>(null);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [selectedCreation, setSelectedCreation] = useState<CreationUpload | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [activeShareCreation, setActiveShareCreation] = useState<CreationUpload | undefined>(undefined);
  
  const isUpgraded = userProfile.membershipPlan === 'premium';
  const unlockedCourses = userProfile.unlockedCourseIds || FREE_STARTER_COURSE_IDS;
  const nonStarterCourses = ALL_COURSES.filter(c => !FREE_STARTER_COURSE_IDS.includes(c.id));
  const [selectedFreeHobbyChoice, setSelectedFreeHobbyChoice] = useState<string>(
    userProfile.selectedPremiumChoiceId || (nonStarterCourses[0]?.id || 'painting')
  );

  // Moderation filtering state
  const [moderationFilter, setModerationFilter] = useState<'all' | 'pending' | 'published' | 'private'>('all');
  const [editingNoteCreationId, setEditingNoteCreationId] = useState<string | null>(null);
  const [noteInputText, setNoteInputText] = useState<string>('');

  const handleUpgradePlan = () => {
    sound.playFanfare();
    if (onUpgradeToPremium) {
      onUpgradeToPremium(selectedFreeHobbyChoice);
    }
  };

  const handleBuyAddon = (courseId: string) => {
    sound.playFanfare();
    if (onUnlockAdditionalHobby) {
      onUnlockAdditionalHobby(courseId);
    }
  };

  const toggleSafetyMode = () => {
    sound.playPop();
    setSettings((prev) => ({ ...prev, safetyMode: !prev.safetyMode }));
  };

  const toggleCommunity = () => {
    sound.playPop();
    setSettings((prev) => ({ ...prev, communityAccess: !prev.communityAccess }));
  };

  const handleClaimVoucher = (id: string) => {
    sound.playChime();
    setClaimedVoucherId(id);
  };

  const handleStartEditNote = (creation: CreationUpload) => {
    sound.playPop();
    setEditingNoteCreationId(creation.id);
    setNoteInputText(creation.parentNote || '');
  };

  const handleSaveNote = (creationId: string) => {
    sound.playChime();
    if (onUpdateParentNote) {
      onUpdateParentNote(creationId, noteInputText);
    }
    setEditingNoteCreationId(null);
  };

  const xpPercent = Math.min(100, Math.round((userProfile.currentXp / userProfile.xpToNextLevel) * 100));
  const completedCount = allModules.filter(m => m.status === 'completed' && m.stepNumber <= 4).length;

  // Filter creations based on user selection
  const alexCreations = creations.filter(c => c.authorName === userProfile.name || !c.authorName);
  const pendingCreations = alexCreations.filter(c => !c.isApprovedByParent);
  const publishedCreations = alexCreations.filter(c => c.isApprovedByParent && c.publishedToGallery);
  const privateCreations = alexCreations.filter(c => c.isApprovedByParent && !c.publishedToGallery);

  const displayedCreations = alexCreations.filter((c) => {
    if (moderationFilter === 'pending') return !c.isApprovedByParent;
    if (moderationFilter === 'published') return c.isApprovedByParent && c.publishedToGallery;
    if (moderationFilter === 'private') return c.isApprovedByParent && !c.publishedToGallery;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 relative pb-36">
      {/* Top Breadcrumb & Parent Hub Welcome */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-400/20 border border-yellow-300/30 rounded-full text-yellow-300 text-xs font-black uppercase tracking-wider mb-2">
            <span className="material-symbols-outlined text-sm">shield</span>
            Parent Control Center
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight drop-shadow-md">
            Welcome back, Parent! 👋
          </h1>
          <p className="text-sm md:text-base text-indigo-100 font-semibold mt-1">
            {userProfile.name} is making outstanding creative progress this week.
          </p>
        </div>

        {/* Back to Child Explorer Button */}
        <button
          onClick={() => {
            sound.playPop();
            onNavigate('adventure-map');
          }}
          className="btn-yellow-tactile font-black px-6 py-3 rounded-2xl flex items-center gap-2 cursor-pointer text-sm md:text-base shadow-xl"
        >
          <span className="material-symbols-outlined">child_care</span>
          Switch to Child View
        </button>
      </div>

      {/* Section 1: Alex's Journey Progress Card */}
      <section className="bg-white/10 backdrop-blur-xl rounded-[32px] p-6 md:p-8 border border-white/20 shadow-2xl mb-8 relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          {/* Avatar & Basic Info */}
          <div className="flex items-center gap-5">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden border-4 border-yellow-400 bg-white/10 shadow-xl shrink-0">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD5fYMrpEM6gEY_uAXlBqxtKLAst0lVUzdSCPbKwFcxAMyv60uYEQaawtHqnAlQBv5J4GyIW5JMSEaOI_6pzirOVxyZAFz1eE5pIMR9dx8w77FeUOTjXvGppaa8r-bAvHhbUELedsR9VVp17YfLb1NWhh7IDh6_Sk92d3t-hH7yAuNlZl0iNdFSxKiP1nnBulWQPPix1If8G5l8gCwz_GGDZv326LBaGt9PY7V-_7Bo79SsRCE6O96irQ"
                alt="Alex 3D Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 bg-yellow-400/20 text-yellow-300 text-xs font-black px-3 py-1 rounded-full border border-yellow-400/30 mb-1.5">
                🔥 7 Day Streak
              </div>
              <h2 className="text-2xl font-black text-white">{userProfile.name}</h2>
              <p className="text-xs text-indigo-200 font-bold">{userProfile.levelTitle} (Level {userProfile.level})</p>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm font-black text-white">
              <span>Weekly Learning XP</span>
              <span className="text-yellow-300 font-black">{userProfile.currentXp} / {userProfile.xpToNextLevel} XP</span>
            </div>
            <div className="h-5 bg-black/40 rounded-full overflow-hidden border border-white/20 p-0.5 shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full transition-all duration-1000 shadow-md"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
            <p className="text-[11px] text-white/70 text-right font-medium">
              {userProfile.xpToNextLevel - userProfile.currentXp} XP until Level {userProfile.level + 1} rewards
            </p>
          </div>

          {/* Quick Safety Controls */}
          <div className="bg-white/10 p-4 rounded-2xl border border-white/20 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-emerald-400">verified_user</span>
                Child Safety Mode
              </span>
              <button
                onClick={toggleSafetyMode}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                  settings.safetyMode ? 'bg-emerald-500' : 'bg-gray-600'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform shadow ${
                    settings.safetyMode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-blue-400">timer</span>
                Daily Screen Limit
              </span>
              <select
                value={settings.timeLimitMinutes}
                onChange={(e) => {
                  sound.playPop();
                  setSettings({ ...settings, timeLimitMinutes: Number(e.target.value) });
                }}
                className="bg-black/40 border border-white/20 text-white rounded-lg px-2 py-1 text-xs outline-none cursor-pointer font-bold"
              >
                <option value={30} className="bg-indigo-950">30 Minutes</option>
                <option value={45} className="bg-indigo-950">45 Minutes</option>
                <option value={60} className="bg-indigo-950">60 Minutes</option>
                <option value={90} className="bg-indigo-950">90 Minutes</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Active Hobbies & Quest Prerequisites */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-yellow-400">route</span>
            Master of Origami: Sequential Quest Path
          </h2>
          <span className="text-xs font-black text-yellow-300 bg-yellow-400/20 px-3 py-1 rounded-full border border-yellow-300/30">
            {completedCount} of 4 Quests Completed
          </span>
        </div>

        {/* 4 Steps Sequential Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {allModules.filter(m => m.stepNumber <= 4).map((mod) => {
            const isDone = mod.status === 'completed';
            const isActive = mod.status === 'active';
            return (
              <div
                key={mod.id}
                className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                  isDone
                    ? 'bg-emerald-500/15 border-emerald-400/60 text-white'
                    : isActive
                    ? 'bg-indigo-600/40 border-yellow-400 text-white shadow-lg'
                    : 'bg-white/5 border-white/10 text-white/50'
                }`}
              >
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[11px] font-black uppercase tracking-wider text-yellow-300">
                      Step {mod.stepNumber} of 4
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-black flex items-center gap-1 ${
                        isDone
                          ? 'bg-emerald-400 text-indigo-950'
                          : isActive
                          ? 'bg-yellow-400 text-indigo-950 animate-pulse'
                          : 'bg-white/10 text-white/50'
                      }`}
                    >
                      {isDone ? (
                        <>
                          <span className="material-symbols-outlined text-xs">check</span>
                          Verified
                        </>
                      ) : isActive ? (
                        <>
                          <span className="material-symbols-outlined text-xs">play_arrow</span>
                          In Progress
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-xs">lock</span>
                          Locked
                        </>
                      )}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-white mb-1">{mod.title}</h3>
                  <p className="text-[11px] text-white/70">
                    {isDone
                      ? '✓ Project submission verified by Coach.'
                      : isActive
                      ? '👉 Child is currently working on this module.'
                      : `🔒 Prerequisite: Complete ${mod.prerequisiteTitle || 'Step ' + (mod.stepNumber - 1)} first.`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 3: Family Wallet / Real Vouchers */}
      <section className="glass-panel rounded-3xl p-6 border-2 border-white/20 shadow-2xl mb-8">
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-300 text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              card_giftcard
            </span>
            <h2 className="text-xl md:text-2xl font-extrabold text-white">
              Family Wallet & Partner Rewards
            </h2>
          </div>
          <span className="text-xs bg-amber-400/20 text-amber-300 border border-amber-300/30 px-3 py-1 rounded-full font-bold">
            Qatar Merchant Partners
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {userProfile.vouchers.map((v) => {
            const isJarir = v.id === 'v1';
            const isUnlocked = isJarir ? isRewardUnlocked : v.status === 'claimable';

            return (
              <div
                key={v.id}
                className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                  isUnlocked
                    ? 'bg-gradient-to-br from-amber-500/20 to-orange-600/20 border-amber-400 shadow-lg'
                    : 'bg-white/5 border-white/15 opacity-80'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-extrabold text-white text-lg border border-white/30">
                    {v.logoLetter}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-white">{v.partnerName}</h3>
                    <p className="text-xs text-amber-300 font-bold">{v.valueText}</p>
                  </div>
                </div>

                {isUnlocked ? (
                  claimedVoucherId === v.id ? (
                    <div className="bg-emerald-500/20 border border-emerald-400 text-emerald-300 p-2.5 rounded-xl text-center font-mono text-xs font-bold">
                      CODE: {v.code}
                    </div>
                  ) : (
                    <button
                      onClick={() => handleClaimVoucher(v.id)}
                      className="w-full py-2.5 bg-[#fd9d1a] hover:bg-amber-500 text-black font-extrabold text-xs rounded-xl shadow border border-white transition-colors cursor-pointer"
                    >
                      Reveal Voucher Barcode
                    </button>
                  )
                ) : (
                  <div
                    className="bg-black/40 p-2.5 rounded-xl text-center text-xs text-white/70 font-medium border border-white/10 flex items-center justify-center gap-1.5"
                    title={`Locked: Requires completing all 4 origami quests (${completedCount}/4 done)`}
                  >
                    <span className="material-symbols-outlined text-sm text-yellow-400">lock</span>
                    <span>Locked ({completedCount}/4 Quests Done)</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 4: Family Membership & One-Time Plans */}
      <section className="glass-panel rounded-3xl p-6 md:p-8 border-2 border-white/20 shadow-2xl mb-8 relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-400/20 border border-yellow-300/30 rounded-full text-yellow-300 text-xs font-black uppercase tracking-wider mb-2">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                diamond
              </span>
              One-Time Lifetime Membership
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold text-white flex items-center gap-2">
              Hiwaya Family Plans & Lifetime Access
            </h2>
            <p className="text-xs md:text-sm text-indigo-200 mt-0.5">
              Transparent one-time pricing. No recurring monthly or annual subscription fees for {userProfile.name}.
            </p>
          </div>

          <button
            onClick={() => {
              sound.playPop();
              onNavigate('pricing');
            }}
            className="btn-yellow-tactile px-4 py-2 rounded-2xl font-black text-xs flex items-center gap-1.5 shadow-md cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-sm">open_in_new</span>
            <span>View Full Pricing Page</span>
          </button>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Plan 1: Free Explorer */}
          <div className={`rounded-2xl p-6 border-2 transition-all flex flex-col justify-between ${
            !isUpgraded
              ? 'bg-white/10 border-white/30 shadow-lg'
              : 'bg-white/5 border-white/10 opacity-70'
          }`}>
            <div>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-1.5">
                    <span>Free Explorer</span>
                    <span>🆓</span>
                  </h3>
                  <p className="text-xs text-indigo-200">Automatic standard access</p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full font-black bg-white/10 text-white border border-white/20">
                  {!isUpgraded ? 'Current Active Plan' : 'Free Tier'}
                </span>
              </div>

              <div className="my-4 p-3.5 rounded-xl bg-black/20 border border-white/10">
                <span className="text-3xl font-black text-white">0 QAR</span>
                <span className="text-xs text-indigo-200 font-bold ml-1.5">/ Forever Free</span>
              </div>

              <div className="mb-4">
                <p className="text-[11px] font-black uppercase text-emerald-300 mb-2">Automatically includes:</p>
                <ul className="space-y-2 text-xs text-white/90">
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-emerald-400 text-sm shrink-0 mt-0.5">check_circle</span>
                    <span>Access to starter hobby modules (Origami, Crocheting)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-emerald-400 text-sm shrink-0 mt-0.5">check_circle</span>
                    <span>*Sequential gating & child safety screen limit controls</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-emerald-400 text-sm shrink-0 mt-0.5">check_circle</span>
                    <span>Standard partner rewards (1 voucher per completed path)</span>
                  </li>
                </ul>
              </div>

              <div className="pt-3 border-t border-white/10">
                <p className="text-[11px] font-black uppercase text-pink-300 mb-2">Not included in Free Explorer:</p>
                <ul className="space-y-1.5 text-xs text-white/50">
                  <li className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-pink-400/70 text-xs">close</span>
                    <span>Coach analysis & Coach mentoring</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-pink-400/70 text-xs">close</span>
                    <span>Live classes & Live mentor sessions</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-pink-400/70 text-xs">close</span>
                    <span>Photo/video evaluation & VIP events</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-5">
              {!isUpgraded ? (
                <div className="p-2.5 rounded-xl bg-white/10 text-center text-xs font-bold text-white/80 border border-white/10">
                  Active Free Plan
                </div>
              ) : (
                <div className="text-center text-xs text-white/60 py-1">
                  Included with Premium
                </div>
              )}
            </div>
          </div>

          {/* Plan 2: Premium — 75 QAR one-time payment */}
          <div className={`rounded-2xl p-6 border-3 transition-all flex flex-col justify-between relative overflow-hidden ${
            isUpgraded
              ? 'bg-emerald-950/60 border-emerald-400 shadow-2xl'
              : 'bg-indigo-950/90 border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.25)]'
          }`}>
            <div className="absolute top-3 right-3 bg-yellow-400 text-indigo-950 font-black text-[10px] px-2.5 py-0.5 rounded-full border border-white">
              ONE-TIME LIFETIME
            </div>

            <div>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-1.5">
                    <span>⭐ Premium</span>
                  </h3>
                  <p className="text-xs text-yellow-300 font-bold">Lifetime full platform & mentoring</p>
                </div>
              </div>

              <div className="my-4 p-3.5 rounded-xl bg-black/40 border border-yellow-400/30">
                <span className="text-3xl font-black text-yellow-300">75 QAR</span>
                <span className="text-xs text-yellow-200 font-black uppercase ml-2 bg-yellow-400/20 px-2 py-0.5 rounded">
                  One-Time Payment
                </span>
                <p className="text-[11px] text-white/80 mt-1">Single lifetime charge. No subscriptions.</p>
              </div>

              <div className="mb-4">
                <p className="text-[11px] font-black uppercase text-yellow-300 mb-2">Premium includes:</p>
                <ul className="space-y-2 text-xs text-white/95 font-medium">
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-yellow-400 text-sm shrink-0 mt-0.5">check_circle</span>
                    <span><strong>Everything in Free Explorer</strong></span>
                  </li>
                  <li className="flex items-start gap-2 bg-yellow-400/10 p-1.5 rounded-lg border border-yellow-400/20">
                    <span className="material-symbols-outlined text-yellow-300 text-sm shrink-0 mt-0.5">add_task</span>
                    <span><strong>1 additional hobby of choice</strong> (3 courses total included)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-yellow-400 text-sm shrink-0 mt-0.5">check_circle</span>
                    <span><strong>Coach mentoring & Live classes</strong> by mentors</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-yellow-400 text-sm shrink-0 mt-0.5">check_circle</span>
                    <span><strong>Instant multi-step coach evaluation</strong> using photos & videos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-yellow-400 text-sm shrink-0 mt-0.5">check_circle</span>
                    <span><strong>Guaranteed Jarir & Virgin Megastore</strong> stationery monthly vouchers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-yellow-400 text-sm shrink-0 mt-0.5">check_circle</span>
                    <span><strong>**Katara & Education City</strong> weekend workshop VIP invitations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-yellow-400 text-sm shrink-0 mt-0.5">check_circle</span>
                    <span><strong>Free hobby toolkits</strong></span>
                  </li>
                </ul>
              </div>

              {!isUpgraded && (
                <div className="p-3 bg-white/10 rounded-xl border border-white/20 mb-4">
                  <label className="block text-[11px] font-bold text-yellow-300 mb-1.5">
                    Select 1 complimentary hobby to include:
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {nonStarterCourses.map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          sound.playPop();
                          setSelectedFreeHobbyChoice(c.id);
                        }}
                        className={`p-1.5 rounded-lg text-center text-[10px] font-black border transition-all cursor-pointer ${
                          selectedFreeHobbyChoice === c.id
                            ? 'bg-yellow-400 text-indigo-950 border-white'
                            : 'bg-black/20 text-white/80 border-white/10'
                        }`}
                      >
                        {c.category}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-2">
              {isUpgraded ? (
                <div className="p-3 bg-emerald-500/30 border border-emerald-400 rounded-xl text-center font-black text-xs text-emerald-200 flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-base">verified</span>
                  Premium Active! Permanent Lifetime Access
                </div>
              ) : (
                <button
                  onClick={handleUpgradePlan}
                  className="w-full py-3 btn-yellow-tactile font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] transition-transform"
                >
                  <span className="material-symbols-outlined text-base">stars</span>
                  <span>Unlock Premium (75 QAR One-Time)</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Additional Hobbies Management Section (50 QAR each) */}
        <div className="p-5 bg-black/20 rounded-2xl border border-white/10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
            <div>
              <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
                <span>➕ Additional Hobbies</span>
                <span className="text-yellow-400 font-bold text-xs bg-yellow-400/20 px-2 py-0.5 rounded border border-yellow-400/30">
                  50 QAR each one-time
                </span>
              </h4>
              <p className="text-xs text-indigo-200">
                After purchasing Premium, each additional hobby course beyond the first 3 costs 50 QAR once.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {ALL_COURSES.map(course => {
              const isStarter = FREE_STARTER_COURSE_IDS.includes(course.id);
              const isChosenFreeHobby = isUpgraded && userProfile.selectedPremiumChoiceId === course.id;
              const isAlreadyUnlocked = unlockedCourses.includes(course.id);

              return (
                <div
                  key={course.id}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-2 ${
                    isAlreadyUnlocked
                      ? 'bg-emerald-950/40 border-emerald-400/40 text-emerald-200'
                      : 'bg-white/5 border-white/10 text-white/90'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="material-symbols-outlined text-lg shrink-0 text-yellow-300">
                      {course.iconName}
                    </span>
                    <div className="truncate">
                      <p className="text-xs font-black truncate text-white">{course.title}</p>
                      <p className="text-[10px] text-white/60">
                        {isStarter
                          ? 'Starter (Free)'
                          : isChosenFreeHobby
                          ? 'Included in 75 QAR'
                          : isAlreadyUnlocked
                          ? 'Permanently Unlocked'
                          : '50 QAR One-Time'}
                      </p>
                    </div>
                  </div>

                  {isAlreadyUnlocked ? (
                    <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-1 rounded-full shrink-0">
                      Active ✓
                    </span>
                  ) : isUpgraded ? (
                    <button
                      onClick={() => handleBuyAddon(course.id)}
                      className="text-[10px] font-black bg-yellow-400 hover:bg-yellow-300 text-indigo-950 px-2.5 py-1 rounded-lg shrink-0 shadow cursor-pointer transition-all"
                    >
                      +50 QAR
                    </button>
                  ) : (
                    <span className="text-[10px] text-white/50 shrink-0">
                      Requires Premium
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section 5: Learner Photo Moderation Queue & Community Gallery Controls */}
      <section className="glass-panel rounded-3xl p-6 md:p-8 border-2 border-white/20 shadow-2xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-400/20 border border-yellow-300/30 rounded-full text-yellow-300 text-xs font-black uppercase tracking-wider mb-2">
              <span className="material-symbols-outlined text-sm">verified_user</span>
              Parent Approval & Sharing Controls
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold text-white flex items-center gap-2">
              {userProfile.name}'s Photo Moderation & Portfolio
            </h2>
            <p className="text-xs md:text-sm text-indigo-200 mt-0.5">
              Learners cannot publish photos without your permission. Review submissions below to publish them to the community gallery.
            </p>
          </div>

          <button
            onClick={() => {
              sound.playPop();
              onNavigate('gallery');
            }}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-yellow-300 font-black text-xs flex items-center gap-1.5 border border-white/20 cursor-pointer shadow"
          >
            <span className="material-symbols-outlined text-sm">visibility</span>
            <span>View Public Gallery</span>
          </button>
        </div>

        {/* Moderation Metrics Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10 text-center">
            <span className="text-2xl font-black text-white">{alexCreations.length}</span>
            <p className="text-[11px] text-white/70 font-semibold mt-0.5">Total Uploads</p>
          </div>

          <div className={`p-3.5 rounded-2xl border text-center transition-all ${
            pendingCreations.length > 0
              ? 'bg-pink-500/20 border-pink-400 text-pink-300 shadow-[0_0_15px_rgba(244,114,182,0.3)]'
              : 'bg-white/5 border-white/10 text-white/60'
          }`}>
            <span className="text-2xl font-black">{pendingCreations.length}</span>
            <p className="text-[11px] font-bold mt-0.5">
              {pendingCreations.length > 0 ? '⚠️ Action Required' : 'Pending Review'}
            </p>
          </div>

          <div className="bg-emerald-500/10 border border-emerald-400/30 p-3.5 rounded-2xl text-center text-emerald-300">
            <span className="text-2xl font-black text-white">{publishedCreations.length}</span>
            <p className="text-[11px] font-bold mt-0.5">🌐 In Public Gallery</p>
          </div>

          <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10 text-center text-indigo-200">
            <span className="text-2xl font-black text-white">{privateCreations.length}</span>
            <p className="text-[11px] font-bold mt-0.5">🔒 Private Vault</p>
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => {
              sound.playPop();
              setModerationFilter('all');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              moderationFilter === 'all'
                ? 'bg-yellow-400 text-indigo-950 shadow'
                : 'bg-white/10 text-white/70 hover:text-white'
            }`}
          >
            All Uploads ({alexCreations.length})
          </button>

          <button
            onClick={() => {
              sound.playPop();
              setModerationFilter('pending');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              moderationFilter === 'pending'
                ? 'bg-pink-500 text-white shadow'
                : 'bg-white/10 text-pink-300 hover:text-white'
            }`}
          >
            <span>Pending Review</span>
            {pendingCreations.length > 0 && (
              <span className="bg-white text-pink-600 px-1.5 py-0.2 rounded-full text-[10px] font-black">
                {pendingCreations.length}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              sound.playPop();
              setModerationFilter('published');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              moderationFilter === 'published'
                ? 'bg-emerald-500 text-white shadow'
                : 'bg-white/10 text-white/70 hover:text-white'
            }`}
          >
            🌐 Published to Gallery ({publishedCreations.length})
          </button>

          <button
            onClick={() => {
              sound.playPop();
              setModerationFilter('private');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              moderationFilter === 'private'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-white/10 text-white/70 hover:text-white'
            }`}
          >
            🔒 Private Vault ({privateCreations.length})
          </button>
        </div>

        {/* Creation Cards List */}
        {displayedCreations.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
            <span className="material-symbols-outlined text-4xl text-white/40 mb-2">folder_open</span>
            <p className="text-sm font-bold text-white">No submissions found in this category.</p>
            <p className="text-xs text-indigo-200 mt-1">
              When {userProfile.name} submits a quest photo, it will appear here for parent verification.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {displayedCreations.map((creation) => {
              const isPending = !creation.isApprovedByParent;
              const isPublished = creation.isApprovedByParent && creation.publishedToGallery;

              return (
                <div
                  key={creation.id}
                  className={`rounded-3xl p-5 border-2 transition-all flex flex-col justify-between ${
                    isPending
                      ? 'bg-pink-950/30 border-pink-400/60 shadow-[0_0_20px_rgba(244,114,182,0.15)]'
                      : isPublished
                      ? 'bg-white/10 border-emerald-400/40'
                      : 'bg-white/5 border-white/15'
                  }`}
                >
                  <div>
                    {/* Top Status & Hobby Header */}
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-xs text-yellow-300 font-bold px-2.5 py-0.5 rounded-full bg-yellow-400/20 border border-yellow-400/30">
                        {creation.hobbyName}
                      </span>

                      {/* Status Tag */}
                      {isPending ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-pink-500 text-white flex items-center gap-1 shadow animate-pulse">
                          <span className="material-symbols-outlined text-xs">pending</span>
                          Pending Parent Action
                        </span>
                      ) : isPublished ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-white flex items-center gap-1 shadow">
                          <span className="material-symbols-outlined text-xs">public</span>
                          Published in Gallery
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-white/20 text-white/80 flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">lock</span>
                          Private to Family
                        </span>
                      )}
                    </div>

                    {/* Image & Title Info */}
                    <div className="flex gap-4 items-start mb-4">
                      <div
                        onClick={() => setSelectedCreation(creation)}
                        className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden shrink-0 bg-black/40 border border-white/30 cursor-pointer group relative shadow-md"
                      >
                        <img
                          src={creation.imageUrl}
                          alt={creation.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <span className="material-symbols-outlined text-2xl">zoom_in</span>
                        </div>
                      </div>

                      <div className="flex-1">
                        <h3 className="font-extrabold text-base text-white leading-snug">{creation.title}</h3>
                        <p className="text-[11px] text-indigo-200 mt-0.5">Uploaded {creation.uploadedAt}</p>

                        <div className="mt-2 p-2 rounded-xl bg-black/30 border border-white/10 text-xs text-white/90">
                          <p className="text-[10px] font-black text-yellow-300 uppercase tracking-wider mb-0.5">
                            Coach Spark Feedback:
                          </p>
                          <p className="italic text-[11px] text-white/80 line-clamp-2">
                            "{creation.aiFeedback}"
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Parent Note Display or Input */}
                    {editingNoteCreationId === creation.id ? (
                      <div className="p-3 bg-pink-500/20 rounded-2xl border border-pink-400/50 mb-3 space-y-2">
                        <label className="text-xs font-black text-pink-200 block">
                          Add Parent Note / Words of Encouragement:
                        </label>
                        <textarea
                          value={noteInputText}
                          onChange={(e) => setNoteInputText(e.target.value)}
                          placeholder="e.g. So proud of Alex's neat folding technique! ❤️"
                          rows={2}
                          className="w-full bg-black/40 border border-pink-300/40 rounded-xl p-2 text-xs text-white placeholder-pink-200/50 focus:outline-none focus:border-pink-400"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditingNoteCreationId(null)}
                            className="px-3 py-1 rounded-lg bg-white/10 text-xs font-bold text-white hover:bg-white/20"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveNote(creation.id)}
                            className="px-3 py-1 rounded-lg bg-pink-500 text-xs font-black text-white hover:bg-pink-600 shadow"
                          >
                            Save Note
                          </button>
                        </div>
                      </div>
                    ) : (
                      creation.parentNote && (
                        <div className="p-2.5 bg-pink-500/10 rounded-2xl border border-pink-400/30 text-xs text-pink-200 mb-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-pink-300 text-sm">favorite</span>
                            <span className="italic text-[11px]">"{creation.parentNote}"</span>
                          </div>
                          <button
                            onClick={() => handleStartEditNote(creation)}
                            className="text-[10px] text-pink-300 hover:text-white underline cursor-pointer"
                          >
                            Edit
                          </button>
                        </div>
                      )
                    )}
                  </div>

                  {/* Parent Control Action Buttons */}
                  <div className="space-y-2 pt-3 border-t border-white/10">
                    {/* Primary Moderation Action */}
                    {isPending ? (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => {
                            sound.playFanfare();
                            if (onToggleApproveCreation) {
                              onToggleApproveCreation(creation.id);
                            }
                          }}
                          className="flex-1 py-2.5 px-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-lg cursor-pointer transition-transform hover:scale-[1.02]"
                        >
                          <span className="material-symbols-outlined text-sm">check_circle</span>
                          <span>Approve & Publish to Gallery</span>
                        </button>

                        <button
                          onClick={() => {
                            sound.playPop();
                            if (onTogglePublishGallery) {
                              onTogglePublishGallery(creation.id);
                            }
                          }}
                          className="py-2.5 px-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">lock</span>
                          <span>Keep Private</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-3 bg-black/20 p-2.5 rounded-2xl border border-white/10">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm text-yellow-300">share</span>
                          <span className="text-xs font-bold text-white">Publish to Gallery:</span>
                        </div>

                        {/* Toggle switch */}
                        <button
                          onClick={() => {
                            sound.playPop();
                            if (onTogglePublishGallery) {
                              onTogglePublishGallery(creation.id);
                            }
                          }}
                          className={`w-12 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                            creation.publishedToGallery ? 'bg-emerald-500' : 'bg-gray-600'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-full bg-white transition-transform ${
                              creation.publishedToGallery ? 'translate-x-6' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    )}

                    {/* Secondary Actions: Add Note & WhatsApp Card */}
                    <div className="flex items-center justify-between text-xs pt-1">
                      {!creation.parentNote && editingNoteCreationId !== creation.id && (
                        <button
                          onClick={() => handleStartEditNote(creation)}
                          className="text-pink-300 hover:text-white font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-xs">add_comment</span>
                          <span>+ Add Parent Praise Note</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          sound.playChime();
                          setActiveShareCreation(creation);
                          setShowShareModal(true);
                        }}
                        className="ml-auto text-yellow-300 hover:text-white font-black flex items-center gap-1 bg-yellow-400/20 hover:bg-yellow-400/30 px-3 py-1 rounded-lg border border-yellow-300/40 cursor-pointer transition-all"
                      >
                        <span className="material-symbols-outlined text-sm">photo_camera</span>
                        <span>WhatsApp Card</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Floating WhatsApp Community FAB */}
      <button
        onClick={() => {
          sound.playPop();
          setShowWhatsAppModal(true);
        }}
        className="fixed bottom-6 right-6 z-40 btn-tactile bg-[#25D366] hover:bg-emerald-600 text-white font-extrabold py-3.5 px-5 rounded-full border-2 border-white shadow-2xl flex items-center gap-2.5 cursor-pointer text-sm"
      >
        <span className="material-symbols-outlined text-xl">forum</span>
        <span>Qatar Parents Community (2.4k)</span>
      </button>

      {/* Shareable Achievement Card Modal for Parents */}
      <ShareableAchievementCardModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        userProfile={userProfile}
        companion={COMPANIONS[0]}
        latestCreation={activeShareCreation || creations[0]}
        courseId="origami"
        aiFeedbackText={activeShareCreation?.aiFeedback}
      />

      {/* WhatsApp Community Modal */}
      {showWhatsAppModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-bounce-in">
          <div className="bg-[#1e293b] border-4 border-emerald-400/80 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl text-white flex flex-col gap-5 text-center">
            <div className="w-16 h-16 rounded-full bg-[#25D366] mx-auto flex items-center justify-center text-white text-3xl shadow-lg">
              <span className="material-symbols-outlined text-4xl">groups</span>
            </div>

            <div>
              <h3 className="text-2xl font-extrabold">Hiwaya Parents Club</h3>
              <p className="text-xs text-white/70 mt-1">
                Connect with 2,400+ parents in Doha & Qatar. Share weekend workshop dates, craft ideas, and swap vouchers!
              </p>
            </div>

            <div className="p-3 bg-white/10 rounded-2xl text-xs space-y-1.5 text-left border border-white/20">
              <div className="flex items-center gap-2 text-emerald-300 font-bold">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                Moderated safe community
              </div>
              <div className="flex items-center gap-2 text-emerald-300 font-bold">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                Weekly weekend craft meetups in Katara & Education City
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowWhatsAppModal(false)}
                className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl"
              >
                Close
              </button>
              <button
                onClick={() => {
                  sound.playChime();
                  window.open('https://chat.whatsapp.com/', '_blank');
                  setShowWhatsAppModal(false);
                }}
                className="flex-1 py-3 bg-[#25D366] hover:bg-emerald-600 text-white font-extrabold rounded-xl border border-white"
              >
                Join WhatsApp Group
              </button>
            </div>
          </div>
        </div>
      )}

      {/* High-res Image Preview Modal */}
      {selectedCreation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          onClick={() => setSelectedCreation(null)}
        >
          <div className="max-w-2xl w-full bg-[#1e293b] p-4 rounded-3xl border-4 border-white/30 shadow-2xl flex flex-col gap-3">
            <div className="flex justify-between items-center text-white pb-2 border-b border-white/10">
              <h3 className="font-extrabold text-lg">{selectedCreation.title}</h3>
              <button
                onClick={() => setSelectedCreation(null)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white"
              >
                ✕
              </button>
            </div>
            <div className="w-full max-h-[65vh] rounded-2xl overflow-hidden bg-black flex items-center justify-center">
              <img
                src={selectedCreation.imageUrl}
                alt={selectedCreation.title}
                className="max-h-[65vh] w-auto object-contain"
              />
            </div>
            <div className="p-3 bg-white/5 rounded-xl text-xs text-white/90">
              <p className="font-bold text-amber-300 mb-0.5">Feedback from {selectedCreation.coachName}:</p>
              <p className="italic">{selectedCreation.aiFeedback}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
