const Booking = require("../model/Booking");
const Company = require("../model/Company");

// @desc    Create booking
// @route   POST /api/v1/companies/:companyId/bookings
// @access  Private
exports.addBooking = async (req, res, next) => {
    try {
        req.body.company = req.params.companyId;
        req.body.user = req.user.id;

        const company = await Company.findById(req.params.companyId);
        if (!company) {
            return res
                .status(404)
                .json({ success: false, error: "Company not found" });
        }

        const bookingDate = new Date(req.body.bookingDate);
        if (Number.isNaN(bookingDate.getTime())) {
            return res.status(400).json({
                success: false,
                error: "Invalid booking date",
            });
        }
        const startDate = new Date("2022-05-10T00:00:00.000Z");
        const endDate = new Date("2022-05-13T23:59:59.999Z");

        if (bookingDate < startDate || bookingDate > endDate) {
            return res.status(400).json({
                success: false,
                error: "Booking date must be between May 10th - 13th, 2022",
            });
        }

        if (req.user.role !== "admin") {
            const existingBookings = await Booking.find({ user: req.user.id });

            const duplicateBooking = existingBookings.find(
                (booking) =>
                    new Date(booking.bookingDate).getTime() ===
                        bookingDate.getTime() &&
                    booking.company.toString() === req.params.companyId
            );

            if (duplicateBooking) {
                return res.status(201).json({
                    success: true,
                    data: duplicateBooking,
                });
            }

            if (existingBookings.length >= 3) {
                return res.status(400).json({
                    success: false,
                    error: "You can only book up to 3 interview sessions",
                });
            }
        }

        req.body.bookingDate = bookingDate;
        const booking = await Booking.create(req.body);

        res.status(201).json({
            success: true,
            data: booking,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Server Error" });
    }
};

// @desc    Get bookings
// @route   GET /api/v1/bookings
// @access  Private
exports.getBookings = async (req, res, next) => {
    try {
        let query;

        if (req.user.role === "admin") {
            query = Booking.find().populate({
                path: "company",
                select: "name address website photoUrl description telephone",
            });
        } else {
            query = Booking.find({ user: req.user.id }).populate({
                path: "company",
                select: "name address website photoUrl description telephone",
            });
        }

        const bookings = await query;

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Server Error" });
    }
};

// @desc    Update booking
// @route   PUT /api/v1/bookings/:id
// @access  Private
exports.updateBooking = async (req, res, next) => {
    try {
        let booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                error: "Booking not found",
            });
        }

        if (
            booking.user.toString() !== req.user.id &&
            req.user.role !== "admin"
        ) {
            return res.status(401).json({
                success: false,
                error: "Not authorized to update this booking",
            });
        }

        booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({
            success: true,
            data: booking,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Server Error" });
    }
};

// @desc    Delete booking
// @route   DELETE /api/v1/bookings/:id
// @access  Private
exports.deleteBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                error: "Booking not found",
            });
        }

        if (
            booking.user.toString() !== req.user.id &&
            req.user.role !== "admin"
        ) {
            return res.status(401).json({
                success: false,
                error: "Not authorized to delete this booking",
            });
        }

        await booking.deleteOne();

        res.status(200).json({
            success: true,
            data: {},
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Server Error" });
    }
};
