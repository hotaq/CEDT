const Hospital = require("../model/Hostpital");

//@desc Get all hospitals
//@route GET /api/v1/hospitals
//@access Public
exports.getHospital = async (req, res, next) => {
  try {
    const hospitals = await Hospital.find();
    res.status(200).json({
      success: true,
      count: hospitals.length,
      data: hospitals,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

//@desc Get single hospital
//@route GET /api/v1/hospitals/:id
//@access Public
exports.getHospitalById = async (req, res, next) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: `No hospital with id ${req.params.id}`,
      });
    }
    res.status(200).json({ success: true, data: hospital });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

//@desc Create new hospital
//@route POST /api/v1/hospitals
//@access Public
exports.createHospital = async (req, res, next) => {
  try {
    const hospital = await Hospital.create(req.body);
    res.status(201).json({ success: true, data: hospital });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

//@desc Update hospital
//@route PUT /api/v1/hospitals/:id
//@access Public
exports.updateHospital = async (req, res, next) => {
  try {
    const hospital = await Hospital.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: `No hospital with id ${req.params.id}`,
      });
    }
    res.status(200).json({ success: true, data: hospital });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

//@desc Delete hospital
//@route DELETE /api/v1/hospitals/:id
//@access Public
exports.deleteHospital = async (req, res, next) => {
  try {
    const hospital = await Hospital.findByIdAndDelete(req.params.id);
    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: `No hospital with id ${req.params.id}`,
      });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
