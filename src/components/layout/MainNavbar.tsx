import Link from "next/link";
import Image from "next/image";

import { AuthMenu } from "@/components/layout/AuthMenu";
import { NavbarLinks } from "@/components/layout/NavbarLinks";
import { createClient } from "@/lib/supabase/server";

const publicLinks = [
  { href: "/", label: "Discover" },
  { href: "/spots", label: "Browse" }
];

export async function MainNavbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: appProfile } = user
    ? await supabase
        .from("app_users")
        .select("role")
        .eq("id", user.id)
        .maybeSingle<{ role: string | null }>()
    : { data: null };
  const links = [
    ...publicLinks,
    user ? { href: "/spots/submit", label: "Submit" } : null,
    user ? { href: "/spots/mine", label: "My spots" } : null,
    appProfile?.role === "moderator" || appProfile?.role === "admin"
      ? { href: "/moderation/spots", label: "Review" }
      : null,
  ].filter((link): link is { href: string; label: string } => Boolean(link));

  return (
    <header className="relative z-50 border-b border-border-subtle/60 bg-surface-base">
      <nav className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-3 md:py-4">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 md:grid-cols-[minmax(24rem,1fr)_minmax(0,38rem)_max-content] md:gap-6">
          <Link href="/" className="flex h-12 min-w-0 shrink-0 items-center gap-2 md:h-[5.5rem] md:gap-4 md:pr-4" aria-label="xivspots home">
            <Image
              src="/brand/icon.png?v=transparent"
              alt=""
              width={510}
              height={510}
              className="h-11 w-11 shrink-0 object-contain md:h-20 md:w-20"
              sizes="(min-width: 768px) 80px, 44px"
              unoptimized
            />
            <svg
              aria-hidden="true"
              className="h-[30px] w-[104px] shrink-0 md:h-12 md:w-[166px]"
              viewBox="0 0 208 60"
              role="img"
            >
              <defs>
                <linearGradient id="navbarLogoWordGradient" x1="102" y1="5" x2="204" y2="55" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#2F8CFF" />
                  <stop offset="1" stopColor="#22D3EE" />
                </linearGradient>
                <radialGradient id="navbarLogoSparkGradient" cx="50%" cy="50%" r="65%">
                  <stop stopColor="#A7FAFF" />
                  <stop offset="0.45" stopColor="#5DEBFF" />
                  <stop offset="1" stopColor="#1C6BFF" />
                </radialGradient>
              </defs>
              <text
                x="0"
                y="45"
                fill="#F8FAFC"
                fontFamily="var(--font-display), Segoe UI, sans-serif"
                fontSize="50"
                fontWeight="700"
                letterSpacing="0"
              >
                x
              </text>
              <rect x="33" y="27" width="8" height="19" rx="4" fill="#F8FAFC" />
              <path
                d="M37 0L39.5 8.5L48 11L39.5 13.5L37 22L34.5 13.5L26 11L34.5 8.5L37 0Z"
                fill="url(#navbarLogoSparkGradient)"
              />
              <text
                x="45"
                y="45"
                fill="#F8FAFC"
                fontFamily="var(--font-display), Segoe UI, sans-serif"
                fontSize="50"
                fontWeight="700"
                letterSpacing="0"
              >
                v
              </text>
              <text
                x="75"
                y="45"
                fill="url(#navbarLogoWordGradient)"
                fontFamily="var(--font-display), Segoe UI, sans-serif"
                fontSize="50"
                fontWeight="600"
                letterSpacing="0"
              >
                spots
              </text>
            </svg>
          </Link>
          <div className="hidden w-full max-w-xl justify-self-center md:flex md:flex-col md:gap-3">
            <NavbarLinks className="flex w-full items-center justify-center gap-2 overflow-x-auto pb-1" links={links} />
          </div>
          <div className="flex items-center justify-end gap-2">
            <AuthMenu />
          </div>
        </div>

        <NavbarLinks className="flex items-center gap-2 overflow-x-auto pb-1 md:hidden" linkClassName="text-sm" links={links} />
      </nav>
    </header>
  );
}
