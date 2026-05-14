export function TagChip({
  children,
  inverted = false,
}: {
  children: React.ReactNode;
  inverted?: boolean;
}) {
  return (
    <span
      className={`inline-block border-2 border-gaude-black px-3 py-1 font-inter text-xs font-black uppercase tracking-wider ${inverted ? "bg-gaude-black text-white" : "bg-white text-gaude-black"}`}
    >
      {children}
    </span>
  );
}
