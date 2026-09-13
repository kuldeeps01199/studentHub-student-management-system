const express = require('express');
const router = express.Router();
const {
    authUser,
    checkAdminExists,
    registerAdmin,
    registerStudent,
    registerTeacher,
    getUserProfile,
    updateUserProfile,
    forgotPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.get('/admin-exists', checkAdminExists);
router.post('/login', authUser);
router.post('/register-admin', registerAdmin);
router.post('/register-student', registerStudent);
router.post('/register-teacher', registerTeacher);
router.post('/forgot-password', forgotPassword);
router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

module.exports = router;
