/**
 * NetSim OSS - Auth Store
 * Minimal auth store for Open Source version.
 * Allows Guest/Demo access.
 */

import { create } from 'zustand';

export interface User {
  id: string;
  email: string;
  name: string;
  tier: 'basic' | 'pro' | 'enterprise';
  preferences?: any;
}

interface AuthState {
  activeUser: User | null;
  uid: string | null;
  loading: boolean;
  error: string | null;
  role: 'basic' | 'pro' | 'enterprise';
  isAuthenticated: boolean;
  mode: 'demo' | 'pro';

  // Actions
  login: (email: string, pass: string) => Promise<boolean>;
  loginWithOAuth: (provider: string) => Promise<boolean>;
  loginDemo: () => void;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => void;
  initListener: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  activeUser: {
    id: 'guest-user',
    email: 'guest@netsim.dev',
    name: 'Guest User',
    tier: 'basic'
  },
  uid: 'guest-user',
  loading: false,
  error: null,
  role: 'basic',
  isAuthenticated: true,
  mode: 'demo',

  login: async (_email: string, _pass: string) => {
    console.warn('⚠️ Manual login is not configured in Community Edition');
    set({ error: 'Manual login disabled' });
    return false;
  },

  loginWithOAuth: async (_provider: string) => {
    console.warn('⚠️ OAuth is not available in the Community Edition');
    set({ error: 'OAuth disabled' });
    return false;
  },

  loginDemo: () => {
    console.log('🎮 NetSim OSS: Entering Demo Mode');
    const guestUser: User = {
      id: 'guest-user',
      email: 'guest@netsim.dev',
      name: 'Guest User',
      tier: 'basic'
    };
    set({
      activeUser: guestUser,
      uid: 'guest-user',
      mode: 'demo',
      isAuthenticated: false
    });
  },

  loginWithGoogle: async () => {
    console.warn('⚠️ OAuth Google is not available in the Community Edition');
    set({ error: 'OAuth disabled' });
    return false;
  },

  logout: () => {
    console.log('👋 Logout');
    set({ activeUser: null, uid: null, mode: 'demo', isAuthenticated: false });
  },

  initListener: () => {
    console.log('🚀 NetSim OSS initialized - Community Edition');
  },
}));

export const getUserTier = () => 'basic';
