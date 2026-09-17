import React, { useState } from 'react';
import { AppScreen, UserProfile } from '../types';
import { sound } from '../utils/audio';

interface TopNavbarProps {
  currentScreen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
  onBack?: () => void;
  userProfile: UserProfile;
  onOpenParentPin: () => void;
  onLogout?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  currentScreen,
  onNavigate,
  onBack,
  userProfile,
  onOpenParentPin,
  onLogout
}) => {
  const [isMuted, setIsMuted] = useState(sound.getIsMuted());
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleToggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      sound.playPop();
    }
  };

  const xpPercent = Math.min(100, Math.round((userProfile.currentXp / userProfile.xpToNextLevel) * 100));

  const isHomepage = currentScreen === 'adventure-map';
  const isTeen = userProfile.userRole === 'learner_teen';
  const isParent = userProfile.userRole === 'parent';

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 h-20 bg-white/10 backdrop-blur-md border-b border-white/20 px-4 md:px-8 flex justify-between items-center transition-all duration-300">
        {/* Brand Left & Back Button */}
        <div className="flex items-center gap-2.5 md:gap-4">
          {/* Back Button - Present on every screen EXCEPT homepage */}
          {!isHomepage && (
            <button
              id="top-nav-back-button"
              onClick={() => {
                sound.playPop();
                if (onBack) {
                  onBack();
                } else {
                  onNavigate('adventure-map');
                }
              }}
              className="flex items-center gap-1.5 md:gap-2 bg-yellow-400 hover:bg-yellow-300 text-indigo-950 px-3.5 md:px-4 py-2 rounded-2xl font-black text-xs md:text-sm shadow-[0_4px_0_0_#ca8a04] hover:shadow-[0_2px_0_0_#ca8a04] active:translate-y-0.5 transition-all cursor-pointer border border-white/40 group shrink-0"
              aria-label="Go back to previous screen"
              title="Go back"
            >
              <span className="material-symbols-outlined text-lg md:text-xl font-black group-hover:-translate-x-0.5 transition-transform">
                arrow_back
              </span>
              <span className="font-black">Back</span>
            </button>
          )}

          <button
            onClick={() => {
              sound.playPop();
              onNavigate('adventure-map');
            }}
            className="flex items-center gap-2.5 md:gap-3.5 group cursor-pointer focus:outline-none"
            aria-label="Go to adventure map homepage"
          >
            <div className="w-10 h-10 md:w-12 md:h-12 bg-yellow-400 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(250,204,21,0.5)] group-hover:scale-105 transition-transform shrink-0">
              <span className="text-xl md:text-2xl font-black text-indigo-900 italic">H!</span>
            </div>
            <div className="hidden sm:block text-left">
              <h1 className="text-xl md:text-2xl font-black text-white tracking-tight uppercase drop-shadow-md leading-none">
                Hiwaya
              </h1>
              {isTeen && (
                <span className="text-[10px] text-purple-300 font-extrabold uppercase tracking-wider block">
                  Teen 13+ Mode
                </span>
              )}
              {isParent && (
                <span className="text-[10px] text-pink-300 font-extrabold uppercase tracking-wider block">
                  Parent Mode
                </span>
              )}
            </div>
          </button>

          {/* Mode Pill Badges for Quick Switching */}
          <div className="hidden sm:flex items-center gap-1.5 bg-black/20 p-1.5 rounded-full border border-white/10 backdrop-blur-md">
            <button
              onClick={() => {
                sound.playPop();
                onNavigate('adventure-map');
              }}
              className={`px-3.5 py-1 text-xs font-extrabold rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
                currentScreen === 'adventure-map' || currentScreen === 'project-module' || currentScreen === 'celebration'
                  ? 'bg-white text-indigo-600 shadow-md'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="material-symbols-outlined text-sm">explore</span>
              Explorer Map
            </button>
            <button
              onClick={() => {
                sound.playPop();
                onNavigate('gallery');
              }}
              className={`px-3.5 py-1 text-xs font-extrabold rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
                currentScreen === 'gallery'
                  ? 'bg-yellow-400 text-indigo-950 shadow-md'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>palette</span>
              Gallery
            </button>

            {/* Parent Hub Pill ONLY shown if NOT a Teen 13+ user */}
            {!isTeen && (
              <button
                onClick={() => {
                  sound.playPop();
                  if (isParent) {
                    onNavigate('parent-hub');
                  } else {
                    onOpenParentPin();
                  }
                }}
                className={`px-3.5 py-1 text-xs font-extrabold rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
                  currentScreen === 'parent-hub'
                    ? 'bg-pink-500 text-white shadow-md'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className="material-symbols-outlined text-sm">family_restroom</span>
                Parent Hub
              </button>
            )}

            {/* Teen Pro / Membership Pill for 13+ users */}
            {isTeen && (
              <button
                onClick={() => {
                  sound.playPop();
                  onNavigate('pricing');
                }}
                className={`px-3.5 py-1 text-xs font-extrabold rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
                  currentScreen === 'pricing'
                    ? 'bg-purple-500 text-white shadow-md'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className="material-symbols-outlined text-sm">workspace_premium</span>
                Premium Pass
              </button>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3 md:gap-5">
          {/* Immersive XP Bar Indicator */}
          <div
            onClick={() => {
              sound.playChime();
            }}
            className="cursor-pointer group bg-black/20 rounded-full px-3 md:px-4 py-1.5 md:py-2 flex items-center gap-2.5 md:gap-3 border border-white/10 hover:border-white/30 transition-all shadow-inner"
            title="Click to hear XP chime!"
          >
            <div className="w-7 h-7 md:w-8 md:h-8 bg-orange-500 rounded-full flex items-center justify-center shadow-lg shrink-0">
              <span className="text-white text-[10px] md:text-xs font-black">XP</span>
            </div>
            <div className="hidden sm:block w-28 md:w-44 h-3 bg-white/10 rounded-full overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-orange-400 to-yellow-300 rounded-full shadow-[0_0_10px_rgba(251,191,36,0.6)] transition-all duration-700"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
            <span className="text-white font-mono text-xs md:text-sm font-bold tracking-tight">
              {userProfile.currentXp.toLocaleString()} / {userProfile.xpToNextLevel.toLocaleString()}
            </span>
          </div>

          {/* Sound Mute Toggle */}
          <button
            onClick={handleToggleSound}
            aria-label="Toggle sound effects"
            className="w-10 h-10 md:w-11 md:h-11 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-all shadow-md"
            title={isMuted ? 'Unmute playful sounds' : 'Mute sounds'}
          >
            <span className="material-symbols-outlined text-xl">
              {isMuted ? 'volume_off' : 'volume_up'}
            </span>
          </button>

          {/* Notifications Button */}
          <div className="relative">
            <button
              onClick={() => {
                sound.playPop();
                setShowNotificationModal(!showNotificationModal);
              }}
              aria-label="Notifications"
              className="w-10 h-10 md:w-11 md:h-11 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-all shadow-md relative"
            >
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-pink-500 rounded-full border-2 border-indigo-900 animate-pulse"></span>
              <span className="material-symbols-outlined text-xl">notifications</span>
            </button>

            {/* Notification dropdown */}
            {showNotificationModal && (
              <div className="absolute right-0 mt-3 w-80 bg-indigo-950/95 backdrop-blur-2xl border-2 border-indigo-300/30 rounded-3xl shadow-2xl p-4 text-white z-50 animate-bounce-in">
                <div className="flex justify-between items-center pb-2 border-b border-white/10 mb-3">
                  <h4 className="font-extrabold text-sm flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-yellow-400 text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                      notifications_active
                    </span>
                    Notifications
                  </h4>
                  <span className="text-[10px] bg-yellow-400/20 text-yellow-300 px-2.5 py-0.5 rounded-full font-black uppercase">
                    2 New
                  </span>
                </div>
                <div className="space-y-2.5 text-xs">
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      🎁
                    </div>
                    <div>
                      <p className="font-bold text-white">QAR 10 Voucher Unlocked!</p>
                      <p className="text-white/70 text-[11px]">Your Jarir Bookstore voucher is ready.</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                      ⭐
                    </div>
                    <div>
                      <p className="font-bold text-white">Coach Feedback</p>
                      <p className="text-white/70 text-[11px]">"Alex, your crane is so precise! 🌟"</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Account Profile Badge Button */}
          <div className="relative">
            <button
              onClick={() => {
                sound.playPop();
                setShowProfileMenu(!showProfileMenu);
              }}
              aria-label="Account Menu"
              className="flex items-center gap-2.5 md:gap-3 bg-white rounded-full pl-1.5 md:pl-2 pr-3 md:pr-4 py-1 border-2 border-indigo-200 shadow-xl cursor-pointer hover:scale-105 transition-transform"
            >
              <div className="w-8 h-8 md:w-9 md:h-9 bg-indigo-500 rounded-full border-2 border-white overflow-hidden flex items-center justify-center font-black text-white text-xs">
                {userProfile.name ? userProfile.name.charAt(0) : 'Z'}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-indigo-900 leading-none">
                  {userProfile.name}
                </span>
                <span className="text-[10px] text-indigo-500 uppercase tracking-wider font-black mt-0.5">
                  Level {userProfile.level}
                </span>
              </div>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-3 w-64 bg-indigo-950/95 backdrop-blur-2xl border-2 border-indigo-300/30 rounded-3xl shadow-2xl p-3.5 text-white z-50 animate-bounce-in">
                <div className="p-3 bg-white/10 rounded-2xl mb-2 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center font-black text-indigo-950 text-base shadow">
                    {userProfile.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">{userProfile.name}</h4>
                    <p className="text-xs text-indigo-200">{userProfile.levelTitle} (Lvl {userProfile.level})</p>
                    {userProfile.id ? (
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-300 font-semibold mt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Firebase Cloud Synced
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] text-amber-300/80 font-medium mt-1">
                        Guest / Sandbox Session
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-1 text-xs md:text-sm">
                  <button
                    onClick={() => {
                      sound.playPop();
                      setShowProfileMenu(false);
                      onNavigate('gallery');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/10 flex items-center gap-2 text-yellow-300 font-bold transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>palette</span>
                    Community Showcase Gallery
                  </button>
                  
                  <button
                    onClick={() => {
                      sound.playPop();
                      setShowProfileMenu(false);
                      onNavigate('onboarding');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/10 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base text-white/80">face</span>
                    Change Companion Avatar
                  </button>

                  {/* Parent Hub for Parents and Kids */}
                  {!isTeen && (
                    <button
                      onClick={() => {
                        sound.playPop();
                        setShowProfileMenu(false);
                        if (isParent) {
                          onNavigate('parent-hub');
                        } else {
                          onOpenParentPin();
                        }
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/10 flex items-center gap-2 text-pink-300 font-bold transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base">family_restroom</span>
                      Parent Hub & Settings
                    </button>
                  )}

                  {/* Teen Pass */}
                  {isTeen && (
                    <button
                      onClick={() => {
                        sound.playPop();
                        setShowProfileMenu(false);
                        onNavigate('pricing');
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/10 flex items-center gap-2 text-purple-300 font-bold transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base">workspace_premium</span>
                      Upgrade / Explore Courses
                    </button>
                  )}

                  <div className="pt-2 mt-1 border-t border-white/10">
                    <button
                      onClick={() => {
                        sound.playPop();
                        setShowProfileMenu(false);
                        if (onLogout) {
                          onLogout();
                        } else {
                          onNavigate('auth');
                        }
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-red-500/20 text-red-300 hover:text-red-200 flex items-center gap-2 font-bold transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base">logout</span>
                      Log Out / Switch Account
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Backdrop for closing popovers */}
      {(showNotificationModal || showProfileMenu) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowNotificationModal(false);
            setShowProfileMenu(false);
          }}
        />
      )}
    </>
  );
};
