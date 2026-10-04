import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { api, type AccessInfo } from '@/lib/api';
import { useAuth } from '@/lib/auth';

const DEFAULT_ACCESS: AccessInfo = {
  age: null,
  access: { period: true, fertility: true, pregnancy: true },
  pregnancyGate: { canConfirmPregnant: true, reason: null, until: null },
};

interface AccessContextValue extends AccessInfo {
  loading: boolean;
  refresh: () => Promise<void>;
}

const AccessContext = createContext<AccessContextValue | undefined>(undefined);

export function AccessProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [info, setInfo] = useState<AccessInfo>(DEFAULT_ACCESS);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) { setInfo(DEFAULT_ACCESS); setLoading(false); return; }
    try {
      const res = await api.getAccess();
      setInfo(res);
    } catch { /* ignore, fall back to permissive defaults */ }
    setLoading(false);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  return (
    <AccessContext.Provider value={{ ...info, loading, refresh }}>
      {children}
    </AccessContext.Provider>
  );
}

export function useAccess() {
  const ctx = useContext(AccessContext);
  if (!ctx) throw new Error('useAccess must be used within AccessProvider');
  return ctx;
}

export function pregnancyGateMessage(reason: 'age' | 'active_period' | 'postpartum' | null, until: string | null): string {
  if (reason === 'active_period') return `You can confirm a pregnancy once your period ends${until ? ` (${until})` : ''}.`;
  if (reason === 'postpartum') return `You're in your postpartum recovery window${until ? ` until ${until}` : ''}.`;
  if (reason === 'age') return `This feature isn't available for your age group.`;
  return '';
}
