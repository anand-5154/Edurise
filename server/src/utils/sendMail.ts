import nodemailer from "nodemailer"
import dotenv from "dotenv"

dotenv.config()

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})

interface MailOptions {
    to: string;
    subject: string;
    text?: string;
    html?: string;
}

export const sendMail = async (emailOrOptions: string | MailOptions, otp?: string) => {
    let mailOptions;

    if (typeof emailOrOptions === 'string') {
        // Handle old format (email, otp)
        mailOptions = {
            from: process.env.EMAIL_USER,
            to: emailOrOptions,
            subject: 'Verify your Account',
            html: `<p>We received a request to verify your account. Your One-Time Password (OTP) is:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <div style="display: inline-block; background-color: #edf2f7; border: 1px dashed #cbd5e0; border-radius: 6px; padding: 15px 30px;">
                            <span style="font-family: 'Courier New', monospace; font-size: 28px; font-weight: bold; color: #3182ce; letter-spacing: 5px;">${otp}</span>
                        </div>
                    </div>
                    <p style="text-align: center;">This code will expire in 5 minutes.</p>`
        };
    } else {
        // Handle new format (MailOptions)
        mailOptions = {
            from: process.env.EMAIL_USER,
            ...emailOrOptions
        };
    }

    if (!mailOptions.to) {
        throw new Error('No recipients defined');
    }

    await transporter.sendMail(mailOptions);
}