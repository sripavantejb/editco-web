import { cn } from "@/lib/utils";

export const EDITCO_LOGO_URL =
  "https://res.cloudinary.com/dxeoibunj/image/upload/v1778782058/editco_logo_transparent_no_watermark_cropped_reb8ht.png";

export function PortalCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[22px] border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5 backdrop-blur-md",
        className
      )}
    >
      {children}
    </div>
  );
}

export function PortalSectionTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={cn(
        "mb-3 font-archivo text-[13px] uppercase tracking-[0.12em] text-[var(--dash-muted)]",
        className
      )}
    >
      {children}
    </h2>
  );
}

export function PortalPageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="mb-8">
      <h1 className="font-archivo text-3xl tracking-tight text-[var(--dash-text)] sm:text-4xl">
        {title}
      </h1>
      {subtitle ? (
        <p className="mt-2 max-w-xl font-inter text-sm leading-relaxed text-[var(--dash-muted)]">
          {subtitle}
        </p>
      ) : null}
    </header>
  );
}
