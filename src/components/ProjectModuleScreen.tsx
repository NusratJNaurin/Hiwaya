import React, { useEffect, useRef, useState } from 'react';
import { ALL_COURSES } from '../data/mockData';
import { AppScreen, Companion, HobbyCourse, MapNode, UserProfile } from '../types';
import { sound } from '../utils/audio';
import { DrawingPadModal } from './DrawingPadModal';

interface ProjectModuleScreenProps {
  userProfile: UserProfile;
  companion: Companion;
  module: MapNode;
  allModules: MapNode[];
  selectedCourseId?: string;
  onSelectCourse?: (courseId: string) => void;
  onNavigate: (screen: AppScreen) => void;
  onProjectComplete: (moduleId: string, creationUrl: string, aiFeedback: string) => void;
  onSelectModule: (moduleId: string) => void;
}

export const ProjectModuleScreen: React.FC<ProjectModuleScreenProps> = ({
  userProfile,
  companion,
  module,
  allModules,
  selectedCourseId = 'origami',
  onSelectCourse,
  onNavigate,
  onProjectComplete,
  onSelectModule
}) => {
  // Steps checklist state (initialize step 1 completed for interactive feel)
  const checklistItems = module.checklist || [
    'Follow the instructor steps carefully',
    'Align edges and shapes symmetrically',
    'Finalize and inspect your creation'
  ];
  const [completedSteps, setCompletedSteps] = useState<number[]>([1]);

  // Upload & AI feedback state
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [showDrawingModal, setShowDrawingModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [justCompletedData, setJustCompletedData] = useState<{
    imageUrl: string;
    feedback: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Compute YouTube embed URL dynamically based on module's youtubeVideoId
  const getEmbedUrl = (videoId?: string, embedUrl?: string) => {
    if (embedUrl) return embedUrl;
    const id = videoId || 'KfnyopxdJXQ';
    return `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&enablejsapi=1&autoplay=0`;
  };

  // Reset checklist when module changes
  useEffect(() => {
    setCompletedSteps([1]);
    setShowCompletionModal(false);
    setJustCompletedData(null);
  }, [module.id]);

  const handleToggleStep = (stepIdx: number) => {
    sound.playPop();
    if (completedSteps.includes(stepIdx)) {
      setCompletedSteps(completedSteps.filter((s) => s !== stepIdx));
    } else {
      setCompletedSteps([...completedSteps, stepIdx]);
      sound.playChime();
    }
  };

  // Trigger file selection or camera
  const handlePhotoUploadClick = () => {
    sound.playPop();
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    sound.playShutter();
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      processCreationEvaluation(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveDrawingCreation = (drawingDataUrl: string) => {
    processCreationEvaluation(drawingDataUrl);
  };

  // Find next module in sequence
  const nextModule = allModules.find((m) => m.stepNumber === module.stepNumber + 1);
  const isFinalModule = module.stepNumber >= 4;

  const currentCourse: HobbyCourse | undefined = ALL_COURSES.find(
    (c) => c.id === (module.courseId || selectedCourseId)
  );

  const isCourseUnlocked = (userProfile.unlockedCourseIds || ['origami', 'crochet']).includes(
    currentCourse?.id || module.courseId || selectedCourseId
  );

  const processCreationEvaluation = (imageUrl: string) => {
    setIsEvaluating(true);
    sound.playPop();

    // Auto mark all checklist steps as done upon submission
    setCompletedSteps(checklistItems.map((_, idx) => idx + 1));

    // Simulate smart AI analysis delay
    setTimeout(() => {
      setIsEvaluating(false);
      sound.playFanfare();

      const feedback =
        module.aiFeedbackTemplate ||
        `"${userProfile.name}, outstanding craft precision! Your technique and structural execution are verified. +${module.xpReward} XP earned! 🌟"`;

      onProjectComplete(module.id, imageUrl, feedback);

      if (isFinalModule) {
        // Final module -> Go straight to Celebration with Confetti & voucher unlock!
        onNavigate('celebration');
      } else {
        // Intermediate module -> Show modal congratulating and offering to jump to next unlocked module
        setJustCompletedData({ imageUrl, feedback });
        setShowCompletionModal(true);
      }
    }, 1800);
  };

  // If the course is locked, strictly prevent viewing any video or quest content
  if (!isCourseUnlocked) {
    return (
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-12 relative pb-32">
        <div className="bg-indigo-950/90 backdrop-blur-2xl rounded-[36px] border-2 border-yellow-400/40 p-8 md:p-12 text-center shadow-2xl flex flex-col items-center gap-6">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-yellow-400/20 border-2 border-yellow-400 text-yellow-300 flex items-center justify-center text-5xl shadow-[0_0_40px_rgba(250,204,21,0.4)] animate-pulse">
            <span className="material-symbols-outlined text-5xl md:text-6xl">lock</span>
          </div>

          <div className="max-w-xl space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-amber-300 bg-amber-400/20 px-3 py-1 rounded-full border border-amber-300/30">
              {currentCourse?.category || 'Premium Hobby Quest'} • Locked
            </span>
            <h1 className="text-3xl md:text-5xl font-black text-white italic tracking-tight">
              {currentCourse?.title || 'This Course'} is Locked
            </h1>
            <p className="text-sm md:text-base text-indigo-200 font-medium leading-relaxed mt-2">
              This hobby course is exclusive to <strong>Hiwaya Premium</strong>. Video tutorials, interactive quests, AI coach evaluations, and partner voucher rewards are locked for this course.
            </p>
          </div>

          <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-5 text-left space-y-3">
            <div className="flex items-center gap-3 text-sm text-white font-bold">
              <span className="w-6 h-6 rounded-full bg-emerald-500/30 text-emerald-300 flex items-center justify-center text-xs shrink-0">✓</span>
              <span>Unlock all 4 step-by-step masterclass videos</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-white font-bold">
              <span className="w-6 h-6 rounded-full bg-emerald-500/30 text-emerald-300 flex items-center justify-center text-xs shrink-0">✓</span>
              <span>Real-time AI Coach project feedback & grading</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-white font-bold">
              <span className="w-6 h-6 rounded-full bg-emerald-500/30 text-emerald-300 flex items-center justify-center text-xs shrink-0">✓</span>
              <span>Earn verified {currentCourse?.voucherPartner || 'partner'} vouchers</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-md pt-2">
            <button
              onClick={() => {
                sound.playFanfare();
                onNavigate('pricing');
              }}
              className="btn-yellow-tactile w-full py-4 rounded-2xl font-black text-base md:text-lg flex items-center justify-center gap-2 cursor-pointer shadow-xl"
            >
              <span className="material-symbols-outlined font-black">stars</span>
              <span>Pay Premium to Unlock (QAR 49/mo)</span>
            </button>

            <button
              onClick={() => {
                sound.playPop();
                if (onSelectCourse) onSelectCourse('origami');
                onNavigate('adventure-map');
              }}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition-all cursor-pointer text-center"
            >
              ← Return to Free Quests
            </button>
          </div>
        </div>
      </div>
    );
  }

  const youtubeSrc = getEmbedUrl(module.youtubeVideoId, module.youtubeEmbedUrl);

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 relative pb-32">
      {/* Top Companion Character Floating Banner */}
      <div className="absolute top-2 right-6 z-20 animate-float hidden lg:flex flex-col items-end pointer-events-none">
        <div className="bg-white text-[#0f172a] px-4 py-2.5 rounded-2xl rounded-br-none font-bold text-xs md:text-sm mb-2 shadow-2xl relative border-2 border-white/80">
          Let's finish Quest {module.stepNumber}! 🌟
          <div className="absolute bottom-[-8px] right-4 w-4 h-4 bg-white transform rotate-45" />
        </div>
        <div className="w-20 h-20 bg-indigo-600 rounded-3xl border-4 border-white shadow-2xl flex flex-col items-center justify-center relative overflow-hidden">
          <img
            src={companion.avatarUrl}
            alt={companion.name}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Course Switcher Tabs */}
      {onSelectCourse && (
        <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-xs font-black text-indigo-200 uppercase tracking-wider shrink-0 mr-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">interests</span>
            Hobby Courses:
          </span>
          {ALL_COURSES.map((course) => {
            const isCourseActive = (module.courseId || selectedCourseId) === course.id;
            return (
              <button
                key={course.id}
                onClick={() => {
                  sound.playPop();
                  onSelectCourse(course.id);
                }}
                className={`px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-2 shrink-0 transition-all cursor-pointer border ${
                  isCourseActive
                    ? 'bg-yellow-400 text-indigo-950 border-white shadow-lg scale-105'
                    : 'bg-white/10 hover:bg-white/20 text-white/90 border-white/20'
                }`}
              >
                <span className="material-symbols-outlined text-sm">{course.iconName}</span>
                <span>{course.category}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-5 relative z-10">
        <div className="bg-white/10 backdrop-blur-xl p-5 md:p-6 rounded-3xl border border-white/20 inline-block shadow-2xl">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-xs font-black text-yellow-300 uppercase tracking-wider bg-yellow-400/20 px-3 py-1 rounded-full border border-yellow-300/30 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">
                {currentCourse?.iconName || 'school'}
              </span>
              {module.courseName || currentCourse?.category || 'Creative Quest'}
            </span>
            <span className="text-xs font-black text-white/90 bg-white/15 px-3 py-1 rounded-full border border-white/20">
              Quest {module.stepNumber} of 4
            </span>
            <span className="text-xs font-black text-amber-300 bg-amber-400/20 px-3 py-1 rounded-full border border-amber-300/30 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">bolt</span>
              +{module.xpReward} XP
            </span>
            {module.status === 'completed' && (
              <span className="text-xs font-black text-emerald-300 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-400/40 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                Completed
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight drop-shadow-md mt-2">
            {module.title}
          </h1>
          <p className="text-sm md:text-base text-indigo-200 font-semibold mt-1 max-w-2xl">
            {module.description || module.subtitle}
          </p>
        </div>

        <button
          onClick={() => {
            sound.playPop();
            onNavigate('adventure-map');
          }}
          className="btn-yellow-tactile px-6 md:px-8 py-3.5 rounded-2xl font-black text-base md:text-lg flex items-center gap-2.5 shadow-xl cursor-pointer"
        >
          <span className="material-symbols-outlined">explore</span>
          Back to Quest Map
        </button>
      </div>

      {/* Main Grid: Video Player + Steps/Upload */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        {/* Left Column: Watch (Real Dynamic YouTube Video Player) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel rounded-3xl p-5 md:p-6 shadow-2xl relative overflow-hidden group border-2 border-white/20">
            {/* Real YouTube Video Embed */}
            <div className="aspect-video bg-black rounded-2xl relative overflow-hidden border-4 border-white/20 shadow-2xl">
              <iframe
                id="course-video-iframe"
                key={module.youtubeVideoId || module.id}
                src={youtubeSrc}
                title={module.videoTitle || `${module.title} Video Tutorial`}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>

            {/* Video Info Bar */}
            <div className="mt-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shrink-0 shadow-md">
                  <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    smart_display
                  </span>
                </div>
                <div>
                  <h4 className="text-sm md:text-base font-black text-white line-clamp-1">
                    {module.videoTitle || `Module ${module.stepNumber}: ${module.title}`}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-indigo-200">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">timer</span>
                      {module.videoDurationLabel || '03:30'}
                    </span>
                    <span>•</span>
                    <span className="text-yellow-300 font-bold">Official Course Tutorial</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold bg-white/15 px-3 py-1.5 rounded-lg border border-white/20 text-white shrink-0">
                  Video ID: <span className="text-yellow-300">{module.youtubeVideoId || 'KfnyopxdJXQ'}</span>
                </span>
              </div>
            </div>

            {/* Quick Navigation to Other Modules in This Course */}
            <div className="mt-4 pt-4 border-t border-white/15">
              <span className="text-xs font-black text-white/70 uppercase tracking-wider block mb-2">
                Module Playlist:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {allModules
                  .filter((m) => m.stepKey !== 'CELEBRATE')
                  .map((m) => {
                    const isCurrent = m.id === module.id;
                    const isCompleted = m.status === 'completed';
                    const isLocked = m.status === 'locked';

                    return (
                      <button
                        key={m.id}
                        disabled={isLocked}
                        onClick={() => {
                          if (!isLocked) {
                            sound.playPop();
                            onSelectModule(m.id);
                          }
                        }}
                        className={`p-2 rounded-xl border text-left transition-all flex flex-col gap-1.5 text-xs cursor-pointer overflow-hidden ${
                          isCurrent
                            ? 'bg-yellow-400 text-indigo-950 border-white font-black shadow-lg scale-[1.02]'
                            : isLocked
                            ? 'bg-black/30 border-white/10 text-white/40 cursor-not-allowed opacity-60'
                            : 'bg-white/10 hover:bg-white/20 border-white/20 text-white font-bold'
                        }`}
                      >
                        {m.previewImage && (
                          <div className="w-full h-12 rounded-lg overflow-hidden relative bg-black/40">
                            <img
                              src={m.previewImage}
                              alt={m.title}
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute top-1 left-1 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded font-black">
                              Part {m.stepNumber}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center justify-between w-full">
                          <span className="font-black text-[10px] uppercase truncate">
                            Part {m.stepNumber}
                          </span>
                          {isCompleted ? (
                            <span className="material-symbols-outlined text-xs text-emerald-400 font-bold">check_circle</span>
                          ) : isLocked ? (
                            <span className="material-symbols-outlined text-xs">lock</span>
                          ) : (
                            <span className="material-symbols-outlined text-xs">play_circle</span>
                          )}
                        </div>
                        <span className="line-clamp-1 text-[11px] leading-tight">{m.title}</span>
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Do (Interactive Steps Checklist & Photo Submission) */}
        <div className="space-y-6">
          {/* Steps Checklist */}
          <div className="bg-white/10 backdrop-blur-xl rounded-[32px] p-5 md:p-6 shadow-2xl border border-white/20 relative">
            <h2 className="text-xl md:text-2xl font-black text-white mb-5 flex items-center gap-3 border-b border-white/10 pb-3">
              <div className="w-9 h-9 rounded-2xl bg-yellow-400 flex items-center justify-center text-indigo-950 shadow-md">
                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  task_alt
                </span>
              </div>
              Interactive Checklist
            </h2>

            <ul className="space-y-3.5">
              {checklistItems.map((itemText, idx) => {
                const stepNum = idx + 1;
                const isChecked = completedSteps.includes(stepNum);
                return (
                  <li
                    key={idx}
                    onClick={() => handleToggleStep(stepNum)}
                    className={`flex items-start gap-3.5 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isChecked
                        ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-200'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 text-white'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md ${
                        isChecked
                          ? 'bg-emerald-500 font-black'
                          : 'bg-white/20 text-white/70 font-black'
                      }`}
                    >
                      {isChecked ? (
                        <span className="material-symbols-outlined text-xl font-bold">check</span>
                      ) : (
                        stepNum
                      )}
                    </div>
                    <div className="flex-1 pt-1">
                      <h3
                        className={`text-sm md:text-base font-bold leading-snug ${
                          isChecked ? 'line-through text-white/60' : 'text-white'
                        }`}
                      >
                        {itemText}
                      </h3>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Upload Section with Immersive UI Styling */}
          <div
            id="quest-upload-section"
            className="bg-indigo-950/80 rounded-[32px] border-2 border-indigo-300/40 p-6 shadow-2xl text-center relative overflow-hidden backdrop-blur-xl group scroll-mt-24"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 rounded-full -mr-12 -mt-12 blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-pink-500/20 rounded-full -ml-8 -mb-8 blur-xl pointer-events-none" />

            <h3 className="text-2xl font-black text-white mb-1 relative z-10 drop-shadow-md">
              Submit Quest Photo
            </h3>
            <p className="text-xs md:text-sm text-indigo-200 mb-5 relative z-10 font-semibold">
              {module.submissionPrompt ||
                `Get instant Coach feedback, mark Module ${module.stepNumber} complete, and unlock the next quest! 🚀`}
            </p>

            {/* Hidden real file input with camera support */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Upload / Camera Action Buttons */}
            <div className="flex flex-col gap-3 relative z-10">
              <button
                onClick={handlePhotoUploadClick}
                disabled={isEvaluating}
                className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border-2 border-white/40 py-5 px-4 rounded-2xl border-dashed flex flex-col items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.02] shadow-lg"
              >
                <div className="w-14 h-14 bg-yellow-400 rounded-2xl flex items-center justify-center text-indigo-950 shadow-md">
                  <span className="material-symbols-outlined text-3xl font-black" style={{ fontVariationSettings: "'FILL' 1" }}>
                    photo_camera
                  </span>
                </div>
                <span className="font-black text-base text-white">
                  Take Photo or Upload Submission
                </span>
                <span className="text-xs text-yellow-300 font-bold">
                  +{module.xpReward} XP upon Coach verification
                </span>
              </button>

              <button
                onClick={() => {
                  sound.playPop();
                  setShowDrawingModal(true);
                }}
                disabled={isEvaluating}
                className="w-full py-3 bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl text-xs font-black text-white transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">draw</span>
                Draw on Canvas Instead
              </button>
            </div>

            {/* Analyzing Coach Loader Overlay */}
            {isEvaluating && (
              <div className="absolute inset-0 bg-indigo-950/95 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-white animate-bounce-in">
                <div className="w-16 h-16 rounded-2xl bg-yellow-400 flex items-center justify-center text-indigo-950 mb-3 animate-spin shadow-xl">
                  <span className="material-symbols-outlined text-3xl font-black">verified</span>
                </div>
                <h4 className="font-black text-xl text-white">Coach Verifying...</h4>
                <p className="text-xs text-indigo-200 text-center mt-1 font-semibold max-w-xs">
                  Checking technique precision, geometry symmetry, and awarding +{module.xpReward} XP! 🌟
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Intermediate Module Completion Success Modal */}
      {showCompletionModal && justCompletedData && nextModule && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-indigo-950 border-2 border-yellow-400 rounded-[36px] max-w-lg w-full p-6 md:p-8 shadow-2xl text-center relative overflow-hidden animate-bounce-in">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-500 text-white flex items-center justify-center shadow-xl mb-4 border-4 border-white">
              <span className="material-symbols-outlined text-4xl font-black">check_circle</span>
            </div>

            <div className="inline-flex items-center gap-1.5 bg-yellow-400/20 text-yellow-300 font-black text-xs px-3 py-1 rounded-full border border-yellow-400/30 mb-2">
              🎉 Module {module.stepNumber} Completed! • +{module.xpReward} XP Earned
            </div>

            <h3 className="text-2xl md:text-3xl font-black text-white mb-2">
              Quest Complete!
            </h3>

            <p className="text-sm text-indigo-200 font-medium mb-3 italic p-3 bg-white/10 rounded-2xl border border-white/15">
              {justCompletedData.feedback}
            </p>

            {/* Parent Moderation Status Badge vs Teen Direct Publishing */}
            {userProfile.userRole === 'learner_teen' || userProfile.ageGroup === 'teen_13_plus' ? (
              <div className="bg-purple-500/20 border border-purple-400/40 rounded-2xl p-3 mb-4 text-left flex items-center gap-3">
                <span className="material-symbols-outlined text-purple-300 text-2xl shrink-0">
                  rocket_launch
                </span>
                <div>
                  <span className="text-[10px] font-black uppercase text-purple-300 tracking-wider">
                    ✨ Teen Direct Publishing
                  </span>
                  <p className="text-xs text-purple-100 font-medium leading-tight">
                    Your creation is uploaded directly to the Community Showcase Gallery for peers to explore and react!
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-pink-500/15 border border-pink-400/40 rounded-2xl p-3 mb-4 text-left flex items-center gap-3">
                <span className="material-symbols-outlined text-pink-300 text-2xl shrink-0">
                  shield_lock
                </span>
                <div>
                  <span className="text-[10px] font-black uppercase text-pink-300 tracking-wider">
                    Parent Moderation Queue
                  </span>
                  <p className="text-xs text-pink-100 font-medium leading-tight">
                    Photo saved to family portfolio. Your parent can review & publish it to the Community Gallery in the Parent Hub!
                  </p>
                </div>
              </div>
            )}

            <div className="bg-yellow-400/10 border border-yellow-300/30 rounded-2xl p-3.5 mb-6 text-left flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-yellow-400 text-indigo-950 flex items-center justify-center shrink-0 font-black">
                <span className="material-symbols-outlined text-2xl">lock_open</span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider font-black text-yellow-300">
                  Unlocked Next Adventure
                </span>
                <h4 className="font-black text-white text-sm">
                  Module {nextModule.stepNumber}: {nextModule.title}
                </h4>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  sound.playPop();
                  setShowCompletionModal(false);
                  onNavigate('adventure-map');
                }}
                className="flex-1 py-3.5 px-4 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-black text-sm border border-white/20 cursor-pointer transition-all"
              >
                🗺️ Quest Map
              </button>

              <button
                onClick={() => {
                  sound.playFanfare();
                  setShowCompletionModal(false);
                  onSelectModule(nextModule.id);
                }}
                className="flex-1 btn-yellow-tactile py-3.5 px-4 rounded-2xl font-black text-sm uppercase tracking-tight flex items-center justify-center gap-2 cursor-pointer shadow-xl"
              >
                <span>Start Module {nextModule.stepNumber}</span>
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drawing modal for instant browser drawing */}
      <DrawingPadModal
        isOpen={showDrawingModal}
        onClose={() => setShowDrawingModal(false)}
        onSaveDrawing={handleSaveDrawingCreation}
      />
    </div>
  );
};

