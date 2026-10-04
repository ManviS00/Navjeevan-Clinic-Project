import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type { UserState, ReproductiveStage, PregnancyProfile, PregnancyOutcome } from '@/lib/types';

interface StageContextValue {
  state: UserState | null;
  pregnancy: PregnancyProfile | null;
  loading: boolean;
  isPregnant: boolean;
  isTryingToConceive: boolean;
  canTrackPeriod: boolean;
  canTrackFertility: boolean;
  canTrackPregnancy: boolean;
  refresh: () => Promise<void>;
  setStage: (stage: ReproductiveStage) => Promise<void>;
  setTryingToConceive: (v: boolean) => Promise<void>;
  startPregnancy: (dueDate: string, lmpDate?: string, nickname?: string) => Promise<void>;
  endPregnancy: (outcome: PregnancyOutcome, outcomeDate: string) => Promise<void>;
}

const StageContext = createContext<StageContextValue | undefined>(undefined);

export function StageProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [state, setState] = useState<UserState | null>(null);
  const [pregnancy, setPregnancy] = useState<PregnancyProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) { setState(null); setPregnancy(null); setLoading(false); return; }
    try {
      const [s, p] = await Promise.all([api.getUserState(), api.getPregnancyProfile()]);
      setState(s as UserState);
      setPregnancy(p as PregnancyProfile | null);
    } catch { /* ignore */ }
    setLoading(false);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const setStage = useCallback(async (stage: ReproductiveStage) => {
    const updated = await api.updateUserState({ stage });
    setState(updated as UserState);
  }, []);

  const setTryingToConceive = useCallback(async (v: boolean) => {
    const stage = v ? 'fertility' : 'period';
    const updated = await api.updateUserState({ trying_to_conceive: v, stage });
    setState(updated as UserState);
  }, []);

  const startPregnancy = useCallback(async (dueDate: string, lmpDate?: string, nickname?: string) => {
    await api.upsertPregnancyProfile({
      due_date: dueDate,
      lmp_date: lmpDate || null,
      conception_date: null,
      baby_nickname: nickname || null,
      outcome: null,
      outcome_date: null,
    });
    const updated = await api.updateUserState({ stage: 'pregnant', trying_to_conceive: false });
    setState(updated as UserState);
    const p = await api.getPregnancyProfile();
    setPregnancy(p as PregnancyProfile);
  }, []);

  const endPregnancy = useCallback(async (outcome: PregnancyOutcome, outcomeDate: string) => {
    await api.upsertPregnancyProfile({ outcome, outcome_date: outcomeDate });
    const updated = await api.updateUserState({ stage: 'period', trying_to_conceive: false });
    setState(updated as UserState);
    // Keep the completed profile (with outcome/outcome_date) rather than
    // nulling it out — the Pregnancy tab uses this to show the postpartum
    // recap, and the backend uses outcome_date to enforce the postpartum
    // recovery window before a new pregnancy can be confirmed.
    const p = await api.getPregnancyProfile();
    setPregnancy(p as PregnancyProfile);
  }, []);

  const stage = state?.stage ?? 'period';
  const isPregnant = stage === 'pregnant';
  const isTryingToConceive = stage === 'fertility' || (state?.trying_to_conceive ?? false);
  const canTrackPeriod = !isPregnant;
  const canTrackFertility = !isPregnant;
  const canTrackPregnancy = true;

  const value: StageContextValue = {
    state, pregnancy, loading,
    isPregnant, isTryingToConceive,
    canTrackPeriod, canTrackFertility, canTrackPregnancy,
    refresh, setStage, setTryingToConceive, startPregnancy, endPregnancy,
  };

  return <StageContext.Provider value={value}>{children}</StageContext.Provider>;
}

export function useStage() {
  const ctx = useContext(StageContext);
  if (!ctx) throw new Error('useStage must be used within StageProvider');
  return ctx;
}
