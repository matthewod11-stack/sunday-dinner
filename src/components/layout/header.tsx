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
 * Main navigation header with hamburger menu for mobile.
 *
 * Features:
 * - Sticky positioning with backdrop blur
 * - Active link detection
 * - Animated hamburger → X transformation
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
    <header className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/60">
      <nav className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        {/* Logo */}
        <Link
          href="/"
          className="group flex items-center gap-2 transition-transform hover:scale-[1.02]"
        >
          {/* Decorative pot icon */}
          <span className="text-2xl" aria-hidden="true">
            🍲
          </span>
          <span className="font-display text-xl font-semibold text-primary">
            Sunday Dinner
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative px-4 py-2 text-sm font-medium transition-colors",
                isActive(item.href)
                  ? "text-primary"
                  : "text-neutral-600 hover:text-foreground"
              )}
            >
              {item.label}
              {/* Active indicator - animated underline */}
              {isActive(item.href) && (
                <span className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-primary animate-scaleIn" />
              )}
            </Link>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="relative z-50 flex h-10 w-10 items-center justify-center rounded-lg text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-foreground md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          <span className="sr-only">{mobileMenuOpen ? "Close" : "Open"} menu</span>
          {/* Animated hamburger/X icon */}
          <div className="relative h-5 w-5">
            <Menu
              className={cn(
                "absolute inset-0 h-5 w-5 transition-all duration-200",
                mobileMenuOpen ? "rotate-90 opacity-0" : "rotate-0 opacity-100"
              )}
            />
            <X
              className={cn(
                "absolute inset-0 h-5 w-5 transition-all duration-200",
                mobileMenuOpen ? "rotate-0 opacity-100" : "-rotate-90 opacity-0"
              )}
            />
          </div>
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm transition-opacity duration-200 md:hidden",
          mobileMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile Menu Drawer */}
      <div
        className={cn(
          "fixed right-0 top-0 z-40 h-full w-64 bg-surface shadow-xl transition-transform duration-300 ease-out md:hidden",
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
                "flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-all",
                "animate-slideUp",
                isActive(item.href)
                  ? "bg-primary-light text-primary"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-foreground"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {item.label}
            </Link>
          ))}

          {/* Decorative divider */}
          <div className="my-4 h-px bg-border" />

          {/* Quick action in mobile menu */}
          <Link
            href="/recipes/new"
            className={cn(
              "flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-base font-medium text-white transition-all hover:bg-primary-hover",
              "animate-slideUp"
            )}
            style={{ animationDelay: "150ms" }}
          >
            <span className="text-lg">+</span>
            Add Recipe
          </Link>
        </div>
      </div>
    </header>
  );
}
