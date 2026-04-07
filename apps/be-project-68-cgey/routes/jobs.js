const express = require("express");
const {
    getJobs,
    getJob,
    createJob,
    updateJob,
    deleteJob,
} = require("../controller/jobs");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router({ mergeParams: true });

router
    .route("/")
    .get(getJobs)
    .post(protect, authorize("admin"), createJob);

router
    .route("/:id")
    .get(getJob)
    .put(protect, authorize("admin"), updateJob)
    .delete(protect, authorize("admin"), deleteJob);

module.exports = router;
