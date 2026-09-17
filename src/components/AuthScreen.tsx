import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  HelpCircle,
  X,
  AlertCircle
} from 'lucide-react';
import { COMPANIONS } from '../data/mockData';
import { UserProfile, UserRole } from '../types';
import { sound } from '../utils/audio';
import { 
  signInWithGoogle, 
  loginWithEmail, 
  registerWithEmail, 
  fetchUserProfile,
  saveUserProfile 
} from '../services/firebase';

interface AuthScreenProps {
  onLoginDemo: (persona?: 'kid' | 'teen' | 'parent') => void;
  onLoginSuccess: (profile: Partial<UserProfile>) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onLoginDemo,
  onLoginSuccess
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  
  // Form input fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'learner_kid' | 'learner_teen' | 'parent'>('learner_kid');
  
  // State management
  const [activeField, setActiveField] = useState<'none' | 'email' | 'password' | 'name' | 'submit' | 'google'>('none');
  const [hoveredField, setHoveredField] = useState<'none' | 'email' | 'password' | 'name' | 'submit' | 'google'>('none');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCelebration, setIsCelebration] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // Focus & Companion assistants
  const primaryCompanion = COMPANIONS.find(c => c.id === 'sparky') || COMPANIONS[0];
  const watcherCompanion = COMPANIONS.find(c => c.id === 'pip') || COMPANIONS[4];

  // Dynamic Assistant Dialogue & Gaze Logic
  const getAssistantDialogue = () => {
    if (isCelebration) {
      return "🎉 Woohoo! Credentials verified! Launching your adventure...";
    }
    if (isLoading) {
      return "⚡ Verifying your credentials with Hiwaya Cloud...";
    }

    const currentFocus = activeField !== 'none' ? activeField : hoveredField;

    switch (currentFocus) {
      case 'email':
        return authMode === 'login'
          ? "📧 Type your explorer email or username here!"
          : "✨ Enter your email address to register your pass.";
      case 'password':
        return showPassword
          ? "👀 Password revealed! Keep it super secret."
          : "🙈 Shh! I'll cover my eyes while you type your password!";
      case 'name':
        return "👋 Nice to meet you! What should we call you on your quest?";
      case 'submit':
        return authMode === 'login'
          ? "🚀 Click to log in and resume your quests & rewards!"
          : "⭐ Ready to start! Click to create your account!";
      case 'google':
        return "🔒 Fast & secure single sign-on with your Google Account!";
      default:
        return authMode === 'login'
          ? "👋 Welcome back! Hover or select any field to get started."
          : "🌟 Ready to turn screen time into real-world craft skills?";
    }
  };

  // Trigger celebration confetti
  const triggerCelebration = () => {
    setIsCelebration(true);
    sound.playFanfare();
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FACC15', '#38BDF8', '#EC4899', '#A855F7', '#34D399']
      });
    } catch {
      // safe fallback
    }
  };

  const handleTabSwitch = (mode: 'login' | 'signup') => {
    sound.playPop();
    setAuthMode(mode);
    setErrorMessage('');
    setActiveField('none');
  };

  const formatAuthError = (err: any): string => {
    const code = err?.code || '';
    if (code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
      return 'Incorrect email or password. Please verify your details.';
    }
    if (code === 'auth/user-not-found') {
      return 'No account found with this email. Please switch to Create Account!';
    }
    if (code === 'auth/email-already-in-use') {
      return 'This email is already in use. Please sign in or use another email.';
    }
    if (code === 'auth/weak-password') {
      return 'Password should be at least 6 characters.';
    }
    if (code === 'auth/invalid-email') {
      return 'Please enter a valid email address.';
    }
    if (code === 'auth/popup-closed-by-user') {
      return 'Google sign-in popup was closed before completing.';
    }
    if (code === 'auth/popup-blocked') {
      return 'Google pop-up was blocked by your browser. Please allow pop-ups for this site.';
    }
    return err?.message || 'Authentication error. Please try again.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    let emailTrimmed = email.trim();
    const passwordTrimmed = password.trim();

    if (authMode === 'signup' && !name.trim()) {
      setErrorMessage('Please enter your full name or nickname.');
      sound.playPop();
      return;
    }

    if (!emailTrimmed) {
      setErrorMessage('Please enter your email or username.');
      sound.playPop();
      return;
    }

    // Auto-complete username to email domain if user just typed an explorer handle
    if (!emailTrimmed.includes('@')) {
      emailTrimmed = `${emailTrimmed.toLowerCase()}@hiwaya.qa`;
    }

    if (!passwordTrimmed) {
      setErrorMessage('Please enter your password.');
      sound.playPop();
      return;
    }

    if (passwordTrimmed.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      sound.playPop();
      return;
    }

    setIsLoading(true);
    sound.playChime();

    try {
      if (authMode === 'signup') {
        const user = await registerWithEmail(
          emailTrimmed,
          passwordTrimmed,
          name.trim(),
          selectedRole
        );
        setIsLoading(false);
        triggerCelebration();

        setTimeout(() => {
          onLoginSuccess({
            id: user.uid,
            name: name.trim() || 'Explorer',
            email: user.email || emailTrimmed,
            userRole: selectedRole,
            companionId: 'sparky',
            membershipPlan: 'free'
          });
        }, 800);
      } else {
        const user = await loginWithEmail(emailTrimmed, passwordTrimmed);
        // Load user profile from Firestore if it exists
        const remoteProfile = await fetchUserProfile(user.uid);
        setIsLoading(false);
        triggerCelebration();

        setTimeout(() => {
          if (remoteProfile) {
            onLoginSuccess({
              ...remoteProfile,
              id: user.uid,
              email: user.email || emailTrimmed
            });
          } else {
            // Determine role by email hint or default
            let role: UserRole = 'learner_kid';
            if (emailTrimmed.includes('parent') || emailTrimmed.includes('sarah')) role = 'parent';
            else if (emailTrimmed.includes('teen') || emailTrimmed.includes('maya')) role = 'learner_teen';

            const defaultProf: Partial<UserProfile> = {
              id: user.uid,
              name: user.displayName || emailTrimmed.split('@')[0] || 'Explorer',
              email: user.email || emailTrimmed,
              userRole: role,
              companionId: 'sparky',
              membershipPlan: 'free'
            };
            saveUserProfile(user.uid, defaultProf);
            onLoginSuccess(defaultProf);
          }
        }, 800);
      }
    } catch (err: any) {
      setIsLoading(false);
      sound.playPop();
      setErrorMessage(formatAuthError(err));
    }
  };

  const handleGoogleSignIn = async () => {
    sound.playChime();
    setIsLoading(true);
    setActiveField('google');
    setErrorMessage('');

    try {
      const { user } = await signInWithGoogle();
      const remoteProfile = await fetchUserProfile(user.uid);
      setIsLoading(false);
      triggerCelebration();

      setTimeout(async () => {
        if (remoteProfile) {
          onLoginSuccess({
            ...remoteProfile,
            id: user.uid,
            email: user.email || '',
            name: remoteProfile.name || user.displayName || 'Explorer'
          });
        } else {
          const newProfile: Partial<UserProfile> = {
            id: user.uid,
            name: user.displayName || 'Explorer',
            email: user.email || '',
            userRole: 'learner_kid',
            companionId: 'sparky',
            membershipPlan: 'free'
          };
          await saveUserProfile(user.uid, newProfile);
          onLoginSuccess(newProfile);
        }
      }, 800);
    } catch (err: any) {
      setIsLoading(false);
      sound.playPop();
      setErrorMessage(formatAuthError(err));
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    sound.playChime();
    setForgotSent(true);
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 z-10 overflow-x-hidden">
      {/* Ambient background illumination */}
      <div className="absolute top-1/6 left-1/4 w-96 h-96 bg-amber-400/15 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />
      <div className="absolute bottom-1/6 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />

      {/* Main Authentication Wrapper */}
      <div className="w-full max-w-[520px] flex flex-col items-center gap-6 my-auto">
        
        {/* ========================================================= */}
        {/* PROMINENT & CLEAN LOGO HEADER (No heavy glass wrappers) */}
        {/* ========================================================= */}
        <div className="flex flex-col items-center text-center gap-3">
          <div className="flex items-center gap-3.5 group cursor-pointer">
            {/* Sizable H! Brand Badge */}
            <div className="w-16 h-16 sm:w-18 sm:h-18 bg-gradient-to-b from-yellow-300 via-yellow-400 to-amber-500 rounded-2xl flex items-center justify-center shadow-[0_10px_25px_rgba(250,204,21,0.45)] border-2 border-white/90 group-hover:scale-105 transition-transform shrink-0">
              <span className="text-3xl sm:text-4xl font-black text-indigo-950 italic tracking-tighter">
                H!
              </span>
            </div>

            {/* Typography */}
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-3xl sm:text-4xl font-black text-white tracking-tight drop-shadow-sm">
                  HIWAYA
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-400/20 text-yellow-300 border border-amber-400/30">
                  هواية
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 font-semibold tracking-wide">
                Where Screen Time Becomes Real-World Skills
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* INTERACTIVE CHARACTER ASSISTANT COMPANION */}
        {/* ========================================================= */}
        <div className="w-full relative flex items-center gap-3.5 bg-slate-900/80 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-3.5 shadow-lg shadow-black/20">
          {/* Avatar Buddy with Gaze / Pose Alterations */}
          <div className="relative shrink-0">
            <motion.div 
              animate={
                isCelebration
                  ? { y: [0, -12, 0, -8, 0], rotate: [0, 8, -8, 0], scale: 1.15 }
                  : activeField === 'password'
                  ? { rotate: [0, -4, 0], scale: 0.96 }
                  : activeField === 'email'
                  ? { y: [0, 2, 0], scale: 1.05 }
                  : { y: [0, -3, 0] }
              }
              transition={{ repeat: isCelebration ? Infinity : Infinity, duration: isCelebration ? 0.8 : 3 }}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border-2 border-yellow-400/90 bg-indigo-950 shadow-md relative"
            >
              <img 
                src={primaryCompanion.avatarUrl} 
                alt={primaryCompanion.name}
                className={`w-full h-full object-cover transition-all duration-300 ${
                  activeField === 'password' && !showPassword ? 'blur-[1px] brightness-75' : ''
                }`}
              />
              
              {/* Dynamic Expression Overlay when typing password */}
              {activeField === 'password' && !showPassword && (
                <div className="absolute inset-0 bg-indigo-950/60 flex items-center justify-center text-xl">
                  🙈
                </div>
              )}
            </motion.div>

            {/* Status indicator pill */}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-yellow-400 border-2 border-slate-900 rounded-full flex items-center justify-center text-[10px] font-black text-indigo-950 shadow">
              {isCelebration ? '🎉' : activeField === 'password' ? '🔒' : '✨'}
            </div>
          </div>

          {/* Interactive Speech Bubble */}
          <div className="flex-1 text-left min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black text-yellow-400 uppercase tracking-wider">
                {primaryCompanion.name} Assistant
              </span>
              <span className="text-[10px] text-slate-400 bg-white/5 px-2 py-0.2 rounded-full border border-white/5">
                AI Coach
              </span>
            </div>
            <motion.p 
              key={activeField + (showPassword ? '_shown' : '') + (isCelebration ? '_won' : '')}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="text-xs sm:text-sm font-semibold text-slate-200 mt-0.5 leading-snug"
            >
              {getAssistantDialogue()}
            </motion.p>
          </div>
        </div>

        {/* ========================================================= */}
        {/* CLEAN ENTERPRISE AUTHENTICATION CARD */}
        {/* ========================================================= */}
        <div className="w-full bg-[#0e1628]/95 backdrop-blur-2xl border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/40 flex flex-col gap-5 relative">
          
          {/* Switchable Navigation Tabs: Sign In / Create Account */}
          <div className="flex bg-slate-900/90 p-1 rounded-2xl border border-slate-800">
            <button
              id="auth-tab-login"
              type="button"
              onClick={() => handleTabSwitch('login')}
              className={`flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                authMode === 'login'
                  ? 'bg-yellow-400 text-indigo-950 shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>Sign In</span>
            </button>

            <button
              id="auth-tab-signup"
              type="button"
              onClick={() => handleTabSwitch('signup')}
              className={`flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                authMode === 'signup'
                  ? 'bg-yellow-400 text-indigo-950 shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>Create Account</span>
            </button>
          </div>

          {/* Google Identity Single Sign-On Button */}
          <div className="flex flex-col gap-3">
            <button
              id="btn-google-auth"
              type="button"
              onClick={handleGoogleSignIn}
              onMouseEnter={() => setHoveredField('google')}
              onMouseLeave={() => setHoveredField('none')}
              onFocus={() => setActiveField('google')}
              onBlur={() => setActiveField('none')}
              disabled={isLoading}
              className="w-full bg-white hover:bg-slate-100 text-slate-800 font-semibold py-3 px-4 rounded-2xl border border-slate-300 shadow-sm flex items-center justify-center gap-3 transition-all active:scale-[0.99] cursor-pointer"
            >
              {/* Official 4-Color Google G SVG Icon */}
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span className="text-sm">
                {authMode === 'login' ? 'Sign in with Google' : 'Sign up with Google'}
              </span>
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-1">
              <div className="flex-1 h-px bg-slate-700/80" />
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                or with email
              </span>
              <div className="flex-1 h-px bg-slate-700/80" />
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="bg-red-500/15 border border-red-500/30 text-red-300 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
            
            {/* If Sign-Up: Full Name Input */}
            {authMode === 'signup' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  Full Name / Explorer Name
                </label>
                <div className="relative">
                  <input
                    id="input-signup-name"
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setErrorMessage('');
                    }}
                    onFocus={() => setActiveField('name')}
                    onBlur={() => setActiveField('none')}
                    onMouseEnter={() => setHoveredField('name')}
                    onMouseLeave={() => setHoveredField('none')}
                    placeholder="e.g. Alex Al-Thani"
                    className="w-full bg-slate-900/90 border border-slate-700 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 rounded-xl px-4 py-3 text-white placeholder-slate-500 font-medium text-sm outline-none transition-all"
                  />
                </div>
              </div>
            )}

            {/* Email / Username Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                Email Address or Username
              </label>
              <div className="relative">
                <input
                  id="input-auth-email"
                  type="text"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrorMessage('');
                  }}
                  onFocus={() => setActiveField('email')}
                  onBlur={() => setActiveField('none')}
                  onMouseEnter={() => setHoveredField('email')}
                  onMouseLeave={() => setHoveredField('none')}
                  placeholder={authMode === 'login' ? 'name@example.com or username' : 'name@example.com'}
                  className="w-full bg-slate-900/90 border border-slate-700 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 rounded-xl px-4 py-3 text-white placeholder-slate-500 font-medium text-sm outline-none transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  Password
                </label>
                {authMode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotModal(true);
                      setForgotSent(false);
                      sound.playPop();
                    }}
                    className="text-xs font-semibold text-yellow-400 hover:text-yellow-300 hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  id="input-auth-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMessage('');
                  }}
                  onFocus={() => setActiveField('password')}
                  onBlur={() => setActiveField('none')}
                  onMouseEnter={() => setHoveredField('password')}
                  onMouseLeave={() => setHoveredField('none')}
                  placeholder="••••••••"
                  className="w-full bg-slate-900/90 border border-slate-700 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 rounded-xl px-4 py-3 pr-11 text-white placeholder-slate-500 font-medium text-sm outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1 rounded-lg transition-colors cursor-pointer"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Sign-Up Role Selector */}
            {authMode === 'signup' && (
              <div className="flex flex-col gap-1.5 pt-1">
                <label className="text-xs font-bold text-slate-300">Account Type</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('learner_kid')}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                      selectedRole === 'learner_kid'
                        ? 'bg-yellow-400/20 border-yellow-400 text-yellow-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <span>🧒 Kid (6-12)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRole('learner_teen')}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                      selectedRole === 'learner_teen'
                        ? 'bg-purple-500/20 border-purple-400 text-purple-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <span>🚀 Teen (13+)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRole('parent')}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                      selectedRole === 'parent'
                        ? 'bg-pink-500/20 border-pink-400 text-pink-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <span>👨‍👩‍👧 Parent</span>
                  </button>
                </div>
              </div>
            )}

            {/* Remember Me Option */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  id="auth-remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-yellow-400 accent-yellow-400 focus:ring-0 cursor-pointer"
                />
                <span className="text-xs text-slate-300 font-medium">
                  Remember my session
                </span>
              </label>
              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>SSL Encrypted</span>
              </div>
            </div>

            {/* ========================================================= */}
            {/* STATUS WATCHER COMPANION & SUBMIT BUTTON AREA */}
            {/* ========================================================= */}
            <div className="relative pt-2">
              {/* Status Watcher Companion (Pip / Glow) */}
              <div className="absolute -top-6 -right-2 flex items-center gap-1.5 pointer-events-none">
                <motion.div
                  animate={
                    isCelebration
                      ? { y: [-6, -16, -6], rotate: [0, 15, -15, 0], scale: 1.2 }
                      : activeField === 'submit'
                      ? { y: [-2, -8, -2], scale: 1.1 }
                      : { y: [0, -3, 0] }
                  }
                  transition={{ repeat: Infinity, duration: isCelebration ? 0.6 : 2 }}
                  className="w-8 h-8 rounded-full border border-yellow-400 bg-indigo-900 overflow-hidden shadow"
                >
                  <img 
                    src={watcherCompanion.avatarUrl} 
                    alt={watcherCompanion.name} 
                    className="w-full h-full object-cover"
                  />
                </motion.div>
                <div className="bg-slate-900/90 border border-slate-700 text-[10px] font-bold text-yellow-300 px-2 py-0.5 rounded-full shadow">
                  {isCelebration ? 'Awesome! 🚀' : activeField === 'submit' ? 'Ready!' : 'Watching 👀'}
                </div>
              </div>

              {/* Primary Action Button */}
              <button
                id="btn-auth-submit"
                type="submit"
                disabled={isLoading}
                onMouseEnter={() => setHoveredField('submit')}
                onMouseLeave={() => setHoveredField('none')}
                onFocus={() => setActiveField('submit')}
                onBlur={() => setActiveField('none')}
                className="w-full py-3.5 px-6 rounded-xl font-black text-base text-indigo-950 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-300 hover:from-yellow-300 hover:to-amber-300 shadow-lg shadow-yellow-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/40"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-indigo-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{authMode === 'login' ? 'Sign In' : 'Create Account'}</span>
                    <ArrowRight className="w-4 h-4 font-bold" />
                  </>
                )}
              </button>
            </div>

            {/* Quick Test Demo Presets (Minimal footer chips) */}
            <div className="mt-2 pt-4 border-t border-slate-800/80 flex flex-col items-center gap-2">
              <span className="text-[11px] text-slate-400 font-medium">
                Quick 1-Click Evaluation Presets:
              </span>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    sound.playPop();
                    onLoginDemo('kid');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
                >
                  🧒 Kid Alex (8y)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sound.playPop();
                    onLoginDemo('teen');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
                >
                  🚀 Teen Maya (13+)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sound.playPop();
                    onLoginDemo('parent');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
                >
                  👨‍👩‍👧 Parent Sarah
                </button>
              </div>
            </div>

          </form>
        </div>

        {/* Footer Terms Note */}
        <p className="text-[11px] text-slate-400 text-center max-w-sm">
          By continuing, you agree to Hiwaya's child-safe terms of service and parental moderation guidelines.
        </p>

      </div>

      {/* ========================================================= */}
      {/* FORGOT PASSWORD MODAL */}
      {/* ========================================================= */}
      <AnimatePresence>
        {showForgotModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl relative text-left"
            >
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-yellow-400">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Reset Account Password</h3>
                  <p className="text-xs text-slate-400">We'll send a secure password recovery link</p>
                </div>
              </div>

              {forgotSent ? (
                <div className="bg-emerald-500/15 border border-emerald-500/30 rounded-2xl p-4 text-center flex flex-col items-center gap-2 my-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  <h4 className="font-bold text-white text-sm">Recovery Link Sent!</h4>
                  <p className="text-xs text-slate-300">
                    If an account exists for <strong>{forgotEmail}</strong>, instructions to reset your password have been emailed.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="mt-3 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
                  >
                    Back to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-300">Registered Email Address</label>
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="e.g. parent@example.com"
                      className="w-full bg-slate-800 border border-slate-700 focus:border-yellow-400 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 text-sm outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-yellow-400 text-indigo-950 font-bold text-sm hover:bg-yellow-300 transition-colors shadow-md cursor-pointer"
                  >
                    Send Reset Link
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

