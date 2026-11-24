import type { ReactNode } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { Segmented } from '../components/ui/Segmented';
import { api } from '../data/api';
import { ProfileForm } from '../features/settings/ProfileForm';
import type { ProfileFormValues } from '../features/settings/profileSchema';
import { useAuth } from '../store/auth';
import { useSettings } from '../store/settings';
import { useTheme, type ThemePreference } from '../store/theme';

const THEME_OPTIONS = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
] as const satisfies readonly { value: ThemePreference; label: string }[];

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  const id = `section-${title.toLowerCase().replace(/\s+/g, '-')}`;
  return (
    <section aria-labelledby={id} className="card grid gap-6 p-6 lg:grid-cols-3">
      <div>
        <h2 id={id} className="font-semibold text-slate-900 dark:text-white">
          {title}
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      <div className="lg:col-span-2">{children}</div>
    </section>
  );
}

export default function SettingsPage() {
  const session = useAuth((s) => s.session);
  const { profile, saveProfile, simulateErrors, setSimulateErrors } = useSettings();
  const { preference, setPreference } = useTheme();

  const defaults: ProfileFormValues = profile ?? {
    fullName: session?.name ?? '',
    email: session?.email ?? '',
    company: 'Pulse Analytics',
    role: 'Founder',
    website: '',
    bio: '',
    weeklyDigest: true,
  };

  const handleSubmit = async (values: ProfileFormValues) => {
    const saved = await api.updateProfile(values);
    saveProfile(saved);
  };

  return (
    <>
      <PageHeader title="Settings" description="Manage your profile and workspace preferences." />
      <div className="space-y-6">
        <Section title="Profile" description="This information is only stored in your browser.">
          <ProfileForm defaultValues={defaults} onSubmit={handleSubmit} />
        </Section>

        <Section title="Appearance" description="System follows your operating system setting.">
          <Segmented
            label="Theme"
            value={preference}
            options={THEME_OPTIONS}
            onChange={setPreference}
          />
        </Section>

        <Section
          title="Developer"
          description="Tools for exploring how the dashboard handles failures."
        >
          <div className="flex items-start gap-3">
            <input
              id="simulate-errors"
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              checked={simulateErrors}
              onChange={(e) => setSimulateErrors(e.target.checked)}
            />
            <div>
              <label
                htmlFor="simulate-errors"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Simulate API errors
              </label>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Every fake API request fails with a 503 so you can see the error and retry states.
              </p>
            </div>
          </div>
        </Section>
      </div>
    </>
  );
}
