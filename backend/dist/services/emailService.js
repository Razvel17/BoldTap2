"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = sendEmail;
exports.sendVerificationEmail = sendVerificationEmail;
exports.sendPasswordResetEmail = sendPasswordResetEmail;
exports.sendWelcomeEmail = sendWelcomeEmail;
// Email Service - SendGrid integration
const mail_1 = __importDefault(require("@sendgrid/mail"));
const env_1 = require("../config/env");
// Initialize SendGrid
if (env_1.SENDGRID_API_KEY) {
    mail_1.default.setApiKey(env_1.SENDGRID_API_KEY);
}
/**
 * Send email via SendGrid
 */
async function sendEmail(options) {
    try {
        if (!env_1.SENDGRID_API_KEY) {
            console.warn("⚠️  SendGrid API key not configured. Email not sent.");
            console.warn(`   To: ${options.to}`);
            console.warn(`   Subject: ${options.subject}`);
            return false;
        }
        const msg = {
            to: options.to,
            from: {
                email: env_1.SMTP_FROM_EMAIL,
                name: env_1.SMTP_FROM_NAME,
            },
            subject: options.subject,
            html: options.html,
            text: options.text || "",
        };
        await mail_1.default.send(msg);
        console.log(`✓ Email sent to ${options.to}`);
        return true;
    }
    catch (error) {
        console.error("✗ Error sending email:", error);
        return false;
    }
}
/**
 * Send email verification email
 */
async function sendVerificationEmail(email, verificationLink) {
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Verify Your Email</h2>
      <p>Hello,</p>
      <p>Thank you for registering with BoldTap! Please verify your email address to complete your signup.</p>
      <p style="margin: 30px 0;">
        <a href="${verificationLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Verify Email
        </a>
      </p>
      <p>Or copy this link into your browser:</p>
      <p style="color: #666; word-break: break-all;">${verificationLink}</p>
      <p style="color: #999; font-size: 12px; margin-top: 30px;">
        This link expires in 24 hours. If you didn't create this account, please ignore this email.
      </p>
    </div>
  `;
    return sendEmail({
        to: email,
        subject: "Verify Your BoldTap Email",
        html,
        text: `Verify your email: ${verificationLink}`,
    });
}
/**
 * Send password reset email
 */
async function sendPasswordResetEmail(email, resetLink) {
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Reset Your Password</h2>
      <p>Hello,</p>
      <p>We received a request to reset your password. Click the link below to create a new password.</p>
      <p style="margin: 30px 0;">
        <a href="${resetLink}" style="background-color: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Reset Password
        </a>
      </p>
      <p>Or copy this link into your browser:</p>
      <p style="color: #666; word-break: break-all;">${resetLink}</p>
      <p style="color: #999; font-size: 12px; margin-top: 30px;">
        This link expires in 1 hour. If you didn't request a password reset, please ignore this email.
      </p>
    </div>
  `;
    return sendEmail({
        to: email,
        subject: "Reset Your BoldTap Password",
        html,
        text: `Reset your password: ${resetLink}`,
    });
}
/**
 * Send welcome email
 */
async function sendWelcomeEmail(name, email) {
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Welcome to BoldTap, ${name}!</h2>
      <p>We're excited to have you on board.</p>
      <p>With BoldTap, you can:</p>
      <ul>
        <li>Create NFC business cards</li>
        <li>Manage loyalty programs</li>
        <li>Track customer engagement</li>
      </ul>
      <p>Get started by exploring your dashboard.</p>
      <p style="color: #999; font-size: 12px; margin-top: 30px;">
        Questions? Contact us at support@boldtap.com
      </p>
    </div>
  `;
    return sendEmail({
        to: email,
        subject: "Welcome to BoldTap!",
        html,
    });
}
//# sourceMappingURL=emailService.js.map