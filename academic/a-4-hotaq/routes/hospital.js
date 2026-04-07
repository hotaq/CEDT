const express = require('express');
const { getHospital, getHospitalById, createHospital, updateHospital, deleteHospital } = require('../controllers/hospitals')
const router = express.Router();


router.route('/').get(getHospital).post(createHospital)
router.route('/:id').get(getHospitalById).put(updateHospital).delete(deleteHospital)
module.exports = router;