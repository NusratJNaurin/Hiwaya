import React, { useEffect, useRef, useState } from 'react';
import { sound } from '../utils/audio';

interface DrawingPadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveDrawing: (dataUrl: string) => void;
}

export const DrawingPadModal: React.FC<DrawingPadModalProps> = ({
  isOpen,
  onClose,
  onSaveDrawing
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#fd9d1a');
  const [lineWidth, setLineWidth] = useState(8);

  const colors = [
    '#fd9d1a', // Amber/Orange
    '#3b82f6', // Blue
    '#ec4899', // Pink
    '#10b981', // Green
    '#8b5cf6', // Purple
    '#ffffff', // White
    '#f59e0b'  // Yellow
  ];

  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill white paper background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw a subtle origami paper fold guide watermark
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.moveTo(canvas.width, 0);
    ctx.lineTo(0, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
  }, [isOpen]);

  if (!isOpen) return null;

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleClear = () => {
    sound.playPop();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    sound.playChime();
    const dataUrl = canvas.toDataURL('image/png');
    onSaveDrawing(dataUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-bounce-in">
      <div className="bg-[#1e293b] border-4 border-amber-400/80 rounded-3xl p-6 max-w-lg w-full shadow-2xl flex flex-col gap-4 text-white">
        <div className="flex justify-between items-center pb-3 border-b border-white/20">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-300 text-2xl">draw</span>
            <h3 className="font-extrabold text-xl">Draw Your Crane Creation!</h3>
          </div>
          <button
            onClick={() => {
              sound.playPop();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80"
          >
            ✕
          </button>
        </div>

        {/* Color Palette */}
        <div className="flex items-center justify-between gap-2 bg-white/10 p-2.5 rounded-2xl">
          <div className="flex items-center gap-2 flex-wrap">
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => {
                  sound.playPop();
                  setColor(c);
                }}
                className={`w-7 h-7 rounded-full transition-transform border-2 ${
                  color === c ? 'scale-125 border-white shadow-md' : 'border-transparent hover:scale-110'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setLineWidth(4)}
              className={`px-2 py-1 text-xs rounded-lg font-bold ${lineWidth === 4 ? 'bg-amber-400 text-black' : 'bg-white/10 text-white'}`}
            >
              Thin
            </button>
            <button
              onClick={() => setLineWidth(8)}
              className={`px-2 py-1 text-xs rounded-lg font-bold ${lineWidth === 8 ? 'bg-amber-400 text-black' : 'bg-white/10 text-white'}`}
            >
              Medium
            </button>
            <button
              onClick={() => setLineWidth(16)}
              className={`px-2 py-1 text-xs rounded-lg font-bold ${lineWidth === 16 ? 'bg-amber-400 text-black' : 'bg-white/10 text-white'}`}
            >
              Thick
            </button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="w-full aspect-square max-h-[340px] bg-white rounded-2xl overflow-hidden shadow-inner border-2 border-white/40 touch-none">
          <canvas
            ref={canvasRef}
            width={600}
            height={600}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full h-full cursor-crosshair"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mt-2">
          <button
            onClick={handleClear}
            className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/30 transition-colors flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">restart_alt</span>
            Clear Canvas
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 btn-tactile bg-[#0058bd] hover:bg-blue-600 text-white font-extrabold rounded-xl border-2 border-blue-300 shadow-[0_4px_0_0_#00387a] flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">check</span>
            Submit Masterpiece
          </button>
        </div>
      </div>
    </div>
  );
};
