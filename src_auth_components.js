// Workly PWA - React + Supabase Authentication System
// Production-Ready Auth with Protected Routes, Session Management, Profiles & OAuth

const AuthContext = React.createContext(null);

function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// -------------------------------------------------------------
// AUTH PROVIDER: Central Session Management & Supabase Listener
// -------------------------------------------------------------
function AuthProvider({ children }) {
  const [user, setUser] = React.useState(null);
  const [session, setSession] = React.useState(null);
  const [profile, setProfile] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [authView, setAuthView] = React.useState('login'); // 'login' | 'signup' | 'forgot' | 'reset'
  const [isRecoveryMode, setIsRecoveryMode] = React.useState(false);

  const supabaseClient = window.WorklySupabase?.client;

  // Fetch or create user profile from public.profiles
  const fetchUserProfile = React.useCallback(async (currentUser) => {
    if (!currentUser || !supabaseClient) return null;
    try {
      const { data, error } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (data && !error) {
        setProfile(data);
        return data;
      } else {
        // Fallback default profile derived from user session
        const fallback = {
          id: currentUser.id,
          full_name: currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || 'Student',
          email: currentUser.email,
          avatar_url: currentUser.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
          course: 'B.Tech Computer Science',
          semester: 'Semester 4',
          roll_no: '2026CS101'
        };
        setProfile(fallback);
        return fallback;
      }
    } catch (e) {
      console.warn('[Workly Auth] Profile load error:', e);
      return null;
    }
  }, [supabaseClient]);

  // Initial session check & onAuthStateChange listener
  React.useEffect(() => {
    let mounted = true;

    // Check for password recovery hash in URL
    const hash = window.location.hash || '';
    if (hash.includes('type=recovery') || hash.includes('access_token=')) {
      setIsRecoveryMode(true);
      setAuthView('reset');
    }

    if (!supabaseClient) {
      // If Supabase is not configured yet, check for mock/local demo session
      const savedDemo = localStorage.getItem('workly_demo_auth_user');
      if (savedDemo) {
        try {
          const parsed = JSON.parse(savedDemo);
          setUser(parsed);
          setProfile(parsed);
        } catch (e) {}
      }
      setLoading(false);
      return;
    }

    // Get current active session
    supabaseClient.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (!mounted) return;
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      if (currentSession?.user) {
        fetchUserProfile(currentSession.user);
      }
      setLoading(false);
    }).catch(() => {
      if (mounted) setLoading(false);
    });

    // Listen to Supabase Auth state changes
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;
      console.log(`[Workly Auth] Auth event: ${event}`);

      setSession(newSession);
      const currentUser = newSession?.user ?? null;
      setUser(currentUser);

      if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
        if (currentUser) {
          await fetchUserProfile(currentUser);
        }
      } else if (event === 'PASSWORD_RECOVERY') {
        setIsRecoveryMode(true);
        setAuthView('reset');
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
        setIsRecoveryMode(false);
        setAuthView('login');
      }

      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [supabaseClient, fetchUserProfile]);

  // 1. Sign In With Email & Password
  const signInWithEmail = async (email, password, rememberMe = true) => {
    if (!supabaseClient || !window.WorklySupabase.isConfigured()) {
      // Demo Fallback Mode when project credentials are not plugged in yet
      const demoUser = {
        id: 'usr-demo-' + Date.now(),
        email: email.trim(),
        full_name: email.split('@')[0],
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
        course: 'B.Tech Computer Science',
        semester: 'Semester 4',
        roll_no: '2026CS101'
      };
      if (rememberMe) {
        localStorage.setItem('workly_demo_auth_user', JSON.stringify(demoUser));
      }
      setUser(demoUser);
      setProfile(demoUser);
      return { user: demoUser, error: null };
    }

    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: email.trim(),
      password: password
    });

    if (error) {
      throw new Error(window.WorklySupabase.formatError(error));
    }

    return data;
  };

  // 2. Sign Up With Email, Password & Full Name
  const signUpWithEmail = async (email, password, fullName) => {
    if (!supabaseClient || !window.WorklySupabase.isConfigured()) {
      const demoUser = {
        id: 'usr-demo-' + Date.now(),
        email: email.trim(),
        full_name: fullName.trim(),
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
        course: 'B.Tech Computer Science',
        semester: 'Semester 4',
        roll_no: '2026CS101'
      };
      localStorage.setItem('workly_demo_auth_user', JSON.stringify(demoUser));
      setUser(demoUser);
      setProfile(demoUser);
      return { user: demoUser, session: null };
    }

    const { data, error } = await supabaseClient.auth.signUp({
      email: email.trim(),
      password: password,
      options: {
        data: {
          full_name: fullName.trim(),
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
        }
      }
    });

    if (error) {
      throw new Error(window.WorklySupabase.formatError(error));
    }

    return data;
  };

  // 3. Sign In With Google OAuth
  const signInWithGoogle = async () => {
    if (!supabaseClient || !window.WorklySupabase.isConfigured()) {
      throw new Error("Please configure your Supabase Project URL & Anon Key to enable Google OAuth.");
    }

    const { data, error } = await supabaseClient.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + window.location.pathname
      }
    });

    if (error) {
      throw new Error(window.WorklySupabase.formatError(error));
    }

    return data;
  };

  // 4. Send Password Reset Email
  const resetPasswordForEmail = async (email) => {
    if (!supabaseClient || !window.WorklySupabase.isConfigured()) {
      return { success: true };
    }

    const { data, error } = await supabaseClient.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin + window.location.pathname + '#type=recovery'
    });

    if (error) {
      throw new Error(window.WorklySupabase.formatError(error));
    }

    return data;
  };

  // 5. Update Password (Recovery Flow)
  const updatePassword = async (newPassword) => {
    if (!supabaseClient || !window.WorklySupabase.isConfigured()) {
      setIsRecoveryMode(false);
      setAuthView('login');
      return { success: true };
    }

    const { data, error } = await supabaseClient.auth.updateUser({
      password: newPassword
    });

    if (error) {
      throw new Error(window.WorklySupabase.formatError(error));
    }

    setIsRecoveryMode(false);
    setAuthView('login');
    return data;
  };

  // 6. Sign Out
  const signOut = async () => {
    localStorage.removeItem('workly_demo_auth_user');
    if (supabaseClient) {
      try {
        await supabaseClient.auth.signOut();
      } catch (e) {
        console.warn('Sign out warning:', e);
      }
    }
    setUser(null);
    setSession(null);
    setProfile(null);
    setAuthView('login');
  };

  const value = {
    user,
    session,
    profile,
    loading,
    authView,
    setAuthView,
    isRecoveryMode,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    resetPasswordForEmail,
    updatePassword,
    signOut,
    refreshProfile: () => user && fetchUserProfile(user)
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// -------------------------------------------------------------
// LOGIN PAGE COMPONENT
// -------------------------------------------------------------
function LoginPage({ onSwitchToSignup, onSwitchToForgot }) {
  const { signInWithEmail, signInWithGoogle } = useAuth();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [isConfigModalOpen, setIsConfigModalOpen] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!email.trim() || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      await signInWithEmail(email, password, rememberMe);
    } catch (err) {
      setErrorMessage(err.message || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMessage('');
    try {
      await signInWithGoogle();
    } catch (err) {
      setErrorMessage(err.message || 'Google login failed.');
    }
  };

  const isSupabaseConfigured = window.WorklySupabase?.isConfigured();

  return (
    <div className="w-full max-w-md mx-auto p-6 sm:p-8 bg-white dark:bg-gray-900/90 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-2xl backdrop-blur-xl animate-fadeIn space-y-6">
      
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-indigo-500/25">
          <i className="fas fa-graduation-cap"></i>
        </div>
        <h2 className="text-2xl sm:text-3xl font-heading font-black text-gray-900 dark:text-white tracking-tight">
          Welcome Back <span className="inline-block animate-bounce">👋</span>
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Sign in to access your student dashboard, assignments & timetable
        </p>
      </div>

      {/* Supabase Status Pill */}
      {!isSupabaseConfigured && (
        <div className="p-3 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/60 flex items-center justify-between text-xs text-indigo-700 dark:text-indigo-300">
          <div className="flex items-center space-x-2">
            <i className="fas fa-bolt text-indigo-500"></i>
            <span>Instant Demo Auth Mode Active</span>
          </div>
          <button
            onClick={() => setIsConfigModalOpen(true)}
            className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Connect Supabase
          </button>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center space-x-2.5 animate-fadeIn">
          <i className="fas fa-circle-exclamation text-rose-500 text-sm flex-shrink-0"></i>
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
            Student Email
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <i className="fas fa-envelope text-xs"></i>
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@university.edu"
              disabled={isLoading}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition disabled:opacity-60"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
            Password
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <i className="fas fa-lock text-xs"></i>
            </span>
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              disabled={isLoading}
              className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition disabled:opacity-60"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs"
              title={showPassword ? "Hide password" : "Show password"}
            >
              <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
            </button>
          </div>
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex items-center space-x-2 cursor-pointer text-gray-600 dark:text-gray-400">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
            <span>Remember me</span>
          </label>

          <button
            type="button"
            onClick={onSwitchToForgot}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Forgot Password?
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition flex items-center justify-center space-x-2 disabled:opacity-70 cursor-pointer"
        >
          {isLoading ? (
            <>
              <i className="fas fa-spinner animate-spin"></i>
              <span>Authenticating...</span>
            </>
          ) : (
            <>
              <i className="fas fa-arrow-right-to-bracket"></i>
              <span>LOGIN TO DASHBOARD</span>
            </>
          )}
        </button>
      </form>

      {/* OR Divider */}
      <div className="relative flex items-center justify-center">
        <div className="border-t border-gray-200 dark:border-gray-800 w-full"></div>
        <span className="bg-white dark:bg-gray-900 px-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest absolute">
          OR
        </span>
      </div>

      {/* Google OAuth Button */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isLoading}
        className="w-full py-2.5 px-4 rounded-2xl bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-bold text-xs shadow-xs transition flex items-center justify-center space-x-3 cursor-pointer"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
        </svg>
        <span>Continue with Google</span>
      </button>

      {/* Switch to Signup */}
      <div className="text-center text-xs text-gray-600 dark:text-gray-400">
        Don't have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToSignup}
          className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          Create an account
        </button>
      </div>

      {/* Supabase Config Modal */}
      {isConfigModalOpen && (
        <SupabaseConfigModal onClose={() => setIsConfigModalOpen(false)} />
      )}
    </div>
  );
}

// -------------------------------------------------------------
// SIGNUP PAGE COMPONENT
// -------------------------------------------------------------
function SignupPage({ onSwitchToLogin }) {
  const { signUpWithEmail } = useAuth();
  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [agreeTerms, setAgreeTerms] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [successMessage, setSuccessMessage] = React.useState('');

  const calculatePasswordStrength = (pass) => {
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const strength = calculatePasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!fullName.trim() || !email.trim() || !password) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please check and re-type.');
      return;
    }

    if (!agreeTerms) {
      setErrorMessage('Please accept the Terms of Service & Privacy Policy.');
      return;
    }

    setIsLoading(true);
    try {
      const data = await signUpWithEmail(email, password, fullName);
      if (data?.session) {
        // Automatically signed in!
      } else {
        setSuccessMessage('Account created! Please check your email inbox to verify your account, or sign in.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 sm:p-8 bg-white dark:bg-gray-900/90 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-2xl backdrop-blur-xl animate-fadeIn space-y-6">
      
      {/* Header */}
      <div className="text-center space-y-1.5">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-indigo-500/25">
          <i className="fas fa-user-plus"></i>
        </div>
        <h2 className="text-2xl sm:text-3xl font-heading font-black text-gray-900 dark:text-white tracking-tight">
          Create Account
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Join Workly for comprehensive academic workflow management
        </p>
      </div>

      {/* Alerts */}
      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center space-x-2.5 animate-fadeIn">
          <i className="fas fa-circle-exclamation text-rose-500 text-sm flex-shrink-0"></i>
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center space-x-2.5 animate-fadeIn">
          <i className="fas fa-check-circle text-emerald-500 text-sm flex-shrink-0"></i>
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
            Full Name
          </label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Gauransh Mittal"
            disabled={isLoading}
            className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
            University / College Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="student@university.edu"
            disabled={isLoading}
            className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              disabled={isLoading}
              className="w-full px-4 pr-10 py-2.5 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs"
            >
              <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
            </button>
          </div>

          {/* Password Strength Indicator */}
          {password.length > 0 && (
            <div className="mt-1.5 flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <div
                  key={lvl}
                  className={`h-1 flex-1 rounded-full transition-all ${
                    strength >= lvl
                      ? strength <= 2
                        ? 'bg-rose-500'
                        : strength <= 3
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                ></div>
              ))}
              <span className="text-[10px] font-bold text-gray-400 ml-1">
                {strength <= 2 ? 'Weak' : strength <= 3 ? 'Medium' : 'Strong'}
              </span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
            Confirm Password
          </label>
          <input
            type={showPassword ? "text" : "password"}
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter password"
            disabled={isLoading}
            className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
        </div>

        {/* Terms Agreement */}
        <label className="flex items-start space-x-2 pt-1 cursor-pointer text-xs text-gray-600 dark:text-gray-400">
          <input
            type="checkbox"
            required
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="rounded text-indigo-600 focus:ring-indigo-500 mt-0.5 cursor-pointer"
          />
          <span className="leading-snug">
            I agree to the <span className="text-indigo-600 dark:text-indigo-400 font-semibold">Terms of Service</span> and <span className="text-indigo-600 dark:text-indigo-400 font-semibold">Privacy Policy</span>.
          </span>
        </label>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition flex items-center justify-center space-x-2 disabled:opacity-70 cursor-pointer"
        >
          {isLoading ? (
            <>
              <i className="fas fa-spinner animate-spin"></i>
              <span>Creating Account...</span>
            </>
          ) : (
            <>
              <i className="fas fa-user-check"></i>
              <span>CREATE STUDENT ACCOUNT</span>
            </>
          )}
        </button>
      </form>

      {/* Back to Login */}
      <div className="text-center text-xs text-gray-600 dark:text-gray-400">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          Sign In
        </button>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// FORGOT PASSWORD PAGE COMPONENT
// -------------------------------------------------------------
function ForgotPasswordPage({ onSwitchToLogin }) {
  const { resetPasswordForEmail } = useAuth();
  const [email, setEmail] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!email.trim()) return;

    setIsLoading(true);
    try {
      await resetPasswordForEmail(email);
      setIsSubmitted(true);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to send reset email.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 sm:p-8 bg-white dark:bg-gray-900/90 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-2xl backdrop-blur-xl animate-fadeIn space-y-6">
      <div className="text-center space-y-1.5">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-orange-500/25">
          <i className="fas fa-key"></i>
        </div>
        <h2 className="text-2xl font-heading font-black text-gray-900 dark:text-white tracking-tight">
          Reset Password
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Enter your registered email address to receive password reset instructions
        </p>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center space-x-2.5 animate-fadeIn">
          <i className="fas fa-circle-exclamation text-rose-500 text-sm flex-shrink-0"></i>
          <span>{errorMessage}</span>
        </div>
      )}

      {isSubmitted ? (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200 text-xs space-y-3 animate-fadeIn text-center">
          <i className="fas fa-paper-plane text-2xl text-emerald-500"></i>
          <p className="font-semibold">
            If an account exists with <span className="font-bold">{email}</span>, we've sent instructions to reset your password.
          </p>
          <button
            onClick={onSwitchToLogin}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition"
          >
            Back to Login
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Account Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@university.edu"
              disabled={isLoading}
              className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center space-x-2 disabled:opacity-70 cursor-pointer"
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner animate-spin"></i>
                <span>Sending Instructions...</span>
              </>
            ) : (
              <>
                <i className="fas fa-envelope"></i>
                <span>SEND RESET LINK</span>
              </>
            )}
          </button>
        </form>
      )}

      <div className="text-center text-xs">
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="font-bold text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center justify-center space-x-1.5 mx-auto"
        >
          <i className="fas fa-arrow-left text-[10px]"></i>
          <span>Back to Sign In</span>
        </button>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// RESET PASSWORD (UPDATE PASSWORD) PAGE COMPONENT
// -------------------------------------------------------------
function ResetPasswordPage({ onComplete }) {
  const { updatePassword } = useAuth();
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmNewPassword, setConfirmNewPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [successMessage, setSuccessMessage] = React.useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      await updatePassword(newPassword);
      setSuccessMessage('Password updated successfully! Redirecting...');
      setTimeout(() => {
        onComplete();
      }, 1200);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 sm:p-8 bg-white dark:bg-gray-900/90 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-2xl backdrop-blur-xl animate-fadeIn space-y-6">
      <div className="text-center space-y-1.5">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-teal-500/25">
          <i className="fas fa-lock"></i>
        </div>
        <h2 className="text-2xl font-heading font-black text-gray-900 dark:text-white tracking-tight">
          Set New Password
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Enter your new strong password for your Workly student account
        </p>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center space-x-2.5">
          <i className="fas fa-circle-exclamation text-rose-500 text-sm flex-shrink-0"></i>
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center space-x-2.5">
          <i className="fas fa-check-circle text-emerald-500 text-sm flex-shrink-0"></i>
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
            New Password
          </label>
          <input
            type="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Min. 6 characters"
            disabled={isLoading}
            className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
            Confirm New Password
          </label>
          <input
            type="password"
            required
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            placeholder="Re-enter password"
            disabled={isLoading}
            className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center space-x-2 disabled:opacity-70 cursor-pointer"
        >
          {isLoading ? (
            <>
              <i className="fas fa-spinner animate-spin"></i>
              <span>Updating Password...</span>
            </>
          ) : (
            <>
              <i className="fas fa-check"></i>
              <span>UPDATE PASSWORD & LOGIN</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}

// -------------------------------------------------------------
// SUPABASE CONFIGURATION MODAL (Dynamic Project Credentials)
// -------------------------------------------------------------
function SupabaseConfigModal({ onClose }) {
  const currentConfig = window.WorklySupabase?.getConfig() || {};
  const [url, setUrl] = React.useState(currentConfig.url && !currentConfig.url.includes('xyzcompany') ? currentConfig.url : '');
  const [anonKey, setAnonKey] = React.useState(currentConfig.anonKey && !currentConfig.anonKey.includes('dummy') ? currentConfig.anonKey : '');

  const handleSave = (e) => {
    e.preventDefault();
    if (!url.trim() || !anonKey.trim()) {
      alert("Please enter both Supabase URL and Anon Key.");
      return;
    }
    window.WorklySupabase.saveConfig(url, anonKey);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-2xl p-6 sm:p-8 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-sm font-bold">
              <i className="fas fa-plug"></i>
            </div>
            <h3 className="text-base font-bold font-heading text-gray-900 dark:text-white">
              Connect Supabase Project
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
          Enter your Supabase project credentials (found under <strong>Project Settings → API</strong> in your Supabase Dashboard).
        </p>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
              Project URL
            </label>
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-project-id.supabase.co"
              className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
              Anon Public Key
            </label>
            <textarea
              required
              rows={3}
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-xs font-mono"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm"
            >
              Save & Connect
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// AUTH CONTAINER (Router between Login, Signup, Forgot, Reset)
// -------------------------------------------------------------
function AuthScreen() {
  const { authView, setAuthView } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-slate-50 dark:bg-gray-950 relative overflow-hidden">
      {/* Background Ambient Mesh */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 -right-4 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full relative z-10">
        {authView === 'login' && (
          <LoginPage
            onSwitchToSignup={() => setAuthView('signup')}
            onSwitchToForgot={() => setAuthView('forgot')}
          />
        )}

        {authView === 'signup' && (
          <SignupPage
            onSwitchToLogin={() => setAuthView('login')}
          />
        )}

        {authView === 'forgot' && (
          <ForgotPasswordPage
            onSwitchToLogin={() => setAuthView('login')}
          />
        )}

        {authView === 'reset' && (
          <ResetPasswordPage
            onComplete={() => setAuthView('login')}
          />
        )}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// PROTECTED ROUTE WRAPPER COMPONENT
// -------------------------------------------------------------
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-indigo-500/30 animate-pulse mb-4">
          <i className="fas fa-graduation-cap"></i>
        </div>
        <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
          <i className="fas fa-spinner animate-spin"></i>
          <span>Loading Academic Workspace...</span>
        </div>
      </div>
    );
  }

  // If user is NOT authenticated, show AuthScreen (Login/Signup/Forgot)
  if (!user) {
    return <AuthScreen />;
  }

  // If authenticated, allow access to dashboard & protected content
  return children;
}
