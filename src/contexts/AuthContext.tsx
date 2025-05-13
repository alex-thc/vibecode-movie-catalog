import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useClient } from '../services/rpc-client';
import { UserSchema, UserService, type User } from '../gen/movie_pb';
import { jwtDecode } from 'jwt-decode';
import { create } from '@bufbuild/protobuf';
import { Code, ConnectError } from '@connectrpc/connect';

interface GoogleJwtPayload {
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthContextType['user']>(null);
  const userService = useClient(UserService);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userEmail = localStorage.getItem('userEmail');
    if (token && userEmail) {
      userService.getUser({ email: userEmail })
        .then(response => setUser(response))
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('userEmail');
        });
    }
  }, []);

  const login = async (token: string) => {
    try {
      const userData = jwtDecode<GoogleJwtPayload>(token);
      
      localStorage.setItem('token', token);
      localStorage.setItem('userEmail', userData.email);

      try {
        const user = await userService.getUser({ email: userData.email });
        setUser(user);
      } catch (error) {
        if (error instanceof ConnectError && error.code == Code.NotFound) {
          setUser(create(UserSchema,{ email: userData.email }));
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 