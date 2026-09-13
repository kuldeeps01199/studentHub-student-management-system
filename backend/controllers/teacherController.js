const Teacher = require('../models/Teacher');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Get all teachers
// @route   GET /api/teachers
// @access  Private
const getTeachers = async (req, res) => {
    try {
        const teachers = await Teacher.find()
            .populate('user', 'name email role')
            .populate('assignedSubjects')
            .populate('assignedCourses');
        res.json(teachers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a teacher
// @route   POST /api/teachers
// @access  Private (Admin)
const createTeacher = async (req, res) => {
    const { fullName, email, password, employeeId, phone, qualification, designation, assignedSubjects, assignedCourses } = req.body;
    try {
        // Create user account first
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }
        
        const user = await User.create({
            name: fullName || req.body.name || (email ? email.split('@')[0] : 'Teacher User'),
            email,
            password: password || 'teacher123',
            role: 'teacher'
        });

        // Create teacher profile
        const teacher = await Teacher.create({
            user: user._id,
            fullName,
            employeeId,
            phone,
            qualification: qualification || 'Master Degree',
            designation: designation || 'Assistant Professor',
            assignedSubjects: assignedSubjects || [],
            assignedCourses: assignedCourses || []
        });

        res.status(201).json(teacher);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get teacher by ID
// @route   GET /api/teachers/:id
// @access  Private
const getTeacherById = async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id)
            .populate('user', 'name email')
            .populate('assignedSubjects')
            .populate('assignedCourses');
        if (teacher) {
            res.json(teacher);
        } else {
            res.status(404).json({ message: 'Teacher not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a teacher
// @route   PUT /api/teachers/:id
// @access  Private (Admin)
const updateTeacher = async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id);

        if (teacher) {
            Object.assign(teacher, req.body);
            const updatedTeacher = await teacher.save();

            // Update linked User name if provided
            if (req.body.fullName && teacher.user) {
                await User.findByIdAndUpdate(teacher.user, { name: req.body.fullName });
            }

            const populated = await Teacher.findById(updatedTeacher._id)
                .populate('user', 'name email')
                .populate('assignedSubjects')
                .populate('assignedCourses');

            res.json(populated);
        } else {
            res.status(404).json({ message: 'Teacher not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a teacher
// @route   DELETE /api/teachers/:id
// @access  Private (Admin)
const deleteTeacher = async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id);

        if (teacher) {
            await teacher.deleteOne();
            res.json({ message: 'Teacher removed' });
        } else {
            res.status(404).json({ message: 'Teacher not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle Admin power for a teacher
// @route   PUT /api/teachers/:id/toggle-admin
// @access  Private (Admin)
const toggleTeacherAdmin = async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id);
        if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
        const user = await User.findById(teacher.user);
        if (!user) return res.status(404).json({ message: 'User account not found' });

        user.role = user.role === 'admin' ? 'teacher' : 'admin';
        await user.save();

        res.json({ message: `Teacher role updated to ${user.role}`, role: user.role });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getTeachers,
    getTeacherById,
    createTeacher,
    updateTeacher,
    deleteTeacher,
    toggleTeacherAdmin
};
