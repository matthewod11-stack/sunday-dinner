import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sunday Dinner",
  description: "Plan and execute family gatherings with your heirloom recipes",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Sunday Dinner",
  },
};

export const viewport: Viewport = {
  themeColor: "#c2410c",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/60">
            <nav className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
              <a href="/" className="flex items-center gap-2">
                <span className="text-xl font-semibold text-primary">Sunday Dinner</span>
              </a>
              <div className="flex items-center gap-4">
                <a
                  href="/recipes"
                  className="text-sm text-neutral-600 transition-colors hover:text-primary"
                >
                  Recipes
                </a>
                <a
                  href="/meals"
                  className="text-sm text-neutral-600 transition-colors hover:text-primary"
                >
                  Meals
                </a>
              </div>
            </nav>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="border-t border-border bg-surface-muted py-6">
            <div className="mx-auto max-w-5xl px-4 text-center text-sm text-neutral-500">
              Sunday Dinner v1.0 &mdash; Made with love for family gatherings
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
