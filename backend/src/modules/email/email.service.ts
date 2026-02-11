import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { I18nService, I18nContext } from 'nestjs-i18n';

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private configService: ConfigService,
    private readonly i18n: I18nService
  ) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const host = this.configService.get<string>('SMTP_HOST') || 'mail.psicoaissist.com';
    const port = this.configService.get<number>('SMTP_PORT') || 587;
    const user = this.configService.get<string>('SMTP_USER') || 'no-reply@psicoaissist.com';
    const pass = this.configService.get<string>('SMTP_PASS') || 'S3gur420vintiDOS!!';

    if (host) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465, // true for 465, false for other ports
        auth: user ? { user, pass } : undefined,
      });
    }
  }

  // Implementation methods...

  async sendWelcomeEmail(to: string, name: string, lang: string = 'es'): Promise<void> {
    const template = this.getWelcomeTemplate(name, lang);
    await this.sendEmail(to, template);
  }

  async sendVerificationEmail(to: string, name: string, token: string, plan?: string, interval?: string, lang: string = 'es'): Promise<void> {
    const template = this.getVerificationTemplate(name, token, plan, interval, lang);
    await this.sendEmail(to, template);
  }

  async sendSubscriptionConfirmation(to: string, planName: string, lang: string = 'es'): Promise<void> {
    const template = this.getSubscriptionTemplate(planName, lang);
    await this.sendEmail(to, template);
  }

  async sendPasswordReset(to: string, resetToken: string, lang: string = 'es'): Promise<void> {
    const template = this.getPasswordResetTemplate(resetToken, lang);
    await this.sendEmail(to, template);
  }

  async sendSubscriptionCancellation(to: string, lang: string = 'es'): Promise<void> {
    const template = this.getCancellationTemplate(lang);
    await this.sendEmail(to, template);
  }

  async sendSessionReminder(to: string, sessionData: {
    clientName: string;
    date: string;
    time: string;
    type: string
  }, lang: string = 'es'): Promise<void> {
    const template = this.getSessionReminderTemplate(sessionData, lang);
    await this.sendEmail(to, template);
  }

  async sendClientSessionReminder(to: string, sessionData: {
    clientName: string;
    professionalName: string;
    date: string;
    time: string
  }, lang: string = 'es'): Promise<void> {
    const template = this.getClientSessionReminderTemplate(sessionData, lang);
    await this.sendEmail(to, template);
  }

  async sendOnboardingConfirmation(to: string, name: string, lang: string = 'es'): Promise<void> {
    const template = this.getOnboardingTemplate(name, lang);
    await this.sendEmail(to, template);
  }

  async sendDailyUpcomingSessions(to: string, sessions: { time: string; patient: string; type: string }[], lang: string = 'es'): Promise<void> {
    const template = this.getDailySummaryTemplate(sessions, lang);
    await this.sendEmail(to, template);
  }

  async sendVideoCallInvitation(to: string, clientName: string, professionalName: string, link: string, lang: string = 'es'): Promise<void> {
    const template = this.getVideoCallTemplate(clientName, professionalName, link, lang);
    await this.sendEmail(to, template);
  }

  private async sendEmail(to: string, template: EmailTemplate): Promise<void> {
    if (!this.transporter) {
      this.logger.warn(`Email sending skipped (no configuration): ${template.subject} -> ${to}`);
      // Fallback to console log for debugging if no transporter
      console.log('📧 [MOCK] Sending email:', to, template.subject);
      return;
    }

    const from = this.configService.get<string>('SMTP_FROM') || '"PsicoAIssist" <no-reply@psicoaissist.com>';

    try {
      await this.transporter.sendMail({
        from,
        to,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });
      this.logger.log(`Email sent successfully: ${template.subject} -> ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error);
      throw error;
    }
  }

  async sendCustomEmail(to: string, subject: string, content: string, lang: string = 'es'): Promise<void> {
    const template = this.getCustomMessageTemplate(subject, content, lang);
    await this.sendEmail(to, template);
  }

  private getCustomMessageTemplate(subject: string, content: string, lang: string = 'es'): EmailTemplate {
    const common = (key: string, args?: any) => this.i18n.translate(`emails.common.${key}`, { lang, args });
    const year = new Date().getFullYear();

    return {
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">PsicoAIssist</h1>
          </div>
          <div style="padding: 20px; background: #f8f9fa;">
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #333; margin-top: 0;">${subject}</h2>
              <div style="color: #555; line-height: 1.6; white-space: pre-wrap;">${content}</div>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://psicoaissist.com/dashboard" 
                 style="background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                ${common('cta_dashboard')}
              </a>
            </div>
            <p style="color: #999; font-size: 11px; margin-top: 10px; text-align: center;">
              ${common('spam_notice')}
            </p>
          </div>
          <div style="background: #eee; padding: 10px; text-align: center; font-size: 12px; color: #777;">
            ${common('copyright', { year })}
          </div>
        </div>
      `,
      text: `
        ${subject}
        
        ${content}
        
        ${common('spam_notice')}

        ${common('support')}
      `
    };
  }

  // Existing methods...
  private getWelcomeTemplate(name: string, lang: string): EmailTemplate {
    const t = (key: string, args?: any) => this.i18n.translate(`emails.welcome.${key}`, { lang, args });
    const common = (key: string, args?: any) => this.i18n.translate(`emails.common.${key}`, { lang, args });
    const year = new Date().getFullYear();

    return {
      subject: t('subject') as string,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">${t('title')}</h1>
          </div>
          <div style="padding: 20px; background: #f8f9fa;">
            <h2 style="color: #333;">${t('greeting', { name })}</h2>
            <p style="color: #666; line-height: 1.6;">
              ${t('intro')}
            </p>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333;">${t('steps_title')}</h3>
              <ul style="color: #666;">
                <li>${t('steps.1')}</li>
                <li>${t('steps.2')}</li>
                <li>${t('steps.3')}</li>
                <li>${t('steps.4')}</li>
              </ul>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://psicoaissist.com/dashboard" 
                 style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                ${t('cta')}
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">
              ${t('help')}
              <a href="mailto:suport@psicoaissist.com">suport@psicoaissist.com</a>
            </p>
            <p style="color: #999; font-size: 11px; margin-top: 10px; text-align: center;">
              ${common('spam_notice')}
            </p>
          </div>
          <div style="background: #333; color: #999; padding: 15px; text-align: center; font-size: 12px;">
            ${common('copyright', { year })}
          </div>
        </div>
      `,
      text: `
        ${t('subject')}
        
        ${t('greeting', { name })}

        ${t('intro')}

        ${t('steps_title')}
        - ${t('steps.1')}
        - ${t('steps.2')}
        - ${t('steps.3')}
        - ${t('steps.4')}

        Dashboard: https://psicoaissist.com/dashboard

        ${t('help')} suport@psicoaissist.com

        ${common('spam_notice')}

        ${common('copyright', { year })}
      `
    };
  };


  private getVerificationTemplate(name: string, token: string, plan?: string, interval?: string, lang: string = 'es'): EmailTemplate {
    const t = (key: string, args?: any) => this.i18n.translate(`emails.verification.${key}`, { lang, args });
    const common = (key: string, args?: any) => this.i18n.translate(`emails.common.${key}`, { lang, args });
    const year = new Date().getFullYear();

    const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    let verificationUrl = `${frontendUrl}/auth/verify-email?token=${token}`;
    if (plan) verificationUrl += `&plan=${plan}`;
    if (interval) verificationUrl += `&interval=${interval}`;

    return {
      subject: t('subject') as string,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">${t('title')}</h1>
          </div>
          <div style="padding: 20px; background: #f8f9fa;">
            <h2 style="color: #333;">${t('greeting', { name })}</h2>
            <p style="color: #666; line-height: 1.6;">
              ${t('message')}
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                ${t('cta')}
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">
              ${t('ignore')}
            </p>
            <p style="color: #999; font-size: 11px; margin-top: 10px; text-align: center;">
              ${common('spam_notice')}
            </p>
          </div>
          <div style="background: #333; color: #999; padding: 15px; text-align: center; font-size: 12px;">
            ${common('copyright', { year })}
          </div>
        </div>
      `,
      text: `
        ${t('subject')}
        
        ${t('greeting', { name })}

        ${t('message')}
        ${verificationUrl}

        ${t('ignore')}

        ${common('spam_notice')}

        ${common('copyright', { year })}
      `
    };
  }

  private getSubscriptionTemplate(planName: string, lang: string = 'es'): EmailTemplate {
    const t = (key: string, args?: any) => this.i18n.translate(`emails.subscription.${key}`, { lang, args });
    const common = (key: string, args?: any) => this.i18n.translate(`emails.common.${key}`, { lang, args });
    const year = new Date().getFullYear();

    return {
      subject: t('subject') as string,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">${t('title')}</h1>
          </div>
          <div style="padding: 20px; background: #f8f9fa;">
            <h2 style="color: #333;">${t('subtitle')}</h2>
            <p style="color: #666; line-height: 1.6;">
              ${t('message', { planName })}
            </p>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333;">${t('features_title')}</h3>
              <ul style="color: #666;">
                <li>${t('features.1')}</li>
                <li>${t('features.2')}</li>
                <li>${t('features.3')}</li>
                <li>${t('features.4')}</li>
              </ul>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://psicoaissist.com/dashboard" 
                 style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                ${t('cta')}
              </a>
            </div>
          </div>
          <div style="background: #333; color: #999; padding: 15px; text-align: center; font-size: 12px;">
            ${common('copyright', { year })}
          </div>
        </div>
      `,
      text: `
        ${t('subject')}

        ${t('message', { planName })}

        ${t('cta')}: https://psicoaissist.com/dashboard

        ${common('spam_notice')}
      `
    };
  }

  private getPasswordResetTemplate(resetToken: string, lang: string = 'es'): EmailTemplate {
    const t = (key: string, args?: any) => this.i18n.translate(`emails.reset_password.${key}`, { lang, args });
    const common = (key: string, args?: any) => this.i18n.translate(`emails.common.${key}`, { lang, args });
    const year = new Date().getFullYear();
    const resetUrl = `https://psicoaissist.com/reset-password?token=${resetToken}`;

    return {
      subject: t('subject') as string,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #f59e0b; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">${t('title')}</h1>
          </div>
          <div style="padding: 20px; background: #f8f9fa;">
            <p style="color: #666; line-height: 1.6;">
              ${t('message')}
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                ${t('cta')}
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">
              ${t('expiry')}
            </p>
            <p style="color: #999; font-size: 11px; margin-top: 10px; text-align: center;">
              ${common('spam_notice')}
            </p>
          </div>
          <div style="background: #333; color: #999; padding: 15px; text-align: center; font-size: 12px;">
            ${common('copyright', { year })}
          </div>
        </div>
      `,
      text: `
        ${t('title')}

        ${t('message')}

        ${t('cta')}: ${resetUrl}

        ${t('expiry')}

        ${common('spam_notice')}
      `
    };
  }

  private getCancellationTemplate(lang: string = 'es'): EmailTemplate {
    const t = (key: string, args?: any) => this.i18n.translate(`emails.cancellation.${key}`, { lang, args });
    const common = (key: string, args?: any) => this.i18n.translate(`emails.common.${key}`, { lang, args });
    const year = new Date().getFullYear();

    return {
      subject: t('subject') as string,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #6b7280; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">${t('title')}</h1>
          </div>
          <div style="padding: 20px; background: #f8f9fa;">
            <p style="color: #666; line-height: 1.6;">
              ${t('message')}
            </p>
            <p style="color: #666;">
              ${t('goodbye')}
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://psicoaissist.com/pricing" 
                 style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                ${t('cta')}
              </a>
            </div>
            <p style="color: #999; font-size: 11px; margin-top: 10px; text-align: center;">
              ${common('spam_notice')}
            </p>
          </div>
          <div style="background: #333; color: #999; padding: 15px; text-align: center; font-size: 12px;">
            ${common('copyright', { year })}
          </div>
        </div>
      `,
      text: `
        ${t('subject')}

        ${t('message')}

        ${t('goodbye')}

        ${t('cta')}: https://psicoaissist.com/pricing

        ${common('spam_notice')}
      `
    };
  }

  private getSessionReminderTemplate(data: { clientName: string; date: string; time: string; type: string }, lang: string = 'es'): EmailTemplate {
    const t = (key: string, args?: any) => this.i18n.translate(`emails.session_reminder.${key}`, { lang, args });
    const common = (key: string, args?: any) => this.i18n.translate(`emails.common.${key}`, { lang, args });
    const year = new Date().getFullYear();

    return {
      subject: t('subject') as string,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">${t('title')}</h1>
          </div>
          <div style="padding: 20px; background: #ffff;">
            <p style="color: #333; font-size: 16px;">${t('greeting')}</p>
            <p style="color: #555; line-height: 1.6;">
              ${t('message')}
            </p>
            
            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>${t('labels.patient')}:</strong> ${data.clientName}</p>
              <p style="margin: 5px 0;"><strong>${t('labels.date')}:</strong> ${data.date}</p>
              <p style="margin: 5px 0;"><strong>${t('labels.time')}:</strong> ${data.time}</p>
              <p style="margin: 5px 0;"><strong>${t('labels.type')}:</strong> ${data.type}</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="https://psicoaissist.com/dashboard/sessions" 
                 style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                ${t('cta')}
              </a>
            </div>
          </div>
          <div style="background: #eee; padding: 10px; text-align: center; font-size: 12px; color: #777;">
            ${common('copyright', { year })}
          </div>
        </div>
      `,
      text: `
        ${t('title')}

        ${t('message')}
        
        ${t('labels.patient')}: ${data.clientName}
        ${t('labels.date')}: ${data.date}
        ${t('labels.time')}: ${data.time}
        ${t('labels.type')}: ${data.type}

        ${t('cta')}: https://psicoaissist.com/dashboard/sessions

        ${common('spam_notice')}
      `
    };
  };


  private getClientSessionReminderTemplate(data: { clientName: string; professionalName: string; date: string; time: string }, lang: string = 'es'): EmailTemplate {
    const t = (key: string, args?: any) => this.i18n.translate(`emails.client_reminder.${key}`, { lang, args });
    const common = (key: string, args?: any) => this.i18n.translate(`emails.common.${key}`, { lang, args });
    const year = new Date().getFullYear();

    return {
      subject: t('subject', { professionalName: data.professionalName }) as string,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">${t('title')}</h1>
          </div>
          <div style="padding: 20px; background: #ffff;">
            <p style="color: #333; font-size: 16px;">${t('greeting', { clientName: data.clientName })}</p>
            <p style="color: #555; line-height: 1.6;">
              ${t('message', { professionalName: data.professionalName })}
            </p>
            
            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>${t('labels.date')}:</strong> ${data.date}</p>
              <p style="margin: 5px 0;"><strong>${t('labels.time')}:</strong> ${data.time}</p>
            </div>
          </div>
          <div style="background: #eee; padding: 10px; text-align: center; font-size: 12px; color: #777;">
            ${common('copyright', { year })}
          </div>
        </div>
      `,
      text: `
        ${t('title')}
        
        ${t('greeting', { clientName: data.clientName })}
        
        ${t('message', { professionalName: data.professionalName })}
        
        ${t('labels.date')}: ${data.date}
        ${t('labels.time')}: ${data.time}

        ${common('spam_notice')}
      `
    };
  }

  private getOnboardingTemplate(name: string, lang: string = 'es'): EmailTemplate {
    const t = (key: string, args?: any) => this.i18n.translate(`emails.onboarding.${key}`, { lang, args });
    const common = (key: string, args?: any) => this.i18n.translate(`emails.common.${key}`, { lang, args });
    const year = new Date().getFullYear();

    return {
      subject: t('subject') as string,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">${t('title')}</h1>
          </div>
          <div style="padding: 20px; background: #f8f9fa;">
            <p style="color: #333; font-size: 16px;">${t('greeting', { name })}</p>
            <p style="color: #555; line-height: 1.6;">
              ${t('message')}
            </p>
            <p style="color: #555; line-height: 1.6;">
              ${t('process')}
            </p>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6366f1;">
               <h3 style="color: #333; margin-top: 0;">${t('next_steps_title')}</h3>
               <ul style="color: #666; margin-bottom: 0;">
                 <li>${t('next_steps.1')}</li>
                 <li>${t('next_steps.2')}</li>
                 <li>${t('next_steps.3')}</li>
               </ul>
            </div>
            <p style="color: #555; line-height: 1.6;">
              ${t('interim')}
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://psicoaissist.com/dashboard" 
                 style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                ${t('cta')}
              </a>
            </div>
            <p style="color: #999; font-size: 11px; margin-top: 10px; text-align: center;">
              ${common('spam_notice')}
            </p>
          </div>
          <div style="background: #eee; padding: 10px; text-align: center; font-size: 12px; color: #777;">
            ${common('copyright', { year })}
          </div>
        </div>
      `,
      text: `
        ${t('subject')}
  
        ${t('greeting', { name })}
  
        ${t('message')}
        ${t('process')}
  
        ${common('support')}

        ${common('spam_notice')}
      `
    };
  }

  private getDailySummaryTemplate(sessions: { time: string; patient: string; type: string }[], lang: string = 'es'): EmailTemplate {
    const t = (key: string, args?: any) => this.i18n.translate(`emails.daily_summary.${key}`, { lang, args });
    const common = (key: string, args?: any) => this.i18n.translate(`emails.common.${key}`, { lang, args });
    const year = new Date().getFullYear();

    const rows = sessions.map(s => `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 10px;"><strong>${s.time}</strong></td>
        <td style="padding: 10px;">${s.patient}</td>
        <td style="padding: 10px; color: #666;">${s.type}</td>
      </tr>
    `).join('');

    const textRows = sessions.map(s => `- ${s.time}: ${s.patient} (${s.type})`).join('\\n');

    return {
      subject: t('subject', { count: sessions.length }) as string,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">${t('title')}</h1>
          </div>
          <div style="padding: 20px; background: #fff;">
            <p style="color: #333; font-size: 16px;">${t('greeting')}</p>
            <p style="color: #555; line-height: 1.6;">
              ${t('message', { count: sessions.length })}
            </p>
            
            <div style="background: white; border: 1px solid #eee; border-radius: 8px; overflow: hidden; margin: 20px 0;">
              <table style="width: 100%; border-collapse: collapse; text-align: left;">
                <thead style="background: #f8f9fa;">
                  <tr>
                    <th style="padding: 10px; color: #444;">${t('table_headers.time')}</th>
                    <th style="padding: 10px; color: #444;">${t('table_headers.patient')}</th>
                    <th style="padding: 10px; color: #444;">${t('table_headers.type')}</th>
                  </tr>
                </thead>
                <tbody>
                  ${rows}
                </tbody>
              </table>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="https://psicoaissist.com/dashboard/sessions" 
                 style="background: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                ${t('cta')}
              </a>
            </div>
            <p style="color: #999; font-size: 11px; margin-top: 10px; text-align: center;">
              ${common('spam_notice')}
            </p>
          </div>
          <div style="background: #eee; padding: 10px; text-align: center; font-size: 12px; color: #777;">
            ${common('copyright', { year })}
          </div>
        </div>
      `,
      text: `
        ${t('title')}

        ${t('message', { count: sessions.length })}

        ${textRows}

        ${t('cta')}: https://psicoaissist.com/dashboard/sessions

        ${common('spam_notice')}
      `
    };
  }

  private getVideoCallTemplate(clientName: string, professionalName: string, link: string, lang: string = 'es'): EmailTemplate {
    const t = (key: string, args?: any) => this.i18n.translate(`emails.video_call.${key}`, { lang, args });
    const common = (key: string, args?: any) => this.i18n.translate(`emails.common.${key}`, { lang, args });

    return {
      subject: t('subject', { professionalName }) as string,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>${t('greeting', { clientName })}</h2>
          <p>${t('message', { professionalName })}</p>
          <p>${t('instruction')}</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${link}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              ${t('cta')}
            </a>
          </div>
          <p>${t('fallback')}</p>
          <p style="word-break: break-all; color: #666;">${link}</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
          <p style="color: #888; font-size: 12px;">${t('footer')}</p>
          <p style="color: #999; font-size: 11px; margin-top: 10px; text-align: center;">
            ${common('spam_notice')}
          </p>
        </div>
      `,
      text: `${t('greeting', { clientName })}\n\n${t('message', { professionalName })}\n\n${t('instruction')}: ${link}\n\n${common('spam_notice')}\n\n${common('support')}`
    };
  }
}