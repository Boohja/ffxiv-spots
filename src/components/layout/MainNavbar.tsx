import Link from "next/link";
import Image from "next/image";

import { AuthMenu } from "@/components/layout/AuthMenu";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const links = [
  { href: "/", label: "Discover" },
  { href: "/spots", label: "Browse" },
  { href: "/favorites", label: "Favorites" },
  { href: "/spots?sort=featured", label: "Curated" },
];

export function MainNavbar() {
  return (
    <header className="border-b border-border-subtle/60 bg-surface-base/85 backdrop-blur-xl">
      <nav className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex h-12 shrink-0 items-center gap-2" aria-label="xivspots home">
            <Image
              src="/brand/icon.png?v=transparent"
              alt=""
              width={510}
              height={510}
              className="h-11 w-11 shrink-0 object-contain"
              sizes="44px"
              unoptimized
            />
            <svg
              aria-hidden="true"
              className="h-[30px] w-[104px] shrink-0"
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
          <div className="hidden max-w-xl flex-1 md:block">
            <form action="/spots">
              <Input name="q" placeholder="Search spots, zones, expansions..." leading={<span className="text-sm">⌕</span>} />
            </form>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" type="button" disabled title="Submission flow placeholder">
              Submit spot
            </Button>
            <AuthMenu />
          </div>
        </div>

        <ul className="flex items-center gap-2 overflow-x-auto pb-1">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="inline-flex h-9 items-center rounded-full border border-transparent px-3 text-sm text-text-secondary transition hover:border-border-default hover:bg-surface-raised hover:text-text-primary"
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li className="ml-auto md:hidden">
            <Button variant="icon" aria-label="Search">
              ⌕
            </Button>
          </li>
        </ul>
      </nav>
    </header>
  );
}
