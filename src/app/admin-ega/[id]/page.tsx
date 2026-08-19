export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";

export default async function AdminEGADetailRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/admin/ega/${id}`);
}
