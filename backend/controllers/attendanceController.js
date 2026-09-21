const Attendance = require('../models/Attendance');

// @desc    Mark attendance
// @route   POST /api/attendance
// @access  Private (Admin, Teacher)
const markAttendance = async (req, res) => {
    const { date, course, semester, records } = req.body;
    try {
        const queryDate = new Date(date);
        let existing = await Attendance.findOne({ date: queryDate, course, semester });

        if (existing) {
            existing.records = records;
            existing.markedBy = req.user._id;
            const updated = await existing.save();
            return res.json(updated);
        }

        const attendance = new Attendance({
            date: queryDate,
            course,
            semester,
            records,
            markedBy: req.user._id,
        });

        const createdAttendance = await attendance.save();
        res.status(201).json(createdAttendance);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get attendance records
// @route   GET /api/attendance
// @access  Private
const getAttendance = async (req, res) => {
    const { course, semester, date } = req.query;
    let query = {};
    
    if (course) query.course = course;
    if (semester) query.semester = semester;
    if (date) query.date = new Date(date);

    try {
        const attendance = await Attendance.find(query)
            .populate('course', 'name')
            .populate('records.student', 'fullName rollNumber')
            .populate('markedBy', 'name');
            
        if (req.user && req.user.role === 'student') {
            const Student = require('../models/Student');
            const myStudent = await Student.findOne({ user: req.user._id });
            if (!myStudent) {
                return res.json([]);
            }
            const filtered = attendance.map(att => {
                const attObj = att.toObject ? att.toObject() : { ...att };
                attObj.records = (attObj.records || []).filter(r => 
                    String(r.student?._id || r.student) === String(myStudent._id)
                );
                return attObj;
            });
            return res.json(filtered);
        }

        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update attendance record
// @route   PUT /api/attendance/:id
// @access  Private (Admin, Teacher)
const updateAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.findById(req.params.id);
        if (attendance) {
            if (req.body.records) attendance.records = req.body.records;
            if (req.body.date) attendance.date = new Date(req.body.date);
            attendance.markedBy = req.user._id;

            const updatedAttendance = await attendance.save();
            res.json(updatedAttendance);
        } else {
            res.status(404).json({ message: 'Attendance record not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete attendance record
// @route   DELETE /api/attendance/:id
// @access  Private (Admin)
const deleteAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.findById(req.params.id);
        if (attendance) {
            await attendance.deleteOne();
            res.json({ message: 'Attendance record removed' });
        } else {
            res.status(404).json({ message: 'Attendance record not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    markAttendance,
    getAttendance,
    updateAttendance,
    deleteAttendance,
};
