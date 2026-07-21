export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/session";
import { AdminLoginForm } from "@/components/referral/AdminLoginForm";
import { Card, CardDescription, CardTitle } from "@/components/referral/ui/card";

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session) redirect("/admin");

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-4">
      <Card className="w-full">
        <CardTitle>Admin login</CardTitle>
        <CardDescription className="mt-1 mb-5 font-inter normal-case tracking-normal">
          Team access only. Go to /admin/login directly — this is not linked
          from the public site.
        </CardDescription>
        <AdminLoginForm />
      </Card>
    </main>
  );
}
