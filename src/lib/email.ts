import nodemailer from 'nodemailer';
import { smtpConfig } from '../config/config';

const transporter = nodemailer.createTransport({
    host: smtpConfig.host,
    port: smtpConfig.port,
    secure: smtpConfig.secure,
    auth: {
        user: smtpConfig.auth.user,
        pass: smtpConfig.auth.pass,
    },
});

// Password Reset Email
export const sendPasswordResetEmail = async (to: string, token: string) => {
    const baseUrl = 'https://test.levant-va.com';
    const resetLink = `${baseUrl}/reset-password?token=${token}`;

    const mailOptions = {
        from: smtpConfig.from,
        to,
        subject: 'Password Reset Request - Levant Virtual Airline',
        html: `
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #d4af37;">Password Reset Request</h2>
                <p>You have requested to reset your password for your Levant Virtual Airline account.</p>
                <p>Please click the link below to reset your password. This link is valid for 60 minutes.</p>
                <p>
                    <a href="${resetLink}" style="background-color: #d4af37; color: #1a1a2e; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Reset Password</a>
                </p>
                <p style="color: #666; font-size: 12px;">Or copy and paste this link: ${resetLink}</p>
                <p style="color: #666;">If you did not request this, please ignore this email.</p>
            </div>
        `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Password reset email sent:', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending password reset email:', error);
        return false;
    }
};

// Registration Pending Activation Email
export const sendPendingActivationEmail = async (to: string, pilotId: string, firstName: string) => {
    const mailOptions = {
        from: smtpConfig.from,
        to,
        subject: 'Registration Received - Levant Virtual Airline',
        html: `
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #d4af37;">Welcome to Levant Virtual Airline!</h2>
                <p>Dear ${firstName},</p>
                <p>Thank you for registering with Levant Virtual Airline. Your pilot ID is <strong>${pilotId}</strong>.</p>
                <p>Your account is currently <strong>pending activation</strong>. Our team will review your application and activate your account shortly.</p>
                <p>You will receive another email once your account has been activated and you can start flying!</p>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                <p style="color: #666; font-size: 12px;">If you have any questions, please contact us via Discord.</p>
                <p style="color: #d4af37; font-weight: bold;">Blue Skies!</p>
                <p style="color: #666;">Levant Virtual Airline Team</p>
            </div>
        `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Pending activation email sent:', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending pending activation email:', error);
        return false;
    }
};

// Account Activated Email
export const sendAccountActivatedEmail = async (to: string, pilotId: string, firstName: string) => {
    const baseUrl = 'https://test.levant-va.com';
    const loginLink = `${baseUrl}/login`;

    const mailOptions = {
        from: smtpConfig.from,
        to,
        subject: 'Account Activated - Levant Virtual Airline',
        html: `
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #d4af37;">Your Account Has Been Activated!</h2>
                <p>Dear ${firstName},</p>
                <p>Great news! Your Levant Virtual Airline account (<strong>${pilotId}</strong>) has been activated.</p>
                <p>You can now log in to the Pilot Portal and start your virtual aviation journey with us!</p>
                <p>
                    <a href="${loginLink}" style="background-color: #d4af37; color: #1a1a2e; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Log In Now</a>
                </p>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                <p><strong>Getting Started:</strong></p>
                <ul>
                    <li>Complete your pilot profile</li>
                    <li>Download the ACARS tracker</li>
                    <li>Book your first flight</li>
                </ul>
                <p style="color: #d4af37; font-weight: bold;">Blue Skies and Happy Flying!</p>
                <p style="color: #666;">Levant Virtual Airline Team</p>
            </div>
        `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Account activated email sent:', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending account activated email:', error);
        return false;
    }
};

// Account Inactive Warning Email (14 Days)
export const sendInactivityReminderEmail = async (to: string, pilotId: string, firstName: string) => {
    const baseUrl = 'https://test.levant-va.com';
    const loginLink = `${baseUrl}/login`;

    const mailOptions = {
        from: smtpConfig.from,
        to,
        subject: 'We Miss You! - Levant Virtual Airline Inactivity Reminder',
        html: `
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #d4af37;">It's Been a While...</h2>
                <p>Dear ${firstName},</p>
                <p>We noticed you haven't completed a flight with Levant Virtual Airline in over 14 days.</p>
                <p>According to our policy, accounts with no activity for 30 days are marked as <strong>Inactive</strong>. We'd love to see you back in the skies before that happens!</p>
                <p>Log in now to browse our current tours or book a new flight via the Dispatch Center.</p>
                <p>
                    <a href="${loginLink}" style="background-color: #d4af37; color: #1a1a2e; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Return to Portal</a>
                </p>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                <p style="color: #d4af37; font-weight: bold;">Blue Skies!</p>
                <p style="color: #666;">Levant Virtual Airline Team</p>
            </div>
        `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Inactivity reminder email sent:', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending inactivity reminder email:', error);
        return false;
    }
};

// Account Inactive Notice (30 Days)
export const sendAccountInactiveEmail = async (to: string, pilotId: string, firstName: string) => {
    const baseUrl = 'https://test.levant-va.com';
    const loginLink = `${baseUrl}/login`;

    const mailOptions = {
        from: smtpConfig.from,
        to,
        subject: 'Account Inactive Notice - Levant Virtual Airline',
        html: `
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #e67e22;">Account Inactive Notice</h2>
                <p>Dear ${firstName},</p>
                <p>We noticed that your Levant Virtual Airline account (<strong>${pilotId}</strong>) has been marked as inactive due to no flight activity.</p>
                <p><strong>Inactivity Policy:</strong></p>
                <ul>
                    <li>New pilots: Must complete a flight within 14 days of registration</li>
                    <li>Active pilots: Must complete a flight every 30 days</li>
                </ul>
                <p>To reactivate your account, simply log in and complete a flight. Your account will automatically be reactivated once we receive your flight report.</p>
                <p>
                    <a href="${loginLink}" style="background-color: #d4af37; color: #1a1a2e; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Log In and Fly</a>
                </p>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                <p style="color: #666;">If you believe this is an error or need assistance, please contact us via Discord.</p>
                <p style="color: #666;">Levant Virtual Airline Team</p>
            </div>
        `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Account inactive email sent:', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending account inactive email:', error);
        return false;
    }
};
