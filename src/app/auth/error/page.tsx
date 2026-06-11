import Link from "next/link";

export const metadata = {
  title: "Sign in error | XIVSpots",
};

type AuthErrorPageProps = Readonly<{
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>;

const authErrorMessages = {
  registration_disabled: {
    title: "Discord registration is temporarily closed",
    description:
      "Your Discord account authenticated successfully, but XIVSpots is not accepting new accounts right now.",
  },
  login_restricted: {
    title: "Discord sign in is temporarily restricted",
    description:
      "Your Discord account authenticated successfully, but only moderators and admins can sign in right now.",
  },
  oauth_start_failed: {
    title: "Discord sign in could not start",
    description: "The app could not create a Discord sign-in request. Check the auth configuration and try again.",
  },
};

type AuthErrorReason = keyof typeof authErrorMessages;

export default async function AuthErrorPage({ searchParams }: AuthErrorPageProps) {
  const reason = single((await searchParams).reason);
  const message = isAuthErrorReason(reason) ? authErrorMessages[reason] : undefined;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-4 py-16">
      <div className="glass-panel rounded-lg p-6">
        <p className="text-sm font-semibold uppercase text-brand-spark">Auth</p>
        <h1 className="mt-2 text-3xl font-semibold text-text-primary">
          {message?.title ?? "Discord sign in failed"}
        </h1>
        <p className="mt-3 text-sm leading-6 text-text-secondary">
          {message?.description ??
            "Check that Discord is enabled in Supabase Auth and that this app's callback URL is allowed in your Supabase redirect settings."}
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

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function isAuthErrorReason(value: string | undefined): value is AuthErrorReason {
  return Boolean(value && value in authErrorMessages);
}
