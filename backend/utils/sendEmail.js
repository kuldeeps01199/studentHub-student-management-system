const nodemailer = require('nodemailer');

// Try Resend API first (works on Render/Vercel/Railway where SMTP is blocked)
// Falls back to Gmail SMTP for local development
const sendEmail = async (options) => {

    // Method 1: Resend HTTP API (recommended for cloud hosting)
    if (process.env.RESEND_API_KEY) {
        try {
            const { Resend } = require('resend');
            const resend = new Resend(process.env.RESEND_API_KEY);

            const { data, error } = await resend.emails.send({
                from: `${process.env.FROM_NAME || 'StudentHub'} <onboarding@resend.dev>`,
                to: [options.email],
                subject: options.subject,
                text: options.message,
                html: options.html || buildHtmlTemplate(options.message),
            });

            if (error) {
                console.error(`[Resend Error]`, error);
                throw new Error(error.message);
            }

            console.log(`[Resend] Email successfully sent to ${options.email} (ID: ${data?.id})`);
            return;
        } catch (err) {
            console.error(`[Resend Error] ${err.message}`);
            throw new Error(`Failed to send email: ${err.message}`);
        }
    }

    // Method 2: Gmail SMTP (for local development)
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            family: 4,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
            tls: {
                rejectUnauthorized: false,
            },
        });

        const message = {
            from: `"${process.env.FROM_NAME || 'StudentHub System'}" <${process.env.EMAIL_USER}>`,
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: options.html || buildHtmlTemplate(options.message),
        };

        try {
            await transporter.sendMail(message);
            console.log(`[SMTP] Email successfully dispatched to ${options.email}`);
            return;
        } catch (err) {
            console.error(`[SMTP Error] ${err.message}`);
            throw new Error(`Failed to send email: ${err.message}`);
        }
    }

    // No email service configured
    console.log(`[Email] No email service configured. Set RESEND_API_KEY or EMAIL_USER/EMAIL_PASS.`);
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
