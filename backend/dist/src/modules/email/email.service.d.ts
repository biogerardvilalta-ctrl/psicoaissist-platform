export interface EmailTemplate {
    subject: string;
    html: string;
    text: string;
}
export declare class EmailService {
    sendWelcomeEmail(to: string, name: string): Promise<void>;
    sendSubscriptionConfirmation(to: string, planName: string): Promise<void>;
    sendPasswordReset(to: string, resetToken: string): Promise<void>;
    sendSubscriptionCancellation(to: string): Promise<void>;
    private sendEmail;
    private getWelcomeTemplate;
    private getSubscriptionTemplate;
    private getPasswordResetTemplate;
    private getCancellationTemplate;
}
