export type AppScreen =
  | 'landing'
  | 'auth'
  | 'onboarding'
  | 'adventure-map'
  | 'project-module'
  | 'celebration'
  | 'parent-hub'
  | 'pricing'
  | 'gallery';

export interface Companion {
  id: string;
  name: string;
  avatarUrl: string;
  role: string;
  personality: string;
  greeting: string;
  accentColor: string;
}

export type PlanType = 'free' | 'premium';
export type UserRole = 'parent' | 'learner_teen' | 'learner_kid' | 'demo';

export interface UserProfile {
  id?: string;
  name: string;
  companionId: string;
  level: number;
  levelTitle: string;
  currentXp: number;
  xpToNextLevel: number;
  streakDays: number;
  unlockedBadges: Badge[];
  vouchers: Voucher[];
  membershipPlan?: PlanType;
  unlockedCourseIds?: string[];
  selectedPremiumChoiceId?: string;
  purchasedAdditionalCourseIds?: string[];
  userRole?: UserRole;
  ageGroup?: 'under_13' | 'teen_13_plus' | 'parent';
  favoriteInterests?: string[];
  email?: string;
}

export interface Badge {
  id: string;
  title: string;
  category: string;
  iconUrl: string;
  description: string;
  unlockedAt?: string;
}

export interface Voucher {
  id: string;
  partnerName: string;
  logoLetter: string;
  valueText: string;
  status: 'claimable' | 'claimed' | 'locked';
  requiredXp?: number;
  code?: string;
  expiry?: string;
}

export type ModerationStatus = 'pending_parent_approval' | 'approved' | 'private' | 'rejected';

export interface ReactionCounts {
  '👍': number;
  '✨': number;
  '💯': number;
  '💛': number;
  '😆': number;
  [key: string]: number;
}

export interface CreationUpload {
  id: string;
  title: string;
  hobbyName: string;
  courseId?: string;
  imageUrl: string;
  uploadedAt: string;
  aiFeedback: string;
  coachName: string;
  authorName?: string;
  authorAge?: number;
  authorCity?: string;
  likesCount: number;
  isApprovedByParent: boolean;
  moderationStatus: ModerationStatus;
  publishedToGallery: boolean;
  approvedAt?: string;
  parentNote?: string;
  reactions: ReactionCounts;
  userLiked?: boolean;
  userReactions?: string[];
}

export interface HobbyCourse {
  id: string;
  title: string;
  category: string;
  tagline: string;
  badgeName: string;
  badgeIconUrl?: string;
  iconName: string;
  themeColor: string;
  thumbnailUrl: string;
  instructorName: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  voucherPartner: string;
  voucherValue: string;
  nodes: MapNode[];
}

export interface MapNode {
  id: string;
  courseId?: string;
  courseName?: string;
  stepNumber: number;
  stepKey: 'SEE' | 'WATCH' | 'DO' | 'CREATE' | 'CELEBRATE';
  title: string;
  subtitle: string;
  description?: string;
  status: 'completed' | 'active' | 'locked';
  xpReward: number;
  icon: string;
  topPercent: number;
  leftPercent: number;
  previewImage?: string;
  prerequisiteId?: string;
  prerequisiteTitle?: string;
  youtubeVideoId?: string;
  youtubeEmbedUrl?: string;
  videoTitle?: string;
  videoDurationSec?: number;
  videoDurationLabel?: string;
  checklist?: string[];
  submissionPrompt?: string;
  aiFeedbackTemplate?: string;
}

export interface ParentSettings {
  safetyMode: boolean;
  timeLimitMinutes: number;
  communityAccess: boolean;
  dailyNotification: boolean;
  aiParentInsights: boolean;
}
