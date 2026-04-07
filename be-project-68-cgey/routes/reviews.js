const express = require("express");
const {
    getReviews,
    addReview,
    updateReview,
    deleteReview
} = require("../controller/reviews");

const { protect, authorize } = require("../middleware/auth");

const router = express.Router({ mergeParams: true });

router
    .route("/")
    .get(getReviews)
    .post(protect, authorize("user", "admin"), addReview);

router
    .route("/:id")
    .put(protect, authorize("user", "admin"), updateReview)
    .delete(protect, authorize("user", "admin"), deleteReview);

module.exports = router;
