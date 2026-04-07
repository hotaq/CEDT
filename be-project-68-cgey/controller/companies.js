const Company = require("../model/Company");

// @desc    Get all companies
// @route   GET /api/v1/companies
// @access  Public
exports.getCompanies = async (req, res, next) => {
    try {
        const companies = await Company.find()
            .populate("bookings")
            .populate("reviews")
            .populate("jobs");
        res.status(200).json({
            success: true,
            count: companies.length,
            data: companies,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Server Error" });
    }
};

// @desc    Get single company
// @route   GET /api/v1/companies/:id
// @access  Public
exports.getCompany = async (req, res, next) => {
    try {
        const company = await Company.findById(req.params.id)
            .populate("bookings")
            .populate("reviews")
            .populate("jobs");
        if (!company) {
            return res
                .status(404)
                .json({ success: false, error: "Company not found" });
        }
        res.status(200).json({
            success: true,
            data: company,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Server Error" });
    }
};

// @desc    Create new company
// @route   POST /api/v1/companies
// @access  Private (admin)
exports.createCompany = async (req, res, next) => {
    try {
        const existingCompany = await Company.findOne({ name: req.body.name });
        if (existingCompany) {
            return res.status(201).json({
                success: true,
                data: existingCompany,
            });
        }

        const company = await Company.create(req.body);
        res.status(201).json({
            success: true,
            data: company,
        });
    } catch (err) {
        console.error(err);
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Update company
// @route   PUT /api/v1/companies/:id
// @access  Private (admin)
exports.updateCompany = async (req, res, next) => {
    try {
        const company = await Company.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!company) {
            return res
                .status(404)
                .json({ success: false, error: "Company not found" });
        }
        res.status(200).json({
            success: true,
            data: company,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Server Error" });
    }
};

// @desc    Delete company
// @route   DELETE /api/v1/companies/:id
// @access  Private (admin)
exports.deleteCompany = async (req, res, next) => {
    try {
        const company = await Company.findById(req.params.id);
        if (!company) {
            return res
                .status(404)
                .json({ success: false, error: "Company not found" });
        }

        await require("../model/Booking").deleteMany({ company: req.params.id });
        await require("../model/Job").deleteMany({ company: req.params.id });
        await company.deleteOne();

        res.status(200).json({
            success: true,
            data: {},
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Server Error" });
    }
};
