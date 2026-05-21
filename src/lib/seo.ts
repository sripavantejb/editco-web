import type { Metadata, Viewport } from "next";
import { EDITCO_LOGO } from "@/content/images";

/** Production site URL — used for metadataBase, canonical, and Open Graph URLs. */
export const SITE_URL = "https://editcomedia.com";

export const SEO_DEFAULTS = {
  siteName: "Editco Media",
  title:
    "Editco Media | AI Automation & Website Development Agency",
  description:
    "Editco Media builds smart websites, AI call agents, WhatsApp automations, SEO/AEO systems, and business growth workflows for clinics, agencies, and local businesses.",
  ogImage:
    "https://res.cloudinary.com/dxeoibunj/image/upload/f_auto,q_auto,w_1200/v1778782058/editco_logo_transparent_no_watermark_cropped_reb8ht.png",
  ogImageAlt: "Editco Media — AI automation and website development agency",
  locale: "en_US",
  favicon: EDITCO_LOGO.src.favicon,
} as const;

export type PageSeoInput = {
  /** Short page title; combined with site name via root template (e.g. "Blog" → "Blog | Editco Media"). */
  title?: string;
  /** Full document title; bypasses the title template. */
  titleAbsolute?: string;
  description?: string;
  /** Path for canonical and Open Graph URL, e.g. `/services` or `/blog/my-post`. */
  path?: string;
  ogImage?: string;
  ogImageAlt?: string;
  ogType?: "website" | "article";
  noIndex?: boolean;
};

function resolveAbsoluteUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalized, SITE_URL).toString();
}

function resolveTitle(input: PageSeoInput): Metadata["title"] {
  if (input.titleAbsolute) {
    return { absolute: input.titleAbsolute };
  }
  if (input.title) {
    return input.title;
  }
  return SEO_DEFAULTS.title;
}

function resolveSocialTitle(input: PageSeoInput): string {
  if (input.titleAbsolute) {
    return input.titleAbsolute;
  }
  if (input.title) {
    return `${input.title} | ${SEO_DEFAULTS.siteName}`;
  }
  return SEO_DEFAULTS.title;
}

/**
 * Per-page SEO metadata. Export from `page.tsx`, `layout.tsx`, or `generateMetadata`.
 *
 * @example
 * export const metadata = buildPageMetadata({ path: "/services", title: "Services", description: "..." });
 */
export function buildPageMetadata(input: PageSeoInput = {}): Metadata {
  const title = resolveTitle(input);
  const socialTitle = resolveSocialTitle(input);
  const description = input.description ?? SEO_DEFAULTS.description;
  const ogImage = input.ogImage ?? SEO_DEFAULTS.ogImage;
  const ogImageAlt = input.ogImageAlt ?? SEO_DEFAULTS.ogImageAlt;
  const ogType = input.ogType ?? "website";
  const pageUrl = input.path ? resolveAbsoluteUrl(input.path) : SITE_URL;

  const metadata: Metadata = {
    title,
    description,
    openGraph: {
      title: socialTitle,
      description,
      url: pageUrl,
      siteName: SEO_DEFAULTS.siteName,
      locale: SEO_DEFAULTS.locale,
      type: ogType,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: ogImageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [ogImage],
    },
  };

  if (input.path) {
    metadata.alternates = {
      canonical: input.path.startsWith("/") ? input.path : `/${input.path}`,
    };
  }

  if (input.noIndex) {
    metadata.robots = { index: false, follow: false };
  }

  return metadata;
}

/** Site-wide defaults for the root layout (title template, icons, metadataBase). */
export function getRootLayoutMetadata(): Metadata {
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: SEO_DEFAULTS.title,
      template: `%s | ${SEO_DEFAULTS.siteName}`,
    },
    description: SEO_DEFAULTS.description,
    applicationName: SEO_DEFAULTS.siteName,
    creator: SEO_DEFAULTS.siteName,
    publisher: SEO_DEFAULTS.siteName,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      title: SEO_DEFAULTS.title,
      description: SEO_DEFAULTS.description,
      url: SITE_URL,
      siteName: SEO_DEFAULTS.siteName,
      locale: SEO_DEFAULTS.locale,
      type: "website",
      images: [
        {
          url: SEO_DEFAULTS.ogImage,
          width: 1200,
          height: 630,
          alt: SEO_DEFAULTS.ogImageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: SEO_DEFAULTS.title,
      description: SEO_DEFAULTS.description,
      images: [SEO_DEFAULTS.ogImage],
    },
    icons: {
      icon: [
        { url: SEO_DEFAULTS.favicon, sizes: "32x32", type: "image/png" },
        { url: SEO_DEFAULTS.favicon, sizes: "16x16", type: "image/png" },
      ],
      apple: [{ url: SEO_DEFAULTS.favicon, sizes: "180x180", type: "image/png" }],
      shortcut: SEO_DEFAULTS.favicon,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

export const defaultViewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0a0a",
  colorScheme: "dark",
};
