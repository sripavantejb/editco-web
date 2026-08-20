import { notFound } from "next/navigation";
import { resolvePortalByUuid } from "@/lib/os/resolve-portal";
import { EDITCO_LOGO_URL } from "@/components/os/portal/ui";
import { ClientPortalNav } from "@/components/os/portal/ClientPortalNav";

export const dynamic = "force-dynamic";

export default async function ClientLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = await params;
  const portal = await resolvePortalByUuid(uuid);
  if (!portal) notFound();
  const base = `/client-portal/${uuid}`;

  return (
    <div className="admin-theme min-h-screen bg-[var(--dash-bg)]">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-[0.35]"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(200,245,66,0.12), transparent 55%), radial-gradient(ellipse 60% 40% at 100% 0%, rgba(255,255,255,0.04), transparent 50%)",
        }}
      />
      <header className="sticky top-0 z-40 border-b border-[var(--dash-border)] bg-[color-mix(in_srgb,var(--dash-bg)_78%,transparent)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:px-8">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <a
              href="https://editcomedia.com"
              target="_blank"
              rel="noreferrer"
              className="flex shrink-0 items-center gap-3"
              aria-label="Editco Media"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={EDITCO_LOGO_URL}
                alt="Editco Media"
                className="h-7 w-auto max-h-7 max-w-[112px] object-contain object-left"
              />
            </a>
            <div className="min-w-0 flex-1">
              <p className="font-archivo text-[10px] uppercase tracking-[0.2em] text-[var(--dash-accent)]">
                Client portal
              </p>
              <p className="truncate font-inter text-sm font-medium text-[var(--dash-text)] sm:text-base">
                {portal.vendor.companyName}
              </p>
            </div>
            <ClientPortalNav base={base} className="w-full sm:ml-auto sm:w-auto" />
          </div>
        </div>
      </header>
      <div className="relative mx-auto max-w-6xl">{children}</div>
    </div>
  );
}
