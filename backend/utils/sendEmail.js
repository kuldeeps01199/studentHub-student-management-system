const nodemailer = require('nodemailer');
const dns = require('dns');
const https = require('https');

// Send email via Gmail SMTP (delivers to Primary Inbox) with Brevo/Resend HTTPS fallback
const sendEmail = async (options) => {
    const emailUser = process.env.EMAIL_USER || process.env.FROM_EMAIL;
    // Clean spaces from Gmail App Password (e.g. "abcd efgh ijkl mnop" -> "abcdefghijklmnop")
    const rawPass = process.env.EMAIL_PASS || '';
    const emailPass = rawPass.replace(/\s+/g, '');
    const brevoApiKey = process.env.BREVO_API_KEY;
    const resendApiKey = process.env.RESEND_API_KEY;
    const fromName = process.env.FROM_NAME || 'StudentHub System';
    const senderEmail = process.env.FROM_EMAIL || emailUser || 'noreply@studenthub.com';

    // Method 1: Gmail SMTP (Port 465 SSL) - Primary for Instant Inbox Delivery
    if (emailUser && emailPass) {
        try {
            await sendSmtpEmail({
                host: process.env.EMAIL_HOST || 'smtp.gmail.com',
                port: 465,
                secure: true,
                emailUser,
                emailPass,
                fromName,
                senderEmail,
                options
            });
            console.log(`[Gmail SMTP 465] Email delivered to ${options.email}`);
            return { success: true, provider: 'Gmail SMTP (465)' };
        } catch (err465) {
            console.error(`[SMTP 465 Notice] ${err465.message}. Trying SMTP 587...`);
            // Try Port 587 TLS
            try {
                await sendSmtpEmail({
                    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
                    port: 587,
                    secure: false,
                    emailUser,
                    emailPass,
                    fromName,
                    senderEmail,
                    options
                });
                console.log(`[Gmail SMTP 587] Email delivered to ${options.email}`);
                return { success: true, provider: 'Gmail SMTP (587)' };
            } catch (err587) {
                console.error(`[SMTP 587 Notice] ${err587.message}. Trying cloud API fallback...`);
            }
        }
    }

    // Method 2: Brevo HTTPS REST API (Fallback for cloud hosting port blocks)
    if (brevoApiKey) {
        try {
            await sendBrevoApiEmail(brevoApiKey, fromName, senderEmail, options);
            console.log(`[Brevo API] Email sent to ${options.email}`);
            return { success: true, provider: 'Brevo API' };
        } catch (err) {
            console.error(`[Brevo API Error] ${err.message}`);
        }
    }

    // Method 3: Resend HTTPS REST API (Backup cloud provider)
    if (resendApiKey) {
        try {
            await sendResendApiEmail(resendApiKey, fromName, senderEmail, options);
            console.log(`[Resend API] Email sent to ${options.email}`);
            return { success: true, provider: 'Resend API' };
        } catch (err) {
            console.error(`[Resend API Error] ${err.message}`);
        }
    }

    return { success: false, error: 'Failed to send email with all providers' };
};

// Brevo REST API helper
function sendBrevoApiEmail(apiKey, fromName, senderEmail, options) {
    return new Promise((resolve, reject) => {
        const payload = JSON.stringify({
            sender: { name: fromName, email: senderEmail },
            to: [{ email: options.email }],
            subject: options.subject,
            htmlContent: options.html || buildHtmlTemplate(options.message),
            textContent: options.message,
        });

        const reqOptions = {
            hostname: 'api.brevo.com',
            port: 443,
            path: '/v3/smtp/email',
            method: 'POST',
            headers: {
                'api-key': apiKey,
                'content-type': 'application/json',
                'accept': 'application/json',
                'content-length': Buffer.byteLength(payload)
            }
        };

        const req = https.request(reqOptions, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(body);
                } else {
                    reject(new Error(`Brevo status ${res.statusCode}: ${body}`));
                }
            });
        });

        req.setTimeout(5000, () => {
            req.destroy(new Error('Brevo request timeout'));
        });

        req.on('error', err => reject(err));
        req.write(payload);
        req.end();
    });
}

// Resend REST API helper
function sendResendApiEmail(apiKey, fromName, senderEmail, options) {
    return new Promise((resolve, reject) => {
        const payload = JSON.stringify({
            from: `${fromName} <${senderEmail}>`,
            to: [options.email],
            subject: options.subject,
            html: options.html || buildHtmlTemplate(options.message),
            text: options.message,
        });

        const reqOptions = {
            hostname: 'api.resend.com',
            port: 443,
            path: '/emails',
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            }
        };

        const req = https.request(reqOptions, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(body);
                } else {
                    reject(new Error(`Resend status ${res.statusCode}: ${body}`));
                }
            });
        });

        req.setTimeout(5000, () => {
            req.destroy(new Error('Resend request timeout'));
        });

        req.on('error', err => reject(err));
        req.write(payload);
        req.end();
    });
}

// Nodemailer SMTP helper
function sendSmtpEmail({ host, port, secure, emailUser, emailPass, fromName, senderEmail, options }) {
    const transporter = nodemailer.createTransport({
        host: host,
        port: port,
        secure: secure,
        auth: {
            user: emailUser,
            pass: emailPass,
        },
        tls: {
            rejectUnauthorized: false,
        },
        connectionTimeout: 4000,
        greetingTimeout: 4000,
        socketTimeout: 5000,
        lookup: (hostname, opts, callback) => {
            dns.lookup(hostname, { family: 4 }, callback);
        }
    });

    const message = {
        from: `"${fromName}" <${senderEmail}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html || buildHtmlTemplate(options.message),
    };

    return transporter.sendMail(message);
}

// Basic HTML template for email body
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
