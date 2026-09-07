import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Loader2 } from 'lucide-react';
import { SEO } from '../components/SEO';
import { AuthCard } from '../components/auth/AuthCard';
import { FormField, inputClasses } from '../components/ui/FormField';
import { Button } from '../components/ui/Button';
import { SuccessMessage } from '../components/ui/SuccessMessage';
import { api, ApiError } from '../lib/api';

export function ForgotPassword() {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      // The backend always responds 200 here regardless of whether the email
      // is registered, so it can't be used to enumerate accounts.
      await api.post('/auth/forgot-password', { email }, { skipAuthHeader: true });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <SEO title="Forgot Password" noindex />
      <AuthCard
      title="Reset your password"
      subtitle="We'll send password reset instructions to your email."
      footer={
        <Link to="/login" className="font-semibold text-accent hover:text-accent-600 dark:text-accent-light">
          Back to sign in
        </Link>
      }
    >
      {submitted ? (
        <SuccessMessage>
          If that email is registered, a reset link has been sent. Check the backend server
          console for the link during local development (no real email provider is configured
          yet).
        </SuccessMessage>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormField label="Email address" htmlFor="forgot-email" required>
            <input
              id="forgot-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClasses}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </FormField>
          <Button type="submit" variant="primary" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {isSubmitting ? 'Sending…' : 'Send Reset Link'}
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
