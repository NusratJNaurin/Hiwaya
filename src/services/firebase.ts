import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { UserProfile, CreationUpload, MapNode } from '../types';
import { INITIAL_USER_PROFILE, INITIAL_CREATIONS } from '../data/mockData';

interface FirebaseConfigValues {
  projectId?: string;
  appId?: string;
  apiKey?: string;
  authDomain?: string;
  firestoreDatabaseId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  measurementId?: string;
  oAuthClientId?: string;
}

// Safely attempt optional local config loading without failing Vite/Vercel production builds
// when firebase-applet-config.json is absent in Git.
const optionalLocalConfigs = import.meta.glob<{ default: FirebaseConfigValues }>(
  ['/firebase-applet-config.json', '../../firebase-applet-config.json'],
  { eager: true }
);

const localConfigFile: FirebaseConfigValues =
  optionalLocalConfigs['/firebase-applet-config.json']?.default ||
  optionalLocalConfigs['../../firebase-applet-config.json']?.default ||
  {};

// Resolve configuration: prioritize environment variables (essential for Vercel and CI)
// with fallback to optional local development config.
export const firebaseConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || localConfigFile.projectId || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || localConfigFile.appId || '',
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || localConfigFile.apiKey || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || localConfigFile.authDomain || '',
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || localConfigFile.firestoreDatabaseId || '(default)',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || localConfigFile.storageBucket || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || localConfigFile.messagingSenderId || '',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || localConfigFile.measurementId || '',
  oAuthClientId: import.meta.env.VITE_FIREBASE_OAUTH_CLIENT_ID || localConfigFile.oAuthClientId || '',
};

// 1. Initialize Firebase App
export const firebaseApp = initializeApp(firebaseConfig);

// 2. Initialize Auth
export const auth = getAuth(firebaseApp);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// 3. Initialize Firestore with named database ID if configured
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId)
  : getFirestore(firebaseApp);

// ============================================================================
// AUTHENTICATION SERVICES
// ============================================================================

/**
 * Sign in with Google Popup
 */
export async function signInWithGoogle(): Promise<{ user: FirebaseUser; isNewUser?: boolean }> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { user: result.user };
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    throw new Error(error?.message || 'Google Sign-In failed. Please try again.');
  }
}

/**
 * Sign up with Email and Password
 */
export async function registerWithEmail(
  email: string, 
  pass: string, 
  displayName: string,
  role: 'learner_kid' | 'learner_teen' | 'parent' = 'learner_kid'
): Promise<FirebaseUser> {
  const cred = await createUserWithEmailAndPassword(auth, email, pass);
  if (displayName) {
    await updateProfile(cred.user, { displayName });
  }

  // Create initial user document in Firestore
  const initialProfile: UserProfile = {
    ...INITIAL_USER_PROFILE,
    name: displayName || 'Explorer',
    email: email,
    userRole: role,
    ageGroup: role === 'parent' ? 'parent' : role === 'learner_teen' ? 'teen_13_plus' : 'under_13',
    membershipPlan: 'free',
    unlockedCourseIds: ['origami', 'crochet'],
    favoriteInterests: ['origami', 'crochet']
  };

  await saveUserProfile(cred.user.uid, initialProfile);
  return cred.user;
}

/**
 * Sign in with Email and Password
 */
export async function loginWithEmail(email: string, pass: string): Promise<FirebaseUser> {
  const cred = await signInWithEmailAndPassword(auth, email, pass);
  return cred.user;
}

/**
 * Sign out of current session
 */
export async function logOutUser(): Promise<void> {
  await signOut(auth);
}

/**
 * Listen for auth state changes
 */
export function subscribeToAuth(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// ============================================================================
// FIRESTORE USER PROFILE SERVICES
// ============================================================================

export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userDocRef = doc(db, 'users', uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (err) {
    console.error('Failed to fetch user profile from Firestore:', err);
    return null;
  }
}

export async function saveUserProfile(uid: string, profile: Partial<UserProfile>): Promise<void> {
  try {
    const userDocRef = doc(db, 'users', uid);
    await setDoc(userDocRef, {
      ...profile,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.error('Failed to save user profile to Firestore:', err);
  }
}

// ============================================================================
// FIRESTORE QUEST & COURSE PROGRESS SERVICES
// ============================================================================

export interface CourseProgressRecord {
  courseId: string;
  completedStepNumbers: number[];
  completedCount: number;
  isRewardUnlocked: boolean;
  nodeStatuses: Record<string, 'completed' | 'active' | 'locked'>;
  updatedAt: string;
}

/**
 * Load user's saved quest progress for a specific course
 */
export async function fetchCourseProgress(uid: string, courseId: string): Promise<CourseProgressRecord | null> {
  try {
    const progressRef = doc(db, 'users', uid, 'quest_progress', courseId);
    const snap = await getDoc(progressRef);
    if (snap.exists()) {
      return snap.data() as CourseProgressRecord;
    }
    return null;
  } catch (err) {
    console.error(`Failed to fetch quest progress for ${courseId}:`, err);
    return null;
  }
}

/**
 * Save user's quest progress for a course to Firestore
 */
export async function saveCourseProgress(
  uid: string, 
  courseId: string, 
  modules: MapNode[]
): Promise<void> {
  try {
    const progressRef = doc(db, 'users', uid, 'quest_progress', courseId);
    
    const completedStepNumbers = modules
      .filter(m => m.status === 'completed' && m.stepNumber <= 4)
      .map(m => m.stepNumber);
    
    const completedCount = completedStepNumbers.length;
    const isRewardUnlocked = completedCount >= 4;

    const nodeStatuses: Record<string, 'completed' | 'active' | 'locked'> = {};
    modules.forEach(m => {
      nodeStatuses[m.id] = m.status;
    });

    const record: CourseProgressRecord = {
      courseId,
      completedStepNumbers,
      completedCount,
      isRewardUnlocked,
      nodeStatuses,
      updatedAt: new Date().toISOString()
    };

    await setDoc(progressRef, record, { merge: true });
  } catch (err) {
    console.error(`Failed to save quest progress for ${courseId}:`, err);
  }
}

// ============================================================================
// FIRESTORE CREATIONS & GALLERY SERVICES
// ============================================================================

export async function fetchCreations(): Promise<CreationUpload[]> {
  try {
    const creationsRef = collection(db, 'creations');
    const q = query(creationsRef, orderBy('uploadedAt', 'desc'), limit(50));
    const snap = await getDocs(q);
    
    if (snap.empty) {
      return INITIAL_CREATIONS;
    }

    const fetched: CreationUpload[] = [];
    snap.forEach((docSnap) => {
      fetched.push({ id: docSnap.id, ...(docSnap.data() as any) });
    });

    // Merge with base initial creations if few
    return fetched.length > 0 ? fetched : INITIAL_CREATIONS;
  } catch (err) {
    console.warn('Could not fetch creations from Firestore (using local fallback):', err);
    return INITIAL_CREATIONS;
  }
}

export async function uploadCreation(creation: CreationUpload, uid?: string): Promise<void> {
  try {
    const creationDoc = doc(db, 'creations', creation.id);
    await setDoc(creationDoc, {
      ...creation,
      userId: uid || 'anonymous',
      createdAt: new Date().toISOString()
    });
  } catch (err) {
    console.error('Failed to upload creation to Firestore:', err);
  }
}

export async function updateCreationInDb(id: string, updates: Partial<CreationUpload>): Promise<void> {
  try {
    const creationDoc = doc(db, 'creations', id);
    await updateDoc(creationDoc, updates);
  } catch (err) {
    console.warn('Failed to update creation in Firestore:', err);
  }
}

// ============================================================================
// COURSE ENTITLEMENT & ACCESS CONTROL LOGIC
// ============================================================================

export const FREE_STARTER_COURSE_IDS = ['origami', 'crochet'];

export interface CourseAccessVerification {
  hasAccess: boolean;
  isPremium: boolean;
  courseId: string;
  reason: 'free_starter' | 'premium_unlocked' | 'premium_locked';
  paywallMessage?: {
    badge: string;
    title: string;
    subtitle: string;
    note: string;
  };
}

/**
 * Structured Course Access Logic (Client & Cloud Verification)
 * Determines whether the user has authorized access to a course.
 * Free courses (origami, crochet) are always accessible.
 * Premium courses require explicit entitlements in the user's database record.
 */
export function verifyCourseAccess(
  userProfile: Partial<UserProfile> | null | undefined,
  courseId: string
): CourseAccessVerification {
  const isFreeStarter = FREE_STARTER_COURSE_IDS.includes(courseId);
  
  if (isFreeStarter) {
    return {
      hasAccess: true,
      isPremium: false,
      courseId,
      reason: 'free_starter'
    };
  }

  // Check user profile database entitlements
  const unlocked = userProfile?.unlockedCourseIds || [];
  const isExplicitlyUnlocked = unlocked.includes(courseId);

  // In MVP: Premium courses are locked by default; real payments are not processed
  return {
    hasAccess: isExplicitlyUnlocked,
    isPremium: true,
    courseId,
    reason: isExplicitlyUnlocked ? 'premium_unlocked' : 'premium_locked',
    paywallMessage: {
      badge: '🔒 Premium Course',
      title: 'This course is part of Hiwaya Premium.',
      subtitle: 'Premium access is not currently available in this MVP.',
      note: 'This demo does not process real payments.'
    }
  };
}

/**
 * Fetch and verify access directly against the Firestore user document
 */
export async function verifyCourseAccessWithDatabase(
  uid: string,
  courseId: string
): Promise<CourseAccessVerification> {
  const isFreeStarter = FREE_STARTER_COURSE_IDS.includes(courseId);
  if (isFreeStarter) {
    return {
      hasAccess: true,
      isPremium: false,
      courseId,
      reason: 'free_starter'
    };
  }

  const profile = await fetchUserProfile(uid);
  return verifyCourseAccess(profile, courseId);
}

