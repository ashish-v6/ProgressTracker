import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserProfile } from '../types';
import { authService } from '../services/authService';
import { registerRefreshFailureListener } from '../services/api';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (username: string, email: string, password: string, avatar?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updatePreferences: (prefs: any) => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to map backend User payload to frontend UserProfile model structure
const mapToUserProfile = (backendUser: any): UserProfile => {
  if (!backendUser) return null as any;
  return {
    name: backendUser.username, // map backend username -> frontend name
    email: backendUser.email,
    avatarUrl: backendUser.avatar || '', // map backend avatar -> avatarUrl
    streak: backendUser.streak || 0,
    longestStreak: backendUser.longestStreak || 0,
    totalStudyHours: backendUser.totalStudyHours || 0,
    preferences: backendUser.preferences || {
      workingHourGoal: 8,
      notificationsEnabled: true,
      theme: 'dark'
    }
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize and check current user session silently on mount
  const initializeAuth = async () => {
    try {
      const currentUser = await authService.getMe();
      setUser(mapToUserProfile(currentUser));
      setIsAuthenticated(true);
    } catch (err) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeAuth();

    // Listen to token refresh failures to auto log out
    registerRefreshFailureListener(() => {
      setUser(null);
      setIsAuthenticated(false);
    });
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const data = await authService.login(email, password);
      setUser(mapToUserProfile(data.user));
      setIsAuthenticated(true);
      return true;
    } catch (err) {
      return false;
    }
  };

  const signup = async (username: string, email: string, password: string, avatar?: string): Promise<boolean> => {
    try {
      await authService.register(username, email, password, avatar);
      // Automatically log in user after registering
      const data = await authService.login(email, password);
      setUser(mapToUserProfile(data.user));
      setIsAuthenticated(true);
      return true;
    } catch (err) {
      return false;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updatePreferences = (prefs: any) => {
    if (!user) return;
    const updatedUser = {
      ...user,
      preferences: {
        ...user.preferences,
        ...prefs
      }
    };
    setUser(updatedUser);
  };

  const updateProfile = (profile: Partial<UserProfile>) => {
    if (!user) return;
    const updatedUser = {
      ...user,
      ...profile
    };
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      loading,
      login,
      signup,
      logout,
      updatePreferences,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
export default AuthContext;
