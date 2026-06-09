import { create } from 'zustand';

interface AppState {
  user: any | null;
  couple: any | null;
  setUser: (user: any) => void;
  setCouple: (couple: any) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null, // Replace with real Supabase user
  couple: null,
  setUser: (user) => set({ user }),
  setCouple: (couple) => set({ couple }),
  logout: () => set({ user: null, couple: null }),
}));
