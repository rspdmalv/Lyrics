/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';
import { refreshEmailVerification, logoutUser } from '../services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  emailVerified: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  authModalMode: 'login' | 'register' | 'forgot';
  setAuthModalMode: (mode: 'login' | 'register' | 'forgot') => void;
  refreshVerification: () => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [emailVerified, setEmailVerified] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'forgot'>('login');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, currentUser => {
      setUser(currentUser);
      setEmailVerified(currentUser ? currentUser.emailVerified : false);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleRefreshVerification = async (): Promise<boolean> => {
    const verified = await refreshEmailVerification();
    setEmailVerified(verified);
    if (auth.currentUser) {
      setUser({ ...auth.currentUser });
    }
    return verified;
  };

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    setEmailVerified(false);
  };

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        emailVerified,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        authModalMode,
        setAuthModalMode,
        refreshVerification: handleRefreshVerification,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
