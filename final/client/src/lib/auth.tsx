import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { api, clearToken, type AuthUser } from '@/lib/api';
import { useAuth as useSiteAuth } from '../context/AuthContext';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  setDateOfBirth: (dateOfBirth: string) => Promise<{ error: string | null }>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user: siteUser, loading: siteLoading, signOut: siteSignOut } = useSiteAuth();
  const [user, setUser] = useState<AuthUser | null>(() => {
    try { return JSON.parse(localStorage.getItem('lumina_user') || 'null'); } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (siteLoading) return;
    if (!siteUser) {
      clearToken();
      localStorage.removeItem('lumina_user');
      setUser(null);
      setLoading(false);
      return;
    }
    if (siteUser.role !== 'patient') {
      setUser(null);
      setLoading(false);
      return;
    }

    const trackerUser: AuthUser = {
      id: siteUser.id,
      email: siteUser.email || '',
      date_of_birth: siteUser.date_of_birth ?? null,
      age: null,
    };
    localStorage.setItem('lumina_user', JSON.stringify(trackerUser));
    setUser(trackerUser);
    setLoading(false);
  }, [siteUser, siteLoading]);

  const value: AuthContextValue = {
    user,
    loading: loading || siteLoading,
    async setDateOfBirth(dateOfBirth) {
      try {
        const res = await api.setDateOfBirth(dateOfBirth);
        localStorage.setItem('lumina_user', JSON.stringify(res.user));
        localStorage.setItem('navjeevan_backend_user', JSON.stringify({
          ...(siteUser || {}),
          date_of_birth: res.user.date_of_birth,
        }));
        setUser(res.user);
        return { error: null };
      } catch (err) {
        return { error: err instanceof Error ? err.message : 'Could not update date of birth.' };
      }
    },
    signOut() {
      clearToken();
      localStorage.removeItem('lumina_user');
      void siteSignOut();
      setUser(null);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
