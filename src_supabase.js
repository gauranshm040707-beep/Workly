// Workly PWA - Supabase Authentication & Database Client
// Supports both dynamic environment configuration and project defaults

(function () {
  // Configuration resolution: window.ENV_SUPABASE_* or localStorage overrides or defaults
  const getSupabaseConfig = () => {
    const storedUrl = localStorage.getItem('workly_supabase_url');
    const storedKey = localStorage.getItem('workly_supabase_key');

    const url = storedUrl || (typeof window.ENV_SUPABASE_URL !== 'undefined' ? window.ENV_SUPABASE_URL : 'https://xyzcompany.supabase.co');
    const anonKey = storedKey || (typeof window.ENV_SUPABASE_ANON_KEY !== 'undefined' ? window.ENV_SUPABASE_ANON_KEY : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy');

    const isConfigured = Boolean(
      url && 
      anonKey && 
      !url.includes('xyzcompany') && 
      !anonKey.includes('dummy') &&
      url.startsWith('https://')
    );

    return { url, anonKey, isConfigured };
  };

  const { url, anonKey, isConfigured } = getSupabaseConfig();

  // Create Supabase client instance
  let supabaseClient = null;
  if (typeof supabase !== 'undefined' && supabase.createClient) {
    try {
      supabaseClient = supabase.createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storage: window.localStorage
        }
      });
    } catch (e) {
      console.warn('[Workly Supabase] Initialization warning:', e);
    }
  }

  // Friendly error formatter
  const formatAuthError = (err) => {
    if (!err) return 'An unexpected error occurred. Please try again.';
    const msg = (err.message || err.toString() || '').toLowerCase();

    if (msg.includes('invalid login credentials') || msg.includes('invalid grant')) {
      return 'Email or password is incorrect. Please check your credentials and try again.';
    }
    if (msg.includes('user already registered') || msg.includes('already exists')) {
      return 'An account with this email already exists. Try logging in instead.';
    }
    if (msg.includes('password should be at least') || msg.includes('weak password')) {
      return 'Password must be at least 6 characters long and contain a mix of letters and numbers.';
    }
    if (msg.includes('email not confirmed')) {
      return 'Please check your inbox and verify your email address before logging in.';
    }
    if (msg.includes('rate limit') || msg.includes('too many requests')) {
      return 'Too many login attempts. Please wait a few moments before trying again.';
    }
    if (msg.includes('network') || msg.includes('fetch')) {
      return 'Network connection error. Please verify your internet connection.';
    }
    return err.message || 'Authentication error. Please try again.';
  };

  window.WorklySupabase = {
    client: supabaseClient,
    isConfigured: () => getSupabaseConfig().isConfigured,
    getConfig: getSupabaseConfig,
    formatError: formatAuthError,
    
    // Save custom Supabase credentials from UI if needed
    saveConfig: (newUrl, newKey) => {
      localStorage.setItem('workly_supabase_url', newUrl.trim());
      localStorage.setItem('workly_supabase_key', newKey.trim());
      window.location.reload();
    },

    clearConfig: () => {
      localStorage.removeItem('workly_supabase_url');
      localStorage.removeItem('workly_supabase_key');
      window.location.reload();
    },

    // Recreate client dynamically
    reinitClient: (newUrl, newKey) => {
      if (typeof supabase !== 'undefined' && supabase.createClient) {
        window.WorklySupabase.client = supabase.createClient(newUrl, newKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            storage: window.localStorage
          }
        });
      }
    }
  };
})();
