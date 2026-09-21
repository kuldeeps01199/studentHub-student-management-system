const nodemailer = require('nodemailer');

/**
 * Dispatches emails (OTP verification, password reset, etc.)
 * Uses Gmail SMTP by default which sends to ANY recipient email address without domain restrictions.
 */
const sendEmail = async (options) => {
    const emailUser = process.env.EMAIL_USER || 'kuldeepsingh011999@gmail.com';
    const emailPass = process.env.EMAIL_PASS || 'qwht drff vrgc vkew';

    if (!emailUser || !emailPass) {
        throw new Error('Email server is not configured. Please set EMAIL_USER and EMAIL_PASS in environment settings.');
    }

    // Gmail SMTP Configuration — sends to ANY student or recipient address
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: emailUser,
            pass: emailPass,
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    const message = {
        from: `"${process.env.FROM_NAME || 'StudentHub System'}" <${emailUser}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html || buildHtmlTemplate(options.message),
    };

    try {
        await transporter.sendMail(message);
        console.log(`[Gmail SMTP] OTP Email successfully dispatched to ${options.email}`);
    } catch (err) {
        console.error(`[Gmail SMTP Error] Failed to send email to ${options.email}:`, err.message);
        throw new Error(`Failed to send email: ${err.message}`);
    }
};

function buildHtmlTemplate(messageText) {
    return `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 24px; background-color: #f8fafc; border-radius: 16px; max-width: 500px; margin: 0 auto; border: 1px solid #e2e8f0;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: #4f46e5; margin: 0; font-size: 24px; font-weight: 800;">StudentHub</h2>
                <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Student Management System</p>
            </div>
            <div style="background-color: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid #cbd5e1; text-align: center;">
                <p style="font-size: 14px; color: #334155; margin-bottom: 12px; font-weight: 600;">${messageText}</p>
            </div>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0 16px 0;" />
            <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">If you did not request this OTP, please ignore this message.</p>
        </div>
    `;
}

module.exports = sendEmail;
