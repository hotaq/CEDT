import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import CompanyReviews from "@/components/company-reviews";
import SiteHeader from "@/components/site-header";
import { buildBackendUrl } from "@/lib/backend";
import {
  PUBLIC_DATA_REVALIDATE_SECONDS,
} from "@/lib/backend-config";
import { getCurrentUser } from "@/lib/auth";
import { openSans, outfit } from "@/lib/fonts";

type CompanyJob = {
  _id: string;
  title: string;
  description: string;
  skills: string[];
  jobType: string;
  isRemote: boolean;
  salaryMin?: number;
  salaryMax?: number;
  location: string;
  createdAt: string;
};

type Company = {
  _id: string;
  name: string;
  address: string;
  website: string;
  photoUrl?: string;
  description: string;
  telephone: string;
  jobs: CompanyJob[];
  reviews?: Array<{ _id: string }>;
  bookings?: Array<{ _id: string }>;
};

type CompanyResponse = {
  success: boolean;
  data?: Company;
};

type CompanyPageProps = {
  params: Promise<{
    companyId: string;
  }>;
};

async function getCompany(companyId: string): Promise<Company | null> {
  try {
    const response = await fetch(buildBackendUrl(`/companies/${companyId}`), {
      next: { revalidate: PUBLIC_DATA_REVALIDATE_SECONDS },
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      console.error(
        "Failed to fetch company",
        response.status,
        response.statusText,
      );
      return null;
    }

    const payload = (await response.json()) as Partial<CompanyResponse>;

    if (!payload.data) {
      console.error("Company response did not contain company data");
      return null;
    }

    return payload.data;
  } catch (error) {
    console.error("Unexpected error fetching company", error);
    return null;
  }
}

function formatSalaryRange(job: CompanyJob): string {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

  if (typeof job.salaryMin === "number" && typeof job.salaryMax === "number") {
    return `${formatter.format(job.salaryMin)} - ${formatter.format(job.salaryMax)}`;
  }

  if (typeof job.salaryMin === "number") {
    return `${formatter.format(job.salaryMin)}+`;
  }

  if (typeof job.salaryMax === "number") {
    return `Up to ${formatter.format(job.salaryMax)}`;
  }

  return "Salary not specified";
}

function getWebsiteHost(website: string): string {
  try {
    return new URL(website).host.replace(/^www\./, "");
  } catch {
    return website;
  }
}

function ImagePlaceholderIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-28 w-28 text-[#e1dfdf] sm:h-32 sm:w-32"
      viewBox="0 0 128 128"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="15"
        y="15"
        width="98"
        height="98"
        rx="18"
        stroke="currentColor"
        strokeWidth="8"
      />
      <circle cx="84" cy="43" r="13" stroke="currentColor" strokeWidth="8" />
      <path
        d="M27 90L54 63L72 81L85 68L101 90"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-[#f1ece5] bg-[#faf9f7] px-4 py-3">
      <p
        className={`${openSans.className} text-[12px] font-semibold uppercase tracking-[0.16em] text-[#ab7a48]`}
      >
        {label}
      </p>
      <p className={`${outfit.className} mt-1 text-[26px] leading-none text-[#111111]`}>
        {value}
      </p>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-[#efe6dc] py-3 last:border-b-0 last:pb-0 first:pt-0">
      <span
        className={`${openSans.className} text-[12px] font-semibold uppercase tracking-[0.16em] text-[#ab7a48]`}
      >
        {label}
      </span>
      <span className={`${openSans.className} text-[15px] leading-6 text-[#3f3b37]`}>
        {value}
      </span>
    </div>
  );
}

export default async function CompanyPage({ params }: CompanyPageProps) {
  const { companyId } = await params;
  const currentUser = await getCurrentUser();
  const company = await getCompany(companyId);

  if (!company) {
    notFound();
  }

  return (
    <div className="min-h-dvh bg-[#f8f8f8]">
      <SiteHeader activePath="/find-jobs" currentUser={currentUser} />

      <main className="px-4 pb-12 pt-[94px] sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1500px] space-y-8">
          <section className="rounded-[30px] border border-[#ece6df] bg-[linear-gradient(180deg,#fffdfa_0%,#fffaf4_100%)] p-4 shadow-[0_24px_70px_rgba(190,155,113,0.08)] sm:p-5 lg:p-6">
            <div className="grid gap-5 xl:grid-cols-[340px_minmax(0,1fr)] xl:items-start">
              <div className="relative aspect-[1/1.18] min-h-[260px] overflow-hidden rounded-[24px] border border-[#efe6dc] bg-white/85 shadow-[0_20px_45px_rgba(160,125,83,0.08)] xl:self-start">
                {company.photoUrl ? (
                  <Image
                    src={company.photoUrl}
                    alt={company.name}
                    fill
                    unoptimized
                    sizes="(max-width: 1279px) 100vw, 340px"
                    className="object-cover object-center"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ImagePlaceholderIcon />
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-5">
                <div className="space-y-2">
                  <p
                    className={`${openSans.className} text-[14px] font-semibold uppercase tracking-[0.18em] text-[#c1823d]`}
                  >
                    Company profile
                  </p>
                  <h1
                    className={`${outfit.className} text-[34px] leading-[0.96] text-[#111111] sm:text-[42px] lg:text-[52px]`}
                  >
                    {company.name}
                  </h1>
                  <p
                    className={`${openSans.className} max-w-[52rem] text-[15px] leading-7 text-black/60`}
                  >
                    {company.description}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <SummaryStat label="Open positions" value={String(company.jobs.length)} />
                  <SummaryStat label="Reviews" value={String(company.reviews?.length ?? 0)} />
                  <SummaryStat label="Bookings" value={String(company.bookings?.length ?? 0)} />
                  <div className="rounded-[18px] border border-[#f1ece5] bg-[#faf9f7] px-4 py-3">
                    <p
                      className={`${openSans.className} text-[12px] font-semibold uppercase tracking-[0.16em] text-[#ab7a48]`}
                    >
                      Website
                    </p>
                    <p
                      title={getWebsiteHost(company.website)}
                      className={`${outfit.className} mt-1 truncate text-[20px] leading-tight text-[#111111] sm:text-[24px]`}
                    >
                      {getWebsiteHost(company.website)}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
                  <div className="rounded-[24px] border border-[#efe6dc] bg-white/85 p-5 shadow-[0_20px_45px_rgba(160,125,83,0.08)]">
                    <p
                      className={`${openSans.className} text-[12px] font-semibold uppercase tracking-[0.16em] text-[#ab7a48]`}
                    >
                      Company information
                    </p>
                    <div className="mt-4">
                      <DetailRow label="Address" value={company.address} />
                      <DetailRow label="Telephone" value={company.telephone} />
                      <DetailRow label="Website" value={company.website} />
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-[#efe6dc] bg-white/85 p-5 shadow-[0_20px_45px_rgba(160,125,83,0.08)]">
                    <p
                      className={`${openSans.className} text-[12px] font-semibold uppercase tracking-[0.16em] text-[#ab7a48]`}
                    >
                      Actions
                    </p>
                    <h2 className={`${outfit.className} mt-1 text-[28px] text-[#111111]`}>
                      Explore opportunities
                    </h2>
                    <p className={`${openSans.className} mt-2 text-[14px] leading-6 text-black/55`}>
                      Review the company, browse open positions, and visit the official website for more context.
                    </p>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <Link
                        href="/find-jobs"
                        className={`${openSans.className} rounded-full bg-[#dd7f21] px-4 py-2.5 text-[14px] font-bold text-white transition-colors hover:bg-[#c56f1f]`}
                      >
                        Back to jobs
                      </Link>
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noreferrer"
                        className={`${openSans.className} rounded-full border border-[#e6c9aa] bg-white px-4 py-2.5 text-[14px] font-bold text-[#b06f2c] transition-colors hover:bg-[#fff4ea]`}
                      >
                        Visit website
                      </a>
                      <CompanyReviews
                        companyId={company._id}
                        companyName={company.name}
                        isAuthenticated={Boolean(currentUser)}
                        currentUserId={currentUser?._id}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p
                  className={`${openSans.className} text-[14px] font-semibold uppercase tracking-[0.18em] text-[#c1823d]`}
                >
                  Open roles
                </p>
                <h2 className={`${outfit.className} text-[30px] leading-[1.02] text-[#111111]`}>
                  Job positions
                </h2>
              </div>
              <p className={`${openSans.className} text-[14px] text-black/55`}>
                {company.jobs.length} position{company.jobs.length === 1 ? "" : "s"} currently available.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {company.jobs.length > 0 ? (
                company.jobs.map((job) => (
                  <article
                    key={job._id}
                    className="flex h-full flex-col rounded-[18px] border border-[#d9d9d9] bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`${openSans.className} rounded-full bg-[#fff4ea] px-2.5 py-1 text-[12px] font-semibold text-[#d37624]`}
                      >
                        {job.jobType}
                      </span>
                      {job.isRemote ? (
                        <span
                          className={`${openSans.className} rounded-full bg-[#edf7ff] px-2.5 py-1 text-[12px] font-semibold text-[#2c7bc9]`}
                        >
                          Remote
                        </span>
                      ) : null}
                    </div>

                    <h3 className={`${openSans.className} mt-4 text-[22px] font-semibold text-[#252525]`}>
                      {job.title}
                    </h3>
                    <p className={`${openSans.className} mt-1 text-[14px] text-black/50`}>
                      {job.location}
                    </p>
                    <p className={`${openSans.className} mt-4 line-clamp-4 text-[14px] leading-6 text-black/65`}>
                      {job.description}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {job.skills.slice(0, 4).map((skill) => (
                        <span
                          key={skill}
                          className={`${openSans.className} rounded-full bg-[#f3f3f3] px-2.5 py-1 text-[12px] font-semibold text-[#2c2c2c]`}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    <div className="mt-auto pt-5">
                      <p className={`${outfit.className} text-[24px] font-bold text-[#2c2c2c]`}>
                        {formatSalaryRange(job)}
                      </p>
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noreferrer"
                        className={`${openSans.className} mt-3 inline-block text-[13px] font-semibold text-[#dd7f21] transition-colors hover:text-[#c56f1f]`}
                      >
                        Visit company website
                      </a>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-[18px] border border-dashed border-[#d9d9d9] bg-white p-6 md:col-span-2 xl:col-span-3">
                  <h3 className={`${openSans.className} text-[18px] font-semibold text-[#252525]`}>
                    No job positions are listed right now.
                  </h3>
                  <p className={`${openSans.className} mt-2 text-[15px] text-black/55`}>
                    Check back later or visit the company website for the most recent openings.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
