interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}
/**
 * Send email via SendGrid
 */
export declare function sendEmail(options: EmailOptions): Promise<boolean>;
/**
 * Send email verification email
 */
export declare function sendVerificationEmail(email: string, verificationLink: string): Promise<boolean>;
/**
 * Send password reset email
 */
export declare function sendPasswordResetEmail(email: string, resetLink: string): Promise<boolean>;
/**
 * Send welcome email
 */
export declare function sendWelcomeEmail(name: string, email: string): Promise<boolean>;
export {};
//# sourceMappingURL=emailService.d.ts.map