import React, { useState } from 'react';
import { UserProfile, Voucher } from '../types';
import { sound } from '../utils/audio';

interface TellParentModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  voucher?: Voucher;
  onOpenCardGenerator?: () => void;
}

export const TellParentModal: React.FC<TellParentModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  voucher,
  onOpenCardGenerator
}) => {
  const [copied, setCopied] = useState(false);
  const [parentPhone, setParentPhone] = useState('+974 5512 3456');

  if (!isOpen) return null;

  const shareText = `🎉 Hi Mom & Dad! ${userProfile.name} just completed "The Peace Crane" on Hiwaya, earned +500 XP, unlocked the "Crane Creator" badge, and received a QAR 10 Jarir Bookstore voucher! 🌟`;

  const handleCopy = () => {
    sound.playPop();
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    sound.playChime();
    const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-bounce-in">
      <div className="bg-[#1e293b] border-4 border-white/30 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl text-white flex flex-col gap-5">
        <div className="flex justify-between items-center pb-3 border-b border-white/20">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-400 text-3xl">share</span>
            <h3 className="text-2xl font-extrabold">Share with Parents!</h3>
          </div>
          <button
            onClick={() => {
              sound.playPop();
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-lg"
          >
            ✕
          </button>
        </div>

        {/* Certificate Card Preview */}
        <div className="bg-gradient-to-br from-[#0058bd] to-indigo-900 p-5 rounded-2xl border-2 border-white/40 shadow-inner flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-widest text-amber-300">
              Hiwaya Achievement Card
            </span>
            <span className="text-xs bg-emerald-500 text-white font-bold px-2 py-0.5 rounded-full">
              Verified Quest
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/10 border-2 border-amber-300 p-1 shrink-0 overflow-hidden">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQn7rgfuFAI6vF6dm2xbm-Wj7-Oaz2qUCH2TF-PyS3gXlW0gdSgUQIXgka-Af06EHYdStH6JK6xf6qzdZDujNX34Dl8AiLzsCBCzNbF_cxR-pnJoG-N50SqOOfpqAR5nfAOhQAX2v6TXFrlJA_7ZJ_mYQdXw1PQYazFgFXw6noBUYhPRWH1oZqjcyfyy_N1lJnC5pMCbzFvrPBWgi7YXQouoLXkLwaonbYZiMnBoAxllK4A2qQVfu-mg"
                alt="Badge"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h4 className="font-extrabold text-lg text-white">
                {userProfile.name} • Crane Creator
              </h4>
              <p className="text-xs text-blue-200">
                +500 XP Earned • 7-Day Streak Active
              </p>
              <p className="text-xs font-bold text-amber-300 mt-1">
                🎁 Unlocked QAR 10 Jarir Voucher
              </p>
            </div>
          </div>
        </div>

        {/* Parent phone / contact preview */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-white/80 uppercase">Parent WhatsApp / Phone:</label>
          <input
            type="text"
            value={parentPhone}
            onChange={(e) => setParentPhone(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white font-mono text-sm outline-none focus:border-amber-300"
          />
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-2.5 pt-2">
          {onOpenCardGenerator && (
            <button
              onClick={() => {
                sound.playChime();
                onOpenCardGenerator();
              }}
              className="w-full btn-yellow-tactile font-black py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 text-sm uppercase shadow-lg cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">photo_camera</span>
              Generate Official Image Card (.PNG)
            </button>
          )}

          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={handleWhatsAppShare}
              className="flex-1 btn-tactile bg-[#25D366] hover:bg-emerald-600 text-white font-extrabold py-3.5 px-4 rounded-xl border-2 border-white/40 shadow-lg flex items-center justify-center gap-2 text-xs"
            >
              <span className="material-symbols-outlined text-base">forum</span>
              Send on WhatsApp
            </button>

            <button
              onClick={handleCopy}
              className="flex-1 btn-tactile bg-white/15 hover:bg-white/25 text-white font-bold py-3.5 px-4 rounded-xl border border-white/30 flex items-center justify-center gap-2 text-xs"
            >
              <span className="material-symbols-outlined text-base">content_copy</span>
              {copied ? 'Copied to Clipboard! ✓' : 'Copy Summary'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
