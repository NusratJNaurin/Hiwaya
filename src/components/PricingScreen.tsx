import React, { useState } from 'react';
import { ALL_COURSES, FREE_STARTER_COURSE_IDS, PREMIUM_ONE_TIME_PRICE_QAR, ADDITIONAL_HOBBY_PRICE_QAR } from '../data/mockData';
import { AppScreen, UserProfile } from '../types';
import { sound } from '../utils/audio';
import { PremiumPaywallModal } from './PremiumPaywallModal';

interface PricingScreenProps {
  userProfile: UserProfile;
  onNavigate: (screen: AppScreen) => void;
  onUpgradeToPremium?: (chosenHobbyId?: string) => void;
  onUnlockAdditionalHobby?: (hobbyId: string) => void;
  onOpenParentPin?: () => void;
}

export const PricingScreen: React.FC<PricingScreenProps> = ({
  userProfile,
  onNavigate,
  onUpgradeToPremium,
  onUnlockAdditionalHobby,
  onOpenParentPin
}) => {
  const isCurrentlyPremium = userProfile.membershipPlan === 'premium';
  const isTeen = userProfile.userRole === 'learner_teen' || userProfile.ageGroup === 'teen_13_plus';
  const unlockedCourses = userProfile.unlockedCourseIds || FREE_STARTER_COURSE_IDS;

  // Selected 1 included hobby with Premium (for non-starter hobbies)
  const nonStarterCourses = ALL_COURSES.filter(c => !FREE_STARTER_COURSE_IDS.includes(c.id));
  
  // Default selected 1 additional included hobby if not already chosen
  const [selectedFreeHobbyId, setSelectedFreeHobbyId] = useState<string>(
    userProfile.selectedPremiumChoiceId || (nonStarterCourses[0]?.id || 'painting')
  );

  // Selected additional hobbies for the checkout calculator (+50 QAR each)
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [showPaywallModal, setShowPaywallModal] = useState(false);
  const [paywallTargetTitle, setPaywallTargetTitle] = useState('Hiwaya Premium');
  const [activeTab, setActiveTab] = useState<'plans' | 'comparison' | 'faq'>('plans');

  // Courses beyond the 3 included (2 starter + 1 chosen)
  const remainingCoursesForAddons = nonStarterCourses.filter(c => c.id !== selectedFreeHobbyId);

  const toggleAddonCourse = (courseId: string) => {
    sound.playPop();
    if (selectedAddons.includes(courseId)) {
      setSelectedAddons(selectedAddons.filter(id => id !== courseId));
    } else {
      setSelectedAddons([...selectedAddons, courseId]);
      sound.playChime();
    }
  };

  const calculateTotal = () => {
    if (isCurrentlyPremium) {
      return selectedAddons.length * ADDITIONAL_HOBBY_PRICE_QAR;
    }
    return PREMIUM_ONE_TIME_PRICE_QAR + (selectedAddons.length * ADDITIONAL_HOBBY_PRICE_QAR);
  };

  const handlePurchasePremium = () => {
    sound.playPop();
    const chosen = ALL_COURSES.find(c => c.id === selectedFreeHobbyId);
    setPaywallTargetTitle(chosen ? chosen.title : 'Hiwaya Premium');
    setShowPaywallModal(true);
  };

  const handlePurchaseSingleAddon = (courseId: string) => {
    sound.playPop();
    const chosen = ALL_COURSES.find(c => c.id === courseId);
    setPaywallTargetTitle(chosen ? chosen.title : 'Hiwaya Premium');
    setShowPaywallModal(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 relative pb-36">
      {/* Top Navigation Row */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => {
            sound.playPop();
            onNavigate('adventure-map');
          }}
          className="btn-yellow-tactile px-5 py-2.5 rounded-2xl font-black text-sm flex items-center gap-2 shadow-lg cursor-pointer"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          <span>Back to Quest Map</span>
        </button>

        {!isTeen && (
          <button
            onClick={() => {
              sound.playPop();
              if (userProfile.userRole === 'parent') {
                onNavigate('parent-hub');
              } else if (onOpenParentPin) {
                onOpenParentPin();
              } else {
                onNavigate('parent-hub');
              }
            }}
            className="bg-white/10 hover:bg-white/20 text-indigo-100 px-4 py-2 rounded-2xl font-bold text-xs flex items-center gap-1.5 border border-white/20 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-base text-pink-300">family_restroom</span>
            <span>Parent Hub</span>
          </button>
        )}
      </div>

      {/* Intentional MVP Paywall Notification Banner */}
      <div className="mb-8 bg-indigo-950/90 border-2 border-yellow-400 text-white p-5 rounded-3xl shadow-2xl backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-yellow-400/20 border border-yellow-400 flex items-center justify-center text-2xl shrink-0 text-yellow-300">
            <span className="material-symbols-outlined">lock</span>
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-yellow-300 mb-0.5">
              <span>🔒 Premium Course Catalog</span>
            </div>
            <h3 className="text-base md:text-lg font-black text-white">
              This course is part of Hiwaya Premium.
            </h3>
            <p className="text-xs md:text-sm text-yellow-200/90 font-medium">
              Premium access is not currently available in this MVP. This demo does not process real payments.
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            sound.playPop();
            onNavigate('adventure-map');
          }}
          className="px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-indigo-950 font-black text-xs md:text-sm rounded-2xl shadow-md cursor-pointer shrink-0"
        >
          Explore Free Quests →
        </button>
      </div>

      {/* Header Banner */}
      <div className="text-center space-y-3 mb-10">
        <div className="inline-flex items-center gap-2 bg-yellow-400 text-indigo-950 px-5 py-1.5 rounded-full border-2 border-white font-black text-xs md:text-sm shadow-md">
          <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
            workspace_premium
          </span>
          Transparent One-Time Pricing • No Subscriptions
        </div>

        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight drop-shadow-md">
          Hiwaya Family Plans
        </h1>

        <p className="text-sm md:text-lg text-indigo-100 max-w-2xl mx-auto font-medium">
          Choose between our permanent <strong className="text-white">Free Explorer</strong> tier or upgrade to <strong className="text-yellow-300">Premium</strong> for a single one-time payment of 75 QAR. No recurring monthly or annual charges.
        </p>

        {/* View Toggle Tabs */}
        <div className="flex justify-center items-center gap-2 pt-2">
          <div className="inline-flex bg-black/30 p-1 rounded-2xl border border-white/15 backdrop-blur-xl">
            <button
              onClick={() => {
                sound.playPop();
                setActiveTab('plans');
              }}
              className={`px-5 py-2 rounded-xl text-xs md:text-sm font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'plans'
                  ? 'bg-yellow-400 text-indigo-950 shadow-md'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-sm">view_carousel</span>
              <span>Plans & Pricing</span>
            </button>
            <button
              onClick={() => {
                sound.playPop();
                setActiveTab('comparison');
              }}
              className={`px-5 py-2 rounded-xl text-xs md:text-sm font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'comparison'
                  ? 'bg-yellow-400 text-indigo-950 shadow-md'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-sm">compare_arrows</span>
              <span>Feature Comparison</span>
            </button>
            <button
              onClick={() => {
                sound.playPop();
                setActiveTab('faq');
              }}
              className={`px-5 py-2 rounded-xl text-xs md:text-sm font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'faq'
                  ? 'bg-yellow-400 text-indigo-950 shadow-md'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-sm">help</span>
              <span>Parent FAQ</span>
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'plans' && (
        <>
          {/* Main Two Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
            
            {/* PLAN 1: Free Explorer — 0 QAR */}
            <div className={`bg-white/10 backdrop-blur-xl rounded-[32px] p-6 md:p-8 border-2 transition-all flex flex-col justify-between ${
              !isCurrentlyPremium
                ? 'border-white/30 shadow-2xl relative'
                : 'border-white/15 opacity-80'
            }`}>
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-2xl font-black text-white">Free Explorer</h3>
                      <span className="text-xl">🆓</span>
                    </div>
                    <p className="text-xs text-indigo-200 mt-0.5 font-medium">Automatic basic access for every child</p>
                  </div>
                  <span className="text-[11px] font-black uppercase px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white">
                    {!isCurrentlyPremium ? 'Active Plan' : 'Free Tier'}
                  </span>
                </div>

                <div className="my-5 p-4 rounded-2xl bg-black/20 border border-white/10">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-white">0 QAR</span>
                    <span className="text-xs text-indigo-200 font-bold">/ Forever Free</span>
                  </div>
                  <p className="text-[11px] text-white/70 mt-1">No credit card required. Includes standard starter quests.</p>
                </div>

                {/* What's Automatically Included */}
                <div className="mb-5">
                  <p className="text-xs font-black uppercase tracking-wider text-emerald-300 mb-2.5 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    Every child automatically gets:
                  </p>
                  <ul className="space-y-2.5 text-xs md:text-sm text-white/90">
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-emerald-400 text-base shrink-0 mt-0.5">check_circle</span>
                      <span><strong>Access to starter hobby modules:</strong> Origami Masters & Crocheting Club</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-emerald-400 text-base shrink-0 mt-0.5">check_circle</span>
                      <span><strong>*Sequential gating & child safety</strong> screen limit controls</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-emerald-400 text-base shrink-0 mt-0.5">check_circle</span>
                      <span><strong>Standard partner rewards:</strong> 1 merchant voucher per completed path</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-emerald-400 text-base shrink-0 mt-0.5">check_circle</span>
                      <span><strong>Basic access</strong> to the creative learning platform & XP levels</span>
                    </li>
                  </ul>
                </div>

                {/* What's NOT Included */}
                <div className="pt-4 border-t border-white/10">
                  <p className="text-xs font-black uppercase tracking-wider text-pink-300 mb-2.5 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">cancel</span>
                    Not included in Free Explorer:
                  </p>
                  <ul className="space-y-2 text-xs text-white/50">
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-pink-400/70 text-sm">close</span>
                      <span>Coach analysis & Coach mentoring</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-pink-400/70 text-sm">close</span>
                      <span>Live classes & Live mentor sessions</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-pink-400/70 text-sm">close</span>
                      <span>Instant photo/video evaluation</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-pink-400/70 text-sm">close</span>
                      <span>Premium guaranteed monthly vouchers</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-pink-400/70 text-sm">close</span>
                      <span>VIP events & Katara/Education City workshop invitations</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-pink-400/70 text-sm">close</span>
                      <span>Free hobby toolkits mailed to your door</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-6">
                {!isCurrentlyPremium ? (
                  <button
                    onClick={() => {
                      sound.playPop();
                      onNavigate('adventure-map');
                    }}
                    className="w-full py-3.5 bg-white/15 hover:bg-white/25 text-white font-black text-sm rounded-2xl border border-white/30 transition-colors cursor-pointer text-center"
                  >
                    Current Active Plan (Start Free Quests)
                  </button>
                ) : (
                  <div className="text-center text-xs text-white/60 py-2">
                    Free features included in your Premium membership
                  </div>
                )}
              </div>
            </div>

            {/* PLAN 2: Premium — 75 QAR one-time payment */}
            <div className={`bg-indigo-950/90 backdrop-blur-2xl rounded-[32px] p-6 md:p-8 border-4 border-yellow-400 shadow-[0_0_50px_rgba(250,204,21,0.3)] flex flex-col justify-between relative overflow-hidden transform md:-translate-y-2 ${
              isCurrentlyPremium ? 'ring-4 ring-emerald-400/80' : ''
            }`}>
              {/* Highlight Badge */}
              <div className="absolute top-4 right-4 bg-yellow-400 text-indigo-950 font-black text-xs px-3.5 py-1 rounded-full border border-white shadow-md flex items-center gap-1">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                <span>ONE-TIME LIFETIME</span>
              </div>

              <div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-2xl font-black text-white">⭐ Premium</h3>
                    </div>
                    <p className="text-xs text-yellow-300 font-bold mt-0.5">Permanent lifetime upgrade for your child</p>
                  </div>
                </div>

                {/* Price Box */}
                <div className="my-5 p-4 rounded-2xl bg-black/40 border border-yellow-400/30">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-yellow-300">75 QAR</span>
                    <span className="text-xs text-yellow-200 font-black uppercase tracking-wider bg-yellow-400/20 px-2 py-0.5 rounded-lg border border-yellow-400/30">
                      One-Time Payment
                    </span>
                  </div>
                  <p className="text-[11px] text-white/90 mt-1 font-semibold">
                    Pay once, own forever. <strong>NOT</strong> a monthly or annual subscription. Zero recurring fees.
                  </p>
                </div>

                {/* What's Included */}
                <div className="mb-5">
                  <p className="text-xs font-black uppercase tracking-wider text-yellow-300 mb-2.5 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                    Full Premium Lifetime Includes:
                  </p>
                  <ul className="space-y-2.5 text-xs md:text-sm text-white/95 font-medium">
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-yellow-400 text-base shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      <span><strong>Everything in Free Explorer</strong> (Origami & Crocheting starter hobbies)</span>
                    </li>
                    <li className="flex items-start gap-2.5 bg-yellow-400/10 p-2 rounded-xl border border-yellow-400/20">
                      <span className="material-symbols-outlined text-yellow-300 text-base shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>add_task</span>
                      <span><strong>1 additional hobby of child's choice</strong> (3 courses total included: Painting, Rocketry, or Finance)</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-yellow-400 text-base shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      <span><strong>Coach mentoring & Live classes</strong> conducted by expert mentors</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-yellow-400 text-base shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      <span><strong>Instant multi-step coach evaluation</strong> using uploaded photos and videos</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-yellow-400 text-base shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      <span><strong>Guaranteed monthly vouchers</strong> aside from vouchers for completing every module</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-yellow-400 text-base shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      <span><strong>Guaranteed Jarir & Virgin Megastore</strong> stationery monthly vouchers</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-yellow-400 text-base shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      <span><strong>**Katara & Education City</strong> weekend workshop VIP invitations + other events</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-yellow-400 text-base shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      <span><strong>Free hobby toolkits</strong> with real-world craft and STEM supplies</span>
                    </li>
                  </ul>
                </div>

                {/* Choose your 1 included hobby */}
                {!isCurrentlyPremium && (
                  <div className="mt-4 p-3.5 bg-white/10 rounded-2xl border border-white/20">
                    <label className="block text-xs font-black text-yellow-300 mb-2">
                      🎨 Choose your 1 complimentary hobby to unlock:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {nonStarterCourses.map((c) => {
                        const isSelected = selectedFreeHobbyId === c.id;
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              sound.playPop();
                              setSelectedFreeHobbyId(c.id);
                            }}
                            className={`p-2 rounded-xl text-center border transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                              isSelected
                                ? 'bg-yellow-400 text-indigo-950 border-white font-black shadow'
                                : 'bg-black/20 text-white/80 border-white/10 hover:border-white/30 font-bold'
                            }`}
                          >
                            <span className="material-symbols-outlined text-base">{c.iconName}</span>
                            <span className="text-[11px] leading-tight line-clamp-1">{c.category}</span>
                            {isSelected && (
                              <span className="text-[9px] bg-indigo-950 text-yellow-300 px-1.5 rounded-full font-black">
                                INCLUDED
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6">
                {isCurrentlyPremium ? (
                  <div className="p-4 bg-emerald-500/30 border-2 border-emerald-400 rounded-2xl text-center font-black text-sm text-emerald-200 flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-xl">verified</span>
                    <span>Premium Active! Permanent Lifetime Access</span>
                  </div>
                ) : (
                  <button
                    onClick={handlePurchasePremium}
                    className="w-full btn-yellow-tactile font-black py-4 px-6 rounded-2xl text-base md:text-lg flex items-center justify-center gap-2 shadow-xl cursor-pointer"
                  >
                    <span>Unlock Premium (75 QAR One-Time)</span>
                    <span className="material-symbols-outlined text-xl">rocket_launch</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* SECTION: ➕ Additional Hobbies Policy & Custom Builder */}
          <div className="max-w-5xl mx-auto bg-white/5 backdrop-blur-2xl rounded-[32px] p-6 md:p-8 border-2 border-white/20 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-400/20 border border-yellow-300/30 rounded-full text-yellow-300 text-xs font-black uppercase tracking-wider mb-2">
                  <span className="material-symbols-outlined text-sm">add_circle</span>
                  Course Expansion
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-white flex items-center gap-2">
                  <span>➕ Additional Hobbies</span>
                  <span className="text-yellow-400 text-lg font-bold">50 QAR each</span>
                </h2>
                <p className="text-xs md:text-sm text-indigo-100 mt-1 max-w-2xl font-medium">
                  After purchasing Premium, each additional hobby costs <strong>50 QAR one-time</strong>. Each course learners are interested in aside from the first 3 (2 starter + 1 chosen) is charged 50 QAR with permanent lifetime access.
                </p>
              </div>

              <div className="bg-yellow-400/10 border border-yellow-400/30 px-4 py-2.5 rounded-2xl text-right shrink-0">
                <span className="text-[11px] text-yellow-300 font-bold block uppercase">First 3 Courses</span>
                <span className="text-sm font-black text-white">Included in 75 QAR</span>
              </div>
            </div>

            {/* Courses Catalog & Add-on Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {ALL_COURSES.map((course) => {
                const isStarter = FREE_STARTER_COURSE_IDS.includes(course.id);
                const isChosenFreeHobby = selectedFreeHobbyId === course.id;
                const isAlreadyUnlocked = unlockedCourses.includes(course.id);
                const isSelectedAddon = selectedAddons.includes(course.id);

                return (
                  <div
                    key={course.id}
                    className={`rounded-2xl p-4 border transition-all flex flex-col justify-between ${
                      isStarter
                        ? 'bg-emerald-950/30 border-emerald-400/40 text-emerald-100'
                        : isChosenFreeHobby
                        ? 'bg-yellow-950/40 border-yellow-400 shadow-md text-white'
                        : isAlreadyUnlocked
                        ? 'bg-emerald-950/30 border-emerald-400 text-emerald-100'
                        : isSelectedAddon
                        ? 'bg-indigo-900/60 border-yellow-400 ring-2 ring-yellow-400 text-white'
                        : 'bg-white/5 border-white/10 text-white/90 hover:border-white/30'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white">
                          <span className="material-symbols-outlined text-lg">{course.iconName}</span>
                        </div>
                        <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                          isStarter
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                            : isChosenFreeHobby
                            ? 'bg-yellow-400 text-indigo-950 font-black'
                            : isAlreadyUnlocked
                            ? 'bg-emerald-500 text-white font-black'
                            : 'bg-white/10 text-white/80 border border-white/20'
                        }`}>
                          {isStarter
                            ? 'Starter (Free)'
                            : isChosenFreeHobby
                            ? 'Included with 75 QAR'
                            : isAlreadyUnlocked
                            ? 'Unlocked ✓'
                            : '+50 QAR One-Time'}
                        </span>
                      </div>

                      <h4 className="font-extrabold text-sm text-white">{course.title}</h4>
                      <p className="text-[11px] text-indigo-200 mt-0.5 line-clamp-2">{course.tagline}</p>
                      
                      <div className="mt-3 text-[11px] text-white/70 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm text-yellow-400">card_giftcard</span>
                        <span>{course.voucherValue} ({course.voucherPartner})</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/10">
                      {isStarter ? (
                        <div className="text-[11px] font-bold text-emerald-300 text-center py-1">
                          ✓ Available on Free & Premium
                        </div>
                      ) : isChosenFreeHobby ? (
                        <div className="text-[11px] font-bold text-yellow-300 text-center py-1">
                          ⭐ Selected as your 1 Free Premium Hobby
                        </div>
                      ) : isAlreadyUnlocked ? (
                        <div className="text-[11px] font-bold text-emerald-300 text-center py-1">
                          ✓ Permanently Unlocked
                        </div>
                      ) : isCurrentlyPremium ? (
                        <button
                          onClick={() => handlePurchaseSingleAddon(course.id)}
                          className="w-full py-2 bg-yellow-400 hover:bg-yellow-300 text-indigo-950 font-black text-xs rounded-xl shadow cursor-pointer transition-all flex items-center justify-center gap-1"
                        >
                          <span className="material-symbols-outlined text-sm">lock_open</span>
                          <span>Unlock for 50 QAR One-Time</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => toggleAddonCourse(course.id)}
                          className={`w-full py-2 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                            isSelectedAddon
                              ? 'bg-yellow-400 text-indigo-950 shadow'
                              : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                          }`}
                        >
                          <span className="material-symbols-outlined text-sm">
                            {isSelectedAddon ? 'check' : 'add'}
                          </span>
                          <span>{isSelectedAddon ? 'Added (+50 QAR)' : 'Add (+50 QAR)'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Live Transparent Checkout Calculator */}
            <div className="bg-black/30 rounded-2xl p-5 border border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-left">
                <span className="text-xs font-black text-yellow-300 uppercase tracking-wider block">
                  Transparent Lifetime Total
                </span>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-2xl md:text-3xl font-black text-white">
                    {calculateTotal()} QAR
                  </span>
                  <span className="text-xs text-indigo-200">
                    {!isCurrentlyPremium ? (
                      <>
                        (75 QAR Base Premium {selectedAddons.length > 0 ? `+ ${selectedAddons.length * 50} QAR for ${selectedAddons.length} extra hobby` : ''})
                      </>
                    ) : (
                      <>
                        ({selectedAddons.length * 50} QAR for {selectedAddons.length} additional hobbies)
                      </>
                    )}
                  </span>
                </div>
                <p className="text-[11px] text-white/70 mt-0.5">
                  ✓ One single charge • No renewal charges • Permanent family access
                </p>
              </div>

              {!isCurrentlyPremium ? (
                <button
                  onClick={handlePurchasePremium}
                  className="btn-yellow-tactile font-black py-3.5 px-6 rounded-2xl text-sm md:text-base flex items-center gap-2 shadow-xl cursor-pointer shrink-0"
                >
                  <span>Complete Purchase ({calculateTotal()} QAR)</span>
                  <span className="material-symbols-outlined text-lg">shopping_cart_checkout</span>
                </button>
              ) : selectedAddons.length > 0 ? (
                <button
                  onClick={() => {
                    sound.playPop();
                    setPaywallTargetTitle('Hiwaya Add-on Courses');
                    setShowPaywallModal(true);
                  }}
                  className="btn-yellow-tactile font-black py-3.5 px-6 rounded-2xl text-sm md:text-base flex items-center gap-2 shadow-xl cursor-pointer shrink-0"
                >
                  <span>Unlock {selectedAddons.length} Extra Hobbies ({calculateTotal()} QAR)</span>
                  <span className="material-symbols-outlined text-lg">shopping_cart_checkout</span>
                </button>
              ) : null}
            </div>
          </div>
        </>
      )}

      {/* Feature Comparison Matrix Tab */}
      {activeTab === 'comparison' && (
        <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-2xl rounded-[32px] p-6 md:p-8 border-2 border-white/20 shadow-2xl">
          <h2 className="text-2xl font-black text-white text-center mb-6">
            Detailed Plan Comparison
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs md:text-sm">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="py-3.5 px-4 font-black text-white/90">Feature</th>
                  <th className="py-3.5 px-4 font-black text-center text-emerald-300 w-36 bg-white/5 rounded-t-xl">
                    Free Explorer<br />
                    <span className="text-[11px] font-bold text-white/70">0 QAR</span>
                  </th>
                  <th className="py-3.5 px-4 font-black text-center text-yellow-300 w-44 bg-yellow-400/10 rounded-t-xl">
                    ⭐ Premium<br />
                    <span className="text-[11px] font-bold text-yellow-200">75 QAR one-time</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 text-white/90">
                <tr>
                  <td className="py-3 px-4 font-bold">Billing Model</td>
                  <td className="py-3 px-4 text-center bg-white/5 font-semibold text-emerald-300">Free Forever</td>
                  <td className="py-3 px-4 text-center bg-yellow-400/10 font-bold text-yellow-300">One-Time Lifetime (No Subscriptions)</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Starter Hobbies (Origami & Crochet)</td>
                  <td className="py-3 px-4 text-center bg-white/5 text-emerald-400 font-black">✓ Included</td>
                  <td className="py-3 px-4 text-center bg-yellow-400/10 text-emerald-400 font-black">✓ Included</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Additional Hobby of Child's Choice</td>
                  <td className="py-3 px-4 text-center bg-white/5 text-pink-400 font-bold">✕</td>
                  <td className="py-3 px-4 text-center bg-yellow-400/10 text-yellow-300 font-black">✓ 1 Free Choice Included (3 total)</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Sequential gating & child safety screen limits</td>
                  <td className="py-3 px-4 text-center bg-white/5 text-emerald-400 font-black">✓ Included</td>
                  <td className="py-3 px-4 text-center bg-yellow-400/10 text-emerald-400 font-black">✓ Included</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Standard Partner Rewards (per completed path)</td>
                  <td className="py-3 px-4 text-center bg-white/5 text-emerald-400 font-black">✓ 1 Voucher / Path</td>
                  <td className="py-3 px-4 text-center bg-yellow-400/10 text-emerald-400 font-black">✓ 1 Voucher / Path</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Coach Analysis & Coach Mentoring</td>
                  <td className="py-3 px-4 text-center bg-white/5 text-pink-400 font-bold">✕</td>
                  <td className="py-3 px-4 text-center bg-yellow-400/10 text-emerald-400 font-black">✓ Included</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Live Classes & Live Mentor Sessions</td>
                  <td className="py-3 px-4 text-center bg-white/5 text-pink-400 font-bold">✕</td>
                  <td className="py-3 px-4 text-center bg-yellow-400/10 text-emerald-400 font-black">✓ Included</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Instant Photo & Video Evaluation</td>
                  <td className="py-3 px-4 text-center bg-white/5 text-pink-400 font-bold">✕</td>
                  <td className="py-3 px-4 text-center bg-yellow-400/10 text-emerald-400 font-black">✓ Multi-Step AI & Coach</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Guaranteed Monthly Jarir & Virgin Stationery Vouchers</td>
                  <td className="py-3 px-4 text-center bg-white/5 text-pink-400 font-bold">✕</td>
                  <td className="py-3 px-4 text-center bg-yellow-400/10 text-emerald-400 font-black">✓ Guaranteed Monthly</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Katara & Education City Workshop VIP Invitations</td>
                  <td className="py-3 px-4 text-center bg-white/5 text-pink-400 font-bold">✕</td>
                  <td className="py-3 px-4 text-center bg-yellow-400/10 text-emerald-400 font-black">✓ VIP Weekend Access</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Free Hobby Physical Toolkits</td>
                  <td className="py-3 px-4 text-center bg-white/5 text-pink-400 font-bold">✕</td>
                  <td className="py-3 px-4 text-center bg-yellow-400/10 text-emerald-400 font-black">✓ Free Toolkits</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Extra Hobbies Beyond First 3</td>
                  <td className="py-3 px-4 text-center bg-white/5 text-white/50">Upgrade to Premium first</td>
                  <td className="py-3 px-4 text-center bg-yellow-400/10 text-yellow-300 font-bold">50 QAR each (one-time)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Parent FAQ Tab */}
      {activeTab === 'faq' && (
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-5 border border-white/10">
            <h3 className="font-extrabold text-base text-yellow-300 mb-1 flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">help</span>
              Is the 75 QAR Premium really a one-time payment?
            </h3>
            <p className="text-xs md:text-sm text-indigo-100">
              Yes, absolutely! The 75 QAR payment is charged strictly once. There are <strong>no monthly or annual recurring subscriptions</strong>. Once purchased, Premium features remain unlocked permanently on your family account.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-5 border border-white/10">
            <h3 className="font-extrabold text-base text-yellow-300 mb-1 flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">palette</span>
              How many hobbies are included with the 75 QAR Premium?
            </h3>
            <p className="text-xs md:text-sm text-indigo-100">
              Premium includes <strong>3 hobbies in total</strong>: the 2 starter hobbies (Origami & Crocheting) plus <strong>1 additional hobby of your child's choice</strong> (e.g. Painting, DIY Rocketry, or Junior Finance).
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-5 border border-white/10">
            <h3 className="font-extrabold text-base text-yellow-300 mb-1 flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">add_circle</span>
              How does the 50 QAR Additional Hobby pricing work?
            </h3>
            <p className="text-xs md:text-sm text-indigo-100">
              After purchasing Premium, each additional hobby beyond the first 3 costs <strong>50 QAR one-time</strong>. If your child wants to explore all available hobbies in the curriculum, you can add them individually at any time for 50 QAR each.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-5 border border-white/10">
            <h3 className="font-extrabold text-base text-yellow-300 mb-1 flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">security</span>
              Is Hiwaya safe and ad-free?
            </h3>
            <p className="text-xs md:text-sm text-indigo-100">
              100% yes! Both Free Explorer and Premium tiers are completely ad-free, COPPA-compliant, and feature strict parental gate controls and screen time limit management.
            </p>
          </div>
        </div>
      )}

      {/* Safety & Satisfaction Guarantee */}
      <div className="mt-12 text-center text-xs text-white/70 max-w-xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-emerald-400">lock</span>
          <span>Secure 256-bit encrypted checkout</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-amber-300">verified</span>
          <span>Permanent Lifetime License Guarantee</span>
        </div>
      </div>

      {/* Intentional Premium Paywall Modal */}
      <PremiumPaywallModal
        isOpen={showPaywallModal}
        onClose={() => setShowPaywallModal(false)}
        courseTitle={paywallTargetTitle}
        onExploreFreeCourses={() => {
          setShowPaywallModal(false);
          onNavigate('adventure-map');
        }}
      />
    </div>
  );
};
