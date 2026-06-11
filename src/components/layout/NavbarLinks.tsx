"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavbarLink = {
  href: string;
  label: string;
};

type NavbarLinksProps = Readonly<{
  className?: string;
  linkClassName?: string;
  links: NavbarLink[];
}>;

const baseLinkClassName =
  "inline-flex h-9 items-center rounded-full border px-3 whitespace-nowrap transition";

const inactiveLinkClassName =
  "border-transparent text-text-secondary hover:border-border-default hover:bg-surface-raised hover:text-text-primary";

const activeLinkClassName =
  "border-border-active/60 bg-brand-spark/10 text-text-primary shadow-[0_0_22px_-16px_rgba(93,235,255,0.95)]";

export function NavbarLinks({ className = "", linkClassName = "", links }: NavbarLinksProps) {
  const pathname = usePathname();
  const activeHref = getActiveHref(pathname, links);

  return (
    <ul className={className}>
      {links.map((link) => {
        const isActive = link.href === activeHref;

        return (
          <li key={link.href}>
            <Link
              href={link.href}
              aria-current={isActive ? "page" : undefined}
              className={`${baseLinkClassName} ${
                isActive ? activeLinkClassName : inactiveLinkClassName
              } ${linkClassName}`.trim()}
            >
              {link.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function getActiveHref(pathname: string, links: NavbarLink[]) {
  return [...links]
    .filter((link) => isActivePath(pathname, link.href))
    .sort((a, b) => getPathname(b.href).length - getPathname(a.href).length)[0]?.href;
}

function isActivePath(pathname: string, href: string) {
  const linkPathname = getPathname(href);

  if (linkPathname === "/") {
    return pathname === "/";
  }

  return pathname === linkPathname || pathname.startsWith(`${linkPathname}/`);
}

function getPathname(href: string) {
  return href.split("?")[0] || "/";
}
