/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ALL_COURSES, COMPANIONS, INITIAL_CREATIONS, INITIAL_MAP_NODES, INITIAL_USER_PROFILE } from './data/mockData';
import { AppScreen, CreationUpload, MapNode, UserProfile } from './types';
import { TopNavbar } from './components/TopNavbar';
import { ShaderBackground } from './components/ShaderBackground';
import { LandingPage } from './components/LandingPage';
import { AuthScreen } from './components/AuthScreen';
import { OnboardingScreen } from './components/OnboardingScreen';
import { AdventureMapScreen } from './components/AdventureMapScreen';
import { ProjectModuleScreen } from './components/ProjectModuleScreen';
import { CelebrationScreen } from './components/CelebrationScreen';
import { ParentDashboardScreen } from './components/ParentDashboardScreen';
import { PricingScreen } from './components/PricingScreen';
import { GalleryScreen } from './components/GalleryScreen';
import { CompanionFloating } from './components/CompanionFloating';
import { ParentPinModal } from './components/ParentPinModal';
import { 
  subscribeToAuth, 
  fetchUserProfile, 
  saveUserProfile, 
  fetchCourseProgress, 
  saveCourseProgress, 
  fetchCreations, 
  uploadCreation, 
  updateCreationInDb, 
  logOutUser,
  verifyCourseAccess
} from './services/firebase';

const applyProgressToNodes = (
  nodes: MapNode[], 
  nodeStatuses?: Record<string, 'completed' | 'active' | 'locked'>
): MapNode[] => {
  if (!nodeStatuses) return nodes;
  return nodes.map(node => {
    if (nodeStatuses[node.id]) {
      return { ...node, status: nodeStatuses[node.id] };
    }
    return node;
  });
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('landing');
  const [screenHistory, setScreenHistory] = useState<AppScreen[]>(['landing']);
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_USER_PROFILE);
  const [creations, setCreations] = useState<CreationUpload[]>(INITIAL_CREATIONS);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('origami');
  const [modules, setModules] = useState<MapNode[]>(INITIAL_MAP_NODES);
  const [activeModuleId, setActiveModuleId] = useState<string>('node-1');
  const [showParentPin, setShowParentPin] = useState(false);
  const [latestAiFeedback, setLatestAiFeedback] = useState<string>('');

  // 1. Synchronize with Firebase Auth & Remote Firestore on App Mount
  useEffect(() => {
    const unsubscribe = subscribeToAuth(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const remoteProfile = await fetchUserProfile(firebaseUser.uid);
          if (remoteProfile) {
            setUserProfile({
              ...INITIAL_USER_PROFILE,
              ...remoteProfile,
              id: firebaseUser.uid,
              email: firebaseUser.email || remoteProfile.email
            });
          }

          // Restore quest progress for currently selected course
          const savedProgress = await fetchCourseProgress(firebaseUser.uid, selectedCourseId);
          if (savedProgress?.nodeStatuses) {
            const courseObj = ALL_COURSES.find(c => c.id === selectedCourseId);
            if (courseObj) {
              const restored = applyProgressToNodes(courseObj.nodes, savedProgress.nodeStatuses);
              setModules(restored);
              const activeNode = restored.find(n => n.status === 'active') || restored[0];
              setActiveModuleId(activeNode.id);
            }
          }
        } catch (err) {
          console.warn('Firebase initial auth hydration note:', err);
        }
      }
    });

    // Load physical creations and gallery items from Firestore
    fetchCreations().then((dbCreations) => {
      if (dbCreations && dbCreations.length > 0) {
        setCreations(dbCreations);
      }
    });

    return () => unsubscribe();
  }, [selectedCourseId]);

  const navigateTo = (screen: AppScreen) => {
    // Prevent teens from accessing parent-hub
    if (screen === 'parent-hub' && (userProfile.userRole === 'learner_teen' || userProfile.ageGroup === 'teen_13_plus')) {
      screen = 'adventure-map';
    }

    // Security & entitlement check: block navigating to quest lessons if course is premium locked
    if (screen === 'project-module') {
      const access = verifyCourseAccess(userProfile, selectedCourseId);
      if (!access.hasAccess) {
        setCurrentScreen('adventure-map');
        return;
      }
    }

    if (screen === currentScreen) return;
    if (screen === 'adventure-map') {
      setScreenHistory(['adventure-map']);
    } else {
      setScreenHistory((prev) => [...prev, screen]);
    }
    setCurrentScreen(screen);
  };

  const handleDemoLogin = (persona: 'kid' | 'teen' | 'parent' = 'kid') => {
    if (persona === 'parent') {
      setUserProfile({
        ...INITIAL_USER_PROFILE,
        name: 'Sarah (Parent)',
        userRole: 'parent',
        ageGroup: 'parent'
      });
      setCurrentScreen('parent-hub');
      setScreenHistory(['parent-hub']);
    } else if (persona === 'teen') {
      setUserProfile({
        ...INITIAL_USER_PROFILE,
        name: 'Maya',
        userRole: 'learner_teen',
        ageGroup: 'teen_13_plus'
      });
      setCurrentScreen('adventure-map');
      setScreenHistory(['adventure-map']);
    } else {
      setUserProfile({
        ...INITIAL_USER_PROFILE,
        name: 'Alex',
        userRole: 'demo',
        ageGroup: 'under_13'
      });
      setCurrentScreen('adventure-map');
      setScreenHistory(['adventure-map']);
    }
  };

  const handleLoginSuccess = async (profileData: Partial<UserProfile>) => {
    const merged: UserProfile = {
      ...INITIAL_USER_PROFILE,
      ...profileData,
      name: profileData.name || 'Explorer'
    };
    setUserProfile(merged);

    // If user has a real account ID, load their saved quest progress immediately
    if (merged.id) {
      try {
        const savedProgress = await fetchCourseProgress(merged.id, selectedCourseId);
        if (savedProgress?.nodeStatuses) {
          const courseObj = ALL_COURSES.find(c => c.id === selectedCourseId);
          if (courseObj) {
            const restored = applyProgressToNodes(courseObj.nodes, savedProgress.nodeStatuses);
            setModules(restored);
            const activeNode = restored.find(n => n.status === 'active') || restored[0];
            setActiveModuleId(activeNode.id);
          }
        }
      } catch (e) {
        console.warn('Could not load course progress on login:', e);
      }
    }

    if (merged.userRole === 'parent') {
      setCurrentScreen('parent-hub');
      setScreenHistory(['parent-hub']);
    } else {
      setCurrentScreen('adventure-map');
      setScreenHistory(['adventure-map']);
    }
  };

  const handleLogout = async () => {
    try {
      await logOutUser();
    } catch (e) {
      console.warn('Logout note:', e);
    }
    setUserProfile(INITIAL_USER_PROFILE);
    setModules(INITIAL_MAP_NODES);
    setCurrentScreen('landing');
    setScreenHistory(['landing']);
  };

  const handleBack = () => {
    if (screenHistory.length > 1) {
      const updatedHistory = [...screenHistory];
      updatedHistory.pop(); // Remove current
      const previousScreen = updatedHistory[updatedHistory.length - 1] || 'adventure-map';
      setScreenHistory(updatedHistory);
      setCurrentScreen(previousScreen);
    } else {
      setCurrentScreen('adventure-map');
      setScreenHistory(['adventure-map']);
    }
  };

  const handleCourseChange = async (courseId: string) => {
    setSelectedCourseId(courseId);
    const targetCourse = ALL_COURSES.find((c) => c.id === courseId);
    if (targetCourse) {
      let currentNodes = targetCourse.nodes;

      // Load remote Firestore quest progress if user is authenticated
      if (userProfile.id) {
        try {
          const savedProgress = await fetchCourseProgress(userProfile.id, courseId);
          if (savedProgress?.nodeStatuses) {
            currentNodes = applyProgressToNodes(targetCourse.nodes, savedProgress.nodeStatuses);
          }
        } catch (e) {
          console.warn('Could not fetch course progress for course change:', e);
        }
      }

      setModules(currentNodes);
      const firstActive = currentNodes.find((n) => n.status === 'active') || currentNodes[0];
      setActiveModuleId(firstActive.id);
    }
  };

  // Current active module object
  const currentModule = modules.find((m) => m.id === activeModuleId) || modules[0];

  // Completed quests count (out of 4 main course steps)
  const completedCount = modules.filter(m => m.status === 'completed' && m.stepNumber <= 4).length;
  const isRewardUnlocked = completedCount >= 4;

  // Current chosen companion object
  const currentCompanion =
    COMPANIONS.find((c) => c.id === userProfile.companionId) || COMPANIONS[1];

  const handleSaveProfile = (name: string, companionId: string) => {
    setUserProfile((prev) => {
      const updated = {
        ...prev,
        name,
        companionId
      };
      if (prev.id) {
        saveUserProfile(prev.id, { name, companionId });
      }
      return updated;
    });
  };

  const handleUpgradeToPremium = (_chosenHobbyId?: string) => {
    // In MVP demo: payments are not processed and premium courses remain locked by default.
    // Structured access logic in verifyCourseAccess will grant access once real payments/entitlements are recorded.
    console.info('Premium upgrade requested - kept locked per MVP demo policy');
  };

  const handleUnlockAdditionalHobby = (_hobbyId: string) => {
    // In MVP demo: payments are not processed and premium courses remain locked by default.
    console.info('Additional hobby unlock requested - kept locked per MVP demo policy');
  };

  const handleModuleSelect = (moduleId: string) => {
    const target = modules.find(m => m.id === moduleId);
    if (target && target.status !== 'locked') {
      setActiveModuleId(moduleId);
    }
  };

  // Moderation Controls for Parents
  const handleToggleApproveCreation = (id: string) => {
    setCreations((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const newApproved = !c.isApprovedByParent;
          const updated = {
            ...c,
            isApprovedByParent: newApproved,
            moderationStatus: (newApproved ? 'approved' : 'pending_parent_approval') as any,
            publishedToGallery: newApproved,
            approvedAt: newApproved ? 'Just now' : undefined
          };
          updateCreationInDb(id, {
            isApprovedByParent: newApproved,
            moderationStatus: updated.moderationStatus,
            publishedToGallery: newApproved
          });
          return updated;
        }
        return c;
      })
    );
  };

  const handleTogglePublishGallery = (id: string) => {
    setCreations((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const newPublished = !c.publishedToGallery;
          const updated = {
            ...c,
            isApprovedByParent: true,
            publishedToGallery: newPublished,
            moderationStatus: (newPublished ? 'approved' : 'private') as any,
            approvedAt: c.approvedAt || 'Just now'
          };
          updateCreationInDb(id, {
            publishedToGallery: newPublished,
            moderationStatus: updated.moderationStatus
          });
          return updated;
        }
        return c;
      })
    );
  };

  const handleUpdateParentNote = (id: string, note: string) => {
    setCreations((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          updateCreationInDb(id, { parentNote: note });
          return { ...c, parentNote: note };
        }
        return c;
      })
    );
  };

  // Gallery Social Reactions & Likes
  const handleLikeCreation = (creationId: string) => {
    setCreations((prev) =>
      prev.map((c) => {
        if (c.id === creationId) {
          const currentlyLiked = !!c.userLiked;
          const updatedLikes = currentlyLiked ? Math.max(0, c.likesCount - 1) : c.likesCount + 1;
          updateCreationInDb(creationId, { likesCount: updatedLikes });
          return {
            ...c,
            userLiked: !currentlyLiked,
            likesCount: updatedLikes
          };
        }
        return c;
      })
    );
  };

  const handleReactCreation = (creationId: string, emoji: string) => {
    setCreations((prev) =>
      prev.map((c) => {
        if (c.id === creationId) {
          const userReactions = c.userReactions || [];
          const hasReacted = userReactions.includes(emoji);
          const newReactionsList = hasReacted
            ? userReactions.filter((e) => e !== emoji)
            : [...userReactions, emoji];

          const currentCount = c.reactions?.[emoji] || 0;
          const newCount = hasReacted ? Math.max(0, currentCount - 1) : currentCount + 1;

          const updatedReactions = {
            ...(c.reactions || { '👍': 0, '✨': 0, '💯': 0, '💛': 0, '😆': 0 }),
            [emoji]: newCount
          };

          updateCreationInDb(creationId, { reactions: updatedReactions });

          return {
            ...c,
            userReactions: newReactionsList,
            reactions: updatedReactions
          };
        }
        return c;
      })
    );
  };

  const handleProjectComplete = (moduleId: string, creationUrl: string, aiFeedback: string) => {
    setLatestAiFeedback(aiFeedback);

    const completedMod = modules.find(m => m.id === moduleId);
    const completedStep = completedMod ? completedMod.stepNumber : 1;

    // Update modules: mark current completed, unlock next in sequence!
    const updatedModules = modules.map((mod) => {
      if (mod.id === moduleId) {
        return { ...mod, status: 'completed' as const };
      }
      if (mod.stepNumber === completedStep + 1) {
        // Automatically unlock next sequential module!
        return { ...mod, status: 'active' as const };
      }
      return mod;
    });

    // Check if next module exists and set as active
    const nextMod = updatedModules.find(m => m.stepNumber === completedStep + 1 && m.stepNumber <= 4);
    if (nextMod) {
      setActiveModuleId(nextMod.id);
    }

    const allStepsCompleted = updatedModules.filter(m => m.stepNumber <= 4).every(m => m.status === 'completed');
    const finalModules = allStepsCompleted
      ? updatedModules.map(m => m.stepKey === 'CELEBRATE' ? { ...m, status: 'completed' as const } : m)
      : updatedModules;

    setModules(finalModules);

    const currentCourseObj = ALL_COURSES.find((c) => c.id === selectedCourseId);
    const isTeen = userProfile.userRole === 'learner_teen';

    const newCreation: CreationUpload = {
      id: `c-${Date.now()}`,
      title: completedMod ? completedMod.title : 'Project Masterpiece',
      hobbyName: currentCourseObj ? currentCourseObj.category : 'Creative Crafting',
      courseId: selectedCourseId,
      imageUrl: creationUrl,
      uploadedAt: 'Just now',
      aiFeedback: aiFeedback,
      coachName: 'Coach Spark',
      authorName: userProfile.name || (isTeen ? 'Teen Maker' : 'Alex'),
      authorAge: isTeen ? 14 : 9,
      authorCity: 'Doha, Qatar',
      likesCount: 0,
      isApprovedByParent: isTeen ? true : false,
      moderationStatus: isTeen ? 'approved' : 'pending_parent_approval',
      publishedToGallery: isTeen ? true : false,
      approvedAt: isTeen ? 'Just now' : undefined,
      reactions: { '👍': 0, '✨': 0, '💯': 0, '💛': 0, '😆': 0 },
      userLiked: false,
      userReactions: []
    };

    setCreations([newCreation, ...creations]);

    // Increase user XP and unlock vouchers if fully completed
    const updatedXp = userProfile.currentXp + 500;
    const updatedVouchers = allStepsCompleted
      ? userProfile.vouchers.map(v => v.id === 'v1' ? { ...v, status: 'claimable' as const } : v)
      : userProfile.vouchers;
    const updatedLevel = updatedXp >= userProfile.xpToNextLevel ? userProfile.level + 1 : userProfile.level;

    const updatedProfile: UserProfile = {
      ...userProfile,
      currentXp: updatedXp,
      level: updatedLevel,
      vouchers: updatedVouchers
    };
    setUserProfile(updatedProfile);

    // Save progress to cloud Firestore if user is authenticated
    if (userProfile.id) {
      saveCourseProgress(userProfile.id, selectedCourseId, finalModules);
      uploadCreation(newCreation, userProfile.id);
      saveUserProfile(userProfile.id, {
        currentXp: updatedXp,
        level: updatedLevel,
        vouchers: updatedVouchers
      });
    }
  };

  return (
    <div className="relative min-h-screen text-white select-none overflow-x-hidden">
      {/* Dynamic Animated WebGL Gradient Shader Background (Platform Screens & Landing Page) */}
      <ShaderBackground opacity={0.92} speed={0.18} />

      {/* Persistent Global Top Navigation Header with Back Button (Hidden on Auth & Landing Screens) */}
      {currentScreen !== 'auth' && currentScreen !== 'landing' && (
        <TopNavbar
          currentScreen={currentScreen}
          onNavigate={navigateTo}
          onBack={handleBack}
          userProfile={userProfile}
          onOpenParentPin={() => setShowParentPin(true)}
          onLogout={handleLogout}
        />
      )}

      {/* Main Screen Content with Padding for Fixed Top Header */}
      <main className={currentScreen === 'auth' || currentScreen === 'landing' ? 'min-h-screen' : 'pt-20 md:pt-24 min-h-screen'}>
        {currentScreen === 'landing' && (
          <LandingPage
            onGetStarted={() => navigateTo('auth')}
            onLogin={() => navigateTo('auth')}
            onSelectCourse={(courseId) => {
              handleCourseChange(courseId);
              navigateTo('auth');
            }}
          />
        )}

        {currentScreen === 'auth' && (
          <AuthScreen
            onLoginDemo={handleDemoLogin}
            onLoginSuccess={handleLoginSuccess}
          />
        )}

        {currentScreen === 'onboarding' && (
          <OnboardingScreen
            userProfile={userProfile}
            onSaveProfile={handleSaveProfile}
            onStartAdventure={() => navigateTo('adventure-map')}
          />
        )}

        {currentScreen === 'adventure-map' && (
          <AdventureMapScreen
            userProfile={userProfile}
            companion={currentCompanion}
            nodes={modules}
            selectedCourseId={selectedCourseId}
            onSelectCourse={handleCourseChange}
            isRewardUnlocked={isRewardUnlocked}
            onNavigate={navigateTo}
            onSelectNode={(nodeId) => {
              handleModuleSelect(nodeId);
            }}
          />
        )}

        {currentScreen === 'project-module' && (
          <ProjectModuleScreen
            userProfile={userProfile}
            companion={currentCompanion}
            module={currentModule}
            allModules={modules}
            selectedCourseId={selectedCourseId}
            onSelectCourse={handleCourseChange}
            onNavigate={navigateTo}
            onProjectComplete={handleProjectComplete}
            onSelectModule={handleModuleSelect}
          />
        )}

        {currentScreen === 'celebration' && (
          <CelebrationScreen
            userProfile={userProfile}
            companion={currentCompanion}
            onNavigate={navigateTo}
            aiFeedbackText={latestAiFeedback}
            isRewardUnlocked={isRewardUnlocked}
            completedCount={completedCount}
            totalModulesCount={4}
            activeModule={currentModule}
            allModules={modules}
            creations={creations}
            selectedCourseId={selectedCourseId}
            onSelectModule={handleModuleSelect}
          />
        )}

        {currentScreen === 'gallery' && (
          <GalleryScreen
            creations={creations}
            userProfile={userProfile}
            onNavigate={navigateTo}
            onReactCreation={handleReactCreation}
            onLikeCreation={handleLikeCreation}
            onOpenParentPin={() => setShowParentPin(true)}
          />
        )}

        {currentScreen === 'parent-hub' && (
          <ParentDashboardScreen
            userProfile={userProfile}
            onNavigate={navigateTo}
            creations={creations}
            allModules={modules}
            isRewardUnlocked={isRewardUnlocked}
            onToggleApproveCreation={handleToggleApproveCreation}
            onTogglePublishGallery={handleTogglePublishGallery}
            onUpdateParentNote={handleUpdateParentNote}
            onUpgradeToPremium={handleUpgradeToPremium}
            onUnlockAdditionalHobby={handleUnlockAdditionalHobby}
          />
        )}

        {currentScreen === 'pricing' && (
          <PricingScreen
            userProfile={userProfile}
            onNavigate={navigateTo}
            onUpgradeToPremium={handleUpgradeToPremium}
            onUnlockAdditionalHobby={handleUnlockAdditionalHobby}
          />
        )}
      </main>

      {/* Floating 3D Companion Buddy on Child Screens */}
      {(currentScreen === 'adventure-map' || currentScreen === 'onboarding' || currentScreen === 'gallery') && (
        <CompanionFloating companion={currentCompanion} />
      )}

      {/* Parental Gate Security PIN Modal */}
      <ParentPinModal
        isOpen={showParentPin}
        onClose={() => setShowParentPin(false)}
        onSuccess={() => {
          setShowParentPin(false);
          navigateTo('parent-hub');
        }}
      />
    </div>
  );
}

