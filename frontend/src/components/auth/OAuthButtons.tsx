export function OAuthButtons() {
  return (
    <div className="flex flex-col gap-2.5">
      {['Google', 'Facebook'].map((provider) => (
        <div key={provider} className="group relative">
          <button
            type="button"
            disabled
            aria-disabled="true"
            className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-full border border-primary-200 px-4 py-2.5 text-sm font-medium text-ink-soft/70 dark:border-primary-700 dark:text-ink-onDarkSoft/60"
          >
            Sign in with {provider}
          </button>
          <span
            role="tooltip"
            className="pointer-events-none absolute left-1/2 top-full z-10 mt-1.5 -translate-x-1/2 whitespace-nowrap rounded-md bg-primary-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
          >
            Coming soon
          </span>
        </div>
      ))}
    </div>
  );
}
