import type { Metadata, Viewport } from "next";
import { Syne, Archivo_Black, Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { LandingLoadOverlay } from "@/components/motion/LandingLoadOverlay";
import { MagneticNav } from "@/components/motion/MagneticNav";
import { FloatingBottomNav } from "@/components/motion/FloatingBottomNav";
import { CalScript } from "@/components/performance/CalScript";
import { JsonLd } from "@/components/seo/JsonLd";
import { defaultViewport, getRootLayoutMetadata } from "@/lib/seo";
import { buildGlobalSchemaGraph } from "@/lib/schema";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  display: "swap",
});

const archivoBlack = Archivo_Black({
  variable: "--font-archivo-black",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "700"],
  display: "swap",
});

export const metadata: Metadata = getRootLayoutMetadata();

export const viewport: Viewport = defaultViewport;

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
        <JsonLd data={buildGlobalSchemaGraph()} />
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
        <CalScript />
      </body>
    </html>
  );
}
