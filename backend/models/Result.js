const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student',
            required: true,
        },
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
            required: true,
        },
        semester: {
            type: String,
            required: true,
        },
        subject: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subject',
            required: true,
        },
        marksObtained: {
            type: Number,
            required: true,
        },
        totalMarks: {
            type: Number,
            required: true,
            default: 100,
        },
        examType: {
            type: String,
            required: true,
            enum: ['Midterm', 'Final', 'Assignment', 'Quiz'],
            default: 'Final',
        },
        enteredBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Prevent duplicate results for the same student/subject/examType
resultSchema.index({ student: 1, subject: 1, examType: 1 }, { unique: true });

module.exports = mongoose.model('Result', resultSchema);
