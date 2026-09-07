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

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const login = useAuth((s) => s.login);
  const isSubmitting = useAuth((s) => s.isSubmitting);
  const error = useAuth((s) => s.error);
  const clearError = useAuth((s) => s.clearError);
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    clearError();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch {
      // Error is already captured in the auth store and rendered below.
    }
  }

  return (
    <>
      <SEO title="Log In" noindex />
      <AuthCard
      title="Welcome back"
      subtitle="Sign in to access your Elevate Minds dashboard."
      footer={
        <>
          New here?{' '}
          <Link to="/signup" className="font-semibold text-accent hover:text-accent-600 dark:text-accent-light">
            Create an account
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
        <FormField label="Email address" htmlFor="login-email" required>
          <input
            id="login-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClasses}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </FormField>
        <FormField label="Password" htmlFor="login-password" required>
          <input
            id="login-password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClasses}
            autoComplete="current-password"
          />
        </FormField>

        <div className="-mt-1 text-right">
          <Link
            to="/forgot-password"
            className="text-xs font-medium text-accent hover:text-accent-600 dark:text-accent-light"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" variant="primary" className="mt-1 w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          {isSubmitting ? 'Signing in…' : 'Sign In'}
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
