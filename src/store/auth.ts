import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface Session {
  email: string;
  name: string;
  signedInAt: string;
}

interface AuthState {
  session: Session | null;
  signIn: (email: string) => void;
  signOut: () => void;
}

export const SESSION_STORAGE_KEY = 'pulse.session';

/** Derives a friendly display name from an email address ("jane.doe@x" -> "Jane Doe"). */
export function nameFromEmail(email: string): string {
  const local = email.split('@')[0] ?? '';
  const words = local.split(/[._-]+/).filter(Boolean);
  if (!words.length) return 'Demo User';
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

/** Fake auth: any email/password pair is accepted; the session lives in localStorage. */
export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      signIn: (email) =>
        set({
          session: { email, name: nameFromEmail(email), signedInAt: new Date().toISOString() },
        }),
      signOut: () => set({ session: null }),
    }),
    {
      name: SESSION_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ session: s.session }),
    },
  ),
);
