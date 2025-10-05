import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useApolloClient, useQuery } from '@apollo/client';
import { GET_ME } from '../lib/graphql/queries';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isAdmin: boolean;
  hostedEventsCount: number;
  tags: Array<{ id: string; name: string }>;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(null);
  const apolloClient = useApolloClient();

  const { data, loading, error } = useQuery(GET_ME, {
    skip: !token,
    errorPolicy: 'all',
  });

  useEffect(() => {
    if (data?.me) {
      setUser(data.me);
    } else if (error && token) {
      // Token is invalid, clear it
      logout();
    }
  }, [data, error, token]);

  const login = (newToken: string, userData: User) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
    // Clear cached data so queries like GET_ME refetch for the new user.
    apolloClient.clearStore().catch(() => {});
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    apolloClient.clearStore().catch(() => {});
  };

  const value: AuthContextType = {
    user,
    token,
    loading: loading && !!token,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
