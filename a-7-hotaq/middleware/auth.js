const jwt = require("jsonwebtoken");
const user = require("../model/User");

exports.protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token || token == 'null') {
    return res
      .status(401)
      .json({ success: false, message: "Not authorized to access this route" });
  }
  try {
    //verifly
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);
    req.user = await user.findById(decoded._id);

    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ success: false, message: "Not authorized" });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({
          success: false,
          message: `User role ${req.user.role} is not authorized`,
        });
    }
    next();
  };
};
