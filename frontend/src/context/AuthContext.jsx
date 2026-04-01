import React, { useState, createContext, useContext } from 'react';
import { mockUsers } from '../data/mockData';
const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const login = (role) => {
    // Mock login by finding the first user with the requested role
    const mockUser = mockUsers.find((u) => u.role === role);
    if (mockUser) {
      setUser(mockUser);
    }
  };
  const logout = () => {
    setUser(null);
  };
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
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