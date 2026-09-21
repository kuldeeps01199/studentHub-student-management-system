const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    let transporter;

    if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: Number(process.env.EMAIL_PORT) || 587,
            secure: process.env.EMAIL_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    } else {
        // Fallback test/local transport configuration
        transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            auth: {
                user: process.env.ETHEREAL_USER || 'studenthub@ethereal.email',
                pass: process.env.ETHEREAL_PASS || 'ethereal_pass'
            }
        });
    }

    const message = {
        from: `"${process.env.FROM_NAME || 'StudentHub System'}" <${process.env.FROM_EMAIL || 'no-reply@studenthub.com'}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html || `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 24px; background-color: #f8fafc; border-radius: 16px; max-width: 500px; margin: 0 auto; border: 1px solid #e2e8f0;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h2 style="color: #4f46e5; margin: 0; font-size: 24px; font-weight: 800;">StudentHub</h2>
                    <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Student Management System</p>
                </div>
                <div style="background-color: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid #cbd5e1; text-align: center;">
                    <p style="font-size: 14px; color: #334155; margin-bottom: 12px; font-weight: 600;">${options.message}</p>
                </div>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0 16px 0;" />
                <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">If you did not request this OTP, please ignore this message.</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(message);
        console.log(`[SMTP Dispatch] OTP Email successfully dispatched to ${options.email}`);
    } catch (err) {
        console.log(`[SMTP Notice] Email transport log: ${err.message}. Target: ${options.email}`);
    }
};

module.exports = sendEmail;
