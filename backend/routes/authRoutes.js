const express = require('express');
const router = express.Router();
const {
    authUser,
    checkAdminExists,
    sendSignupOTP,
    verifySignupOTP,
    registerAdmin,
    registerStudent,
    registerTeacher,
    sendOTP,
    verifyOTPAndResetPassword,
    getUserProfile,
    updateUserProfile,
    forgotPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.get('/admin-exists', checkAdminExists);
router.post('/login', authUser);
router.post('/send-signup-otp', sendSignupOTP);
router.post('/verify-signup-otp', verifySignupOTP);
router.post('/register-admin', registerAdmin);
router.post('/register-student', registerStudent);
router.post('/register-teacher', registerTeacher);
router.post('/send-otp', sendOTP);
router.post('/verify-otp-reset-password', verifyOTPAndResetPassword);
router.post('/forgot-password', forgotPassword);
router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

module.exports = router;
