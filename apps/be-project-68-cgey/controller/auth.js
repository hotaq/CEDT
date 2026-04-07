const mongoose = require("mongoose");
const User = require("../model/User");

// @desc    Register user
// @route   POST /api/v1/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, telephone, email, password, role } = req.body;

    if (!name || !telephone || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "Please provide name, telephone, email, and password",
      });
    }

    const normalizedRole = role || "user";
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      const isSamePassword = await existingUser.matchPassword(password);
      const isSameProfile =
        existingUser.name === name &&
        existingUser.telephone === telephone &&
        existingUser.role === normalizedRole &&
        isSamePassword;

      if (isSameProfile) {
        return res.status(201).json({
          success: true,
          data: existingUser,
        });
      }

      return res.status(400).json({
        success: false,
        error: "Email already exists",
      });
    }

    const user = await User.create({
      name,
      telephone,
      email,
      password,
      role: normalizedRole,
    });

    res.status(201).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/v1/user
// @access  Public
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.find();
    res.status(200).json({
      success: true,
      count: user.length,
      data: user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// @desc    Login user
// @route   POST /api/v1/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "cannot find user" });
    }
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Password is incorrect" });
    }
    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "something went wrong" });
  }
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = user.generateAuthToken();
  const options = {
    expires: new Date(
      Date.now() + parseInt(process.env.JWT_COOKIE_EXPIRE) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }
  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    data: { user, token },
  });
};

// @desc    Logout user
// @route   POST /api/v1/logout
// @access  Private
exports.logout = async (req, res, next) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    data: {},
  });
};

// @desc    Get current logged in user
// @route   GET /api/v1/getme
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
