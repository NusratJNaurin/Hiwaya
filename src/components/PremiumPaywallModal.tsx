import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { sound } from '../utils/audio';

interface PremiumPaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseTitle?: string;
  courseCategory?: string;
  onExploreFreeCourses: () => void;
}

export const PremiumPaywallModal: React.FC<PremiumPaywallModalProps> = ({
  isOpen,
  onClose,
  courseTitle = 'Creative Course',
  courseCategory = 'Premium Quest',
  onExploreFreeCourses
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        id="premium-paywall-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-indigo-950/80 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg bg-indigo-900/95 border-2 border-yellow-400/60 rounded-3xl md:rounded-[36px] shadow-[0_20px_60px_rgba(0,0,0,0.6)] p-6 sm:p-8 text-white text-center flex flex-col items-center gap-5 overflow-hidden"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-yellow-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            id="close-premium-modal-btn"
            onClick={() => {
              sound.playPop();
              onClose();
            }}
            className="absolute top-4 right-4 sm:top-5 sm:right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all cursor-pointer"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>

          {/* Premium Lock Visual Badge */}
          <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-yellow-400/30 via-amber-500/20 to-yellow-300/10 border-2 border-yellow-400 flex items-center justify-center shadow-[0_0_30px_rgba(250,204,21,0.35)] shrink-0 mt-2">
            <span className="material-symbols-outlined text-4xl sm:text-5xl text-yellow-300">
              lock
            </span>
          </div>

          {/* Primary Paywall Statement */}
          <div className="space-y-3 max-w-md">
            <div className="inline-flex items-center gap-1.5 bg-yellow-400/20 border border-yellow-400/40 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider text-yellow-300">
              <span className="material-symbols-outlined text-sm">lock</span>
              <span>Premium Course</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-white italic tracking-tight drop-shadow-sm">
              {courseTitle}
            </h3>

            {/* Exact Required Notice Message */}
            <div className="p-4 rounded-2xl bg-black/40 border border-yellow-400/30 text-indigo-100 space-y-2 text-sm md:text-base leading-relaxed">
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

          {/* Free Courses Callout */}
          <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-3.5 text-left text-xs sm:text-sm text-indigo-100 flex items-start gap-3">
            <span className="material-symbols-outlined text-yellow-400 text-xl shrink-0 mt-0.5">
              verified
            </span>
            <div>
              <span className="font-bold text-white">Free Starter Tracks Available: </span>
              <span>
                <strong>Origami Mastery</strong> and <strong>Crochet Club</strong> are 100% unlocked with interactive videos, AI coach analysis, and Jarir Bookstore vouchers!
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full pt-2">
            <button
              id="explore-free-courses-btn"
              onClick={() => {
                sound.playFanfare();
                onExploreFreeCourses();
              }}
              className="btn-yellow-tactile w-full py-3.5 px-5 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer shadow-xl text-indigo-950"
            >
              <span className="material-symbols-outlined text-lg font-black">explore</span>
              <span>Explore Free Quests</span>
            </button>

            <button
              id="got-it-modal-btn"
              onClick={() => {
                sound.playPop();
                onClose();
              }}
              className="w-full sm:w-auto py-3.5 px-6 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition-all cursor-pointer text-center shrink-0"
            >
              Got it
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
