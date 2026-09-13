const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        code: {
            type: String,
            required: true,
        },
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
            required: true,
        },
        semester: {
            type: String,
            default: 'Semester 1',
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Subject', subjectSchema);
