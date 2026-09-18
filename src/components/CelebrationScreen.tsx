import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { ALL_COURSES } from '../data/mockData';
import { AppScreen, Companion, CreationUpload, HobbyCourse, MapNode, UserProfile } from '../types';
import { sound } from '../utils/audio';
import { ShareableAchievementCardModal } from './ShareableAchievementCardModal';
import { TellParentModal } from './TellParentModal';

interface CelebrationScreenProps {
  userProfile: UserProfile;
  companion: Companion;
  onNavigate: (screen: AppScreen) => void;
  aiFeedbackText?: string;
  isRewardUnlocked: boolean;
  completedCount: number;
  totalModulesCount: number;
  activeModule?: MapNode;
  allModules?: MapNode[];
  creations?: CreationUpload[];
  selectedCourseId?: string;
  onSelectModule?: (moduleId: string) => void;
}

export const CelebrationScreen: React.FC<CelebrationScreenProps> = ({
  userProfile,
  companion,
  onNavigate,
  aiFeedbackText,
  isRewardUnlocked,
  completedCount,
  totalModulesCount = 4,
  activeModule,
  allModules = [],
  creations = [],
  selectedCourseId = 'origami',
  onSelectModule
}) => {
  const [showTellParentModal, setShowTellParentModal] = useState(false);
  const [showShareCardModal, setShowShareCardModal] = useState(false);
  const [claimedVoucher, setClaimedVoucher] = useState(false);

  const currentCourse: HobbyCourse =
    ALL_COURSES.find((c) => c.id === selectedCourseId) || ALL_COURSES[0];

  const latestCreation = creations.length > 0 ? creations[0] : undefined;

  // Trigger high-energy confetti shower on mount ONLY if reward is actually unlocked!
  useEffect(() => {
    if (isRewardUnlocked) {
      sound.playFanfare();

      const end = Date.now() + 3 * 1000;
      const colors = ['#fd9d1a', '#0058bd', '#ec4899', '#ffe171', '#10b981', '#a855f7'];

      (function frame() {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
    }
  }, [isRewardUnlocked]);

  const handleConfettiBlast = () => {
    if (!isRewardUnlocked) {
      sound.playPop();
      return;
    }
    sound.playChime();
    confetti({
      particleCount: 60,
      spread: 90,
      origin: { y: 0.6 }
    });
  };

  const handleClaimVoucher = () => {
    sound.playChime();
    setClaimedVoucher(true);
    handleConfettiBlast();
  };

  const progressPercent = Math.min(100, Math.round((completedCount / totalModulesCount) * 100));

  // If reward is NOT unlocked yet: Display Padlock Gated Screen
  if (!isRewardUnlocked) {
    return (
      <div className="relative min-h-[calc(100vh-80px)] flex flex-col items-center justify-center p-4 md:p-8 z-10 pb-36 max-w-4xl mx-auto">
        <div className="w-full bg-white/10 backdrop-blur-2xl rounded-[40px] border-2 border-white/20 p-6 md:p-10 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Big Glowing Padlock Icon */}
          <div className="relative mb-6">
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-3xl bg-indigo-900/90 border-4 border-yellow-400/80 shadow-[0_0_40px_rgba(250,204,21,0.3)] flex items-center justify-center text-yellow-300">
              <span className="material-symbols-outlined text-5xl md:text-6xl font-black">
                lock
              </span>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-amber-400 text-indigo-950 px-3 py-0.5 rounded-full font-black text-xs border border-white shadow">
              LOCKED
            </div>
          </div>

          <div className="inline-flex items-center gap-2 bg-yellow-400/20 text-yellow-300 px-4 py-1.5 rounded-full border border-yellow-300/30 text-xs font-black uppercase tracking-wider mb-3">
            <span className="material-symbols-outlined text-sm">lock_clock</span>
            Prerequisite Gated Reward
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight drop-shadow-md mb-2">
            Reward Vault is Locked
          </h1>

          <p className="text-sm md:text-base text-indigo-200 max-w-lg mb-6 font-medium">
            The <strong className="text-yellow-300">Crane Creator Master Badge</strong> and <strong className="text-yellow-300">QAR 10 Jarir Bookstore Voucher</strong> are only unlocked once you complete all 4 Origami Quests!
          </p>

          {/* Progress Bar Card */}
          <div className="w-full max-w-md bg-black/30 p-4 rounded-2xl border border-white/10 mb-8 space-y-2 text-left">
            <div className="flex justify-between items-center text-xs font-black text-white">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-yellow-300">flag</span>
                Prerequisite Progress
              </span>
              <span className="text-yellow-300">{completedCount} of {totalModulesCount} Quests Finished ({progressPercent}%)</span>
            </div>
            <div className="h-4 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/20">
              <div
                className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full transition-all duration-700 shadow-md"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* 4 Quests Prerequisite Checklist */}
          <div className="w-full max-w-lg space-y-2.5 mb-8 text-left">
            {allModules.filter(m => m.stepNumber <= 4).map((mod) => {
              const isDone = mod.status === 'completed';
              const isActive = mod.status === 'active';
              return (
                <div
                  key={mod.id}
                  onClick={() => {
                    if (isActive || isDone) {
                      sound.playPop();
                      if (onSelectModule) onSelectModule(mod.id);
                      onNavigate('project-module');
                    }
                  }}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                    isDone
                      ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-200 cursor-pointer hover:bg-emerald-500/30'
                      : isActive
                      ? 'bg-indigo-600/40 border-yellow-400/80 text-white shadow-lg cursor-pointer hover:scale-[1.02]'
                      : 'bg-white/5 border-white/10 text-white/50 cursor-not-allowed'
                  }`}
                  title={!isDone && !isActive ? `Complete Previous Quest: ${mod.prerequisiteTitle || 'Prior step'}` : undefined}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                        isDone
                          ? 'bg-emerald-500 text-white'
                          : isActive
                          ? 'bg-yellow-400 text-indigo-950 animate-pulse'
                          : 'bg-white/10 text-white/40'
                      }`}
                    >
                      {isDone ? (
                        <span className="material-symbols-outlined text-base">check</span>
                      ) : isActive ? (
                        '▶'
                      ) : (
                        <span className="material-symbols-outlined text-sm">lock</span>
                      )}
                    </div>
                    <div>
                      <h4 className={`text-xs md:text-sm font-bold ${isDone ? 'line-through text-white/70' : 'text-white'}`}>
                        Module {mod.stepNumber}: {mod.title}
                      </h4>
                      <p className="text-[11px] text-white/60">
                        {isDone
                          ? '✓ Verified & Finished'
                          : isActive
                          ? '👉 Current Active Quest • Ready to complete!'
                          : `🔒 Complete Previous Quest: ${mod.prerequisiteTitle || 'Module ' + (mod.stepNumber - 1)}`}
                      </p>
                    </div>
                  </div>

                  {isActive && (
                    <span className="text-[10px] font-black uppercase bg-yellow-400 text-indigo-950 px-2.5 py-1 rounded-full shadow shrink-0">
                      Resume
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Blurred Locked Voucher Preview */}
          <div className="w-full max-w-lg bg-white/5 border-2 border-dashed border-white/20 rounded-3xl p-5 mb-8 relative overflow-hidden">
            <div className="filter blur-[3px] select-none opacity-40">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-white">Jarir Bookstore Voucher</span>
                <span className="bg-yellow-400 text-black px-2 py-0.5 rounded text-xs font-black">QAR 10</span>
              </div>
              <div className="bg-black/30 p-2 rounded text-xs font-mono text-center">CODE: JARIR-XXXX-XXXX</div>
            </div>

            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-indigo-950/70 backdrop-blur-[2px]">
              <span className="material-symbols-outlined text-yellow-300 text-2xl mb-1">lock</span>
              <span className="text-xs font-black text-white">Reward Voucher 🔒</span>
              <span className="text-[11px] text-indigo-200">Finish Module 4 to unlock all quests</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
            <button
              onClick={() => {
                sound.playPop();
                onNavigate('adventure-map');
              }}
              className="flex-1 py-4 px-6 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-black text-sm border border-white/20 cursor-pointer transition-all"
            >
              🗺️ Quest Map
            </button>

            {activeModule && (
              <button
                onClick={() => {
                  sound.playPop();
                  if (onSelectModule) onSelectModule(activeModule.id);
                  onNavigate('project-module');
                }}
                className="flex-1 btn-yellow-tactile py-4 px-6 rounded-2xl font-black text-sm uppercase tracking-tight flex items-center justify-center gap-2 cursor-pointer shadow-xl"
              >
                <span>Complete Quest {activeModule.stepNumber}</span>
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // If reward IS unlocked: Display Celebratory Screen
  return (
    <div className="relative min-h-[calc(100vh-80px)] flex flex-col items-center justify-center p-4 md:p-8 z-10 pb-36">
      <div className="max-w-4xl w-full flex flex-col items-center gap-8 py-4">
        {/* Top Hero Animation Area */}
        <div className="text-center space-y-4 w-full animate-bounce-in">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-4 py-1 rounded-full border border-emerald-400/40 text-xs font-black uppercase tracking-wider">
            <span className="material-symbols-outlined text-sm">verified</span>
            All 4 Quests Completed!
          </div>

          <h1 className="text-3xl md:text-6xl font-black text-white tracking-tight drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] uppercase italic">
            Mission Accomplished!
          </h1>

          {/* XP Gain Pill */}
          <div className="inline-flex items-center gap-2 bg-yellow-400 text-indigo-950 px-6 py-2 rounded-full border-2 border-white font-black text-lg md:text-xl shadow-[0_4px_0_0_#a16207] animate-bounce">
            <span className="material-symbols-outlined text-2xl font-black" style={{ fontVariationSettings: "'FILL' 1" }}>
              stars
            </span>
            <span>+500 Master Bonus XP</span>
          </div>
        </div>

        {/* 3D Badge Reveal Section */}
        <div className="relative flex flex-col items-center my-2 group">
          {/* Sparkles / Aura behind badge */}
          <div className="absolute -inset-10 bg-gradient-to-r from-yellow-400/30 via-pink-500/30 to-indigo-500/30 rounded-full blur-2xl animate-pulse-glow" />

          <div
            onClick={handleConfettiBlast}
            className="relative w-48 h-48 md:w-56 md:h-56 rounded-[32px] bg-gradient-to-tr from-yellow-400/30 via-white/10 to-indigo-500/30 border-4 border-yellow-300 p-3 shadow-2xl flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
            title="Click for more confetti!"
          >
            <div className="w-full h-full rounded-2xl overflow-hidden bg-black/20 flex items-center justify-center relative">
              <img
                src={
                  currentCourse.badgeIconUrl ||
                  'https://lh3.googleusercontent.com/aida-public/AB6AXuCQn7rgfuFAI6vF6dm2xbm-Wj7-Oaz2qUCH2TF-PyS3gXlW0gdSgUQIXgka-Af06EHYdStH6JK6xf6qzdZDujNX34Dl8AiLzsCBCzNbF_cxR-pnJoG-N50SqOOfpqAR5nfAOhQAX2v6TXFrlJA_7ZJ_mYQdXw1PQYazFgFXw6noBUYhPRWH1oZqjcyfyy_N1lJnC5pMCbzFvrPBWgi7YXQouoLXkLwaonbYZiMnBoAxllK4A2qQVfu-mg'
                }
                alt={`${currentCourse.badgeName} Badge`}
                className="w-full h-full object-contain p-2 filter drop-shadow-xl"
              />

              <div className="absolute top-2 left-2 bg-yellow-400 text-indigo-950 font-black text-[11px] px-2.5 py-0.5 rounded-full border border-white shadow">
                UNLOCKED BADGE
              </div>
            </div>
          </div>

          <h2 className="mt-4 text-2xl md:text-3xl font-black text-white tracking-wide drop-shadow-md">
            {currentCourse.badgeName}
          </h2>
          <span className="text-sm text-yellow-300 font-bold">
            {currentCourse.category} Tier 1 • Certified
          </span>
        </div>

        {/* Share with Parents / WhatsApp GC Highlight Banner */}
        <div className="w-full bg-gradient-to-r from-emerald-900/50 via-indigo-950/60 to-purple-950/50 backdrop-blur-xl p-5 md:p-6 rounded-[32px] border-2 border-emerald-400/50 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-5 relative overflow-hidden">
          <div className="flex items-center gap-4 text-left">
            <div className="w-14 h-14 rounded-2xl bg-[#25D366] text-white flex items-center justify-center font-black shrink-0 shadow-lg border-2 border-white/30">
              <span className="material-symbols-outlined text-3xl">forum</span>
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-300 uppercase tracking-wider mb-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Parents & Family Share
              </div>
              <h3 className="text-lg md:text-xl font-black text-white">
                Share Milestone to WhatsApp Group
              </h3>
              <p className="text-xs text-indigo-200 mt-0.5">
                Generate an official canvas achievement card with {userProfile.name}'s project photo & coach review!
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playChime();
              setShowShareCardModal(true);
            }}
            className="w-full sm:w-auto btn-tactile bg-[#25D366] hover:bg-emerald-500 text-white font-black py-3.5 px-6 rounded-2xl border-2 border-white/40 shadow-xl flex items-center justify-center gap-2.5 text-sm uppercase tracking-tight cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-xl">photo_camera</span>
            <span>Create Share Card</span>
          </button>
        </div>

        {/* Rewards & Feedback Grid (Bento Style) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full">
          {/* Reward Voucher Card */}
          <div className="bg-white/10 backdrop-blur-xl p-5 md:p-6 rounded-[32px] border border-white/20 shadow-2xl flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-28 h-28 bg-yellow-400/10 rounded-full blur-xl pointer-events-none" />

            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-yellow-300 text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  redeem
                </span>
                <h3 className="font-black text-lg text-white uppercase tracking-tight flex items-center gap-2">
                  <span>Reward Voucher</span>
                  <span className="text-base">🔒</span>
                </h3>
              </div>

              <div className="inline-flex items-center gap-1.5 bg-yellow-400/20 text-yellow-300 px-3 py-1 rounded-full text-xs font-black uppercase mb-3 border border-yellow-400/30">
                <span className="material-symbols-outlined text-sm">lock</span>
                MVP Feature Status
              </div>

              <p className="text-sm md:text-base text-white/95 font-bold mb-2 leading-snug">
                🎉 Congratulations! You've completed all the quests.
              </p>

              <p className="text-xs text-white/80 font-medium mb-3 leading-relaxed">
                Earned path reward: <span className="text-yellow-300 font-black">{currentCourse.voucherValue}</span> for {currentCourse.voucherPartner}.
              </p>
            </div>

            <div className="pt-2">
              <div className="bg-black/30 border border-white/20 rounded-2xl p-4 text-center space-y-1.5 shadow-inner">
                <div className="flex items-center justify-center gap-1.5 text-xs font-black text-amber-300">
                  <span className="material-symbols-outlined text-sm">lock</span>
                  <span>Voucher redemption isn't available in this MVP yet.</span>
                </div>
                <p className="text-[11px] text-white/70 font-medium">
                  This feature will be available in a future version.
                </p>
              </div>
            </div>
          </div>

          {/* Coach Feedback Card */}
          <div className="bg-white/10 backdrop-blur-xl p-5 md:p-6 rounded-[32px] border border-white/20 shadow-2xl flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-28 h-28 bg-purple-500/10 rounded-full blur-xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-indigo-950 text-xs font-black shadow">
                    ⭐
                  </div>
                  <h3 className="font-black text-lg text-white">
                    Coach Review
                  </h3>
                </div>
                <span className="text-[10px] bg-indigo-500/30 text-indigo-200 px-2.5 py-0.5 rounded-full font-black uppercase">
                  Verified
                </span>
              </div>

              <blockquote className="text-sm md:text-base text-white/95 italic font-medium p-3.5 bg-black/20 rounded-2xl border border-white/10 leading-relaxed">
                {aiFeedbackText || `"${userProfile.name}, you conquered every folding challenge and mastered the Japanese Peace Crane with outstanding precision! 🌟"`}
              </blockquote>
            </div>

            <div className="mt-3 flex items-center gap-2 text-xs text-white/70">
              <span className="material-symbols-outlined text-emerald-400 text-sm">check_circle</span>
              <span>Saved to {userProfile.name}'s Creative Portfolio</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl mt-2">
          <button
            onClick={() => {
              sound.playChime();
              setShowShareCardModal(true);
            }}
            className="flex-1 btn-tactile bg-[#25D366] hover:bg-emerald-600 text-white font-black py-4 px-6 rounded-2xl border-2 border-white/40 shadow-xl flex items-center justify-center gap-2.5 text-base cursor-pointer transition-all"
          >
            <span className="material-symbols-outlined text-2xl">photo_camera</span>
            <span>WhatsApp Image Card</span>
          </button>

          <button
            onClick={() => {
              sound.playPop();
              setShowTellParentModal(true);
            }}
            className="flex-1 bg-white/20 hover:bg-white/30 text-white font-black py-4 px-6 rounded-2xl border border-white/30 shadow-lg flex items-center justify-center gap-2.5 text-base cursor-pointer transition-all"
          >
            <span className="material-symbols-outlined text-2xl text-pink-300">favorite</span>
            <span>Tell Mom/Dad</span>
          </button>

          <button
            onClick={() => {
              sound.playPop();
              onNavigate('adventure-map');
            }}
            className="flex-1 btn-yellow-tactile py-4 px-6 rounded-2xl font-black text-base flex items-center justify-center gap-2.5 shadow-xl cursor-pointer"
          >
            <span>Back to Map</span>
            <span className="material-symbols-outlined text-2xl">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Floating monster mascot in bottom-left */}
      <div className="fixed bottom-6 left-6 z-40 flex items-end gap-3 hidden sm:flex pointer-events-auto">
        <button
          onClick={handleConfettiBlast}
          className="w-20 h-20 rounded-3xl overflow-hidden border-4 border-white shadow-2xl bg-pink-500 hover:scale-110 transition-transform cursor-pointer block-shadow"
          title="Click to celebrate!"
        >
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCeWHSRq9i0byDV6ecDwYewqmYbiqimUupvkYmxKcBEUQ6VcWJF1pttj6-eiCLwBKMdf0W5XOccV9si9oLX2oKnhC63PoA0MYZi2TYeL1Ly9_9sLqbdDsCbL1w8TIh3gW-idzstvCCYSfzR79jU4K_kVYykOlVuMJNTTeeh2LqlykcMQMcVknGobUnErfRApJxPlI44GJ1j1Zjpbb1dgu6OB2CcwCz_dDdpGjWK3V_FEtWbgAIQQZZFWw"
            alt="Mascot"
            className="w-full h-full object-cover"
          />
        </button>

        <div className="glass-panel p-3.5 rounded-2xl rounded-bl-none border border-white/30 text-white max-w-xs shadow-xl character-bubble mb-3 animate-bounce-in">
          <p className="text-xs md:text-sm font-bold">
            Wow! You unlocked the {currentCourse.badgeName} and the {currentCourse.voucherValue} voucher! 🚀
          </p>
        </div>
      </div>

      {/* Tell Mom/Dad Modal */}
      <TellParentModal
        isOpen={showTellParentModal}
        onClose={() => setShowTellParentModal(false)}
        userProfile={userProfile}
        voucher={userProfile.vouchers[0]}
        onOpenCardGenerator={() => {
          setShowTellParentModal(false);
          setShowShareCardModal(true);
        }}
      />

      {/* Shareable Achievement Card Generator Modal (HTML5 Canvas) */}
      <ShareableAchievementCardModal
        isOpen={showShareCardModal}
        onClose={() => setShowShareCardModal(false)}
        userProfile={userProfile}
        companion={companion}
        latestCreation={latestCreation}
        courseId={selectedCourseId}
        aiFeedbackText={aiFeedbackText}
      />
    </div>
  );
};

