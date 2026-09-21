const nodemailer = require('nodemailer');
const dns = require('dns');
const https = require('https');

/**
 * Dispatches emails (OTP verification, password reset, etc.)
 * Supports Brevo HTTPS REST API (Port 443 - unblocked on cloud hosts) & Gmail SMTP.
 */
const sendEmail = async (options) => {
    const emailUser = process.env.EMAIL_USER || 'kuldeepsingh011999@gmail.com';
    const emailPass = process.env.EMAIL_PASS || 'qwht drff vrgc vkew';
    const brevoApiKey = process.env.BREVO_API_KEY;

    // Method 1: Brevo HTTPS REST API (Port 443 - Never blocked on Render / Cloud hosting)
    if (brevoApiKey) {
        try {
            await sendBrevoApiEmail(brevoApiKey, emailUser, options);
            console.log(`[Brevo API] OTP Email successfully dispatched to ${options.email}`);
            return;
        } catch (err) {
            console.error(`[Brevo API Error] ${err.message}. Trying Gmail SMTP...`);
        }
    }

    // Method 2: Gmail SMTP (Port 465 SSL with forced IPv4 DNS lookup)
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: emailUser,
                pass: emailPass,
            },
            tls: {
                rejectUnauthorized: false,
            },
            lookup: (hostname, opts, callback) => {
                dns.lookup(hostname, { family: 4 }, callback);
            }
        });

        const message = {
            from: `"${process.env.FROM_NAME || 'StudentHub System'}" <${emailUser}>`,
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: options.html || buildHtmlTemplate(options.message),
        };

        await transporter.sendMail(message);
        console.log(`[Gmail SMTP] OTP Email successfully dispatched to ${options.email}`);
    } catch (err) {
        console.error(`[SMTP Notice] Email delivery attempt: ${err.message}. Target: ${options.email}`);
        // Log notice so registration flow continues smoothly
    }
};

function sendBrevoApiEmail(apiKey, senderEmail, options) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            sender: { name: process.env.FROM_NAME || 'StudentHub System', email: senderEmail },
            to: [{ email: options.email }],
            subject: options.subject,
            htmlContent: options.html || buildHtmlTemplate(options.message),
        });

        const reqOptions = {
            hostname: 'api.brevo.com',
            port: 443,
            path: '/v3/smtp/email',
            method: 'POST',
            headers: {
                'api-key': apiKey,
                'content-type': 'application/json',
                'content-length': Buffer.byteLength(data)
            }
        };

        const req = https.request(reqOptions, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(body);
                } else {
                    reject(new Error(`Brevo API returned status ${res.statusCode}: ${body}`));
                }
            });
        });

        req.on('error', err => reject(err));
        req.write(data);
        req.end();
    });
}

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
