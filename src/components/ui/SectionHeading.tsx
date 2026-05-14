export function SectionHeading({
  title,
  description,
  eyebrow,
  align = "left",
  light = false,
}: {
  title: React.ReactNode;
  description?: string;
  eyebrow?: string;
  align?: "left" | "center";
  light?: boolean;
}) {
  const alignClass = align === "center" ? "text-center mx-auto" : "";
  const titleColor = light ? "text-white" : "text-gaude-black";
  const bodyColor = light ? "text-white/85" : "text-gaude-black/80";

  return (
    <div className={`mb-10 max-w-4xl md:mb-14 ${alignClass}`}>
      {eyebrow ? (
        <p
          className={`mb-3 font-archivo text-xs font-black uppercase tracking-[0.25em] ${light ? "text-gaude-purple" : "text-gaude-orange"}`}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={`font-archivo text-3xl uppercase leading-[0.95] tracking-tighter md:text-5xl lg:text-6xl ${titleColor}`}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={`mt-4 font-inter text-base font-medium leading-relaxed md:text-lg ${bodyColor}`}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
