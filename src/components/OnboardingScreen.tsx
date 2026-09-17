import React, { useState } from 'react';
import { COMPANIONS } from '../data/mockData';
import { UserProfile } from '../types';
import { sound } from '../utils/audio';

interface OnboardingScreenProps {
  userProfile: UserProfile;
  onSaveProfile: (name: string, companionId: string) => void;
  onStartAdventure: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  userProfile,
  onSaveProfile,
  onStartAdventure
}) => {
  const [selectedCompanionId, setSelectedCompanionId] = useState(userProfile.companionId || 'glow');
  const [explorerName, setExplorerName] = useState(userProfile.name || 'Alex');
  const [errorMsg, setErrorMsg] = useState('');

  const handleCompanionSelect = (id: string) => {
    sound.playPop();
    setSelectedCompanionId(id);
  };

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!explorerName.trim()) {
      setErrorMsg('Please write your explorer name!');
      return;
    }
    sound.playChime();
    onSaveProfile(explorerName.trim(), selectedCompanionId);
    onStartAdventure();
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] flex flex-col items-center justify-center p-4 md:p-8 z-10">
      <div className="max-w-4xl w-full flex flex-col items-center gap-8 py-6">
        {/* Top Back Row */}
        <div className="w-full flex justify-start">
          <button
            type="button"
            onClick={() => {
              sound.playPop();
              onStartAdventure();
            }}
            className="btn-yellow-tactile px-5 py-2 rounded-2xl font-black text-sm flex items-center gap-2 shadow-lg cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            <span>Back to Quest Map</span>
          </button>
        </div>

        {/* Header Badge */}
        <div className="text-center space-y-4 w-full animate-bounce-in">
          <div className="inline-flex items-center gap-2 bg-yellow-400 text-indigo-950 px-5 py-2 rounded-full border-2 border-white font-black text-sm shadow-[0_4px_12px_rgba(234,179,8,0.4)]">
            <span className="material-symbols-outlined text-lg font-black" style={{ fontVariationSettings: "'FILL' 1" }}>
              military_tech
            </span>
            Level 1: Creative Cub
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] tracking-tight">
            Choose Your Creative Companion!
          </h1>

          <p className="text-base md:text-xl text-indigo-100 max-w-2xl mx-auto drop-shadow font-semibold">
            Pick a buddy to join you on your learning adventure!
          </p>
        </div>

        {/* 6 Avatar Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-6 w-full">
          {COMPANIONS.map((comp) => {
            const isSelected = selectedCompanionId === comp.id;
            return (
              <button
                key={comp.id}
                type="button"
                onClick={() => handleCompanionSelect(comp.id)}
                className={`group relative rounded-[28px] p-4 flex flex-col items-center gap-3 transition-all duration-300 cursor-pointer text-center focus:outline-none backdrop-blur-xl ${
                  isSelected
                    ? 'scale-105 -translate-y-2 bg-indigo-600/40 border-4 border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.5)]'
                    : 'bg-white/10 hover:bg-white/15 hover:border-white/40 border border-white/20 hover:scale-102 shadow-lg'
                }`}
              >
                {/* Selected Checkmark Badge */}
                {isSelected && (
                  <div className="absolute top-2 right-2 w-7 h-7 bg-yellow-400 rounded-full flex items-center justify-center text-indigo-950 border-2 border-white shadow-md font-black">
                    <span className="material-symbols-outlined text-sm font-black">check</span>
                  </div>
                )}

                {/* Avatar Image circle */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 border-yellow-400 shadow-lg relative bg-white/10 group-hover:rotate-3 transition-transform">
                  <img
                    src={comp.avatarUrl}
                    alt={comp.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div>
                  <h3 className="font-black text-lg md:text-xl text-white drop-shadow-md">
                    {comp.name}
                  </h3>
                  <span className="text-xs text-indigo-200 font-bold block mt-0.5">
                    {comp.role}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Profile Setup Input */}
        <form onSubmit={handleStart} className="w-full max-w-md flex flex-col items-center gap-6">
          <div className="w-full bg-white/10 backdrop-blur-xl p-6 rounded-[32px] border border-white/20 shadow-2xl flex flex-col gap-3 text-center">
            <label
              htmlFor="explorer-name"
              className="text-xl md:text-2xl font-black text-white drop-shadow-md"
            >
              What's your Explorer Name?
            </label>

            <input
              id="explorer-name"
              type="text"
              value={explorerName}
              onChange={(e) => {
                setExplorerName(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="Type your name here..."
              className="w-full px-5 py-3.5 rounded-2xl bg-black/30 border-2 border-white/30 text-white placeholder-white/50 text-center text-lg font-black outline-none focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/30 transition-all"
              maxLength={20}
            />

            {errorMsg && (
              <p className="text-pink-400 text-sm font-bold animate-shake">
                {errorMsg}
              </p>
            )}
          </div>

          {/* Start Adventure Button */}
          <button
            type="submit"
            className="w-full max-w-xs btn-yellow-tactile font-black text-lg md:text-xl py-4 px-8 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl cursor-pointer"
          >
            <span>Start Adventure!</span>
            <span className="material-symbols-outlined text-2xl font-black">rocket_launch</span>
          </button>
        </form>
      </div>
    </div>
  );
};
