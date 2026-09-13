const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
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

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name: name || fullName || (email ? email.split('@')[0] : 'Admin User'),
            email,
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
    const { email, password, fullName, ...studentData } = req.body;
    try {
        const Student = require('../models/Student');
        
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User with this email already exists' });
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

        const user = await User.create({
            name: fullName || req.body.name || (email ? email.split('@')[0] : 'Student User'),
            email,
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
    const { email, password, fullName, employeeId, phone, assignedSubjects } = req.body;
    try {
        const Teacher = require('../models/Teacher');
        
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        if (!employeeId) {
            return res.status(400).json({ message: 'Employee ID is required for verification.' });
        }

        const existingTeacher = await Teacher.findOne({ employeeId });
        if (existingTeacher) {
            return res.status(400).json({ message: 'Verification Failed: A teacher with this Employee ID already exists.' });
        }

        const user = await User.create({
            name: fullName || req.body.name || (email ? email.split('@')[0] : 'Teacher User'),
            email,
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
            // Admin can change email if needed; for students/teachers, keep email consistent or update if provided
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
                    // Locked fields: rollNumber, admissionNumber, course, semester
                    await student.save();
                }
            } else if (user.role === 'teacher') {
                const Teacher = require('../models/Teacher');
                const teacher = await Teacher.findOne({ user: user._id });
                if (teacher) {
                    if (req.body.name) teacher.fullName = req.body.name;
                    if (req.body.phone !== undefined) teacher.phone = req.body.phone;
                    // Locked fields: employeeId, assignedSubjects
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
    const { email, newPassword } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'No account found with this email address' });
        }
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters long' });
        }
        user.password = newPassword;
        await user.save();
        res.json({ message: 'Password reset successfully! You can now log in with your new password.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    authUser,
    checkAdminExists,
    registerAdmin,
    registerStudent,
    registerTeacher,
    getUserProfile,
    updateUserProfile,
    forgotPassword,
};
