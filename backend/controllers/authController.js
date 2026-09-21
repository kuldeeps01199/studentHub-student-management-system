const User = require('../models/User');
const SignupOTP = require('../models/SignupOTP');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res) => {
    const { email, password, role } = req.body;

    try {
        const user = await User.findOne({ email: email ? email.toLowerCase().trim() : email });

        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Strict Role Check
        if (role && user.role !== role) {
            let roleMsg = `Access Denied: You are registered as a ${user.role.toUpperCase()}. Please switch to the ${user.role.toUpperCase()} login tab.`;
            if (role === 'admin' && user.role !== 'admin') {
                roleMsg = `Access Denied: You are registered as a ${user.role.toUpperCase()}. You cannot log in through the Admin portal.`;
            }
            return res.status(403).json({ message: roleMsg });
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Check if an admin account already exists
// @route   GET /api/auth/admin-exists
// @access  Public
const checkAdminExists = async (req, res) => {
    try {
        const adminCount = await User.countDocuments({ role: 'admin' });
        res.json({ exists: adminCount > 0, count: adminCount });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Send OTP to email for Registration verification
// @route   POST /api/auth/send-signup-otp
// @access  Public
const sendSignupOTP = async (req, res) => {
    const { email } = req.body;
    try {
        if (!email) {
            return res.status(400).json({ message: 'Please provide a valid email address.' });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Check if user with this email already exists
        const userExists = await User.findOne({ email: normalizedEmail });
        if (userExists) {
            return res.status(400).json({ message: 'User with this email address already exists. Please log in instead.' });
        }

        // Generate 6-digit numeric OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Upsert SignupOTP record
        await SignupOTP.findOneAndUpdate(
            { email: normalizedEmail },
            { otp, expiresAt },
            { upsert: true, returnDocument: 'after' }
        );

        const messageText = `Your One-Time Password (OTP) for StudentHub account registration is: ${otp}. This code is valid for 10 minutes. Do not share this OTP with anyone.`;

        await sendEmail({
            email: normalizedEmail,
            subject: 'StudentHub - Account Registration Verification Code',
            message: messageText
        });

        res.json({
            message: `Verification OTP sent to ${normalizedEmail}. Please check your email inbox!`,
            otpSent: true,
            debugOTP: process.env.NODE_ENV !== 'production' ? otp : undefined
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Register a new admin
// @route   POST /api/auth/register-admin
// @access  Public
const registerAdmin = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const adminExists = await User.findOne({ role: 'admin' });
        if (adminExists) {
            return res.status(400).json({ message: 'Registration locked: Only one Admin account is allowed in the system.' });
        }

        const userExists = await User.findOne({ email: email.toLowerCase().trim() });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists with this email address' });
        }

        const user = await User.create({
            name: name || (email ? email.split('@')[0] : 'Admin User'),
            email: email.toLowerCase().trim(),
            password,
            role: 'admin',
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Register a new student
// @route   POST /api/auth/register-student
// @access  Public
const registerStudent = async (req, res) => {
    const { email, password, fullName, otp, ...studentData } = req.body;
    try {
        const Student = require('../models/Student');
        const normalizedEmail = email ? email.toLowerCase().trim() : '';
        
        const userExists = await User.findOne({ email: normalizedEmail });
        if (userExists) {
            return res.status(400).json({ message: 'User with this email address already exists. Please log in.' });
        }

        // Verify Signup OTP
        if (!otp) {
            return res.status(400).json({ message: 'Email verification OTP is required for registration. Please click "Send Verification OTP to Email" first.' });
        }

        const signupOTPRecord = await SignupOTP.findOne({ email: normalizedEmail });
        if (!signupOTPRecord || signupOTPRecord.expiresAt < Date.now()) {
            return res.status(400).json({ message: 'Verification OTP has expired or does not exist. Please click "Send Verification OTP" to get a new code.' });
        }

        if (signupOTPRecord.otp !== String(otp).trim()) {
            return res.status(400).json({ message: 'Invalid verification OTP code. Please check your email and try again.' });
        }

        if (!studentData.rollNumber || !studentData.admissionNumber) {
            return res.status(400).json({ message: 'Roll Number and Admission Number are required for verification.' });
        }

        const existingStudent = await Student.findOne({
            $or: [
                { rollNumber: studentData.rollNumber },
                { admissionNumber: studentData.admissionNumber }
            ]
        });
        if (existingStudent) {
            return res.status(400).json({ message: 'Verification Failed: A student with this Roll Number or Admission Number already exists.' });
        }

        // Clean up verified OTP
        await SignupOTP.deleteOne({ _id: signupOTPRecord._id });

        const user = await User.create({
            name: fullName || req.body.name || (email ? email.split('@')[0] : 'Student User'),
            email: normalizedEmail,
            password,
            role: 'student',
        });

        const student = await Student.create({
            ...studentData,
            fullName,
            user: user._id
        });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Register a new teacher
// @route   POST /api/auth/register-teacher
// @access  Public
const registerTeacher = async (req, res) => {
    const { email, password, fullName, employeeId, phone, assignedSubjects, otp } = req.body;
    try {
        const Teacher = require('../models/Teacher');
        const normalizedEmail = email ? email.toLowerCase().trim() : '';
        
        const userExists = await User.findOne({ email: normalizedEmail });
        if (userExists) {
            return res.status(400).json({ message: 'User with this email address already exists. Please log in.' });
        }

        // Verify Signup OTP
        if (!otp) {
            return res.status(400).json({ message: 'Email verification OTP is required for registration. Please click "Send Verification OTP to Email" first.' });
        }

        const signupOTPRecord = await SignupOTP.findOne({ email: normalizedEmail });
        if (!signupOTPRecord || signupOTPRecord.expiresAt < Date.now()) {
            return res.status(400).json({ message: 'Verification OTP has expired or does not exist. Please click "Send Verification OTP" to get a new code.' });
        }

        if (signupOTPRecord.otp !== String(otp).trim()) {
            return res.status(400).json({ message: 'Invalid verification OTP code. Please check your email and try again.' });
        }

        if (!employeeId) {
            return res.status(400).json({ message: 'Employee ID is required for verification.' });
        }

        const existingTeacher = await Teacher.findOne({ employeeId });
        if (existingTeacher) {
            return res.status(400).json({ message: 'Verification Failed: A teacher with this Employee ID already exists.' });
        }

        // Clean up verified OTP
        await SignupOTP.deleteOne({ _id: signupOTPRecord._id });

        const user = await User.create({
            name: fullName || req.body.name || (email ? email.split('@')[0] : 'Teacher User'),
            email: normalizedEmail,
            password,
            role: 'teacher',
        });

        const teacher = await Teacher.create({
            user: user._id,
            fullName,
            employeeId,
            phone,
            assignedSubjects: assignedSubjects || []
        });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Send OTP to user's registered email
// @route   POST /api/auth/send-otp
// @access  Public
const sendOTP = async (req, res) => {
    const { email } = req.body;
    try {
        if (!email) {
            return res.status(400).json({ message: 'Please provide a valid email address.' });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res.status(404).json({ message: 'No account registered with this email address.' });
        }

        // Generate 6-digit numeric OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        user.resetOTP = otp;
        user.resetOTPExpires = expires;
        await user.save();

        const messageText = `Your One-Time Password (OTP) for StudentHub password reset is: ${otp}. This code is valid for 10 minutes. Do not share this OTP with anyone.`;

        await sendEmail({
            email: user.email,
            subject: 'StudentHub - Password Reset OTP Code',
            message: messageText
        });

        res.json({ 
            message: `OTP sent successfully to ${user.email}. Please check your email inbox!`,
            otpSent: true,
            debugOTP: process.env.NODE_ENV !== 'production' ? otp : undefined
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify OTP and reset password
// @route   POST /api/auth/verify-otp-reset-password
// @access  Public
const verifyOTPAndResetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    try {
        if (!email || !otp || !newPassword) {
            return res.status(400).json({ message: 'Email, OTP, and new password are required.' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters long.' });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res.status(404).json({ message: 'No account found with this email address.' });
        }

        if (!user.resetOTP || !user.resetOTPExpires) {
            return res.status(400).json({ message: 'No active OTP request found. Please click "Send OTP to Email" first.' });
        }

        if (user.resetOTPExpires < Date.now()) {
            user.resetOTP = undefined;
            user.resetOTPExpires = undefined;
            await user.save();
            return res.status(400).json({ message: 'OTP code has expired. Please request a new OTP.' });
        }

        if (user.resetOTP !== otp.trim()) {
            return res.status(400).json({ message: 'Invalid OTP code. Please check and try again.' });
        }

        // OTP verified successfully -> Update password
        user.password = newPassword;
        user.resetOTP = undefined;
        user.resetOTPExpires = undefined;
        await user.save();

        res.json({ message: 'Password reset successfully! You can now log in with your new password.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            if (req.body.email && user.role === 'admin') {
                user.email = req.body.email;
            }
            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();

            // Update linked Student or Teacher record
            if (user.role === 'student') {
                const Student = require('../models/Student');
                const student = await Student.findOne({ user: user._id });
                if (student) {
                    if (req.body.name) student.fullName = req.body.name;
                    if (req.body.phone !== undefined) student.phone = req.body.phone;
                    if (req.body.gender && ['Male', 'Female', 'Other'].includes(req.body.gender)) {
                        student.gender = req.body.gender;
                    }
                    if (req.body.dateOfBirth) {
                        student.dateOfBirth = new Date(req.body.dateOfBirth);
                    }
                    if (req.body.address !== undefined) student.address = req.body.address;
                    await student.save();
                }
            } else if (user.role === 'teacher') {
                const Teacher = require('../models/Teacher');
                const teacher = await Teacher.findOne({ user: user._id });
                if (teacher) {
                    if (req.body.name) teacher.fullName = req.body.name;
                    if (req.body.phone !== undefined) teacher.phone = req.body.phone;
                    await teacher.save();
                }
            }

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                token: generateToken(updatedUser._id),
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reset forgotten password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    return verifyOTPAndResetPassword(req, res);
};

module.exports = {
    authUser,
    checkAdminExists,
    sendSignupOTP,
    registerAdmin,
    registerStudent,
    registerTeacher,
    sendOTP,
    verifyOTPAndResetPassword,
    getUserProfile,
    updateUserProfile,
    forgotPassword,
};
