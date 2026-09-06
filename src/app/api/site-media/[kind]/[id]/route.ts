import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { SiteClientLogo } from "@/models/os/SiteClientLogo";
import { SiteCrewMember } from "@/models/os/SiteCrewMember";
import { SiteWork } from "@/models/os/SiteWork";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ kind: string; id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { kind, id } = await params;
  if (!id || (kind !== "client" && kind !== "work" && kind !== "crew")) {
    return new NextResponse("Not found", { status: 404 });
  }

  await connectDB();
  const doc =
    kind === "client"
      ? await SiteClientLogo.findById(id)
          .select("imageBase64 mimeType recordStatus")
          .lean()
      : kind === "work"
        ? await SiteWork.findById(id)
            .select("imageBase64 mimeType recordStatus")
            .lean()
        : await SiteCrewMember.findById(id)
            .select("imageBase64 mimeType recordStatus")
            .lean();

  if (!doc || doc.recordStatus !== "active" || !doc.imageBase64) {
    return new NextResponse("Not found", { status: 404 });
  }

  const buffer = Buffer.from(doc.imageBase64, "base64");
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": doc.mimeType || "image/png",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
