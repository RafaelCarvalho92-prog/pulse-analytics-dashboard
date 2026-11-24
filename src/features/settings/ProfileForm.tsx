import { zodResolver } from '@hookform/resolvers/zod';
import { useState, type ReactNode } from 'react';
import { useForm, type FieldError } from 'react-hook-form';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/cn';
import { profileSchema, ROLES, type ProfileFormValues } from './profileSchema';

interface ProfileFormProps {
  defaultValues: ProfileFormValues;
  onSubmit: (values: ProfileFormValues) => Promise<void>;
}

function Field({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  error?: FieldError;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1 text-sm text-rose-600 dark:text-rose-400">
          {error.message}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

export function ProfileForm({ defaultValues, onSubmit }: ProfileFormProps) {
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues,
    mode: 'onTouched',
  });

  const bioLength = watch('bio')?.length ?? 0;
  const a11y = (name: keyof ProfileFormValues, hasHint = false) => ({
    id: `profile-${name}`,
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': errors[name]
      ? `profile-${name}-error`
      : hasHint
        ? `profile-${name}-hint`
        : undefined,
  });

  const submit = handleSubmit(async (values) => {
    setResult(null);
    try {
      await onSubmit(values);
      reset(values);
      setResult({ ok: true, message: 'Profile saved.' });
    } catch (err) {
      setResult({
        ok: false,
        message: err instanceof Error ? err.message : 'Could not save profile.',
      });
    }
  });

  return (
    <form onSubmit={submit} noValidate className="space-y-5" aria-label="Profile">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="profile-fullName" label="Full name" error={errors.fullName}>
          <input
            className="input"
            autoComplete="name"
            {...a11y('fullName')}
            {...register('fullName')}
          />
        </Field>
        <Field id="profile-email" label="Email" error={errors.email}>
          <input
            className="input"
            type="email"
            autoComplete="email"
            {...a11y('email')}
            {...register('email')}
          />
        </Field>
        <Field id="profile-company" label="Company" error={errors.company}>
          <input
            className="input"
            autoComplete="organization"
            {...a11y('company')}
            {...register('company')}
          />
        </Field>
        <Field id="profile-role" label="Role" error={errors.role}>
          <select className="input" {...a11y('role')} {...register('role')}>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </Field>
        <div className="sm:col-span-2">
          <Field id="profile-website" label="Website" error={errors.website} hint="Optional">
            <input
              className="input"
              type="url"
              placeholder="https://example.com"
              autoComplete="url"
              {...a11y('website', true)}
              {...register('website')}
            />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field
            id="profile-bio"
            label="Bio"
            error={errors.bio}
            hint={`${bioLength}/160 characters`}
          >
            <textarea
              className="input min-h-24"
              rows={3}
              {...a11y('bio', true)}
              {...register('bio')}
            />
          </Field>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <input
          id="profile-weeklyDigest"
          type="checkbox"
          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          {...register('weeklyDigest')}
        />
        <label
          htmlFor="profile-weeklyDigest"
          className="text-sm text-slate-700 dark:text-slate-300"
        >
          Email me a weekly metrics digest
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 pt-5 dark:border-slate-800">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save changes'}
        </Button>
        <Button
          variant="ghost"
          disabled={!isDirty || isSubmitting}
          onClick={() => {
            reset();
            setResult(null);
          }}
        >
          Reset
        </Button>
        <p
          role="status"
          className={cn(
            'text-sm',
            result?.ok
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-rose-600 dark:text-rose-400',
          )}
        >
          {result?.message}
        </p>
      </div>
    </form>
  );
}
