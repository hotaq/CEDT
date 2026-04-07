const express = require("express");
const {
    addBooking,
    getBookings,
    updateBooking,
    deleteBooking
} = require("../controller/bookings");

const { protect, authorize } = require("../middleware/auth");

const router = express.Router({ mergeParams: true });

router
    .route("/")
    .get(protect, authorize("admin", "user"), getBookings)
    .post(protect, authorize("admin", "user"), addBooking);

router
    .route("/:id")
    .put(protect, authorize("admin", "user"), updateBooking)
    .delete(protect, authorize("admin", "user"), deleteBooking);

module.exports = router;