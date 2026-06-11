import Image from "next/image";
import Link from "next/link";

import { KoFiButton } from "@/components/layout/KoFiButton";

const currentYear = new Date().getFullYear();

function FooterLogo() {
  return (
    <Link href="/" className="inline-flex items-center gap-3" aria-label="xivspots home">
      <Image
        src="/brand/icon.webp"
        alt=""
        width={510}
        height={510}
        className="h-14 w-14 shrink-0 object-contain"
        sizes="56px"
        unoptimized
      />
      <svg
        aria-hidden="true"
        className="h-[38px] w-[132px] shrink-0"
        viewBox="0 0 208 60"
        role="img"
      >
        <defs>
          <linearGradient id="footerLogoWordGradient" x1="102" y1="5" x2="204" y2="55" gradientUnits="userSpaceOnUse">
            <stop stopColor="#2F8CFF" />
            <stop offset="1" stopColor="#22D3EE" />
          </linearGradient>
          <radialGradient id="footerLogoSparkGradient" cx="50%" cy="50%" r="65%">
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
          fill="url(#footerLogoSparkGradient)"
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
          fill="url(#footerLogoWordGradient)"
          fontFamily="var(--font-display), Segoe UI, sans-serif"
          fontSize="50"
          fontWeight="600"
          letterSpacing="0"
        >
          spots
        </text>
      </svg>
    </Link>
  );
}

export function MainFooter() {
  return (
    <footer className="mt-20 border-t border-border-subtle/60 bg-[#020817]">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 text-sm text-text-muted md:grid-cols-[auto_1fr_auto] md:items-center">
        <div className="flex justify-start">
          <FooterLogo />
        </div>
        <p className="max-w-xl text-xs leading-6 text-text-subtle md:mx-auto md:text-center">
          XIVSpots is an unofficial fan project and is not affiliated with, endorsed by, or sponsored by Square Enix.
          FINAL FANTASY is a registered trademark of Square Enix Holdings Co., Ltd. &copy; SQUARE ENIX. Fan content is
          used under the{" "}
          <a
            href="https://support.na.square-enix.com/rule.php?id=5382&la=1&tag=authc"
            className="font-semibold text-brand-spark hover:text-text-primary"
          >
            FINAL FANTASY XIV Materials Usage License
          </a>
          .
        </p>
        <div className="flex flex-col items-start gap-3 md:items-end">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <a
              href="https://sorkos.net/"
              className="text-text-secondary transition hover:text-brand-gold"
            >
              &copy; {currentYear} sorkos.net
            </a>
            <a
              href="https://sorkos.featurebase.app/"
              className="font-semibold text-text-secondary transition hover:text-brand-gold"
            >
              Feedback
            </a>
          </div>
          <KoFiButton />
        </div>
      </div>
    </footer>
  );
}
