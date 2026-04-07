const express = require("express");
const { register, getUser, login, logout, getMe } = require("../controller/auth");
const { protect } = require("../middleware/auth");

const router = express.Router();
router.route("/user").get(getUser);
router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").post(protect, logout);
router.route("/getme").get(protect, getMe);

module.exports = router;
