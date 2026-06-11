import Image from "next/image";
import Link from "next/link";

import { KoFiButton } from "@/components/layout/KoFiButton";

const currentYear = new Date().getFullYear();

function FooterLogo() {
  return (
    <Link href="/" className="inline-flex items-center gap-3" aria-label="xivspots home">
      <Image
        src="/brand/icon.webp"
        alt="XIVSpots Logo"
        width={510}
        height={510}
        className="h-30 w-30 shrink-0 object-contain"
        sizes="56px"
        unoptimized
      />
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
