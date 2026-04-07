const Appointment = require("../model/Appointment");
const Hospital = require("../model/Hostpital");

//@desc Get all appointments
// @route GET /api/appointments
// @access Private
exports.getAppointments = async (req, res) => {
  let query;
  const baseQuery = {};
  if (req.params.hospitalId) {
    baseQuery.hospital = req.params.hospitalId;
  }
  if (req.user.role !== "admin") {
    baseQuery.user = req.user.id;
  }

  query = Appointment.find(baseQuery).populate({
    path: "hospital",
    select: "name province tel",
  });

  try {
    const appointments = await query;
    res
      .status(200)
      .json({ success: true, count: appointments.length, data: appointments });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: "cannot get appointments" });
  }
};

//@desc Get single appointment
// @route GET /api/appointments/:id
// @access Public
exports.getAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate({
      path: "hospital",
      select: "name description  tel",
    });
    if (!appointment) {
      return res
        .status(404)
        .json({ success: false, message: "appointment not found" });
    }
    res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: "cannot get appointment" });
  }
};

//@desc Add single appointment
// @route POST /api/v1/hospitals/:hospitalId/appointments
// @access Private
exports.addAppointment = async (req, res, next) => {
  try {
    req.body.hospital = req.params.hospitalId;
    const hospital = await Hospital.findById(req.params.hospitalId);
    if (!hospital) {
      return res
        .status(404)
        .json({ success: false, message: "hospital not found" });
    }

    req.body.user = req.user.id;
    const existAppointment = await Appointment.find({
      user: req.user.id
    });

    if (existAppointment.length >= 3 && req.user.role != "admin") {
      return res
        .status(400)
        .json({ success: false, message: "you already have an appointment" });
    }



    const appointment = await Appointment.create(req.body);
    res.status(201).json({ success: true, data: appointment });
  } catch (err) {
    console.log(err.stack);
    res.status(500).json({ success: false, message: err.message });
  }
};

//@desc Update appointment
// @route PUT /api/v1/appointments/:id
// @access Private
exports.updateAppointment = async (req, res, next) => {
  try {
    let appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res
        .status(404)
        .json({ success: false, message: "appointment not found" });
    }
    if (appointment.user.toString() != req.user.id && req.user.role != "admin") {
      return res
        .status(401)
        .json({ success: false, message: "not authorized to update this appointment" });
    }
    appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    return res.status(200).json({ success: true, data: appointment });
  } catch (err) {
    console.log(err.stack);
    return res.status(500).json({ success: false, message: err.message });
  }
};

//@desc Delete appointment
// @route DELETE /api/v1/appointments/:id
// @access Private
exports.deleteAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res
        .status(404)
        .json({ success: false, message: "appointment not found" });
    }
    await appointment.deleteOne();
    return res.status(200).json({ success: true, data: {} });
  } catch (err) {
    console.log(err.stack);
    return res.status(500).json({ success: false, message: err.message });
  }
};