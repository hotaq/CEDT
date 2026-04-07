const Company = require("../model/Company");
const Job = require("../model/Job");

const escapeRegex = (value) =>
    value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const parseBoolean = (value) => {
    if (value === "true") {
        return true;
    }

    if (value === "false") {
        return false;
    }

    return undefined;
};

const normalizeSkills = (skills) => {
    if (!skills) {
        return undefined;
    }

    const values = Array.isArray(skills) ? skills : String(skills).split(",");
    const normalized = values
        .map((skill) => String(skill).trim())
        .filter(Boolean);

    return normalized.length > 0 ? normalized : undefined;
};

const parseNumber = (value) => {
    if (value === undefined || value === null || value === "") {
        return undefined;
    }

    const parsed = Number(value);
    return Number.isNaN(parsed) ? NaN : parsed;
};

const getSalaryRangeError = (salaryMin, salaryMax) => {
    const parsedMin = parseNumber(salaryMin);
    const parsedMax = parseNumber(salaryMax);

    if (Number.isNaN(parsedMin) || Number.isNaN(parsedMax)) {
        return "salaryMin and salaryMax must be numbers";
    }

    if (parsedMin == null || parsedMax == null) {
        return null;
    }

    return parsedMin > parsedMax
        ? "salaryMin must be less than or equal to salaryMax"
        : null;
};

const companySelect = "name address website photoUrl description telephone";

// @desc    Get jobs
// @route   GET /api/v1/jobs
// @route   GET /api/v1/companies/:companyId/jobs
// @access  Public
exports.getJobs = async (req, res) => {
    try {
        const {
            q,
            skill,
            jobType,
            isRemote,
            minSalary,
            maxSalary,
            sort = "new",
        } = req.query;
        const filter = {};

        if (req.params.companyId) {
            filter.company = req.params.companyId;
        }

        if (q) {
            const pattern = new RegExp(escapeRegex(String(q).trim()), "i");
            filter.$or = [
                { title: pattern },
                { description: pattern },
                { location: pattern },
                { skills: pattern },
            ];
        }

        const requestedSkills = normalizeSkills(skill);
        if (requestedSkills) {
            filter.skills = {
                $in: requestedSkills.map(
                    (value) => new RegExp(`^${escapeRegex(value)}$`, "i")
                ),
            };
        }

        if (jobType) {
            filter.jobType = new RegExp(`^${escapeRegex(String(jobType).trim())}$`, "i");
        }

        const remoteFlag = parseBoolean(isRemote);
        if (remoteFlag !== undefined) {
            filter.isRemote = remoteFlag;
        }

        const salaryConditions = [];
        const parsedMinSalary = parseNumber(minSalary);
        const parsedMaxSalary = parseNumber(maxSalary);

        if (minSalary !== undefined && Number.isNaN(parsedMinSalary)) {
            return res.status(400).json({
                success: false,
                error: "minSalary must be a number",
            });
        }

        if (maxSalary !== undefined && Number.isNaN(parsedMaxSalary)) {
            return res.status(400).json({
                success: false,
                error: "maxSalary must be a number",
            });
        }

        if (parsedMinSalary !== undefined) {
            salaryConditions.push({ salaryMax: { $gte: parsedMinSalary } });
        }

        if (parsedMaxSalary !== undefined) {
            salaryConditions.push({ salaryMin: { $lte: parsedMaxSalary } });
        }

        if (salaryConditions.length > 0) {
            filter.$and = (filter.$and || []).concat(salaryConditions);
        }

        let query = Job.find(filter).populate({
            path: "company",
            select: companySelect,
        });

        switch (sort) {
            case "salaryAsc":
                query = query.sort({ salaryMin: 1, salaryMax: 1, createdAt: -1 });
                break;
            case "salaryDesc":
                query = query.sort({ salaryMax: -1, salaryMin: -1, createdAt: -1 });
                break;
            case "new":
            default:
                query = query.sort({ createdAt: -1 });
                break;
        }

        const jobs = await query;

        res.status(200).json({
            success: true,
            count: jobs.length,
            data: jobs,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Server Error" });
    }
};

// @desc    Get single job
// @route   GET /api/v1/jobs/:id
// @access  Public
exports.getJob = async (req, res) => {
    try {
        const criteria = { _id: req.params.id };
        if (req.params.companyId) {
            criteria.company = req.params.companyId;
        }

        const job = await Job.findOne(criteria).populate({
            path: "company",
            select: companySelect,
        });

        if (!job) {
            return res.status(404).json({
                success: false,
                error: "Job not found",
            });
        }

        res.status(200).json({
            success: true,
            data: job,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Server Error" });
    }
};

// @desc    Create job
// @route   POST /api/v1/jobs
// @route   POST /api/v1/companies/:companyId/jobs
// @access  Private (admin)
exports.createJob = async (req, res) => {
    try {
        if (req.params.companyId) {
            req.body.company = req.params.companyId;
        }

        if (req.body.salaryMin !== undefined) {
            req.body.salaryMin = parseNumber(req.body.salaryMin);
        }

        if (req.body.salaryMax !== undefined) {
            req.body.salaryMax = parseNumber(req.body.salaryMax);
        }

        const salaryError = getSalaryRangeError(
            req.body.salaryMin,
            req.body.salaryMax
        );
        if (salaryError) {
            return res.status(400).json({
                success: false,
                error: salaryError,
            });
        }

        const company = await Company.findById(req.body.company);
        if (!company) {
            return res.status(404).json({
                success: false,
                error: "Company not found",
            });
        }

        req.body.skills = normalizeSkills(req.body.skills) || [];

        const job = await Job.create(req.body);

        res.status(201).json({
            success: true,
            data: job,
        });
    } catch (err) {
        console.error(err);
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Update job
// @route   PUT /api/v1/jobs/:id
// @access  Private (admin)
exports.updateJob = async (req, res) => {
    try {
        const criteria = { _id: req.params.id };
        if (req.params.companyId) {
            criteria.company = req.params.companyId;
        }

        const existingJob = await Job.findOne(criteria);
        if (!existingJob) {
            return res.status(404).json({
                success: false,
                error: "Job not found",
            });
        }

        if (req.body.salaryMin !== undefined) {
            req.body.salaryMin = parseNumber(req.body.salaryMin);
        }

        if (req.body.salaryMax !== undefined) {
            req.body.salaryMax = parseNumber(req.body.salaryMax);
        }

        const nextCompanyId =
            req.body.company || req.params.companyId || existingJob.company;
        const nextSalaryMin =
            req.body.salaryMin !== undefined
                ? req.body.salaryMin
                : existingJob.salaryMin;
        const nextSalaryMax =
            req.body.salaryMax !== undefined
                ? req.body.salaryMax
                : existingJob.salaryMax;
        const salaryError = getSalaryRangeError(nextSalaryMin, nextSalaryMax);

        if (salaryError) {
            return res.status(400).json({
                success: false,
                error: salaryError,
            });
        }

        const company = await Company.findById(nextCompanyId);
        if (!company) {
            return res.status(404).json({
                success: false,
                error: "Company not found",
            });
        }

        if (req.body.skills !== undefined) {
            req.body.skills = normalizeSkills(req.body.skills) || [];
        }

        req.body.company = nextCompanyId;

        const job = await Job.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({
            success: true,
            data: job,
        });
    } catch (err) {
        console.error(err);
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Delete job
// @route   DELETE /api/v1/jobs/:id
// @access  Private (admin)
exports.deleteJob = async (req, res) => {
    try {
        const criteria = { _id: req.params.id };
        if (req.params.companyId) {
            criteria.company = req.params.companyId;
        }

        const job = await Job.findOne(criteria);

        if (!job) {
            return res.status(404).json({
                success: false,
                error: "Job not found",
            });
        }

        await job.deleteOne();

        res.status(200).json({
            success: true,
            data: {},
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Server Error" });
    }
};
