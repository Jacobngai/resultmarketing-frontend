import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, auth as supabaseAuth, isSupabaseConfigured } from '../lib/supabase';

// Create the Auth context
const AuthContext = createContext(null);

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if we're in demo mode (no Supabase configured)
  const isDemoMode = !isSupabaseConfigured();

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (isDemoMode) {
          // Demo mode - check localStorage for mock session
          const mockUser = localStorage.getItem('resultmarketing-demo-user');
          if (mockUser) {
            setUser(JSON.parse(mockUser));
          }
          setLoading(false);
          return;
        }

        // Get current session from Supabase
        const { session: currentSession, error: sessionError } = await supabaseAuth.getSession();

        if (sessionError) {
          console.error('Error getting session:', sessionError);
          setError(sessionError.message);
        }

        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes (only if Supabase is configured)
    if (!isDemoMode) {
      const { data: { subscription } } = supabaseAuth.onAuthStateChange(
        async (event, newSession) => {
          console.log('Auth state changed:', event);

          if (event === 'SIGNED_IN') {
            setSession(newSession);
            setUser(newSession?.user || null);
          } else if (event === 'SIGNED_OUT') {
            setSession(null);
            setUser(null);
          } else if (event === 'TOKEN_REFRESHED') {
            setSession(newSession);
          } else if (event === 'USER_UPDATED') {
            setUser(newSession?.user || null);
          }
        }
      );

      // Cleanup subscription on unmount
      return () => {
        subscription?.unsubscribe();
      };
    }
  }, [isDemoMode]);

  // Sign in with phone OTP
  const signInWithOtp = useCallback(async (phone) => {
    setError(null);

    if (isDemoMode) {
      // Demo mode - simulate OTP sent
      console.log('Demo mode: OTP sent to', phone);
      localStorage.setItem('resultmarketing-demo-phone', phone);
      return { data: { phone }, error: null };
    }

    try {
      const { data, error: otpError } = await supabaseAuth.signInWithOtp(phone);

      if (otpError) {
        setError(otpError.message);
        return { data: null, error: otpError };
      }

      return { data, error: null };
    } catch (err) {
      setError(err.message);
      return { data: null, error: err };
    }
  }, [isDemoMode]);

  // Verify OTP
  const verifyOtp = useCallback(async (phone, token) => {
    setError(null);

    if (isDemoMode) {
      // Demo mode - simulate verification
      console.log('Demo mode: Verifying OTP', token);

      // Accept any 6-digit code in demo mode
      if (token.length === 6) {
        const mockUser = {
          id: 'demo-user-' + Date.now(),
          phone: phone,
          created_at: new Date().toISOString(),
        };
        localStorage.setItem('resultmarketing-demo-user', JSON.stringify(mockUser));
        setUser(mockUser);
        return { data: { user: mockUser }, error: null };
      }

      return { data: null, error: { message: 'Invalid OTP code' } };
    }

    try {
      const { data, error: verifyError } = await supabaseAuth.verifyOtp(phone, token);

      if (verifyError) {
        setError(verifyError.message);
        return { data: null, error: verifyError };
      }

      if (data?.session) {
        setSession(data.session);
        setUser(data.session.user);
      }

      return { data, error: null };
    } catch (err) {
      setError(err.message);
      return { data: null, error: err };
    }
  }, [isDemoMode]);

  // Sign out
  const signOut = useCallback(async () => {
    setError(null);

    if (isDemoMode) {
      // Demo mode - clear mock session
      localStorage.removeItem('resultmarketing-demo-user');
      localStorage.removeItem('resultmarketing-demo-phone');
      setUser(null);
      setSession(null);
      return { error: null };
    }

    try {
      const { error: signOutError } = await supabaseAuth.signOut();

      if (signOutError) {
        setError(signOutError.message);
        return { error: signOutError };
      }

      setUser(null);
      setSession(null);
      return { error: null };
    } catch (err) {
      setError(err.message);
      return { error: err };
    }
  }, [isDemoMode]);

  // Update user profile
  const updateProfile = useCallback(async (updates) => {
    setError(null);

    if (isDemoMode) {
      // Demo mode - update mock user
      const updatedUser = { ...user, ...updates };
      localStorage.setItem('resultmarketing-demo-user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return { data: updatedUser, error: null };
    }

    try {
      const { data, error: updateError } = await supabase.auth.updateUser({
        data: updates,
      });

      if (updateError) {
        setError(updateError.message);
        return { data: null, error: updateError };
      }

      setUser(data.user);
      return { data: data.user, error: null };
    } catch (err) {
      setError(err.message);
      return { data: null, error: err };
    }
  }, [isDemoMode, user]);

  // Refresh session
  const refreshSession = useCallback(async () => {
    if (isDemoMode) {
      return { data: null, error: null };
    }

    try {
      const { data, error: refreshError } = await supabase.auth.refreshSession();

      if (refreshError) {
        console.error('Session refresh error:', refreshError);
        return { data: null, error: refreshError };
      }

      if (data?.session) {
        setSession(data.session);
        setUser(data.session.user);
      }

      return { data, error: null };
    } catch (err) {
      console.error('Session refresh error:', err);
      return { data: null, error: err };
    }
  }, [isDemoMode]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Context value
  const value = {
    // State
    user,
    session,
    loading,
    error,
    isDemoMode,
    isAuthenticated: !!user,

    // Actions
    signInWithOtp,
    verifyOtp,
    signOut,
    updateProfile,
    refreshSession,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
