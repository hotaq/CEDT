//@desc Get all hospital
//@route GET /api/v1/hospital
//@access Public

exports.getHospital = (req, res, next) => {
    res.status(200).json({ success: true, msg: 'get all hospital' });
}

//@desc Get single hospital
//@route GET /api/v1/hospital/:id
//@access Public

exports.getHospitalById = (req, res, next) => {
    res.status(200).json({ success: true, msg: `get single hospital ${req.params.id}` });
}

//@desc Create hospital
//@route POST /api/v1/hospital
//@access Public

exports.createHospital = (req, res, next) => {
    res.status(200).json({ success: true, msg: `Create hospital` });
}

//@desc Update single hospital
//@route PUT /api/v1/hospital/:id
//@access Public

exports.updateHospital = (req, res, next) => {
    res.status(200).json({ success: true, msg: `Update hospital ${req.params.id}` });
}

//@desc Delete single hospital
//@route DELETE /api/v1/hospital/:id
//@access Public

exports.deleteHospital = (req, res, next) => {
    res.status(200).json({ success: true, msg: `Delete hospital ${req.params.id}` });
}

