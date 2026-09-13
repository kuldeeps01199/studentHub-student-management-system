const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        fullName: {
            type: String,
            required: true,
        },
        employeeId: {
            type: String,
            required: true,
            unique: true,
        },
        phone: {
            type: String,
        },
        qualification: {
            type: String,
            default: 'Master Degree',
        },
        designation: {
            type: String,
            default: 'Assistant Professor',
        },
        assignedSubjects: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Subject',
            },
        ],
        assignedCourses: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Course',
            },
        ],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Teacher', teacherSchema);
