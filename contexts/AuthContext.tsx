"use client";
import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { userServices } from "@/lib/api-services";
import { UserProfile } from "@/types/user";
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

const AuthContext = createContext<{
  refetchProfile: () => Promise<void>;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  logout: () => void;
}>({
  refetchProfile: async () => {},
  user: null,
  profile: null,
  loading: true,
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refetchProfile = async () => {
    try {
      const userProfile = await userServices.getProfile();
      setProfile(userProfile);
    } catch (error) {
      console.error('Failed to refetch profile:', error);
      setProfile(null);
    }
  };
  const supabase = createClient();
  const router = useRouter();

  const logout = async () => {
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
  };

  useEffect(() => {
    let mounted = true;

    const getInitialSession = async () => {
      try {
        // Use getUser() instead of getSession() for better validation
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error) {
          console.error('Error getting user:', error);
        }

        if (mounted) {
          setUser(user);

          if (user) {
            console.log('Initial session found for user:', user.id);
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
            }
          } else {
            console.log('No initial session found');
            setProfile(null);
          }

          setLoading(false);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        if (mounted) {
          setUser(null);
          setProfile(null);
          setLoading(false);
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
            setTimeout(async () => {
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
              }
            }, 300);
          }
          break;

        case 'SIGNED_OUT':
          setUser(null);
          setProfile(null);
          // Clear any cached data
          if (typeof window !== 'undefined') {
            // Only clear auth-related items, not all localStorage
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
          // Don't refetch profile on token refresh if we already have it
          if (session?.user && !profile) {
            try {
              const userProfile = await userServices.getProfile();
              if (mounted) {
                setProfile(userProfile);
              }
            } catch (error) {
              console.error("Failed to fetch profile after token refresh:", error);
            }
          }
          break;

        default:
          setUser(session?.user ?? null);
          if (!session?.user) {
            setProfile(null);
          }
          break;
      }

      if (mounted) {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, logout, refetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
