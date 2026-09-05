import type { Metadata } from "next";
import { Syne, Archivo_Black, Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { LandingLoadOverlay } from "@/components/motion/LandingLoadOverlay";
import { MagneticNav } from "@/components/motion/MagneticNav";
import { FloatingBottomNav } from "@/components/motion/FloatingBottomNav";
import { PublicSiteScripts } from "@/components/motion/PublicSiteScripts";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const archivoBlack = Archivo_Black({
  variable: "--font-archivo",
  weight: "400",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Editco Media — Websites, AI Automations & Growth Systems",
  description:
    "Editco Media builds smart websites, AI calling agents, CRM workflows, and marketing systems for clinics, startups, agencies, and service businesses.",
  metadataBase: new URL("https://editcomedia.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Editco Media — Websites, AI Automations & Growth Systems",
    description: "Scale your business with technical excellence. We build smart websites, AI calling agents, and CRM workflows.",
    url: "https://editcomedia.com",
    siteName: "Editco Media",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Editco Media — Technical Growth Systems",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Editco Media — Websites, AI Automations & Growth Systems",
    description: "Scale your business with technical excellence. We build smart websites, AI calling agents, and CRM workflows.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/favicon-48x48.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${syne.variable} ${archivoBlack.variable} ${inter.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-gaude-black text-white selection:bg-gaude-orange selection:text-white"
      >
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-[6.5rem] focus:z-[1000000] focus:bg-white focus:text-gaude-black focus:px-4 focus:py-2 focus:border-4 focus:border-gaude-black focus:shadow-[4px_4px_0_0_#0a0a0a]"
        >
          Skip to main content
        </a>
        <LandingLoadOverlay />
        <MagneticNav />
        <FloatingBottomNav />
        {children}
        <PublicSiteScripts />
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            style: {
              background: "#121212",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "#f5f5f5",
            },
          }}
        />
      </body>
    </html>
  );
}
