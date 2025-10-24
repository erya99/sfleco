// src/components/Navbar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";

const LOGO_SRC = "/logo.png"; // logo dosyanı /public/logo.png olarak koy

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isActive =
    href === "/"
      ? pathname === "/"
      : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={[
        "text-sm transition-colors",
        "text-slate-600 hover:text-amber-600",
        "dark:text-slate-300 dark:hover:text-amber-400",
        isActive ? "font-semibold text-amber-600 dark:text-amber-400" : "",
      ].join(" ")}
      aria-current={isActive ? "page" : undefined}
    >
      {children}
    </Link>
  );
}

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 dark:border-slate-800/70 backdrop-blur bg-white/75 dark:bg-slate-900/70">
      <nav className="max-w-6xl mx-auto h-14 px-4 flex items-center justify-between">
        {/* Left: Logo + Primary nav */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            {/* Logo */}
            <img
              src={LOGO_SRC}
              alt="SFL ECO"
              className="h-12 w-12 rounded-md object-contain"
            />
            <span className="font-semibold">SFL ECO</span>
          </Link>

          {/* Main links */}
          <div className="hidden sm:flex items-center gap-5">
            <NavLink href="/">Flower Profit</NavLink>
            <NavLink href="/coin-profit">Coin Profit</NavLink>
          </div>
        </div>

        {/* Right: Play link + theme toggle */}
        <div className="flex items-center gap-3">
          <a
            href="https://sunflower-land.com/play/?ref=Erya"
            target="_blank"
            rel="noreferrer"
            className="text-sm text-slate-600 hover:text-amber-600 dark:text-slate-300 dark:hover:text-amber-400"
          >
            Play SunflowerLand!
          </a>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
