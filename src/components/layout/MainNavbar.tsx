import Link from "next/link";

import { Button } from "@/components/ui/Button";

const links = [
  { href: "/", label: "Home" },
  { href: "/favorites", label: "Favorites" },
];

export function MainNavbar() {
  return (
    <header className="border-b border-zinc-200 bg-white">
      <nav className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-base font-semibold tracking-tight">
          xivspots
        </Link>
        <ul className="flex items-center gap-2">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="rounded-md px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <Button variant="ghost" type="button">
          Sign in
        </Button>
      </nav>
    </header>
  );
}
