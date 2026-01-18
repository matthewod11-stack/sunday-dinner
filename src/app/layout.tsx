import type { Metadata, Viewport } from "next";
import { Playfair_Display, Source_Serif_4, Source_Sans_3 } from "next/font/google";
import { Toaster } from "@/components/ui/toast";
import { ServiceWorkerRegister, OfflineIndicator } from "@/components/pwa";
import { Header } from "@/components/layout";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  display: "swap",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans",
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
  themeColor: "#D4483B",
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
    <html lang="en" className={`${playfair.variable} ${sourceSerif.variable} ${sourceSans.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased" suppressHydrationWarning>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-border bg-surface-muted py-6">
            <div className="mx-auto max-w-5xl px-4 text-center font-ui text-sm text-neutral-500">
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
