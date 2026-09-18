import React, { useState } from 'react';
import { sound } from '../utils/audio';

interface ParentPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ParentPinModal: React.FC<ParentPinModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    sound.playPop();
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      if (newPin.length === 4) {
        if (newPin === '1234' || newPin === '0000') {
          sound.playChime();
          setTimeout(() => {
            setPin('');
            onSuccess();
          }, 300);
        } else {
          sound.playPop();
          setError(true);
          setTimeout(() => {
            setPin('');
            setError(false);
          }, 800);
        }
      }
    }
  };

  const handleBackspace = () => {
    sound.playPop();
    setPin((prev) => prev.slice(0, -1));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-bounce-in">
      <div className="bg-[#1e293b] border-4 border-amber-400/80 rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl text-white flex flex-col items-center gap-6">
        <div className="w-14 h-14 rounded-2xl bg-[#fd9d1a] text-black flex items-center justify-center shadow-lg">
          <span className="material-symbols-outlined text-3xl">lock</span>
        </div>

        <div className="text-center">
          <h3 className="text-2xl font-extrabold">Parent Gate 🔒</h3>
          <p className="text-xs text-white/70 mt-1">
            Grown-ups only! Enter your 4-digit PIN to access Parent Hub
          </p>
        </div>

        {/* PIN Indicators */}
        <div className="flex gap-4">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`w-5 h-5 rounded-full border-2 transition-all ${
                pin.length > idx
                  ? 'bg-amber-400 border-white scale-110 shadow-md'
                  : 'bg-white/10 border-white/30'
              } ${error ? 'bg-red-500 border-red-300 animate-shake' : ''}`}
            />
          ))}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-[240px]">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              onClick={() => handleDigit(digit)}
              className="w-16 h-14 rounded-2xl bg-white/10 hover:bg-white/25 border border-white/20 text-xl font-extrabold flex items-center justify-center transition-all block-shadow active:scale-95"
            >
              {digit}
            </button>
          ))}
          <button
            onClick={() => {
              sound.playPop();
              onClose();
            }}
            className="w-16 h-14 rounded-2xl bg-red-500/20 hover:bg-red-500/30 text-xs font-bold flex items-center justify-center text-red-300"
          >
            Cancel
          </button>
          <button
            onClick={() => handleDigit('0')}
            className="w-16 h-14 rounded-2xl bg-white/10 hover:bg-white/25 border border-white/20 text-xl font-extrabold flex items-center justify-center transition-all block-shadow"
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            className="w-16 h-14 rounded-2xl bg-white/10 hover:bg-white/25 border border-white/20 flex items-center justify-center text-white"
          >
            <span className="material-symbols-outlined text-lg">backspace</span>
          </button>
        </div>
      </div>
    </div>
  );
};
