import type { Metadata } from "next";
import { Syne, Archivo_Black, Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { LandingLoadOverlay } from "@/components/motion/LandingLoadOverlay";
import { MagneticNav } from "@/components/motion/MagneticNav";
import Script from "next/script";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
});

const archivoBlack = Archivo_Black({
  variable: "--font-archivo-black",
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
        {children}
        <Script id="cal-init" strategy="afterInteractive">
          {`
            (function (C, A, L) { let p = function (a, ar) { a.q.push(ar); }; let d = C.document; C.Cal = C.Cal || function () { let cal = C.Cal; let ar = arguments; if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement("script")).src = A; cal.loaded = true; } if (ar[0] === L) { const api = function () { p(api, arguments); }; const namespace = ar[1]; api.q = api.q || []; if(typeof namespace === "string"){cal.ns[namespace] = cal.ns[namespace] || api;p(cal.ns[namespace], ar);p(cal, ["initNamespace", namespace]);} else p(cal, ar); return;} p(cal, ar); }; })(window, "https://app.cal.com/embed/embed.js", "init");
            Cal("init", "15min", {origin:"https://app.cal.com"});
            Cal.ns["15min"]("ui", {"hideEventTypeDetails":false,"layout":"month_view"});
          `}
        </Script>
      </body>
    </html>
  );
}
