import Image from "next/image";
import Link from "next/link";

import SelectBookingButton from "@/components/select-booking-button";
import CompanyReviews from "@/components/company-reviews";
import SiteHeader from "@/components/site-header";
import { buildBackendUrl } from "@/lib/backend";
import { PUBLIC_DATA_REVALIDATE_SECONDS } from "@/lib/backend-config";
import { getCurrentUser } from "@/lib/auth";
import { getCurrentUserBookedCompanyIds } from "@/lib/bookings";
import { openSans, outfit } from "@/lib/fonts";

type Company = {
  _id: string;
  name: string;
  address: string;
  website: string;
  photoUrl?: string;
  description: string;
  telephone: string;
};

type Job = {
  _id: string;
  title: string;
  description: string;
  skills: string[];
  jobType: string;
  isRemote: boolean;
  salaryMin?: number;
  salaryMax?: number;
  location: string;
  company: Company;
  createdAt: string;
};

type JobsResponse = {
  success: boolean;
  count: number;
  data: Job[];
};

type FindJobsPageProps = {
  searchParams?: Promise<{
    q?: string | string[];
    skill?: string | string[];
    jobType?: string | string[];
    isRemote?: string | string[];
    minSalary?: string | string[];
    maxSalary?: string | string[];
    sort?: string | string[];
  }>;
};

type JobFilters = {
  q: string;
  skill: string[];
  jobType: string;
  isRemote: string;
  minSalary: string;
  maxSalary: string;
  sort: string;
};

const keywordTags = ["Engineer", "Designer", "Remote", "Analytics"];

const jobTypeOptions = [
  {
    label: "Full-time",
    value: "Full-time",
    description: "Long-term roles for full-time product and engineering teams.",
  },
  {
    label: "Part-time",
    value: "Part-time",
    description: "Flexible schedules for focused project or operational support.",
  },
  {
    label: "Contract",
    value: "Contract",
    description: "Fixed-term positions for delivery, QA, and specialized work.",
  },
  {
    label: "Internship",
    value: "Internship",
    description: "Entry-level opportunities for students and early-career talent.",
  },
];

const skillOptions = [
  "React",
  "Node.js",
  "Python",
  "AWS",
  "Docker",
  "TypeScript",
];

const salaryRanges = [
  { label: "Any", minSalary: "", maxSalary: "" },
  { label: "Under $60k", minSalary: "", maxSalary: "60000" },
  { label: "$60k - $100k", minSalary: "60000", maxSalary: "100000" },
  { label: "$100k+", minSalary: "100000", maxSalary: "" },
];

const sortOptions = [
  { label: "New", value: "new" },
  { label: "Salary ascending", value: "salaryAsc" },
  { label: "Salary descending", value: "salaryDesc" },
];

function normalizeSingleValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0]?.trim() ?? "";
  }

  return value?.trim() ?? "";
}

function normalizeMultiValue(value: string | string[] | undefined): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => item.trim()).filter(Boolean);
  }

  return value ? [value.trim()].filter(Boolean) : [];
}

function getFilters(
  searchParams: Awaited<FindJobsPageProps["searchParams"]>,
): JobFilters {
  const sort = normalizeSingleValue(searchParams?.sort);

  return {
    q: normalizeSingleValue(searchParams?.q),
    skill: normalizeMultiValue(searchParams?.skill),
    jobType: normalizeSingleValue(searchParams?.jobType),
    isRemote: normalizeSingleValue(searchParams?.isRemote),
    minSalary: normalizeSingleValue(searchParams?.minSalary),
    maxSalary: normalizeSingleValue(searchParams?.maxSalary),
    sort: sort || "new",
  };
}

function buildFilterHref(filters: JobFilters, updates: Partial<JobFilters>): string {
  const nextFilters: JobFilters = {
    ...filters,
    ...updates,
  };
  const params = new URLSearchParams();

  if (nextFilters.q) {
    params.set("q", nextFilters.q);
  }

  nextFilters.skill.forEach((skill) => {
    if (skill) {
      params.append("skill", skill);
    }
  });

  if (nextFilters.jobType) {
    params.set("jobType", nextFilters.jobType);
  }

  if (nextFilters.isRemote) {
    params.set("isRemote", nextFilters.isRemote);
  }

  if (nextFilters.minSalary) {
    params.set("minSalary", nextFilters.minSalary);
  }

  if (nextFilters.maxSalary) {
    params.set("maxSalary", nextFilters.maxSalary);
  }

  if (nextFilters.sort && nextFilters.sort !== "new") {
    params.set("sort", nextFilters.sort);
  }

  const query = params.toString();
  return query ? `/find-jobs?${query}` : "/find-jobs";
}

function toggleValue(values: string[], value: string): string[] {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

function formatSalaryRange(job: Job): string {
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

function getSalaryRangeLabel(filters: JobFilters): string {
  const match = salaryRanges.find(
    (range) =>
      range.minSalary === filters.minSalary && range.maxSalary === filters.maxSalary,
  );

  return match?.label ?? "Custom";
}

async function getJobs(filters: JobFilters): Promise<Job[]> {
  try {
    const params = new URLSearchParams();

    if (filters.q) {
      params.set("q", filters.q);
    }

    filters.skill.forEach((skill) => {
      params.append("skill", skill);
    });

    if (filters.jobType) {
      params.set("jobType", filters.jobType);
    }

    if (filters.isRemote) {
      params.set("isRemote", filters.isRemote);
    }

    if (filters.minSalary) {
      params.set("minSalary", filters.minSalary);
    }

    if (filters.maxSalary) {
      params.set("maxSalary", filters.maxSalary);
    }

    if (filters.sort) {
      params.set("sort", filters.sort);
    }

    const query = params.toString();
    const response = await fetch(
      buildBackendUrl(query ? `/jobs?${query}` : "/jobs"),
      { next: { revalidate: PUBLIC_DATA_REVALIDATE_SECONDS } },
    );

    if (!response.ok) {
      console.error("Failed to fetch jobs", response.status, response.statusText);
      return [];
    }

    const payload = (await response.json()) as Partial<JobsResponse>;

    if (!Array.isArray(payload.data)) {
      console.error("Jobs response did not contain an array");
      return [];
    }

    return payload.data;
  } catch (error) {
    console.error("Unexpected error fetching jobs", error);
    return [];
  }
}

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5 text-[#2d2d2d]"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9 15C12.3137 15 15 12.3137 15 9C15 5.68629 12.3137 3 9 3C5.68629 3 3 5.68629 3 9C3 12.3137 5.68629 15 9 15Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M13.5 13.5L17 17"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckIcon({ active }: { active: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className={`h-5 w-5 ${active ? "text-[#2d2d2d]" : "text-[#d0d0d6]"}`}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="1.5" y="1.5" width="17" height="17" rx="4" fill="currentColor" />
      <path
        d="M5.8 10.2L8.4 12.8L14.2 7"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
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
      <rect x="15" y="15" width="98" height="98" rx="18" stroke="currentColor" strokeWidth="8" />
      <circle cx="84" cy="43" r="13" stroke="currentColor" strokeWidth="8" />
      <path d="M27 90L54 63L72 81L85 68L101 90" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default async function FindJobsPage({
  searchParams,
}: FindJobsPageProps) {
  const currentUser = await getCurrentUser();
  const bookedCompanyIds = currentUser
    ? await getCurrentUserBookedCompanyIds()
    : [];
  const resolvedSearchParams = await searchParams;
  const filters = getFilters(resolvedSearchParams);
  const jobs = await getJobs(filters);

  return (
    <div className="min-h-dvh w-full bg-white">
      <SiteHeader activePath="/find-jobs" currentUser={currentUser} />

      <main className="w-full pb-0 pt-[70px] bg-[#f8f8f8]">
        <section
          id="find-jobs"
          className="w-full bg-[#f8f8f8] px-4 py-6 sm:px-6 lg:px-8"
        >
          <div className="space-y-6 xl:flex xl:items-start xl:gap-10 xl:space-y-0">
            <aside className="rounded-[12px] border border-[#d9d9d9] bg-white p-4 sm:p-5 xl:sticky xl:top-[94px] xl:max-h-[calc(100dvh-118px)] xl:w-[264px] xl:flex-shrink-0 xl:overflow-hidden">
              <div className="space-y-6 xl:max-h-full xl:overflow-y-auto xl:pr-1">
                <div className="space-y-3">
                  <h2 className={`${openSans.className} text-[18px] font-semibold text-[#222222]`}>
                    Keywords
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {keywordTags.map((tag) => {
                      const isActive = filters.q.toLowerCase() === tag.toLowerCase();

                      return (
                        <Link
                          key={tag}
                          href={buildFilterHref(filters, { q: isActive ? "" : tag })}
                          className={`${openSans.className} inline-flex items-center gap-2 rounded-[10px] px-3 py-1.5 text-[13px] font-semibold transition-colors ${
                            isActive
                              ? "bg-[#dd7f21] text-white"
                              : "bg-[#f3f3f3] text-[#2c2c2c] hover:bg-[#ececec]"
                          }`}
                        >
                          <span>{tag}</span>
                          <span className="text-[18px] leading-none">{isActive ? "−" : "+"}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-3">
                    <h3 className={`${openSans.className} text-[16px] font-semibold text-[#222222]`}>
                      Work setup
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={buildFilterHref(filters, {
                          isRemote: filters.isRemote === "true" ? "" : "true",
                        })}
                        className={`${openSans.className} inline-flex items-center gap-2 rounded-[10px] px-3 py-1.5 text-[13px] font-semibold transition-colors ${
                          filters.isRemote === "true"
                            ? "bg-[#dd7f21] text-white"
                            : "bg-[#f3f3f3] text-[#2c2c2c] hover:bg-[#ececec]"
                        }`}
                      >
                        <span>Remote only</span>
                        <span className="text-[18px] leading-none">
                          {filters.isRemote === "true" ? "−" : "+"}
                        </span>
                      </Link>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className={`${openSans.className} text-[16px] font-semibold text-[#222222]`}>
                      Job type
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {jobTypeOptions.map((option) => {
                        const isActive = filters.jobType === option.value;

                        return (
                          <Link
                            key={option.value}
                            href={buildFilterHref(filters, {
                              jobType: isActive ? "" : option.value,
                            })}
                            className={`${openSans.className} inline-flex items-center gap-2 rounded-[10px] px-3 py-1.5 text-[13px] font-semibold transition-colors ${
                              isActive
                                ? "bg-[#dd7f21] text-white"
                                : "bg-[#f3f3f3] text-[#2c2c2c] hover:bg-[#ececec]"
                            }`}
                          >
                            <span>{option.label}</span>
                            <span className="text-[18px] leading-none">{isActive ? "−" : "+"}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <span className={`${openSans.className} text-[16px] font-semibold text-[#2c2c2c]`}>
                      Salary
                    </span>
                    <span className={`${openSans.className} text-[14px] text-[#333333]`}>
                      {getSalaryRangeLabel(filters)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {salaryRanges.map((range) => {
                      const isActive =
                        filters.minSalary === range.minSalary &&
                        filters.maxSalary === range.maxSalary;

                      return (
                        <Link
                          key={range.label}
                          href={buildFilterHref(filters, {
                            minSalary: range.minSalary,
                            maxSalary: range.maxSalary,
                          })}
                          className={`${openSans.className} rounded-full px-3 py-2 text-[13px] font-semibold transition-colors ${
                            isActive
                              ? "bg-[#dd7f21] text-white"
                              : "bg-[#f3f3f3] text-[#2c2c2c] hover:bg-[#ececec]"
                          }`}
                        >
                          {range.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className={`${openSans.className} text-[16px] font-semibold text-[#222222]`}>
                    Skill
                  </h3>
                  <div className="space-y-3">
                    {skillOptions.map((skill) => {
                      const isActive = filters.skill.includes(skill);

                      return (
                        <Link
                          key={skill}
                          href={buildFilterHref(filters, {
                            skill: toggleValue(filters.skill, skill),
                          })}
                          className="flex items-center gap-3"
                        >
                          <CheckIcon active={isActive} />
                          <span className={`${openSans.className} text-[16px] font-semibold text-[#2c2c2c]`}>
                            {skill}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </aside>

            <div className="space-y-6 xl:min-w-0 xl:flex-1">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <form
                  action="/find-jobs"
                  className="flex w-full max-w-[360px] items-center gap-3"
                  method="get"
                >
                  {filters.skill.map((skill) => (
                    <input key={skill} type="hidden" name="skill" value={skill} />
                  ))}
                  {filters.jobType ? (
                    <input type="hidden" name="jobType" value={filters.jobType} />
                  ) : null}
                  {filters.isRemote ? (
                    <input type="hidden" name="isRemote" value={filters.isRemote} />
                  ) : null}
                  {filters.minSalary ? (
                    <input type="hidden" name="minSalary" value={filters.minSalary} />
                  ) : null}
                  {filters.maxSalary ? (
                    <input type="hidden" name="maxSalary" value={filters.maxSalary} />
                  ) : null}
                  {filters.sort ? (
                    <input type="hidden" name="sort" value={filters.sort} />
                  ) : null}

                  <label className="flex h-[46px] w-full items-center gap-3 rounded-full border border-[#d6d6d6] bg-white px-4 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
                    <input
                      type="text"
                      name="q"
                      defaultValue={filters.q}
                      placeholder="Search jobs"
                      className={`${openSans.className} w-full border-none bg-transparent text-[16px] text-[#2a2a2a] outline-none placeholder:text-black/30`}
                    />
                    <button type="submit" aria-label="Search jobs" className="shrink-0">
                      <SearchIcon />
                    </button>
                  </label>
                  {filters.q ? (
                    <Link
                      href={buildFilterHref(filters, { q: "" })}
                      className={`${openSans.className} text-[14px] font-semibold text-[#dd7f21] transition-colors hover:text-[#c56f1f]`}
                    >
                      Clear
                    </Link>
                  ) : null}
                </form>

                <div className="flex flex-wrap items-center gap-2">
                  {sortOptions.map((option) => {
                    const isActive = filters.sort === option.value;

                    return (
                      <Link
                        key={option.value}
                        href={buildFilterHref(filters, { sort: option.value })}
                        className={`${openSans.className} rounded-[12px] px-4 py-2 text-[14px] font-semibold transition-colors ${
                          isActive
                            ? "bg-[#dd7f21] text-white"
                            : "bg-[#f3f3f3] text-black/45 hover:text-black/65"
                        }`}
                      >
                        {isActive ? "✓ " : ""}
                        {option.label}
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4">
                <p className={`${openSans.className} text-[14px] text-black/55`}>
                  {filters.q
                    ? `Showing ${jobs.length} job${jobs.length === 1 ? "" : "s"} for “${filters.q}”`
                    : `Showing ${jobs.length} job${jobs.length === 1 ? "" : "s"}`}
                </p>

                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                  {jobs.length > 0 ? (
                    jobs.map((job) => (
                      <article
                        key={job._id}
                        className="flex h-full flex-col rounded-[12px] border border-[#d9d9d9] bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
                      >
                        <div className="relative flex aspect-[1.05/1] items-center justify-center overflow-hidden rounded-[4px] bg-[#f1efef]">
                          {job.company.photoUrl ? (
                            <Image
                              src={job.company.photoUrl}
                              alt={job.company.name}
                              fill
                              unoptimized
                              sizes="(max-width: 639px) 100vw, (max-width: 1279px) 50vw, 25vw"
                              className="object-cover"
                            />
                          ) : (
                            <ImagePlaceholderIcon />
                          )}
                        </div>
                        <div className="flex flex-1 flex-col pt-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`${openSans.className} rounded-full bg-[#fff4ea] px-2.5 py-1 text-[12px] font-semibold text-[#d37624]`}>
                              {job.jobType}
                            </span>
                            {job.isRemote ? (
                              <span className={`${openSans.className} rounded-full bg-[#edf7ff] px-2.5 py-1 text-[12px] font-semibold text-[#2c7bc9]`}>
                                Remote
                              </span>
                            ) : null}
                          </div>

                          <h2 className={`${openSans.className} mt-3 text-[18px] font-semibold text-[#252525]`}>
                            {job.title}
                          </h2>
                          <p className={`${openSans.className} mt-1 text-[15px] text-black/50`}>
                            {job.company.name}
                          </p>
                          <p className={`${openSans.className} mt-1 text-[14px] text-black/50`}>
                            {job.location}
                          </p>
                          <p className={`${openSans.className} mt-3 line-clamp-3 text-[14px] text-black/65`}>
                            {job.description}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-2">
                            {job.skills.slice(0, 3).map((skill) => (
                              <span
                                key={skill}
                                className={`${openSans.className} rounded-full bg-[#f3f3f3] px-2.5 py-1 text-[12px] font-semibold text-[#2c2c2c]`}
                              >
                                {skill}
                              </span>
                            ))}
                          </div>

                          <p className={`${outfit.className} mt-4 text-[20px] font-bold text-[#2c2c2c]`}>
                            {formatSalaryRange(job)}
                          </p>

                          <div className="mt-auto flex items-end justify-between gap-2 pt-4">
                            <Link
                              href={`/companies/${job.company._id}`}
                              className={`${openSans.className} inline-block leading-tight text-[13px] font-semibold text-[#dd7f21] transition-colors hover:text-[#c56f1f]`}
                            >
                              More detail
                            </Link>
                            <div className="flex items-center gap-2">
                              <CompanyReviews
                                companyId={job.company._id}
                                companyName={job.company.name}
                                isAuthenticated={Boolean(currentUser)}
                                currentUserId={currentUser?._id}
                              />
                              <SelectBookingButton
                                companyId={job.company._id}
                                companyName={job.company.name}
                                isAuthenticated={Boolean(currentUser)}
                                initiallySelected={bookedCompanyIds.includes(job.company._id)}
                              />
                            </div>
                          </div>
                        </div>
                      </article>
                    ))
                  ) : (
                    <div className="rounded-[12px] border border-dashed border-[#d9d9d9] bg-white p-6 sm:col-span-2 xl:col-span-4">
                      <h2 className={`${openSans.className} text-[18px] font-semibold text-[#252525]`}>
                        No jobs matched your current filters.
                      </h2>
                      <p className={`${openSans.className} mt-2 text-[15px] text-black/55`}>
                        Try changing the search text, salary range, remote toggle, job type, or selected skills.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
