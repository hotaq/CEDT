const express = require("express");
const {
  getHospital,
  getHospitalById,
  createHospital,
  updateHospital,
  deleteHospital,
} = require("../controllers/hospitals");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");

router
  .route("/")
  .get(getHospital)
  .post(protect, authorize("admin"), createHospital);
router
  .route("/:id")
  .get(getHospitalById)
  .put(protect, authorize("admin"), updateHospital)
  .delete(protect, authorize("admin"), deleteHospital);
module.exports = router;
