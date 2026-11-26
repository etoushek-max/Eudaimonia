import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { dateKey } from '@/lib/dates';
import type { Influences } from '@/lib/influences';
import type { LifeMap } from '@/lib/life-map';
import type { PlanItem } from '@/lib/week';
import { parseHabits } from '@/lib/profile';
import { EMPTY_DATA, type AppData, type ChatMessage, type Habit, type LogStatus } from '@/lib/types';

const STORAGE_KEY = 'eudaimonia:v1';

interface Store {
  data: AppData;
  loaded: boolean;
  saveProfile: (profile: string) => void;
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt'>) => void;
  removeHabit: (id: string) => void;
  setStatus: (habitId: string, status: LogStatus | null, day?: string) => void;
  setCoachThread: (messages: ChatMessage[]) => void;
  setCheckin: (day: string, messages: ChatMessage[]) => void;
  addLifeMap: (map: LifeMap) => void;
  setInfluences: (influences: Influences) => void;
  setWeekPlan: (items: Omit<PlanItem, 'id' | 'done'>[]) => void;
  addPlanItem: (item: Omit<PlanItem, 'id' | 'done'>) => void;
  togglePlanItem: (id: string) => void;
  removePlanItem: (id: string) => void;
  resetAll: () => void;
}

const StoreContext = createContext<Store | null>(null);

const newId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(EMPTY_DATA);
  const [loaded, setLoaded] = useState(false);
  const hydrated = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setData({ ...EMPTY_DATA, ...(JSON.parse(raw) as Partial<AppData>) });
      })
      .catch((e) => console.warn('Could not load saved data', e))
      .finally(() => {
        hydrated.current = true;
        setLoaded(true);
      });
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch((e) => console.warn('Could not save data', e));
  }, [data]);

  const saveProfile = useCallback((profile: string) => {
    setData((d) => {
      // Habits come from the profile's table; keep ids (and history) for habits that still exist.
      const parsed = parseHabits(profile);
      const habits = parsed.length
        ? parsed.map((h) => {
            const existing = d.habits.find((x) => x.name.toLowerCase() === h.name.toLowerCase());
            return existing
              ? { ...existing, ...h, days: h.days }
              : { ...h, id: newId(), createdAt: new Date().toISOString() };
          })
        : d.habits;
      return {
        ...d,
        profile,
        profileUpdatedAt: new Date().toISOString(),
        habits,
      };
    });
  }, []);

  const addHabit = useCallback((habit: Omit<Habit, 'id' | 'createdAt'>) => {
    setData((d) => ({
      ...d,
      habits: [...d.habits, { ...habit, id: newId(), createdAt: new Date().toISOString() }],
    }));
  }, []);

  const removeHabit = useCallback((id: string) => {
    setData((d) => ({ ...d, habits: d.habits.filter((h) => h.id !== id) }));
  }, []);

  const setStatus = useCallback((habitId: string, status: LogStatus | null, day = dateKey()) => {
    setData((d) => {
      const dayLog = { ...(d.log[day] ?? {}) };
      if (status) dayLog[habitId] = status;
      else delete dayLog[habitId];
      return { ...d, log: { ...d.log, [day]: dayLog } };
    });
  }, []);

  const setCoachThread = useCallback((coachThread: ChatMessage[]) => setData((d) => ({ ...d, coachThread })), []);
  const setCheckin = useCallback(
    (day: string, messages: ChatMessage[]) => setData((d) => ({ ...d, checkins: { ...d.checkins, [day]: messages } })),
    [],
  );
  const setInfluences = useCallback((influences: Influences) => setData((d) => ({ ...d, influences })), []);
  const addLifeMap = useCallback((map: LifeMap) => setData((d) => ({ ...d, lifeMaps: [...d.lifeMaps, map] })), []);
  // A new plan from the coach replaces unfinished items in the days it covers; done items stay.
  const setWeekPlan = useCallback(
    (items: Omit<PlanItem, 'id' | 'done'>[]) =>
      setData((d) => {
        if (items.length === 0) return d;
        const dates = items.map((i) => i.date).sort();
        const [first, last] = [dates[0], dates[dates.length - 1]];
        const kept = d.plan.filter((p) => p.done || p.date < first || p.date > last);
        return {
          ...d,
          plan: [...kept, ...items.map((i) => ({ ...i, id: newId(), done: false }))],
        };
      }),
    [],
  );
  const addPlanItem = useCallback(
    (item: Omit<PlanItem, 'id' | 'done'>) =>
      setData((d) => ({
        ...d,
        plan: [...d.plan, { ...item, id: newId(), done: false }],
      })),
    [],
  );
  const togglePlanItem = useCallback(
    (id: string) =>
      setData((d) => ({
        ...d,
        plan: d.plan.map((p) => (p.id === id ? { ...p, done: !p.done } : p)),
      })),
    [],
  );
  const removePlanItem = useCallback(
    (id: string) => setData((d) => ({ ...d, plan: d.plan.filter((p) => p.id !== id) })),
    [],
  );
  const resetAll = useCallback(() => setData(EMPTY_DATA), []);

  const value = useMemo(
    () => ({
      data,
      loaded,
      saveProfile,
      addHabit,
      removeHabit,
      setStatus,
      setCoachThread,
      setCheckin,
      addLifeMap,
      setInfluences,
      setWeekPlan,
      addPlanItem,
      togglePlanItem,
      removePlanItem,
      resetAll,
    }),
    [
      data,
      loaded,
      saveProfile,
      addHabit,
      removeHabit,
      setStatus,
      setCoachThread,
      setCheckin,
      addLifeMap,
      setInfluences,
      setWeekPlan,
      addPlanItem,
      togglePlanItem,
      removePlanItem,
      resetAll,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useStore must be used inside StoreProvider');
  return store;
}
