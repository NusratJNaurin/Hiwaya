import React, { useState } from 'react';
import { Companion } from '../types';
import { sound } from '../utils/audio';

interface CompanionFloatingProps {
  companion: Companion;
  customMessage?: string;
}

export const CompanionFloating: React.FC<CompanionFloatingProps> = ({
  companion,
  customMessage
}) => {
  const [clickCount, setClickCount] = useState(0);
  const [bounce, setBounce] = useState(false);

  const funQuotes = [
    customMessage || companion.greeting,
    "Did you know? Origami was first practiced in ancient Japan! ⛩️",
    "Crease the edges sharp with your fingernail! 💡",
    "You're doing fantastic! High five! ✋",
    "Keep going, you're on a 7-day learning streak! 🔥",
    "Every fold makes you a master crafter! ✨"
  ];

  const currentQuote = customMessage || funQuotes[clickCount % funQuotes.length];

  const handleClick = () => {
    sound.playPop();
    setBounce(true);
    setClickCount((prev) => prev + 1);
    setTimeout(() => setBounce(false), 600);
  };

  return (
    <div className="fixed bottom-5 left-5 z-40 flex items-end gap-3 pointer-events-auto">
      {/* 3D Animated Companion Avatar */}
      <button
        onClick={handleClick}
        aria-label={`Talk to ${companion.name}`}
        className={`relative w-20 h-20 md:w-24 md:h-24 rounded-3xl border-4 border-white/60 glass-panel shadow-2xl flex items-center justify-center overflow-hidden cursor-pointer group transition-transform ${
          bounce ? 'scale-125 rotate-6' : 'hover:scale-110 animate-float-slow'
        }`}
        title="Click me for tips and encouragement!"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-white/30 pointer-events-none" />
        <img
          src={companion.avatarUrl}
          alt={companion.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />

        {/* Level / Status dot */}
        <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-white shadow-sm animate-pulse" />
      </button>

      {/* Speech Balloon Bubble */}
      <div className="glass-panel-light p-3.5 md:p-4 rounded-2xl rounded-bl-none shadow-xl border border-white/30 character-bubble max-w-xs md:max-w-sm mb-4 animate-bounce-in">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
            {companion.name}
          </span>
          <span className="text-[10px] bg-white/20 text-white/90 px-1.5 py-0.5 rounded-full">
            Buddy
          </span>
        </div>
        <p className="text-xs md:text-sm font-medium text-white leading-snug drop-shadow-sm">
          {currentQuote}
        </p>
      </div>
    </div>
  );
};
