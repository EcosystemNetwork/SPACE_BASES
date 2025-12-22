/**
 * Mock Authentication Context
 * 
 * This provides a mock implementation of Privy authentication hooks
 * to allow app flow development without requiring real wallet connections.
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Mock User type matching Privy's User interface
export interface MockUser {
  id: string;
  email?: {
    address: string;
  };
  wallet?: {
    address: string;
  };
}

// Mock authentication context type matching Privy's interface
interface MockAuthContextType {
  ready: boolean;
  authenticated: boolean;
  user: MockUser | null;
  login: () => void;
  logout: () => void;
}

const MockAuthContext = createContext<MockAuthContextType | undefined>(undefined);

interface MockAuthProviderProps {
  children: ReactNode;
}

/**
 * Mock Authentication Provider
 * 
 * Provides mock authentication state and methods for development.
 * Simulates Privy's authentication flow without requiring real credentials.
 */
export function MockAuthProvider({ children }: MockAuthProviderProps) {
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<MockUser | null>(null);

  const login = () => {
    // Simulate login with mock user data
    const mockUser: MockUser = {
      id: 'mock-user-123',
      email: {
        address: 'developer@space-bases.dev',
      },
      wallet: {
        address: '0x1234567890abcdef1234567890abcdef12345678',
      },
    };
    setUser(mockUser);
    setAuthenticated(true);
    console.log('🔓 Mock login successful:', mockUser);
  };

  const logout = () => {
    setUser(null);
    setAuthenticated(false);
    console.log('🔒 Mock logout successful');
  };

  const value: MockAuthContextType = {
    ready: true, // Mock is always ready
    authenticated,
    user,
    login,
    logout,
  };

  return (
    <MockAuthContext.Provider value={value}>
      {children}
    </MockAuthContext.Provider>
  );
}

/**
 * Hook to access mock authentication context
 * 
 * Mimics the usePrivy() hook interface for drop-in replacement
 */
export function useMockAuth(): MockAuthContextType {
  const context = useContext(MockAuthContext);
  if (context === undefined) {
    throw new Error('useMockAuth must be used within MockAuthProvider');
  }
  return context;
}
