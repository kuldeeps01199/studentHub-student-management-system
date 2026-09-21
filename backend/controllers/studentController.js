const Student = require('../models/Student');

// @desc    Get all students
// @route   GET /api/students
// @access  Private
const getStudents = async (req, res) => {
    try {
        const students = await Student.find().populate('user', 'name email').populate('course', 'name');

        if (req.user && req.user.role === 'student') {
            const sanitizedStudents = students.map(s => {
                const isOwner = s.user && String(s.user._id || s.user) === String(req.user._id);
                if (isOwner) {
                    return s;
                } else {
                    return {
                        _id: s._id,
                        fullName: s.fullName,
                        user: {
                            _id: s.user?._id,
                            name: s.user?.name || s.fullName
                        },
                        course: s.course ? { name: s.course.name } : null
                    };
                }
            });
            return res.json(sanitizedStudents);
        }

        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get student by ID
// @route   GET /api/students/:id
// @access  Private
const getStudentById = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id).populate('user', 'name email').populate('course', 'name');
        if (student) {
            if (req.user && req.user.role === 'student') {
                const isOwner = student.user && String(student.user._id || student.user) === String(req.user._id);
                if (!isOwner) {
                    return res.json({
                        _id: student._id,
                        fullName: student.fullName,
                        user: {
                            _id: student.user?._id,
                            name: student.user?.name || student.fullName
                        },
                        course: student.course ? { name: student.course.name } : null
                    });
                }
            }
            res.json(student);
        } else {
            res.status(404).json({ message: 'Student not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a student
// @route   POST /api/students
// @access  Private (Admin, Teacher)
const createStudent = async (req, res) => {
    const { email, password, fullName, ...studentData } = req.body;
    try {
        const User = require('../models/User'); // Import User inside or at top
        
        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // Create user
        const user = await User.create({
            name: fullName || req.body.name || (email ? email.split('@')[0] : 'Student User'),
            email,
            password: password || 'student123',
            role: 'student'
        });

        // Create student
        const student = new Student({
            ...studentData,
            fullName,
            user: user._id
        });
        const createdStudent = await student.save();
        res.status(201).json(createdStudent);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a student
// @route   PUT /api/students/:id
// @access  Private (Admin, Teacher)
const updateStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);

        if (student) {
            Object.assign(student, req.body);
            const updatedStudent = await student.save();
            res.json(updatedStudent);
        } else {
            res.status(404).json({ message: 'Student not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a student
// @route   DELETE /api/students/:id
// @access  Private (Admin)
const deleteStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);

        if (student) {
            await student.deleteOne();
            res.json({ message: 'Student removed' });
        } else {
            res.status(404).json({ message: 'Student not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getStudents,
    getStudentById,
    createStudent,
    updateStudent,
    deleteStudent,
};
