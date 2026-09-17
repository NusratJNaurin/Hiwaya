import React, { useEffect, useRef, useState } from 'react';
import { ALL_COURSES } from '../data/mockData';
import { Companion, CreationUpload, HobbyCourse, UserProfile } from '../types';
import { sound } from '../utils/audio';

interface ShareableAchievementCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  companion: Companion;
  latestCreation?: CreationUpload;
  courseId?: string;
  aiFeedbackText?: string;
}

type CardTheme = 'gold-navy' | 'cosmic-purple' | 'emerald-champion' | 'sunset-radiance';

interface ThemeConfig {
  id: CardTheme;
  name: string;
  bgGradStart: string;
  bgGradMid: string;
  bgGradEnd: string;
  accentColor: string;
  accentSecondary: string;
  textColor: string;
  badgeBorder: string;
  previewClass: string;
}

const THEMES: ThemeConfig[] = [
  {
    id: 'gold-navy',
    name: 'Royal Gold & Navy',
    bgGradStart: '#0f172a',
    bgGradMid: '#1e1b4b',
    bgGradEnd: '#020617',
    accentColor: '#facc15',
    accentSecondary: '#fbbf24',
    textColor: '#ffffff',
    badgeBorder: '#f59e0b',
    previewClass: 'from-slate-900 to-indigo-950 border-amber-400'
  },
  {
    id: 'cosmic-purple',
    name: 'Cosmic Galaxy',
    bgGradStart: '#2e1065',
    bgGradMid: '#4c1d95',
    bgGradEnd: '#172554',
    accentColor: '#ec4899',
    accentSecondary: '#a855f7',
    textColor: '#ffffff',
    badgeBorder: '#d946ef',
    previewClass: 'from-purple-950 to-indigo-900 border-pink-400'
  },
  {
    id: 'emerald-champion',
    name: 'Emerald Master',
    bgGradStart: '#064e3b',
    bgGradMid: '#065f46',
    bgGradEnd: '#022c22',
    accentColor: '#34d399',
    accentSecondary: '#6ee7b7',
    textColor: '#ffffff',
    badgeBorder: '#10b981',
    previewClass: 'from-emerald-950 to-teal-900 border-emerald-400'
  },
  {
    id: 'sunset-radiance',
    name: 'Arabian Sunset',
    bgGradStart: '#7c2d12',
    bgGradMid: '#9a3412',
    bgGradEnd: '#3b0764',
    accentColor: '#fb923c',
    accentSecondary: '#fcd34d',
    textColor: '#ffffff',
    badgeBorder: '#f97316',
    previewClass: 'from-amber-950 to-orange-950 border-orange-400'
  }
];

export const ShareableAchievementCardModal: React.FC<ShareableAchievementCardModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  companion,
  latestCreation,
  courseId = 'origami',
  aiFeedbackText
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<CardTheme>('gold-navy');
  const [parentNote, setParentNote] = useState<string>(
    `Super proud of ${userProfile.name} for completing this craft project all on their own! 🌟👏`
  );
  const [includePhoto, setIncludePhoto] = useState(true);
  const [includeQuote, setIncludeQuote] = useState(true);
  const [includeVoucher, setIncludeVoucher] = useState(true);
  const [includeParentNote, setIncludeParentNote] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [imgDataUrl, setImgDataUrl] = useState<string>('');

  const currentCourse: HobbyCourse =
    ALL_COURSES.find((c) => c.id === courseId) || ALL_COURSES[0];

  const projectTitle = latestCreation?.title || currentCourse.title;
  const hobbyCategory = latestCreation?.hobbyName || currentCourse.category;
  const projectPhotoUrl =
    latestCreation?.imageUrl || currentCourse.thumbnailUrl;
  const effectiveFeedback =
    aiFeedbackText ||
    latestCreation?.aiFeedback ||
    `"${userProfile.name} conquered every challenge with outstanding precision and creativity! 🌟"`;

  // Draw card onto HTML Canvas
  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const theme = THEMES.find((t) => t.id === selectedTheme) || THEMES[0];

    // Fixed High-Res Canvas Dimensions (ideal 4:5 Instagram/WhatsApp portrait ratio)
    const width = 800;
    const height = 1000;
    canvas.width = width;
    canvas.height = height;

    // Helper: Draw Rounded Rect
    const roundRect = (
      x: number,
      y: number,
      w: number,
      h: number,
      radius: number
    ) => {
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + w - radius, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
      ctx.lineTo(x + w, y + h - radius);
      ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
      ctx.lineTo(x + radius, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
    };

    // Helper: Wrap text
    const wrapText = (
      text: string,
      x: number,
      y: number,
      maxWidth: number,
      lineHeight: number,
      maxLines = 3
    ) => {
      const words = text.split(' ');
      let line = '';
      let currentY = y;
      let lineCount = 0;

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
          ctx.fillText(line.trim(), x, currentY);
          line = words[n] + ' ';
          currentY += lineHeight;
          lineCount++;
          if (lineCount >= maxLines - 1 && n < words.length - 1) {
            ctx.fillText(line + '...', x, currentY);
            return currentY;
          }
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line.trim(), x, currentY);
      return currentY;
    };

    // 1. Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, theme.bgGradStart);
    bgGrad.addColorStop(0.5, theme.bgGradMid);
    bgGrad.addColorStop(1, theme.bgGradEnd);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle particle constellations in background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    for (let i = 0; i < 45; i++) {
      const px = (Math.sin(i * 99) * 0.5 + 0.5) * width;
      const py = (Math.cos(i * 33) * 0.5 + 0.5) * height;
      const size = (i % 3) + 1.5;
      ctx.beginPath();
      ctx.arc(px, py, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Ornate Border Frame
    ctx.strokeStyle = theme.accentColor;
    ctx.lineWidth = 4;
    roundRect(24, 24, width - 48, height - 48, 28);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1.5;
    roundRect(32, 32, width - 64, height - 64, 22);
    ctx.stroke();

    // Corner decorative accents
    const drawCorner = (cx: number, cy: number, rot: number) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      ctx.fillStyle = theme.accentColor;
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = theme.accentSecondary;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(12, 0);
      ctx.lineTo(26, 0);
      ctx.moveTo(0, 12);
      ctx.lineTo(0, 26);
      ctx.stroke();
      ctx.restore();
    };

    drawCorner(44, 44, 0);
    drawCorner(width - 44, 44, Math.PI / 2);
    drawCorner(width - 44, height - 44, Math.PI);
    drawCorner(44, height - 44, (3 * Math.PI) / 2);

    // 3. Header Ribbon: HIWAYA JUNIOR ACADEMY
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    roundRect(width / 2 - 190, 48, 380, 38, 19);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = theme.accentColor;
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✨ HIWAYA JUNIOR CRAFT ACADEMY ✨', width / 2, 72);

    // 4. Student Name & Master Achievement Title
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 38px system-ui, -apple-system, sans-serif';
    ctx.fillText(`${userProfile.name.toUpperCase()}'S MASTER ACHIEVEMENT`, width / 2, 130);

    // Course Category Pill
    ctx.fillStyle = theme.accentColor;
    ctx.font = 'bold 17px system-ui, -apple-system, sans-serif';
    ctx.fillText(`🏅 ${hobbyCategory} • ${currentCourse.badgeName}`, width / 2, 162);

    // Project Name Underline
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.font = 'italic 16px system-ui, -apple-system, sans-serif';
    ctx.fillText(`Project: "${projectTitle}"`, width / 2, 190);

    // 5. Center Section: Project Photo or Illustration Showcase
    let currentLayoutY = 215;

    const renderCardContent = () => {
      // If photo enabled, draw the framed artwork
      const cardHeight = includePhoto ? 340 : 160;
      const cardWidth = width - 110;
      const cardX = 55;

      if (includePhoto) {
        // Frame container
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        roundRect(cardX, currentLayoutY, cardWidth, cardHeight, 20);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Image Drawing (clipped inside rounded rect)
        roundRect(cardX + 6, currentLayoutY + 6, cardWidth - 12, cardHeight - 12, 16);
        ctx.clip();

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          try {
            // Draw image with cover aspect ratio
            const scale = Math.max(
              (cardWidth - 12) / img.width,
              (cardHeight - 12) / img.height
            );
            const sw = (cardWidth - 12) / scale;
            const sh = (cardHeight - 12) / scale;
            const sx = (img.width - sw) / 2;
            const sy = (img.height - sh) / 2;
            ctx.drawImage(
              img,
              sx,
              sy,
              sw,
              sh,
              cardX + 6,
              currentLayoutY + 6,
              cardWidth - 12,
              cardHeight - 12
            );

            // Subtle gradient overlay at bottom of photo
            const photoGrad = ctx.createLinearGradient(
              0,
              currentLayoutY + cardHeight - 80,
              0,
              currentLayoutY + cardHeight
            );
            photoGrad.addColorStop(0, 'rgba(0,0,0,0)');
            photoGrad.addColorStop(1, 'rgba(0,0,0,0.85)');
            ctx.fillStyle = photoGrad;
            ctx.fillRect(cardX + 6, currentLayoutY + cardHeight - 80, cardWidth - 12, 80);

            // Verified Artwork watermark tag
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(
              `📸 ${userProfile.name}'s Verified Creation`,
              cardX + 22,
              currentLayoutY + cardHeight - 20
            );

            ctx.fillStyle = theme.accentColor;
            ctx.textAlign = 'right';
            ctx.fillText('100% Hands-On Crafted', cardX + cardWidth - 22, currentLayoutY + cardHeight - 20);
          } catch {
            // fallback handled
          }
          ctx.restore();
          finishDrawingLowerSections(currentLayoutY + cardHeight + 20);
        };

        img.onerror = () => {
          ctx.restore();
          // Fallback if image fails to load
          ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
          roundRect(cardX + 6, currentLayoutY + 6, cardWidth - 12, cardHeight - 12, 16);
          ctx.fill();
          ctx.fillStyle = theme.accentColor;
          ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`🎨 ${projectTitle}`, width / 2, currentLayoutY + cardHeight / 2);
          finishDrawingLowerSections(currentLayoutY + cardHeight + 20);
        };

        img.src = projectPhotoUrl;
      } else {
        finishDrawingLowerSections(currentLayoutY);
      }
    };

    const finishDrawingLowerSections = (nextY: number) => {
      let y = nextY;

      // 6. Badges & Stats Ribbon (XP, Streak, Level)
      const ribbonWidth = width - 110;
      const ribbonX = 55;
      const ribbonHeight = 58;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      roundRect(ribbonX, y, ribbonWidth, ribbonHeight, 16);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      const colWidth = ribbonWidth / 3;
      ctx.textAlign = 'center';

      // Stat 1: XP
      ctx.fillStyle = theme.accentColor;
      ctx.font = '900 18px system-ui, -apple-system, sans-serif';
      ctx.fillText('+500 XP', ribbonX + colWidth * 0.5, y + 26);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
      ctx.fillText('QUEST REWARD', ribbonX + colWidth * 0.5, y + 46);

      // Stat 2: Streak
      ctx.fillStyle = '#f43f5e';
      ctx.font = '900 18px system-ui, -apple-system, sans-serif';
      ctx.fillText(`🔥 ${userProfile.streakDays}-Day Streak`, ribbonX + colWidth * 1.5, y + 26);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
      ctx.fillText('CONSISTENCY', ribbonX + colWidth * 1.5, y + 46);

      // Stat 3: Badge Status
      ctx.fillStyle = '#38bdf8';
      ctx.font = '900 18px system-ui, -apple-system, sans-serif';
      ctx.fillText('🌟 Certified', ribbonX + colWidth * 2.5, y + 26);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
      ctx.fillText(currentCourse.badgeName.toUpperCase(), ribbonX + colWidth * 2.5, y + 46);

      y += ribbonHeight + 16;

      // 7. AI Coach Review Quote Box
      if (includeQuote) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        roundRect(55, y, width - 110, 68, 16);
        ctx.fill();
        ctx.strokeStyle = 'rgba(250, 204, 21, 0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = theme.accentColor;
        ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('🎖️ COACH VERIFICATION:', 72, y + 22);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'italic 13px system-ui, -apple-system, sans-serif';
        wrapText(effectiveFeedback, 72, y + 42, width - 150, 18, 2);

        y += 68 + 14;
      }

      // 8. Proud Parent Note (Customized Message for WhatsApp)
      if (includeParentNote && parentNote.trim()) {
        ctx.fillStyle = 'rgba(236, 72, 153, 0.18)';
        roundRect(55, y, width - 110, 64, 16);
        ctx.fill();
        ctx.strokeStyle = 'rgba(244, 114, 182, 0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#f472b6';
        ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('❤️ PROUD PARENT NOTE:', 72, y + 22);

        ctx.fillStyle = '#ffffff';
        ctx.font = '500 13px system-ui, -apple-system, sans-serif';
        wrapText(`"${parentNote}"`, 72, y + 42, width - 150, 18, 2);

        y += 64 + 14;
      }

      // 9. Qatar Partner Voucher Pill (if enabled)
      if (includeVoucher) {
        ctx.fillStyle = 'rgba(251, 191, 36, 0.15)';
        roundRect(55, y, width - 110, 38, 12);
        ctx.fill();
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = theme.accentColor;
        ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(
          `🎁 Unlocked ${currentCourse.voucherValue} for ${currentCourse.voucherPartner}!`,
          width / 2,
          y + 24
        );

        y += 38 + 14;
      }

      // 10. Footer Stamp & Web URL
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = '11px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      const todayDate = new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      ctx.fillText(
        `Verified by Hiwaya Creative Learning Platform • Issued on ${todayDate} • hiwaya.qa`,
        width / 2,
        height - 38
      );

      // Generate Data URL for image tag
      try {
        const dataUrl = canvas.toDataURL('image/png');
        setImgDataUrl(dataUrl);
      } catch (e) {
        console.warn('Canvas export tainted or pending', e);
      }
    };

    renderCardContent();
  }, [
    isOpen,
    selectedTheme,
    parentNote,
    includePhoto,
    includeQuote,
    includeVoucher,
    includeParentNote,
    userProfile,
    currentCourse,
    projectTitle,
    hobbyCategory,
    projectPhotoUrl,
    effectiveFeedback
  ]);

  if (!isOpen) return null;

  // 1. Download PNG file
  const handleDownloadImage = () => {
    sound.playFanfare();
    setIsGenerating(true);

    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      const safeName = userProfile.name.toLowerCase().replace(/\s+/g, '-');
      a.download = `hiwaya-${safeName}-${currentCourse.id}-achievement.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (e) {
      console.error('Download failed', e);
    } finally {
      setIsGenerating(false);
    }
  };

  // 2. Share to WhatsApp GC
  const handleWhatsAppShare = async () => {
    sound.playChime();

    const canvas = canvasRef.current;
    const formattedText = `🌟 *Look what ${userProfile.name} created on Hiwaya!* 🌟\n\n🎉 ${userProfile.name} just completed the *${projectTitle}* quest (${hobbyCategory}) and earned the official *${currentCourse.badgeName}* badge! 🏅\n\n✨ *Rewards Earned:*\n• +500 Master XP\n• 🔥 ${userProfile.streakDays}-Day Crafting Streak\n• 🎁 ${currentCourse.voucherValue} for ${currentCourse.voucherPartner}\n\n💬 *Coach Review:*\n${effectiveFeedback}\n\n${
      parentNote ? `❤️ *Parent Note:* "${parentNote}"\n\n` : ''
    }🚀 Empowering young makers & crafters in Qatar • Explore at https://hiwaya.qa`;

    // Try Web Share API with image file first (mobile native share to WhatsApp)
    if (canvas && navigator.share && navigator.canShare) {
      try {
        canvas.toBlob(async (blob) => {
          if (!blob) {
            window.open(`https://wa.me/?text=${encodeURIComponent(formattedText)}`, '_blank');
            return;
          }
          const file = new File(
            [blob],
            `hiwaya-${userProfile.name}-achievement.png`,
            { type: 'image/png' }
          );
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: `${userProfile.name}'s Achievement on Hiwaya`,
              text: formattedText,
              files: [file]
            });
            return;
          } else {
            window.open(
              `https://wa.me/?text=${encodeURIComponent(formattedText)}`,
              '_blank'
            );
          }
        }, 'image/png');
        return;
      } catch (err) {
        console.log('WebShare fallback to URL', err);
      }
    }

    // Fallback standard WhatsApp link
    const waUrl = `https://wa.me/?text=${encodeURIComponent(formattedText)}`;
    window.open(waUrl, '_blank');
  };

  // 3. Copy Image to Clipboard
  const handleCopyImage = async () => {
    sound.playPop();
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          // Modern Clipboard API for image
          await navigator.clipboard.write([
            new ClipboardItem({
              'image/png': blob
            })
          ]);
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2500);
        } catch {
          // Fallback to text copy
          const fallbackText = `🌟 ${userProfile.name}'s Master Achievement on Hiwaya: Completed "${projectTitle}" (${hobbyCategory}) • Earned +500 XP and ${currentCourse.badgeName} badge! 🏅`;
          await navigator.clipboard.writeText(fallbackText);
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2500);
        }
      }, 'image/png');
    } catch (e) {
      console.error('Copy failed', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#1e1b4b] border-2 border-yellow-400/80 rounded-[32px] max-w-5xl w-full shadow-2xl text-white flex flex-col max-h-[92vh] overflow-hidden my-auto animate-bounce-in">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-white/15 flex items-center justify-between bg-white/5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-yellow-400 text-indigo-950 flex items-center justify-center font-black shadow-lg">
              <span className="material-symbols-outlined text-2xl">
                photo_camera
              </span>
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-black text-white flex items-center gap-2">
                Generate Shareable Achievement Card
                <span className="bg-emerald-500 text-white text-[10px] uppercase font-black px-2 py-0.5 rounded-full">
                  WhatsApp Ready
                </span>
              </h3>
              <p className="text-xs text-indigo-200">
                Share {userProfile.name}'s proud milestone with family & friends!
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playPop();
              onClose();
            }}
            className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-lg transition-colors cursor-pointer border border-white/20"
          >
            ✕
          </button>
        </div>

        {/* Modal Body: Left controls + Right Canvas Preview */}
        <div className="p-4 md:p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Customization Controls (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Theme Selector */}
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-2.5">
              <label className="text-xs font-black text-yellow-300 uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">palette</span>
                1. Select Card Theme
              </label>
              <div className="grid grid-cols-2 gap-2">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      sound.playPop();
                      setSelectedTheme(t.id);
                    }}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                      selectedTheme === t.id
                        ? 'bg-yellow-400 text-indigo-950 border-white shadow-lg scale-102'
                        : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full border border-white shrink-0 bg-gradient-to-br ${t.previewClass}`}
                    />
                    <span className="truncate">{t.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Proud Parent Note */}
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-pink-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">favorite</span>
                  2. Parent's Proud Note
                </label>
                <button
                  onClick={() => setIncludeParentNote(!includeParentNote)}
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded cursor-pointer ${
                    includeParentNote
                      ? 'bg-pink-500 text-white'
                      : 'bg-white/10 text-white/50'
                  }`}
                >
                  {includeParentNote ? 'Included' : 'Hidden'}
                </button>
              </div>
              <textarea
                rows={2}
                disabled={!includeParentNote}
                value={parentNote}
                onChange={(e) => setParentNote(e.target.value)}
                placeholder="Write a proud message to your family..."
                className="w-full px-3 py-2 rounded-xl bg-black/30 border border-white/20 text-white text-xs outline-none focus:border-yellow-300 disabled:opacity-40 transition-colors"
              />
            </div>

            {/* Content Toggles */}
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-2.5">
              <label className="text-xs font-black text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">tune</span>
                3. Card Content Elements
              </label>

              <div className="space-y-2">
                <label className="flex items-center justify-between text-xs text-white/90 p-2 rounded-xl bg-white/5 cursor-pointer hover:bg-white/10">
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-yellow-300">image</span>
                    Include Child's Artwork / Project Photo
                  </span>
                  <input
                    type="checkbox"
                    checked={includePhoto}
                    onChange={(e) => setIncludePhoto(e.target.checked)}
                    className="w-4 h-4 accent-yellow-400 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between text-xs text-white/90 p-2 rounded-xl bg-white/5 cursor-pointer hover:bg-white/10">
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-yellow-300">verified</span>
                    Include Coach Review Quote
                  </span>
                  <input
                    type="checkbox"
                    checked={includeQuote}
                    onChange={(e) => setIncludeQuote(e.target.checked)}
                    className="w-4 h-4 accent-yellow-400 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between text-xs text-white/90 p-2 rounded-xl bg-white/5 cursor-pointer hover:bg-white/10">
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-amber-300">redeem</span>
                    Include Qatar Voucher Unlock Banner
                  </span>
                  <input
                    type="checkbox"
                    checked={includeVoucher}
                    onChange={(e) => setIncludeVoucher(e.target.checked)}
                    className="w-4 h-4 accent-yellow-400 rounded cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* Quick WhatsApp Share Info */}
            <div className="bg-emerald-950/50 border border-emerald-500/40 p-3.5 rounded-2xl flex items-start gap-3">
              <span className="w-7 h-7 rounded-xl bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow">
                <span className="material-symbols-outlined text-sm">forum</span>
              </span>
              <p className="text-[11px] text-emerald-200 leading-relaxed font-medium">
                Click <strong>"Post to WhatsApp Group"</strong> to instantly open WhatsApp with an achievement card and message ready for family group chats!
              </p>
            </div>
          </div>

          {/* Right Column: Live Card Canvas Preview & Actions (7 cols) */}
          <div className="lg:col-span-7 flex flex-col items-center gap-4">
            <div className="w-full flex items-center justify-between px-1">
              <span className="text-xs font-black text-white/80 uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-yellow-300">visibility</span>
                Live Card Preview (800 × 1000 px)
              </span>
              <span className="text-[10px] text-indigo-300 font-mono">
                HTML5 Canvas Render
              </span>
            </div>

            {/* Responsive Canvas Container */}
            <div className="w-full max-w-sm sm:max-w-md aspect-[4/5] bg-black/50 rounded-2xl p-2 border-2 border-white/20 shadow-2xl relative flex items-center justify-center overflow-hidden">
              <canvas
                ref={canvasRef}
                className="w-full h-full object-contain rounded-xl shadow-lg transition-transform"
                style={{ imageRendering: 'auto' }}
              />

              {isGenerating && (
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2 rounded-xl backdrop-blur-sm">
                  <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-bold text-white">Rendering High-Res Card...</span>
                </div>
              )}
            </div>

            {/* Action Buttons: WhatsApp, Download PNG, Copy */}
            <div className="w-full max-w-sm sm:max-w-md flex flex-col gap-2.5">
              <button
                onClick={handleWhatsAppShare}
                className="w-full btn-tactile bg-[#25D366] hover:bg-emerald-600 text-white font-black py-3.5 px-5 rounded-2xl border-2 border-white/40 shadow-xl flex items-center justify-center gap-2.5 text-sm uppercase tracking-tight cursor-pointer"
              >
                <span className="material-symbols-outlined text-xl">forum</span>
                <span>Post to WhatsApp Group</span>
              </button>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={handleDownloadImage}
                  className="btn-yellow-tactile py-3 px-4 rounded-xl font-black text-xs uppercase flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">download</span>
                  <span>{downloadSuccess ? 'Downloaded! ✓' : 'Save PNG'}</span>
                </button>

                <button
                  onClick={handleCopyImage}
                  className="bg-white/15 hover:bg-white/25 text-white font-bold py-3 px-4 rounded-xl border border-white/30 flex items-center justify-center gap-2 text-xs cursor-pointer transition-all"
                >
                  <span className="material-symbols-outlined text-base">content_copy</span>
                  <span>{copySuccess ? 'Copied! ✓' : 'Copy Card'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
