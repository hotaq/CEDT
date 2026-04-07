import Link from "next/link";

import SiteHeader from "@/components/site-header";
import { openSans, outfit } from "@/lib/fonts";

const keyboardRows = Array.from({ length: 5 }, (_, row) =>
  Array.from({ length: 6 }, (_, column) => `key-${row}-${column}`),
);

const heroBoxConfig = {
  pageGutter: "mx-auto w-full max-w-[1512px] pt-[70px]",
  maxWidth: "max-w-[1512px]",
  minHeight: "min-h-[calc(100dvh-70px)] lg:min-h-[841px]",
  innerSpacing:
    "px-6 py-10 sm:px-8 sm:py-12 lg:px-[106px] lg:pb-[114px] lg:pt-[148px]",
};

export default async function Home() {
  return (
    <div className="min-h-dvh w-full bg-white">
      <SiteHeader activePath="/" />

      <main className={heroBoxConfig.pageGutter}>
        <section
          className={`relative mx-auto w-full overflow-hidden bg-[#f8f8f8] ${heroBoxConfig.maxWidth} ${heroBoxConfig.minHeight} ${heroBoxConfig.innerSpacing}`}
        >
          <div
            id="find-jobs"
            className="relative z-10 flex max-w-[578px] flex-col gap-8"
          >
            <div className="space-y-[18px]">
              <h1
                className={`${outfit.className} max-w-[578px] text-[2.5rem] font-bold leading-[1.3] tracking-[-0.03em] text-[#1e1e1e] sm:text-[2.9rem] lg:text-[55px]`}
              >
                Find Jobs Through the Right Career Fair.
              </h1>
              <p
                className={`${openSans.className} max-w-[501px] text-[18px] font-normal leading-[1.3] text-black/60 sm:text-[19px] lg:text-[20px]`}
              >
                Search upcoming job fairs, compare hiring companies, and follow
                live openings from one database built for serious job seekers.
              </p>
            </div>

            <div className={`${openSans.className} flex flex-wrap gap-4 sm:gap-[34px]`}>
              <Link
                href="/find-jobs"
                className="flex h-[60px] w-[200px] items-center justify-center rounded-[50px] bg-[#d37624] text-[20px] font-bold leading-[1.4] text-white transition-colors hover:bg-[#bc661d]"
              >
                Find Jobs
              </Link>
              <button
                className="flex h-[60px] w-[200px] items-center justify-center rounded-[50px] border-2 border-[#d37624] text-[20px] font-bold leading-[1.4] text-[#d37624] transition-colors hover:bg-[#fff4ea]"
                type="button"
              >
                Browse Fairs
              </button>
            </div>

            <div
              id="job-fairs"
              className="grid gap-6 pt-8 sm:grid-cols-3 sm:gap-8 lg:w-[586px] lg:gap-[93px] lg:pt-[25px]"
            >
              <div className="space-y-0">
                <p
                  className={`${outfit.className} text-[40px] font-bold leading-[1.4] text-[#f0c932]`}
                >
                  250+
                </p>
                <p
                  className={`${openSans.className} max-w-[136px] text-[20px] font-bold leading-[1.4] text-black`}
                >
                  Job fairs listed
                </p>
              </div>
              <div className="space-y-0">
                <p
                  className={`${outfit.className} text-[40px] font-bold leading-[1.4] text-[#2489d3]`}
                >
                  5K+
                </p>
                <p
                  className={`${openSans.className} max-w-[103px] text-[20px] font-bold leading-[1.4] text-black`}
                >
                  Open roles
                </p>
              </div>
              <div className="space-y-0">
                <p
                  className={`${outfit.className} text-[40px] font-bold leading-[1.4] text-[#fe753f]`}
                >
                  800+
                </p>
                <p
                  className={`${openSans.className} max-w-[135px] text-[20px] font-bold leading-[1.4] text-black`}
                >
                  Companies hiring
                </p>
              </div>
            </div>
          </div>

          <div className="relative mt-10 min-h-[360px] w-full sm:min-h-[460px] lg:absolute lg:left-[692px] lg:top-[32px] lg:mt-0 lg:h-[782px] lg:w-[782px] lg:min-h-0">
            <div className="absolute right-4 top-8 h-28 w-[78%] skew-x-[-26deg] rounded-[10px] bg-[#eda27a] sm:h-36 lg:right-8 lg:top-4 lg:h-44" />
            <div className="absolute right-10 top-14 h-24 w-[68%] skew-x-[-26deg] rounded-[10px] bg-[#b96f49] sm:h-32 lg:right-16 lg:top-10 lg:h-36" />
            <div className="absolute right-12 top-[4.25rem] h-3 w-[58%] bg-white/85 lg:right-20 lg:top-[3.55rem]" />
            <div className="absolute right-[24%] top-40 h-12 w-24 bg-white/45 lg:top-48 lg:h-16 lg:w-32" />
            <div className="absolute right-[33%] top-[12.75rem] h-10 w-3 bg-[#d98960] lg:top-[18rem] lg:h-14" />

            <div className="absolute left-10 top-40 h-12 w-28 rotate-[39deg] rounded-[10px] border-[3px] border-[#f4c7b0] bg-[#b96f49] sm:left-16 lg:left-4 lg:top-72 lg:h-16 lg:w-36" />

            <div className="absolute bottom-20 left-6 rotate-[-22deg] rounded-[18px] border-[10px] border-[#f5cdb8] bg-[#fffaf6] p-4 shadow-[0_16px_30px_rgba(185,111,73,0.12)] sm:left-16 lg:bottom-12 lg:left-8">
              <div className="grid grid-cols-6 gap-2">
                {keyboardRows.flat().map((key) => (
                  <span
                    key={key}
                    className="h-4 w-5 rounded-[4px] bg-[#f3d8ca] sm:h-5 sm:w-6"
                  />
                ))}
              </div>
            </div>

            <div className="absolute bottom-8 right-4 h-36 w-52 rotate-[14deg] rounded-[20px] bg-[#b96f49] shadow-[0_18px_40px_rgba(105,51,25,0.14)] sm:h-44 sm:w-64 lg:bottom-2 lg:right-4 lg:h-52 lg:w-72">
              <div className="absolute left-5 top-5 flex flex-col gap-2">
                <span className="h-2.5 w-12 rounded-full bg-[#d98c61]" />
                <span className="h-2.5 w-10 rounded-full bg-[#d98c61]" />
                <span className="h-2.5 w-8 rounded-full bg-[#d98c61]" />
              </div>
              <div className="absolute left-5 top-20 h-12 w-12 rounded-full border-[6px] border-[#d98c61]" />
              <div className="absolute inset-y-5 right-5 w-[1px] bg-[#f5cdb8]/60" />
              <div className="absolute inset-x-5 top-5 h-[1px] bg-[#f5cdb8]/60" />
              <div className="absolute inset-x-5 bottom-5 h-[1px] bg-[#f5cdb8]/60" />
            </div>

            <div className="absolute bottom-28 right-[46%] h-16 w-4 rotate-[-24deg] rounded-full bg-[#c97d54] shadow-[0_8px_20px_rgba(105,51,25,0.16)]" />
            <div className="absolute bottom-4 right-[48%] h-16 w-16 rounded-full bg-[#eda27a]">
              <div className="absolute left-0 top-0 h-16 w-14 rounded-full bg-white" />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
