import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { configureApi } from '../data/api';
import type { Profile } from '../data/types';

interface SettingsState {
  profile: Profile | null;
  simulateErrors: boolean;
  saveProfile: (profile: Profile) => void;
  setSimulateErrors: (value: boolean) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      profile: null,
      simulateErrors: false,
      saveProfile: (profile) => set({ profile }),
      setSimulateErrors: (simulateErrors) => {
        configureApi({ failRequests: simulateErrors });
        set({ simulateErrors });
      },
    }),
    {
      name: 'pulse.settings',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) configureApi({ failRequests: state.simulateErrors });
      },
    },
  ),
);
