const Review = require("../model/Review");
const Company = require("../model/Company");

// @desc    Get reviews
// @route   GET /api/v1/reviews
// @route   GET /api/v1/companies/:companyId/reviews
// @access  Public
exports.getReviews = async (req, res, next) => {
    try {
        let query;

        if (req.params.companyId) {
            query = Review.find({ company: req.params.companyId }).populate({
                path: "user",
                select: "name email",
            });
        } else {
            query = Review.find().populate({
                path: "company",
                select: "name address photoUrl",
            }).populate({
                path: "user",
                select: "name email",
            });
        }

        const reviews = await query;

        res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Server Error" });
    }
};

// @desc    Add a review
// @route   POST /api/v1/companies/:companyId/reviews
// @access  Private
exports.addReview = async (req, res, next) => {
    try {
        req.body.company = req.params.companyId;
        req.body.user = req.user.id;

        const company = await Company.findById(req.params.companyId);

        if (!company) {
            return res.status(404).json({
                success: false,
                error: `No company with the id of ${req.params.companyId}`,
            });
        }

        const review = await Review.create(req.body);

        res.status(201).json({
            success: true,
            data: review,
        });
    } catch (err) {
        console.error(err);
        if (err.code === 11000) {
            return res.status(400).json({ success: false, error: 'You have already submitted a review for this company' })
        }
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Update review
// @route   PUT /api/v1/reviews/:id
// @access  Private
exports.updateReview = async (req, res, next) => {
    try {
        let review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({
                success: false,
                error: `No review with the id of ${req.params.id}`,
            });
        }

        // Make sure review belongs to user or user is admin
        if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
            return res.status(401).json({
                success: false,
                error: "Not authorized to update review",
            });
        }

        review = await Review.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({
            success: true,
            data: review,
        });
    } catch (err) {
        console.error(err);
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Delete review
// @route   DELETE /api/v1/reviews/:id
// @access  Private
exports.deleteReview = async (req, res, next) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({
                success: false,
                error: `No review with the id of ${req.params.id}`,
            });
        }

        // Make sure review belongs to user or user is admin
        if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
            return res.status(401).json({
                success: false,
                error: "Not authorized to delete review",
            });
        }

        await review.deleteOne();

        res.status(200).json({
            success: true,
            data: {},
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Server Error" });
    }
};
