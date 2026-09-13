const express = require('express');
const router = express.Router();
const { 
    markAttendance, 
    getAttendance,
    updateAttendance,
    deleteAttendance
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getAttendance)
    .post(protect, authorize('admin', 'teacher'), markAttendance);

router.route('/:id')
    .put(protect, authorize('admin', 'teacher'), updateAttendance)
    .delete(protect, authorize('admin'), deleteAttendance);

module.exports = router;
