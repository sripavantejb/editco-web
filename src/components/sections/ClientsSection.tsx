"use client";

import Image from "next/image";
import { clients, type ClientLogo } from "@/content/clients";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LogoLoop, type LogoItem } from "@/components/motion/LogoLoop";
import { stickySlide4 } from "@/lib/stickyStack";

function toLogoItem(logo: ClientLogo): LogoItem {
  if (logo.src) {
    return {
      src: logo.src,
      alt: logo.alt ?? logo.title,
      title: logo.title,
      href: logo.href,
    };
  }

  return {
    node: (
      <span className="font-archivo text-base font-black uppercase tracking-tight sm:text-lg md:text-xl">
        {logo.title}
      </span>
    ),
    title: logo.title,
    href: logo.href,
  };
}

export function ClientsSection({ logos: logosProp }: { logos?: ClientLogo[] }) {
  const logoSource = logosProp?.length ? logosProp : clients.logos;
  const logos: LogoItem[] = logoSource.map((logo) => toLogoItem(logo));

  return (
    <section
      id={clients.id}
      className={`relative bg-gaude-black pt-16 pb-20 md:pt-[110px] md:pb-24 ${stickySlide4}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-gaude-pink/10 to-transparent" />

      <div className="relative z-10 mx-auto max-w-[1200px] px-4 sm:px-6">
        <div className="max-w-4xl">
          <SectionHeading
            title={
              <>
                Businesses Across Industries Trust{" "}
                <span className="text-gaude-pink">Editco</span> Media to Build
                Systems That{" "}
                <span className="text-gaude-pink">Actually Convert.</span>
              </>
            }
            light
          />
        </div>

        <div className="mt-8 overflow-hidden py-4 md:mt-12 md:py-6">
          <LogoLoop
            logos={logos}
            speed={70}
            direction="left"
            logoHeight={72}
            gap={20}
            pauseOnHover={false}
            fadeOut
            fadeOutColor="#050505"
            scaleOnHover
            ariaLabel="Editco Media clients"
            renderItem={(item, _key, index) => {
              const meta = logoSource.find((l) => l.title === item.title);
              const onDark =
                meta?.card === "dark"
                  ? true
                  : meta?.card === "light"
                    ? false
                    : index % 2 === 0;
              const hasImage = "src" in item && Boolean(item.src);
              const scale = meta?.scale ?? 1.2;

              const inner = hasImage ? (
                <Image
                  src={item.src}
                  alt={item.alt ?? item.title ?? "Client logo"}
                  width={400}
                  height={220}
                  className="h-auto max-h-[88%] w-auto max-w-[92%] object-contain"
                  style={{ transform: `scale(${scale})` }}
                  unoptimized
                />
              ) : "node" in item ? (
                <span
                  className={
                    onDark
                      ? "text-white/90 group-hover:text-white"
                      : "text-gaude-black/90 group-hover:text-gaude-black"
                  }
                >
                  {item.node}
                </span>
              ) : null;

              const card = (
                <div
                  className={`group relative flex h-[100px] w-[min(200px,70vw)] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[18px] border transition-all sm:h-[120px] sm:w-[220px] md:h-[132px] md:w-[250px] md:rounded-[22px] ${
                    onDark
                      ? "border-white/10 bg-[#0a0a0a] hover:border-gaude-orange/35"
                      : "border-black/10 bg-white hover:border-gaude-orange/40"
                  }`}
                >
                  {inner}
                  <div
                    className={`absolute top-3 right-3 z-10 h-1.5 w-1.5 rounded-full opacity-0 transition-opacity group-hover:opacity-100 ${
                      onDark ? "bg-gaude-orange/50" : "bg-gaude-orange"
                    }`}
                  />
                </div>
              );

              if (item.href) {
                return (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={item.title ?? "Client"}
                    className="block cursor-pointer"
                  >
                    {card}
                  </a>
                );
              }
              return card;
            }}
          />
        </div>
      </div>
    </section>
  );
}
