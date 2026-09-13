const Subject = require('../models/Subject');

// @desc    Get all subjects
// @route   GET /api/subjects
// @access  Private
const getSubjects = async (req, res) => {
    try {
        const subjects = await Subject.find().populate('course', 'name');
        res.json(subjects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a subject
// @route   POST /api/subjects
// @access  Private (Admin)
const createSubject = async (req, res) => {
    try {
        const { name, code, course, semester } = req.body;
        const existing = await Subject.findOne({ code: code.trim().toUpperCase(), course });
        if (existing) {
            return res.status(400).json({ message: `Subject code '${code}' already exists in this course!` });
        }
        const subject = new Subject({ name, code: code.trim().toUpperCase(), course, semester });
        const createdSubject = await subject.save();
        res.status(201).json(createdSubject);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a subject
// @route   PUT /api/subjects/:id
// @access  Private (Admin)
const updateSubject = async (req, res) => {
    try {
        const { name, code, course, semester } = req.body;
        const subject = await Subject.findById(req.params.id);
        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }
        if (code && course) {
            const existing = await Subject.findOne({ 
                code: code.trim().toUpperCase(), 
                course, 
                _id: { $ne: req.params.id } 
            });
            if (existing) {
                return res.status(400).json({ message: `Subject code '${code}' already exists in this course!` });
            }
        }
        if (name) subject.name = name;
        if (code) subject.code = code.trim().toUpperCase();
        if (course) subject.course = course;
        if (semester) subject.semester = semester;
        const updatedSubject = await subject.save();
        res.json(updatedSubject);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a subject
// @route   DELETE /api/subjects/:id
// @access  Private (Admin)
const deleteSubject = async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.id);
        if (subject) {
            await subject.deleteOne();
            res.json({ message: 'Subject removed' });
        } else {
            res.status(404).json({ message: 'Subject not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getSubjects,
    createSubject,
    updateSubject,
    deleteSubject
};
