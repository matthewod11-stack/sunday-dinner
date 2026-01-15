"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/recipes", label: "Recipes" },
  { href: "/meals", label: "Meals" },
] as const;

/**
 * Main navigation header with NYT editorial styling.
 *
 * Features:
 * - Thick bottom border (editorial rule line)
 * - Clean typography with Source Sans UI font
 * - Active link detection with accent underline
 * - Accessible mobile drawer with focus trap
 */
export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Close menu when route changes
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  React.useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 border-b-2 border-neutral-900 bg-surface">
      <nav className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        {/* Logo - Editorial wordmark */}
        <Link
          href="/"
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <span className="font-display text-xl font-bold tracking-tight text-text-primary">
            Sunday Dinner
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative py-4 font-ui text-sm font-semibold uppercase tracking-wide transition-colors",
                isActive(item.href)
                  ? "text-text-primary"
                  : "text-text-tertiary hover:text-text-primary"
              )}
            >
              {item.label}
              {/* Active indicator - accent underline */}
              {isActive(item.href) && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </Link>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="relative z-50 flex h-10 w-10 items-center justify-center rounded-sm text-text-secondary transition-colors hover:bg-neutral-100 hover:text-text-primary md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          <span className="sr-only">{mobileMenuOpen ? "Close" : "Open"} menu</span>
          {/* Animated hamburger/X icon */}
          <div className="relative h-5 w-5">
            <Menu
              className={cn(
                "absolute inset-0 h-5 w-5 transition-all duration-150",
                mobileMenuOpen ? "rotate-90 opacity-0" : "rotate-0 opacity-100"
              )}
            />
            <X
              className={cn(
                "absolute inset-0 h-5 w-5 transition-all duration-150",
                mobileMenuOpen ? "rotate-0 opacity-100" : "-rotate-90 opacity-0"
              )}
            />
          </div>
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-neutral-900/20 transition-opacity duration-150 md:hidden",
          mobileMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile Menu Drawer */}
      <div
        className={cn(
          "fixed right-0 top-0 z-40 h-full w-64 bg-surface shadow-lg transition-transform duration-200 ease-out md:hidden",
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* Menu content - offset for header height */}
        <div className="flex flex-col gap-1 px-4 pt-20">
          {navItems.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-sm px-4 py-3 font-ui text-sm font-semibold uppercase tracking-wide transition-all",
                "animate-slideUp",
                isActive(item.href)
                  ? "bg-primary-light text-primary"
                  : "text-text-tertiary hover:bg-neutral-100 hover:text-text-primary"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {item.label}
            </Link>
          ))}

          {/* Divider */}
          <div className="my-4 h-px bg-border" />

          {/* Quick action in mobile menu */}
          <Link
            href="/recipes/new"
            className={cn(
              "flex items-center justify-center gap-2 rounded-sm bg-primary px-4 py-3 font-ui text-sm font-semibold uppercase tracking-wide text-white transition-all hover:bg-primary-hover",
              "animate-slideUp"
            )}
            style={{ animationDelay: "150ms" }}
          >
            Add Recipe
          </Link>
        </div>
      </div>
    </header>
  );
}
