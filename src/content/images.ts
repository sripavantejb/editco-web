/** Cloudinary asset — base upload path (no transforms). */
const LOGO_PUBLIC_ID =
  "v1778782058/editco_logo_transparent_no_watermark_cropped_reb8ht";

const CLOUD_NAME = "dxeoibunj";

/** Build optimized delivery URL: auto format (WebP/AVIF), auto quality, width cap. */
export function cloudinaryImageUrl(
  publicId: string,
  options: { width: number; quality?: "auto" | number } = { width: 400 }
): string {
  const q = options.quality ?? "auto";
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_${q},w_${options.width}/${publicId}`;
}

export const EDITCO_LOGO = {
  publicId: LOGO_PUBLIC_ID,
  /** Default alt when the logo is the primary content (e.g. nav home link). */
  altPrimary:
    "Editco Media logo — AI automation and website development agency in Hyderabad",
  /** Shorter alt when redundant with visible brand text beside the image. */
  altDecorative: "",
  src: {
    nav: cloudinaryImageUrl(LOGO_PUBLIC_ID, { width: 64 }),
    navFloating: cloudinaryImageUrl(LOGO_PUBLIC_ID, { width: 128 }),
    menu: cloudinaryImageUrl(LOGO_PUBLIC_ID, { width: 96 }),
    footerMarquee: cloudinaryImageUrl(LOGO_PUBLIC_ID, { width: 80 }),
    favicon: cloudinaryImageUrl(LOGO_PUBLIC_ID, { width: 64 }),
  },
  intrinsic: {
    width: 512,
    height: 512,
  },
} as const;
