import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, Loader2 } from 'lucide-react';
import { SEO } from '../components/SEO';
import { AuthCard } from '../components/auth/AuthCard';
import { FormField, inputClasses } from '../components/ui/FormField';
import { Button } from '../components/ui/Button';
import { SuccessMessage } from '../components/ui/SuccessMessage';
import { api, ApiError } from '../lib/api';

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!submitted) return;
    const timer = setTimeout(() => navigate('/login'), 2000);
    return () => clearTimeout(timer);
  }, [submitted, navigate]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/auth/reset-password', { token, newPassword: password }, { skipAuthHeader: true });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!token) {
    return (
      <>
        <SEO title="Reset Password" noindex />
        <AuthCard
          title="Reset link missing"
          subtitle="This page needs a reset token from your email link."
          footer={
            <Link to="/forgot-password" className="font-semibold text-accent hover:text-accent-600 dark:text-accent-light">
              Request a new reset link
            </Link>
          }
        >
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            No reset token was found in the URL. Use the link from your password reset email, or
            request a new one.
          </div>
        </AuthCard>
      </>
    );
  }

  return (
    <>
      <SEO title="Reset Password" noindex />
      <AuthCard
      title="Set a new password"
      subtitle="Choose a new password for your Elevate Minds account."
      footer={
        <Link to="/login" className="font-semibold text-accent hover:text-accent-600 dark:text-accent-light">
          Back to sign in
        </Link>
      }
    >
      {submitted ? (
        <SuccessMessage>Your password has been reset. Redirecting you to sign in…</SuccessMessage>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormField label="New password" htmlFor="reset-password" required>
            <input
              id="reset-password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClasses}
              placeholder="At least 8 characters"
              autoComplete="new-password"
            />
          </FormField>
          <FormField label="Confirm new password" htmlFor="reset-password-confirm" required>
            <input
              id="reset-password-confirm"
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClasses}
              placeholder="Re-enter your new password"
              autoComplete="new-password"
            />
          </FormField>
          <Button type="submit" variant="primary" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {isSubmitting ? 'Resetting…' : 'Reset Password'}
          </Button>

          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              {error}
            </div>
          )}
        </form>
      )}
      </AuthCard>
    </>
  );
}
