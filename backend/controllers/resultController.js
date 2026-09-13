const Result = require('../models/Result');

// @desc    Add a result
// @route   POST /api/results
// @access  Private (Admin, Teacher)
const addResult = async (req, res) => {
    const { student, course, semester, subject, marksObtained, totalMarks, examType } = req.body;
    try {
        const result = new Result({
            student,
            course,
            semester,
            subject,
            marksObtained,
            totalMarks,
            examType,
            enteredBy: req.user._id,
        });

        const createdResult = await result.save();
        res.status(201).json(createdResult);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Result already exists for this student, subject, and exam type.' });
        }
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get results
// @route   GET /api/results
// @access  Private
const getResults = async (req, res) => {
    const { student, course, semester, subject, examType } = req.query;
    let query = {};
    
    if (student) query.student = student;
    if (course) query.course = course;
    if (semester) query.semester = semester;
    if (subject) query.subject = subject;
    if (examType) query.examType = examType;

    try {
        const results = await Result.find(query)
            .populate('student', 'fullName rollNumber')
            .populate('course', 'name')
            .populate('subject', 'name code')
            .populate('enteredBy', 'name');
            
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update result
// @route   PUT /api/results/:id
// @access  Private (Admin, Teacher)
const updateResult = async (req, res) => {
    try {
        const result = await Result.findById(req.params.id);
        if (result) {
            Object.assign(result, req.body);
            const updatedResult = await result.save();
            res.json(updatedResult);
        } else {
            res.status(404).json({ message: 'Result not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete result
// @route   DELETE /api/results/:id
// @access  Private (Admin, Teacher)
const deleteResult = async (req, res) => {
    try {
        const result = await Result.findById(req.params.id);
        if (result) {
            await result.deleteOne();
            res.json({ message: 'Result removed' });
        } else {
            res.status(404).json({ message: 'Result not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    addResult,
    getResults,
    updateResult,
    deleteResult
};
