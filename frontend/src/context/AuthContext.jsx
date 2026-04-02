import React, { useState, createContext, useContext, useCallback } from 'react';
import { mockUsers } from '../data/mockData';
const AuthContext = createContext(undefined);

function decodeJwt(token) {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
    const json = decodeURIComponent(
      atob(padded)
        .split('')
        .map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const login = useCallback((role) => {
    // Mock login by finding the first user with the requested role
    const mockUser = mockUsers.find((u) => u.role === role);
    if (mockUser) {
      setUser(mockUser);
    }
  }, []);

  const loginWithGoogleCredential = useCallback((credential) => {
    if (!credential) {
      return { success: false, error: 'Missing Google credential.' };
    }
    const payload = decodeJwt(credential);
    if (!payload) {
      return { success: false, error: 'Invalid Google credential.' };
    }

    const nextUser = {
      id: payload.sub,
      name: payload.name || payload.given_name || payload.email || 'Google User',
      email: payload.email || '',
      role: 'USER',
      avatarUrl: payload.picture || `https://i.pravatar.cc/150?u=${payload.sub}`
    };

    setUser(nextUser);
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    try {
      if (user?.email && window.google?.accounts?.id?.revoke) {
        window.google.accounts.id.revoke(user.email, () => {});
      }
      if (window.google?.accounts?.id?.disableAutoSelect) {
        window.google.accounts.id.disableAutoSelect();
      }
    } catch {
      // ignore
    }
    setUser(null);
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        loginWithGoogleCredential,
        logout
      }}>
      
      {children}
    </AuthContext.Provider>);

}
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}