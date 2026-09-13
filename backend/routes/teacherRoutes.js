const express = require('express');
const router = express.Router();
const { 
    getTeachers, 
    getTeacherById, 
    createTeacher, 
    updateTeacher, 
    deleteTeacher,
    toggleTeacherAdmin
} = require('../controllers/teacherController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getTeachers)
    .post(protect, authorize('admin'), createTeacher);

router.put('/:id/toggle-admin', protect, authorize('admin'), toggleTeacherAdmin);

router.route('/:id')
    .get(protect, getTeacherById)
    .put(protect, authorize('admin'), updateTeacher)
    .delete(protect, authorize('admin'), deleteTeacher);

module.exports = router;
