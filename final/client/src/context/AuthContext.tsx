import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { backendRequest, clearBackendToken, getBackendToken } from '../lib/backendApi';
import type { PatientProfile } from '../types';

export interface SiteUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'patient' | 'doctor' | 'admin';
  date_of_birth?: string | null;
}

interface AuthContextValue {
  user: SiteUser | null;
  profile: PatientProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: (userId?: string) => Promise<void>;
  setSession: (user: SiteUser, token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null, profile: null, loading: true,
  signOut: async () => {}, refreshProfile: async () => {}, setSession: async () => {},
});

function readStoredUser(): SiteUser | null {
  try {
    const raw = localStorage.getItem('navjeevan_backend_user');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function mapProfile(data: any): PatientProfile {
  const u = data?.user ?? {};
  return {
    id: String(data?._id ?? data?.id ?? u._id ?? u.id ?? ''),
    full_name: u.fullName ?? data?.fullName ?? '',
    phone: u.phone ?? data?.phone ?? '',
    email: u.email ?? data?.email ?? '',
    age: data?.age ?? undefined,
    address: data?.address ?? { city: '', state: '', country: '', pincode: '' },
    created_at: data?.createdAt ?? new Date().toISOString(),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SiteUser | null>(readStoredUser);
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchProfile(forUser?: SiteUser | null) {
    const currentUser = forUser ?? user;
    if (!getBackendToken() || !currentUser || currentUser.role !== 'patient') {
      setProfile(null);
      return;
    }
    try {
      const result = await backendRequest<any>('/patient-profile/me');
      setProfile(mapProfile(result.data ?? result));
    } catch {
      setProfile(null);
    }
  }

  async function refreshProfile(_userId?: string) {
    await fetchProfile();
  }

  useEffect(() => {
    const token = getBackendToken();
    const stored = readStoredUser();
    if (!token || !stored) {
      setUser(null);
      setProfile(null);
      setLoading(false);
      return;
    }
    setUser(stored);
    fetchProfile().finally(() => setLoading(false));
  }, []);

  async function setSession(sessionUser: SiteUser, token: string) {
    localStorage.setItem('navjeevan_backend_token', token);
    localStorage.setItem('navjeevan_backend_user', JSON.stringify(sessionUser));
    setUser(sessionUser);
    setLoading(false);
    if (sessionUser.role === 'patient') await fetchProfile(sessionUser);
  }

  async function signOut() {
    clearBackendToken();
    localStorage.removeItem('navjeevan_backend_user');
    localStorage.removeItem('lumina_user');
    setUser(null);
    setProfile(null);
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, refreshProfile, setSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() { return useContext(AuthContext); }
