const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
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
        rollNumber: {
            type: String,
            required: true,
            unique: true,
        },
        admissionNumber: {
            type: String,
            required: true,
            unique: true,
        },
        phone: {
            type: String,
        },
        gender: {
            type: String,
            enum: ['Male', 'Female', 'Other'],
        },
        dateOfBirth: {
            type: Date,
        },
        address: {
            type: String,
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
        profileImage: {
            type: String, // URL to image
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Student', studentSchema);
