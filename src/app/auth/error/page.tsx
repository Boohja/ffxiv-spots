import Link from "next/link";

export const metadata = {
  title: "Sign in error | XIVSpots",
};

export default function AuthErrorPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-4 py-16">
      <div className="glass-panel rounded-lg p-6">
        <p className="text-sm font-semibold uppercase text-brand-spark">Auth</p>
        <h1 className="mt-2 text-3xl font-semibold text-text-primary">Discord sign in failed</h1>
        <p className="mt-3 text-sm leading-6 text-text-secondary">
          Check that Discord is enabled in Supabase Auth and that this app&apos;s callback URL is
          allowed in your Supabase redirect settings.
        </p>
        <Link
          href="/auth/login"
          className="mt-5 inline-flex h-10 items-center justify-center rounded-lg border border-border-default bg-surface-elevated px-4 text-sm font-semibold text-text-primary transition hover:border-border-active/60 hover:bg-surface-overlay"
        >
          Try again
        </Link>
      </div>
    </main>
  );
}
