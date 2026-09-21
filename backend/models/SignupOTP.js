const mongoose = require('mongoose');

const signupOTPSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        otp: {
            type: String,
            required: true,
        },
        expiresAt: {
            type: Date,
            required: true,
            expires: 600, // MongoDB TTL index: automatically deletes document after 10 minutes
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('SignupOTP', signupOTPSchema);
