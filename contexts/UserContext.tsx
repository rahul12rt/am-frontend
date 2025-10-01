"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { User } from "@supabase/supabase-js";
import { userServices } from "@/lib/api-services";
import { UserProfile } from "@/types/user";
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';

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
  const queryClient = useQueryClient();

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
      // Profile fetching logging disabled for production
      const userProfile = await userServices.getProfile();
      setProfile(userProfile);
      // Profile success logging disabled for production
    } catch (error) {
      // Profile error logging disabled for production
      setProfile(null);
    } finally {
      setIsLoadingProfile(false);
    }
  }, [user]);

  const logout = useCallback(async () => {
    try {
      // Logout logging disabled for production
      const { error } = await supabase.auth.signOut();

      if (error) {
        // Supabase error logging disabled for production
        throw error;
      }

      // Clear local state
      setUser(null);
      setProfile(null);

      // Clear React Query cache
      queryClient.clear();

      // Clear any localStorage tokens if they exist
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }

      // Logout success logging disabled for production

      // Redirect to home page after logout
      router.push('/');
    } catch (error) {
      // Logout error logging disabled for production
      // Even if logout fails, clear local state
      setUser(null);
      setProfile(null);
      // Clear React Query cache
      queryClient.clear();
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }
      router.push('/');
    }
  }, [supabase, router, queryClient]);

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const getInitialSession = async () => {
      try {
        // Initial session logging disabled for production
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error) {
          // User error logging disabled for production
        }

        if (mounted) {
          setUser(user);

          if (user) {
            // Initial session logging disabled for production
            // Fetch profile for authenticated user
            setIsLoadingProfile(true);
            try {
              const userProfile = await userServices.getProfile();
              if (mounted) {
                setProfile(userProfile);
                // Profile load logging disabled for production
              }
            } catch (error) {
              // Profile error logging disabled for production
              if (mounted) {
                setProfile(null);
              }
            } finally {
              if (mounted) {
                setIsLoadingProfile(false);
              }
            }
          } else {
            // No session logging disabled for production
            setProfile(null);
          }

          setIsInitializing(false);
        }
      } catch (error) {
        // Initial session error logging disabled for production
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

      // Auth state logging disabled for production

      // Handle different auth events
      switch (event) {
        case 'SIGNED_IN':
          setUser(session?.user ?? null);
          if (session?.user) {
            // Sign in event logging disabled for production
            // Longer delay to ensure backend session and database record are ready (especially after registration)
            timeoutId = setTimeout(async () => {
              if (!mounted) return;
              setIsLoadingProfile(true);
              try {
                const userProfile = await userServices.getProfile();
                if (mounted) {
                  setProfile(userProfile);
                  // Profile fetch success logging disabled for production
                }
              } catch (error) {
                // Profile fetch error logging disabled for production
                // Retry once more with additional delay (helpful for new registrations)
                setTimeout(async () => {
                  if (!mounted) return;
                  try {
                    const userProfile = await userServices.getProfile();
                    if (mounted) {
                      setProfile(userProfile);
                      // Profile retry success logging disabled for production
                    }
                  } catch (retryError) {
                    // Profile retry error logging disabled for production
                    if (mounted) {
                      setProfile(null);
                    }
                  } finally {
                    if (mounted) {
                      setIsLoadingProfile(false);
                    }
                  }
                }, 1000);
              } finally {
                // Don't set loading to false here if we're going to retry
                if (mounted) {
                  // setIsLoadingProfile(false); // Moved to retry block
                }
              }
            }, 800);
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
