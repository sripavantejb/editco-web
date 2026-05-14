import Link from "next/link";

type Variant = "primary" | "secondary" | "dark";

const variants: Record<
  Variant,
  string
> = {
  primary:
    "bg-gaude-orange text-white border-4 border-gaude-black shadow-[4px_4px_0_0_#0a0a0a] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[8px_8px_0_0_#0a0a0a]",
  secondary:
    "bg-white text-gaude-black border-4 border-gaude-black shadow-[4px_4px_0_0_#0a0a0a] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[8px_8px_0_0_#0a0a0a]",
  dark: "bg-gaude-black text-white border-4 border-white shadow-[4px_4px_0_0_#ffffff] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[8px_8px_0_0_#ffffff]",
};

export function BrutalistLink({
  href,
  children,
  variant = "primary",
  className = "",
  ...props
}: {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
  [key: string]: any;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex cursor-pointer items-center justify-center px-6 py-3 font-archivo text-sm font-black uppercase tracking-wide transition-transform md:px-8 md:py-4 md:text-base ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </Link>
  );
}
