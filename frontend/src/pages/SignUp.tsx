import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, Loader2 } from 'lucide-react';
import { SEO } from '../components/SEO';
import { AuthCard } from '../components/auth/AuthCard';
import { OAuthButtons } from '../components/auth/OAuthButtons';
import { FormField, inputClasses } from '../components/ui/FormField';
import { Button } from '../components/ui/Button';
import { useAuth } from '../store/useAuth';

export function SignUp() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const signup = useAuth((s) => s.signup);
  const isSubmitting = useAuth((s) => s.isSubmitting);
  const error = useAuth((s) => s.error);
  const clearError = useAuth((s) => s.clearError);
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    clearError();
    try {
      await signup({ firstName, lastName, email, password });
      navigate('/dashboard');
    } catch {
      // Error is already captured in the auth store and rendered below.
    }
  }

  return (
    <>
      <SEO title="Create an Account" noindex />
      <AuthCard
      title="Create your account"
      subtitle="Get personalized access to Elevate Minds tools and programs."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-accent hover:text-accent-600 dark:text-accent-light">
            Sign in
          </Link>
        </>
      }
    >
      <OAuthButtons />

      <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wide text-ink-soft dark:text-ink-onDarkSoft">
        <span className="h-px flex-1 bg-primary-100 dark:bg-primary-800" />
        or with email
        <span className="h-px flex-1 bg-primary-100 dark:bg-primary-800" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <FormField label="First name" htmlFor="signup-first-name" required>
            <input
              id="signup-first-name"
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={inputClasses}
              autoComplete="given-name"
            />
          </FormField>
          <FormField label="Last name" htmlFor="signup-last-name" required>
            <input
              id="signup-last-name"
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={inputClasses}
              autoComplete="family-name"
            />
          </FormField>
        </div>

        <FormField label="Email address" htmlFor="signup-email" required>
          <input
            id="signup-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClasses}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </FormField>
        <FormField label="Password" htmlFor="signup-password" required hint="At least 8 characters">
          <input
            id="signup-password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClasses}
            autoComplete="new-password"
          />
        </FormField>

        <Button type="submit" variant="primary" className="mt-2 w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          {isSubmitting ? 'Creating account…' : 'Create Account'}
        </Button>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {error}
          </div>
        )}
      </form>
      </AuthCard>
    </>
  );
}
