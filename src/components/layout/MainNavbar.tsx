import Link from "next/link";
import Image from "next/image";

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
          <Link href="/" className="flex items-center gap-2">
            <Image src="/brand/logo-mark.svg" alt="xivspots" width={42} height={48} />
            <span className="font-display text-2xl font-semibold">
              <span className="text-text-primary">XIV</span>
              <span className="text-brand-azure">Spots</span>
            </span>
          </Link>
          <div className="hidden max-w-xl flex-1 md:block">
            <form action="/spots">
              <Input name="q" placeholder="Search spots, zones, expansions..." leading={<span className="text-sm">⌕</span>} />
            </form>
          </div>
          <Button variant="secondary" size="sm" type="button" disabled title="Submission flow placeholder">
            Submit spot
          </Button>
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
