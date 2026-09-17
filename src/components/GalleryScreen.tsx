import React, { useState } from 'react';
import { ALL_COURSES } from '../data/mockData';
import { AppScreen, CreationUpload, UserProfile } from '../types';
import { sound } from '../utils/audio';

interface GalleryScreenProps {
  creations: CreationUpload[];
  userProfile: UserProfile;
  onNavigate: (screen: AppScreen) => void;
  onReactCreation?: (creationId: string, emoji: string) => void;
  onLikeCreation?: (creationId: string) => void;
  onOpenParentPin?: () => void;
}

const REACTION_EMOJIS = [
  { emoji: '👍', label: 'Great Job', color: 'hover:bg-blue-500/30 text-blue-300' },
  { emoji: '✨', label: 'Creative', color: 'hover:bg-yellow-500/30 text-yellow-300' },
  { emoji: '💯', label: 'Masterpiece', color: 'hover:bg-red-500/30 text-red-300' },
  { emoji: '💛', label: 'Love It', color: 'hover:bg-amber-500/30 text-amber-300' },
  { emoji: '😆', label: 'Fun', color: 'hover:bg-emerald-500/30 text-emerald-300' }
];

export const GalleryScreen: React.FC<GalleryScreenProps> = ({
  creations,
  userProfile,
  onNavigate,
  onReactCreation,
  onLikeCreation,
  onOpenParentPin
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'reactions'>('recent');
  const [selectedModalCreation, setSelectedModalCreation] = useState<CreationUpload | null>(null);
  const [floatingReaction, setFloatingReaction] = useState<{ id: string; emoji: string } | null>(null);

  // Only show approved and published items in public gallery
  const publishedCreations = creations.filter(
    (c) => c.isApprovedByParent && c.publishedToGallery
  );

  // Filter & Search
  const filteredCreations = publishedCreations
    .filter((item) => {
      if (selectedCategory !== 'all') {
        const matchesCategory =
          item.hobbyName.toLowerCase().includes(selectedCategory.toLowerCase()) ||
          item.courseId === selectedCategory;
        if (!matchesCategory) return false;
      }

      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesAuthor = (item.authorName || '').toLowerCase().includes(q);
        const matchesHobby = item.hobbyName.toLowerCase().includes(q);
        if (!matchesTitle && !matchesAuthor && !matchesHobby) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'popular') {
        return b.likesCount - a.likesCount;
      }
      if (sortBy === 'reactions') {
        const totalA = Object.values(a.reactions || {}).reduce<number>((acc, v) => acc + (typeof v === 'number' ? v : 0), 0);
        const totalB = Object.values(b.reactions || {}).reduce<number>((acc, v) => acc + (typeof v === 'number' ? v : 0), 0);
        return totalB - totalA;
      }
      return 0; // Default order
    });

  const handleReactionClick = (creationId: string, emoji: string, e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playPop();

    // Trigger visual float animation
    setFloatingReaction({ id: creationId, emoji });
    setTimeout(() => {
      setFloatingReaction(null);
    }, 900);

    if (onReactCreation) {
      onReactCreation(creationId, emoji);
    }
  };

  const handleLikeClick = (creationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playChime();
    if (onLikeCreation) {
      onLikeCreation(creationId);
    }
  };

  // Count Alex's pending items for the banner
  const alexPendingCount = creations.filter(
    (c) => c.authorName === userProfile.name && !c.isApprovedByParent
  ).length;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 relative pb-36">
      {/* Top Hero Banner */}
      <div className="text-center max-w-3xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-yellow-400/20 border border-yellow-300/30 rounded-full text-yellow-300 text-xs font-black uppercase tracking-wider mb-3">
          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
            palette
          </span>
          Qatar Young Makers Community
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight drop-shadow-md">
          Makers Showcase & Gallery ✨
        </h1>
        <p className="text-sm md:text-base text-indigo-100 font-semibold mt-2">
          Discover verified craft projects, origami masterpieces, and STEM inventions created by young learners across Qatar.
        </p>
      </div>

      {/* Safety & Moderation Info Banner */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-4 md:p-5 mb-8 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5 text-left">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-2xl">verified_user</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-white text-sm md:text-base">
                Safe & Parent-Approved Community
              </h3>
              <span className="text-[10px] bg-emerald-400 text-emerald-950 px-2 py-0.5 rounded-full font-black uppercase">
                100% Moderated
              </span>
            </div>
            <p className="text-xs text-indigo-200 mt-0.5">
              Every photo in this gallery has been reviewed by Coach and approved by parents before appearing publicly.
            </p>
          </div>
        </div>

        {alexPendingCount > 0 && !(userProfile.userRole === 'learner_teen' || userProfile.ageGroup === 'teen_13_plus') ? (
          <button
            onClick={() => {
              sound.playPop();
              if (onOpenParentPin) onOpenParentPin();
            }}
            className="w-full md:w-auto px-4 py-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:scale-105 transition-all shrink-0"
          >
            <span className="material-symbols-outlined text-base">lock</span>
            <span>{alexPendingCount} Pending Parent Approval in Hub</span>
          </button>
        ) : (
          <button
            onClick={() => {
              sound.playPop();
              onNavigate('adventure-map');
            }}
            className="w-full md:w-auto px-4 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-indigo-950 rounded-2xl font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:scale-105 transition-all shrink-0"
          >
            <span className="material-symbols-outlined text-base">add_a_photo</span>
            <span>Submit Your Quest Photo</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-8">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 scrollbar-none">
          <button
            onClick={() => {
              sound.playPop();
              setSelectedCategory('all');
            }}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all shrink-0 cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-yellow-400 text-indigo-950 shadow-lg scale-105'
                : 'bg-white/10 hover:bg-white/20 text-white/80 border border-white/15'
            }`}
          >
            🌟 All Creations ({publishedCreations.length})
          </button>

          {ALL_COURSES.map((course) => {
            const isSelected = selectedCategory === course.id;
            return (
              <button
                key={course.id}
                onClick={() => {
                  sound.playPop();
                  setSelectedCategory(course.id);
                }}
                className={`px-3.5 py-2 rounded-2xl text-xs font-black transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-yellow-400 text-indigo-950 shadow-lg scale-105'
                    : 'bg-white/10 hover:bg-white/20 text-white/80 border border-white/15'
                }`}
              >
                <span className="material-symbols-outlined text-sm">{course.iconName}</span>
                <span>{course.category}</span>
              </button>
            );
          })}
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-3 w-full lg:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 lg:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">
              search
            </span>
            <input
              type="text"
              placeholder="Search by project or maker..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/30 border border-white/20 rounded-2xl pl-9 pr-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-yellow-400 backdrop-blur-md"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="bg-black/30 border border-white/20 rounded-2xl px-3 py-1.5 flex items-center gap-1.5 shrink-0 backdrop-blur-md">
            <span className="material-symbols-outlined text-xs text-white/60">sort</span>
            <select
              value={sortBy}
              onChange={(e) => {
                sound.playPop();
                setSortBy(e.target.value as any);
              }}
              className="bg-transparent text-xs font-black text-white focus:outline-none cursor-pointer"
            >
              <option value="recent" className="bg-indigo-950 text-white">Latest</option>
              <option value="popular" className="bg-indigo-950 text-white">Most Liked ❤️</option>
              <option value="reactions" className="bg-indigo-950 text-white">Top Sparkles ✨</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Gallery Cards */}
      {filteredCreations.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4 text-3xl">
            🎨
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No creations found</h3>
          <p className="text-xs text-indigo-200 mb-6">
            Try adjusting your search query or select another hobby category.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className="btn-yellow-tactile text-xs font-black px-5 py-2.5 rounded-xl cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCreations.map((item) => {
            const hasUserLiked = item.userLiked;
            const reactions = item.reactions || { '👍': 0, '✨': 0, '💯': 0, '💛': 0, '😆': 0 };
            const isAlexCreation = item.authorName === userProfile.name;

            return (
              <div
                key={item.id}
                onClick={() => {
                  sound.playPop();
                  setSelectedModalCreation(item);
                }}
                className="bg-white/10 backdrop-blur-xl border-2 border-white/20 rounded-[32px] overflow-hidden shadow-2xl hover:border-yellow-400/60 hover:shadow-[0_0_30px_rgba(250,204,21,0.2)] transition-all flex flex-col justify-between group cursor-pointer relative"
              >
                {/* Float Animation Overlay */}
                {floatingReaction && floatingReaction.id === item.id && (
                  <div className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center">
                    <span className="text-6xl animate-bounce-in drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
                      {floatingReaction.emoji}
                    </span>
                  </div>
                )}

                {/* Top Image Preview */}
                <div className="relative h-60 overflow-hidden bg-black/40">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Gradient bottom overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-indigo-950 via-transparent to-black/30 pointer-events-none" />

                  {/* Hobby Tag & Parent Approved Badge */}
                  <div className="absolute top-3.5 left-3.5 right-3.5 flex justify-between items-center pointer-events-none">
                    <span className="px-3 py-1 bg-black/60 backdrop-blur-md border border-white/30 rounded-full text-[11px] font-black text-yellow-300">
                      {item.hobbyName}
                    </span>

                    <span className="px-2.5 py-1 bg-emerald-500/90 backdrop-blur-md text-white rounded-full text-[10px] font-black flex items-center gap-1 shadow-lg border border-white/30">
                      <span className="material-symbols-outlined text-xs">verified</span>
                      Parent Approved
                    </span>
                  </div>

                  {/* Author Pill Overlay */}
                  <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/20">
                      <div className="w-6 h-6 rounded-full bg-yellow-400 text-indigo-950 flex items-center justify-center font-black text-xs">
                        {item.authorName ? item.authorName.charAt(0) : 'M'}
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-black text-white leading-none">
                          {item.authorName || 'Young Maker'} {item.authorAge ? `(${item.authorAge})` : ''}
                        </p>
                        <p className="text-[9px] text-indigo-200 leading-none mt-0.5">
                          {item.authorCity || 'Qatar'}
                        </p>
                      </div>
                    </div>

                    {isAlexCreation && (
                      <span className="px-2 py-0.5 bg-yellow-400 text-indigo-950 rounded-full text-[10px] font-black shadow">
                        Your Project! ⭐
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Content & Quotes */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-black text-white group-hover:text-yellow-300 transition-colors mb-2">
                      {item.title}
                    </h3>

                    {/* Coach Feedback Box */}
                    <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-xs text-white/90 mb-3">
                      <p className="text-[10px] font-black text-yellow-300 uppercase tracking-wider mb-0.5 flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">verified</span>
                        Coach Feedback:
                      </p>
                      <p className="italic text-indigo-100 leading-relaxed text-[11px] line-clamp-2">
                        "{item.aiFeedback}"
                      </p>
                    </div>

                    {/* Parent Note (if present) */}
                    {item.parentNote && (
                      <div className="p-2.5 bg-pink-500/10 rounded-2xl border border-pink-400/30 text-xs text-pink-200 mb-3 flex items-start gap-2">
                        <span className="material-symbols-outlined text-pink-300 text-sm shrink-0">
                          favorite
                        </span>
                        <p className="italic text-[11px] leading-tight">
                          "{item.parentNote}"
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Social Action Bar: Like Button & 5 Reaction Emojis */}
                  <div className="pt-3 border-t border-white/15 space-y-2.5">
                    {/* Primary Like + Total Reactions Row */}
                    <div className="flex items-center justify-between">
                      {/* Interactive Like Button */}
                      <button
                        onClick={(e) => handleLikeClick(item.id, e)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer ${
                          hasUserLiked
                            ? 'bg-red-500 text-white shadow-[0_0_12px_rgba(239,68,68,0.5)] scale-105'
                            : 'bg-white/10 hover:bg-white/20 text-white/90 border border-white/15'
                        }`}
                      >
                        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: hasUserLiked ? "'FILL' 1" : "'FILL' 0" }}>
                          favorite
                        </span>
                        <span>{item.likesCount} Likes</span>
                      </button>

                      <span className="text-[11px] text-indigo-200 font-bold">
                        {Object.values(reactions).reduce((acc: number, v) => acc + (typeof v === 'number' ? v : 0), 0)} Reactions
                      </span>
                    </div>

                    {/* 5 Distinct Emotion Reaction Emoji Selector */}
                    <div className="flex items-center justify-between gap-1 bg-black/30 p-1.5 rounded-2xl border border-white/15 backdrop-blur-md">
                      {REACTION_EMOJIS.map((r) => {
                        const count = reactions[r.emoji] || 0;
                        const isUserReacted = item.userReactions?.includes(r.emoji);

                        return (
                          <button
                            key={r.emoji}
                            onClick={(e) => handleReactionClick(item.id, r.emoji, e)}
                            title={r.label}
                            className={`flex-1 py-1 px-1 rounded-xl text-xs font-black flex items-center justify-center gap-1 transition-all cursor-pointer hover:scale-110 active:scale-95 ${
                              isUserReacted
                                ? 'bg-yellow-400/30 border border-yellow-300 text-white'
                                : `${r.color} hover:bg-white/20`
                            }`}
                          >
                            <span className="text-sm">{r.emoji}</span>
                            <span className="text-[10px] font-mono text-white/90">{count}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detailed Modal Viewer */}
      {selectedModalCreation && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedModalCreation(null)}
        >
          <div
            className="bg-indigo-950/95 border-2 border-indigo-300/40 rounded-[36px] p-6 md:p-8 max-w-2xl w-full shadow-2xl text-white relative max-h-[90vh] overflow-y-auto animate-bounce-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedModalCreation(null)}
              className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-lg font-black cursor-pointer z-10"
            >
              ✕
            </button>

            {/* Header Badge */}
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-yellow-400/20 border border-yellow-300/30 text-yellow-300 rounded-full text-xs font-black uppercase">
                {selectedModalCreation.hobbyName}
              </span>
              <span className="px-3 py-1 bg-emerald-500/30 border border-emerald-400 text-emerald-200 rounded-full text-xs font-black flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">verified</span>
                Verified & Parent Approved
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl font-black text-white mb-4">
              {selectedModalCreation.title}
            </h2>

            {/* Big High-Res Image */}
            <div className="rounded-3xl overflow-hidden border-2 border-white/20 mb-5 max-h-80 bg-black/40">
              <img
                src={selectedModalCreation.imageUrl}
                alt={selectedModalCreation.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain max-h-80"
              />
            </div>

            {/* Maker & Coach Review Details */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between p-3.5 bg-white/5 rounded-2xl border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-yellow-400 text-indigo-950 flex items-center justify-center font-black text-sm">
                    {selectedModalCreation.authorName ? selectedModalCreation.authorName.charAt(0) : 'M'}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">
                      {selectedModalCreation.authorName || 'Young Maker'} {selectedModalCreation.authorAge ? `(Age ${selectedModalCreation.authorAge})` : ''}
                    </h4>
                    <p className="text-xs text-indigo-200">{selectedModalCreation.authorCity || 'Qatar'} • Uploaded {selectedModalCreation.uploadedAt}</p>
                  </div>
                </div>

                <button
                  onClick={(e) => handleLikeClick(selectedModalCreation.id, e)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black transition-all cursor-pointer ${
                    selectedModalCreation.userLiked
                      ? 'bg-red-500 text-white shadow-lg'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">favorite</span>
                  <span>{selectedModalCreation.likesCount} Likes</span>
                </button>
              </div>

              {/* Coach Feedback */}
              <div className="p-4 bg-white/5 rounded-2xl border border-white/15">
                <p className="text-xs font-black text-yellow-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">verified</span>
                  Coach Spark Evaluation:
                </p>
                <p className="text-sm italic text-white leading-relaxed">
                  "{selectedModalCreation.aiFeedback}"
                </p>
              </div>

              {/* Parent Note */}
              {selectedModalCreation.parentNote && (
                <div className="p-4 bg-pink-500/15 rounded-2xl border border-pink-400/40">
                  <p className="text-xs font-black text-pink-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">favorite</span>
                    Parent's Pride & Note:
                  </p>
                  <p className="text-sm italic text-pink-100 leading-relaxed">
                    "{selectedModalCreation.parentNote}"
                  </p>
                </div>
              )}
            </div>

            {/* Reaction Selector in Modal */}
            <div className="p-4 bg-black/40 rounded-2xl border border-white/15">
              <p className="text-xs font-bold text-indigo-200 mb-2 text-center">
                React with positive praise for this young maker:
              </p>
              <div className="flex items-center justify-around gap-2">
                {REACTION_EMOJIS.map((r) => {
                  const count = selectedModalCreation.reactions?.[r.emoji] || 0;
                  const isUserReacted = selectedModalCreation.userReactions?.includes(r.emoji);

                  return (
                    <button
                      key={r.emoji}
                      onClick={(e) => handleReactionClick(selectedModalCreation.id, r.emoji, e)}
                      className={`flex-1 py-2 px-2 rounded-xl text-sm font-black flex flex-col items-center gap-1 transition-all cursor-pointer hover:scale-110 active:scale-95 ${
                        isUserReacted
                          ? 'bg-yellow-400 text-indigo-950 shadow-md font-black'
                          : 'bg-white/10 hover:bg-white/20 text-white'
                      }`}
                    >
                      <span className="text-xl">{r.emoji}</span>
                      <span className="text-[11px]">{r.label}</span>
                      <span className="text-[10px] font-mono opacity-80">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
