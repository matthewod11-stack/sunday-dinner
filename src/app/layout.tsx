import type { Metadata, Viewport } from "next";
import { Fraunces } from "next/font/google";
import { Toaster } from "@/components/ui/toast";
import { ServiceWorkerRegister, OfflineIndicator } from "@/components/pwa";
import { Header } from "@/components/layout";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sunday Dinner",
  description: "Plan and execute family gatherings with your heirloom recipes",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Sunday Dinner",
  },
  icons: {
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#c2410c",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover", // Enables safe-area-inset-* for notched devices
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={fraunces.variable}>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-border bg-surface-muted py-6">
            <div className="mx-auto max-w-5xl px-4 text-center text-sm text-neutral-500">
              Sunday Dinner v1.0 &mdash; Made with love for family gatherings
            </div>
          </footer>
        </div>
        <Toaster />
        <ServiceWorkerRegister />
        <OfflineIndicator />
      </body>
    </html>
  );
}
