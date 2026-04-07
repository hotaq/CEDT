import Link from "next/link";

import { openSans, outfit } from "@/lib/fonts";
import styles from "./auth-carousel.module.css";

const authSlides = [
  {
    id: "welcome",
    title: "Welcome to My Website",
    subtitle: "Your job fair database for smarter job hunting.",
    footerTitle: "Find the Right Fair",
    footerText: "Explore upcoming events, hiring companies, and open roles in one place.",
  },
  {
    id: "progress",
    title: "Meet Employers Faster",
    subtitle: "Compare fairs, recruiters, and job posts without jumping between sites.",
    footerTitle: "Track Real Opportunities",
    footerText: "Save target companies, review open roles, and focus on events worth your time.",
  },
  {
    id: "prepare",
    title: "Keep Your Search Moving",
    subtitle: "Return to saved fairs, companies, and job leads anytime.",
    footerTitle: "Built for Job Seekers",
    footerText: "Use My Website to discover openings, plan applications, and stay ready for the next chance.",
  },
];

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`${openSans.className} min-h-dvh bg-white px-4 py-4 sm:px-6 sm:py-5 lg:px-8`}>
      <div className="mx-auto relative w-full max-w-[1620px]">
        <Link
          href="/"
          className="absolute right-0 top-0 z-20 inline-flex items-center gap-2 text-sm font-semibold text-[#7f869f] transition-colors hover:text-[#dd7f21]"
        >
          <svg
            aria-hidden="true"
            className="h-4 w-4"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9.5 3L4.5 8L9.5 13"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>Back to main menu</span>
        </Link>

        <div className="grid min-h-[calc(100dvh-2rem)] w-full gap-4 bg-white p-4 sm:min-h-[calc(100dvh-2.5rem)] sm:p-6 xl:grid-cols-[0.92fr_1.08fr] xl:gap-8 xl:p-8">
          <section
            aria-hidden="true"
            className="relative overflow-hidden rounded-[20px] bg-[#e3e3e3] bg-cover bg-center bg-no-repeat p-8 text-white sm:p-10 lg:p-14"
            style={{
              backgroundImage:
                "linear-gradient(135deg, rgba(211, 118, 36, 0.78), rgba(211, 118, 36, 0.28)), url('/imgs/floral-pattern-1774192920930.png')",
            }}
          >
            <div className="auth-carousel relative h-full min-h-[620px]">
              {authSlides.map((slide, index) => (
                <div
                  key={slide.id}
                  className={`${styles.slide} absolute inset-0 flex flex-col justify-between`}
                  data-initial={index === 0}
                  style={{ animationDelay: `${index * 4.5}s` }}
                >
                  <div className="space-y-2.5">
                    <h1
                      className={`${outfit.className} max-w-[31rem] text-3xl font-bold leading-[1.1] sm:text-[42px] lg:text-[54px]`}
                    >
                      {slide.title}
                    </h1>
                    <p className="max-w-[32rem] text-base leading-[1.35] text-white/88 sm:text-xl lg:text-[22px]">
                      {slide.subtitle}
                    </p>
                  </div>

                  <div className="space-y-3 pb-16">
                    <h2
                      className={`${outfit.className} max-w-[30rem] text-3xl font-bold leading-[1.1] sm:text-[40px] lg:text-[52px]`}
                    >
                      {slide.footerTitle}
                    </h2>
                    <p className="max-w-[30rem] text-lg leading-[1.4] text-white/92 sm:text-xl lg:text-[22px]">
                      {slide.footerText}
                    </p>
                  </div>
                </div>
              ))}

              <div className="absolute bottom-2 left-0 z-10 flex items-center gap-2">
                {authSlides.map((slide, index) => (
                  <span
                    key={`${slide.id}-dot`}
                    className={styles.dot}
                    data-initial={index === 0}
                    style={{ animationDelay: `${index * 4.5}s` }}
                  />
                ))}
              </div>
            </div>
          </section>

          <section className="flex min-h-[520px] flex-col rounded-[28px] border border-[#e8ecff] bg-white p-6 sm:p-8 lg:p-10">
            {children}
          </section>
        </div>
      </div>
    </div>
  );
}
