import { connectDB } from "@/lib/db";
import { clients, type ClientLogo } from "@/content/clients";
import { crew, works as staticWorks } from "@/content/landing";
import { SiteClientLogo } from "@/models/os/SiteClientLogo";
import { SiteCrewMember } from "@/models/os/SiteCrewMember";
import { SiteWork } from "@/models/os/SiteWork";

export type SiteWorkItem = {
  id: string;
  title: string;
  location: string;
  category: string;
  image: string;
  fullWidth: boolean;
  problem: string;
  approach: string;
  outcome: string;
  focus: string[];
};

export type SiteCrewItem = {
  slug: string;
  name: string;
  role: string;
  description: string;
  accent: "orange" | "green" | "purple";
  image: string;
  linkedin: string;
  portfolio: string;
};

export function siteClientImageSrc(id: string) {
  return `/api/site-media/client/${id}`;
}

export function siteWorkImageSrc(id: string) {
  return `/api/site-media/work/${id}`;
}

export function siteCrewImageSrc(id: string) {
  return `/api/site-media/crew/${id}`;
}

function resolveImage(
  doc: {
    _id: { toString(): string };
    imageBase64?: string | null;
    imageUrl?: string | null;
  },
  kind: "client" | "work" | "crew"
) {
  if (doc.imageBase64) {
    if (kind === "client") return siteClientImageSrc(doc._id.toString());
    if (kind === "work") return siteWorkImageSrc(doc._id.toString());
    return siteCrewImageSrc(doc._id.toString());
  }
  return doc.imageUrl || "";
}

function staticCrewItems(): SiteCrewItem[] {
  return crew.members.map((m) => ({
    slug: m.slug,
    name: m.name,
    role: m.role,
    description: m.description,
    accent: m.accent,
    image: m.image,
    linkedin: m.linkedin,
    portfolio: m.portfolio,
  }));
}

/** Seed DB from static content; also inserts any new static items missing from DB. */
export async function ensureSiteContentSeeded() {
  await connectDB();
  const [clientCount, workCount, crewCount] = await Promise.all([
    SiteClientLogo.countDocuments({ recordStatus: "active" }),
    SiteWork.countDocuments({ recordStatus: "active" }),
    SiteCrewMember.countDocuments({ recordStatus: "active" }),
  ]);

  if (clientCount === 0) {
    await SiteClientLogo.insertMany(
      clients.logos.map((logo, i) => ({
        title: logo.title,
        href: logo.href || "",
        alt: logo.alt || logo.title,
        card: logo.card || "light",
        scale: logo.scale ?? 1.2,
        sortOrder: i,
        imageUrl: logo.src || "",
        createdBy: "system",
        updatedBy: "system",
      }))
    );
  }

  if (workCount === 0) {
    await SiteWork.insertMany(
      staticWorks.map((work, i) => ({
        slug: work.id,
        title: work.title,
        location: work.location,
        category: work.category,
        fullWidth: work.fullWidth,
        problem: work.problem,
        approach: work.approach,
        outcome: work.outcome,
        focus: [...work.focus],
        sortOrder: i,
        imageUrl: work.image,
        createdBy: "system",
        updatedBy: "system",
      }))
    );
  } else {
    const existing = await SiteWork.find({}).select("slug").lean();
    const have = new Set(existing.map((d) => d.slug));
    const missing = staticWorks.filter((w) => !have.has(w.id));
    if (missing.length) {
      const baseOrder = await SiteWork.countDocuments({});
      await SiteWork.insertMany(
        missing.map((work, i) => ({
          slug: work.id,
          title: work.title,
          location: work.location,
          category: work.category,
          fullWidth: work.fullWidth,
          problem: work.problem,
          approach: work.approach,
          outcome: work.outcome,
          focus: [...work.focus],
          sortOrder: work.id === "epm" ? -1 : baseOrder + i,
          imageUrl: work.image,
          createdBy: "system",
          updatedBy: "system",
        }))
      );
    }
  }

  if (crewCount === 0) {
    await SiteCrewMember.insertMany(
      crew.members.map((m, i) => ({
        slug: m.slug,
        name: m.name,
        role: m.role,
        description: m.description,
        accent: m.accent,
        linkedin: m.linkedin,
        portfolio: m.portfolio,
        sortOrder: i,
        imageUrl: m.image,
        createdBy: "system",
        updatedBy: "system",
      }))
    );
  } else {
    const existing = await SiteCrewMember.find({}).select("slug").lean();
    const have = new Set(existing.map((d) => d.slug));
    const missing = crew.members.filter((m) => !have.has(m.slug));
    if (missing.length) {
      const baseOrder = await SiteCrewMember.countDocuments({});
      await SiteCrewMember.insertMany(
        missing.map((m, i) => ({
          slug: m.slug,
          name: m.name,
          role: m.role,
          description: m.description,
          accent: m.accent,
          linkedin: m.linkedin,
          portfolio: m.portfolio,
          sortOrder: baseOrder + i,
          imageUrl: m.image,
          createdBy: "system",
          updatedBy: "system",
        }))
      );
    }

    // Refresh static photo paths + portfolio links when no custom upload exists.
    for (const m of crew.members) {
      await SiteCrewMember.updateOne(
        {
          slug: m.slug,
          recordStatus: "active",
          $or: [{ imageBase64: "" }, { imageBase64: { $exists: false } }],
        },
        {
          $set: {
            name: m.name,
            role: m.role,
            description: m.description,
            accent: m.accent,
            linkedin: m.linkedin,
            portfolio: m.portfolio,
            imageUrl: m.image,
          },
        }
      );
    }

    // Point Deepika at the new photo if still on the old path (no custom upload).
    await SiteCrewMember.updateOne(
      {
        slug: "deepika",
        recordStatus: "active",
        $or: [
          { imageUrl: "/crew/deepika.jpg" },
          { imageUrl: "" },
          { imageUrl: { $exists: false } },
        ],
        $and: [
          {
            $or: [{ imageBase64: "" }, { imageBase64: { $exists: false } }],
          },
        ],
      },
      { $set: { imageUrl: "/crew/deepika-v2.jpg" } }
    );

    await SiteCrewMember.updateOne(
      {
        slug: "harsha",
        recordStatus: "active",
        $or: [
          { imageUrl: "/crew/harsha.jpg" },
          { imageUrl: "" },
          { imageUrl: { $exists: false } },
        ],
        $and: [
          {
            $or: [{ imageBase64: "" }, { imageBase64: { $exists: false } }],
          },
        ],
      },
      { $set: { imageUrl: "/crew/harsha-v2.jpg" } }
    );
  }
}

export async function getSiteClientLogos(): Promise<ClientLogo[]> {
  try {
    await ensureSiteContentSeeded();
    const docs = await SiteClientLogo.find({ recordStatus: "active" })
      .sort({ sortOrder: 1, createdAt: 1 })
      .lean();
    if (!docs.length) return [...clients.logos];

    return docs.map((d) => ({
      title: d.title,
      href: d.href || undefined,
      src: resolveImage(d, "client") || undefined,
      alt: d.alt || d.title,
      card: d.card === "dark" || d.card === "light" ? d.card : undefined,
      scale: typeof d.scale === "number" ? d.scale : undefined,
    }));
  } catch {
    return [...clients.logos];
  }
}

export async function getSiteWorks(): Promise<SiteWorkItem[]> {
  try {
    await ensureSiteContentSeeded();
    const docs = await SiteWork.find({ recordStatus: "active" })
      .sort({ sortOrder: 1, createdAt: 1 })
      .lean();
    if (!docs.length) {
      return staticWorks.map((w) => ({
        id: w.id,
        title: w.title,
        location: w.location,
        category: w.category,
        image: w.image,
        fullWidth: w.fullWidth,
        problem: w.problem,
        approach: w.approach,
        outcome: w.outcome,
        focus: [...w.focus],
      }));
    }

    return docs.map((d) => ({
      id: d.slug,
      title: d.title,
      location: d.location || "",
      category: d.category || "",
      image: resolveImage(d, "work") || "/works/dentin-oral-experts.png",
      fullWidth: Boolean(d.fullWidth),
      problem: d.problem || "",
      approach: d.approach || "",
      outcome: d.outcome || "",
      focus: Array.isArray(d.focus) ? d.focus.map(String) : [],
    }));
  } catch {
    return staticWorks.map((w) => ({
      id: w.id,
      title: w.title,
      location: w.location,
      category: w.category,
      image: w.image,
      fullWidth: w.fullWidth,
      problem: w.problem,
      approach: w.approach,
      outcome: w.outcome,
      focus: [...w.focus],
    }));
  }
}

export async function getSiteWork(slug: string): Promise<SiteWorkItem | undefined> {
  const all = await getSiteWorks();
  return all.find((w) => w.id === slug);
}

export async function getSiteCrew(): Promise<SiteCrewItem[]> {
  try {
    await ensureSiteContentSeeded();
    const docs = await SiteCrewMember.find({ recordStatus: "active" })
      .sort({ sortOrder: 1, createdAt: 1 })
      .lean();
    if (!docs.length) return staticCrewItems();

    return docs.map((d) => ({
      slug: d.slug,
      name: d.name,
      role: d.role || "",
      description: d.description || "",
      accent:
        d.accent === "green" || d.accent === "purple" || d.accent === "orange"
          ? d.accent
          : "orange",
      image: resolveImage(d, "crew") || "/crew/tej.jpg",
      linkedin: d.linkedin || "",
      portfolio: d.portfolio || "",
    }));
  } catch {
    return staticCrewItems();
  }
}

export async function readUploadedImage(formData: FormData, key = "image") {
  const file = formData.get(key);
  if (!(file instanceof File) || file.size <= 0) return null;
  if (file.size > 6 * 1024 * 1024) {
    throw new Error("Image must be under 6MB");
  }
  const allowed = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
    "image/gif",
    "image/svg+xml",
  ];
  const mime = file.type || "application/octet-stream";
  if (!allowed.includes(mime) && !mime.startsWith("image/")) {
    throw new Error("Upload a PNG, JPG, WEBP, GIF, or SVG");
  }
  const buf = Buffer.from(await file.arrayBuffer());
  return { base64: buf.toString("base64"), mimeType: mime };
}
