"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { User } from "@supabase/supabase-js";
import { userServices } from "@/lib/api-services";
import { UserProfile } from "@/types/user";
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

interface UserContextType {
  // Auth state
  user: User | null;
  profile: UserProfile | null;
  
  // Loading states
  isInitializing: boolean;  // Initial app load
  isLoadingProfile: boolean; // Profile fetch in progress
  isAuthenticated: boolean;
  
  // Actions
  refetchProfile: () => Promise<void>;
  logout: () => Promise<void>;
  
  // Computed states
  isReady: boolean; // Auth check complete and profile loaded (if authenticated)
}

const UserContext = createContext<UserContextType>({
  user: null,
  profile: null,
  isInitializing: true,
  isLoadingProfile: false,
  isAuthenticated: false,
  refetchProfile: async () => {},
  logout: async () => {},
  isReady: false,
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  const supabase = createClient();
  const router = useRouter();

  // Computed states
  const isAuthenticated = !!user;
  const isReady = !isInitializing && (!isAuthenticated || !!profile);

  const refetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      return;
    }

    setIsLoadingProfile(true);
    try {
      console.log('Fetching profile for user:', user.id);
      const userProfile = await userServices.getProfile();
      setProfile(userProfile);
      console.log('Profile loaded successfully:', userProfile);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      setProfile(null);
    } finally {
      setIsLoadingProfile(false);
    }
  }, [user]);

  const logout = useCallback(async () => {
    try {
      console.log('Attempting to sign out...');
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Supabase signOut error:', error);
        throw error;
      }

      // Clear local state
      setUser(null);
      setProfile(null);

      // Clear any localStorage tokens if they exist
      if (typeof window !== 'undefined') {
        localStorage.clear();
      }

      console.log('Sign out successful');

      // Redirect to home page after logout
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout fails, clear local state
      setUser(null);
      setProfile(null);
      if (typeof window !== 'undefined') {
        localStorage.clear();
      }
      router.push('/');
    }
  }, [supabase.auth, router]);

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const getInitialSession = async () => {
      try {
        console.log('Checking initial session...');
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error) {
          console.error('Error getting user:', error);
        }

        if (mounted) {
          setUser(user);

          if (user) {
            console.log('Initial session found for user:', user.id);
            // Fetch profile for authenticated user
            setIsLoadingProfile(true);
            try {
              const userProfile = await userServices.getProfile();
              if (mounted) {
                setProfile(userProfile);
                console.log('Profile loaded on initial session');
              }
            } catch (error) {
              console.error("Failed to fetch profile on initial load:", error);
              if (mounted) {
                setProfile(null);
              }
            } finally {
              if (mounted) {
                setIsLoadingProfile(false);
              }
            }
          } else {
            console.log('No initial session found');
            setProfile(null);
          }

          setIsInitializing(false);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        if (mounted) {
          setUser(null);
          setProfile(null);
          setIsInitializing(false);
        }
      }
    };

    getInitialSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log('Auth state changed:', event, session?.user?.id);

      // Handle different auth events
      switch (event) {
        case 'SIGNED_IN':
          setUser(session?.user ?? null);
          if (session?.user) {
            console.log('SIGNED_IN event - fetching profile for user:', session.user.id);
            // Small delay to ensure backend session is ready
            timeoutId = setTimeout(async () => {
              if (!mounted) return;
              setIsLoadingProfile(true);
              try {
                const userProfile = await userServices.getProfile();
                if (mounted) {
                  setProfile(userProfile);
                  console.log('Profile fetched successfully after SIGNED_IN');
                }
              } catch (error) {
                console.error("Failed to fetch profile after sign in:", error);
                if (mounted) {
                  setProfile(null);
                }
              } finally {
                if (mounted) {
                  setIsLoadingProfile(false);
                }
              }
            }, 300);
          }
          break;

        case 'SIGNED_OUT':
          setUser(null);
          setProfile(null);
          setIsLoadingProfile(false);
          // Clear any cached data
          if (typeof window !== 'undefined') {
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key && (key.includes('supabase') || key.includes('auth'))) {
                keysToRemove.push(key);
              }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));
          }
          break;

        case 'TOKEN_REFRESHED':
          setUser(session?.user ?? null);
          // Don't refetch profile on token refresh - we already have it or it will be fetched elsewhere
          break;

        default:
          setUser(session?.user ?? null);
          if (!session?.user) {
            setProfile(null);
            setIsLoadingProfile(false);
          }
          break;
      }
    });

    return () => {
      mounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      subscription?.unsubscribe();
    };
  }, [supabase.auth]);

  const contextValue: UserContextType = {
    user,
    profile,
    isInitializing,
    isLoadingProfile,
    isAuthenticated,
    refetchProfile,
    logout,
    isReady,
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

// Backward compatibility - keep the same interface as AuthContext
export const useAuth = () => {
  const { user, profile, isInitializing, isLoadingProfile, logout, refetchProfile } = useUser();
  
  return {
    user,
    profile,
    loading: isInitializing || isLoadingProfile,
    logout,
    refetchProfile,
  };
};
