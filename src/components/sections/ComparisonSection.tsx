import { comparison } from "@/content/landing";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { sectionFlow } from "@/lib/stickyStack";

export function ComparisonSection() {
  return (
    <section
      id={comparison.id}
      className={`border-b-4 border-gaude-black bg-gaude-black px-4 py-16 md:px-8 md:py-24 ${sectionFlow}`}
    >
      <div className="mx-auto max-w-5xl">
        <SectionHeading 
          title={
            <>
              Not Just Another <span className="text-gaude-pink">Marketing Agency</span>
            </>
          } 
          light 
        />

        <div className="mt-8 hidden md:block">
          <table className="w-full border-collapse overflow-hidden border-4 border-white text-left">
            <thead>
              <tr className="bg-white text-gaude-black">
                <th className="border-b-4 border-gaude-black px-4 py-4 font-archivo text-sm uppercase tracking-wide md:px-6">
                  Normal Agency
                </th>
                <th className="border-b-4 border-l-4 border-gaude-black bg-gaude-orange px-4 py-4 font-archivo text-sm uppercase tracking-wide text-white md:px-6">
                  Editco Media
                </th>
              </tr>
            </thead>
            <tbody>
              {comparison.rows.map((row) => (
                <tr key={row.agency} className="border-b border-white/15 text-white">
                  <td className="px-4 py-4 font-inter text-sm font-medium md:px-6 md:text-base">
                    {row.agency}
                  </td>
                  <td className="border-l-4 border-gaude-black bg-white/5 px-4 py-4 font-inter text-sm font-bold text-gaude-green md:px-6 md:text-base">
                    {row.editco}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 flex flex-col gap-4 md:hidden">
          {comparison.rows.map((row) => (
            <div
              key={row.agency}
              className="border-4 border-white bg-white/5 p-4 font-inter text-sm text-white"
            >
              <p className="font-archivo text-[10px] font-black uppercase tracking-widest text-gaude-pink">
                Normal Agency
              </p>
              <p className="mt-1 font-medium">{row.agency}</p>
              <p className="mt-4 font-archivo text-[10px] font-black uppercase tracking-widest text-gaude-green">
                Editco Media
              </p>
              <p className="mt-1 font-bold text-gaude-green">{row.editco}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
