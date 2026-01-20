import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<number>('SMTP_PORT');
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');

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

  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    const template = this.getWelcomeTemplate(name);
    await this.sendEmail(to, template);
  }

  async sendVerificationEmail(to: string, name: string, token: string, plan?: string, interval?: string): Promise<void> {
    const template = this.getVerificationTemplate(name, token, plan, interval);
    await this.sendEmail(to, template);
  }

  async sendSubscriptionConfirmation(to: string, planName: string): Promise<void> {
    const template = this.getSubscriptionTemplate(planName);
    await this.sendEmail(to, template);
  }

  async sendPasswordReset(to: string, resetToken: string): Promise<void> {
    const template = this.getPasswordResetTemplate(resetToken);
    await this.sendEmail(to, template);
  }

  async sendSubscriptionCancellation(to: string): Promise<void> {
    const template = this.getCancellationTemplate();
    await this.sendEmail(to, template);
  }

  async sendSessionReminder(to: string, sessionData: {
    clientName: string;
    date: string;
    time: string;
    type: string
  }): Promise<void> {
    const template = this.getSessionReminderTemplate(sessionData);
    await this.sendEmail(to, template);
  }

  async sendClientSessionReminder(to: string, sessionData: {
    clientName: string;
    professionalName: string;
    date: string;
    time: string
  }): Promise<void> {
    const template = this.getClientSessionReminderTemplate(sessionData);
    await this.sendEmail(to, template);
  }

  async sendOnboardingConfirmation(to: string, name: string): Promise<void> {
    const template = this.getOnboardingTemplate(name);
    await this.sendEmail(to, template);
  }

  async sendDailyUpcomingSessions(to: string, sessions: { time: string; patient: string; type: string }[]): Promise<void> {
    const template = this.getDailySummaryTemplate(sessions);
    await this.sendEmail(to, template);
  }

  private async sendEmail(to: string, template: EmailTemplate): Promise<void> {
    if (!this.transporter) {
      this.logger.warn(`Email sending skipped (no configuration): ${template.subject} -> ${to}`);
      // Fallback to console log for debugging if no transporter
      console.log('📧 [MOCK] Sending email:', to, template.subject);
      return;
    }

    const from = this.configService.get<string>('SMTP_FROM') || 'noreply@psicoaissist.com';

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

  async sendCustomEmail(to: string, subject: string, content: string): Promise<void> {
    const template = this.getCustomMessageTemplate(subject, content);
    await this.sendEmail(to, template);
  }

  private getCustomMessageTemplate(subject: string, content: string): EmailTemplate {
    return {
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Notificación Administrativa</h1>
          </div>
          <div style="padding: 20px; background: #f8f9fa;">
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #333; margin-top: 0;">${subject}</h2>
              <div style="color: #555; line-height: 1.6; white-space: pre-wrap;">${content}</div>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://psicoaissist.com/dashboard" 
                 style="background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Ir al Dashboard
              </a>
            </div>
          </div>
          <div style="background: #eee; padding: 10px; text-align: center; font-size: 12px; color: #777;">
            © 2025 PsicoAIssist. Todos los derechos reservados.
          </div>
        </div>
      `,
      text: `
        ${subject}
        
        ${content}
        
        Soporte PsicoAIssist
      `
    };
  }

  // Existing methods...
  private getWelcomeTemplate(name: string): EmailTemplate {
    return {
      subject: '¡Bienvenido a PsicoAIssist!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">¡Bienvenido a PsicoAIssist!</h1>
          </div>
          <div style="padding: 20px; background: #f8f9fa;">
            <h2 style="color: #333;">Hola ${name},</h2>
            <p style="color: #666; line-height: 1.6;">
              Nos complace darte la bienvenida a PsicoAIssist, tu nuevo asistente de inteligencia artificial 
              para optimizar tu práctica psicológica.
            </p>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333;">¿Qué puedes hacer ahora?</h3>
              <ul style="color: #666;">
                <li>Configura tu perfil profesional</li>
                <li>Explora las funciones de transcripción automática</li>
                <li>Genera tu primer informe con IA</li>
                <li>Familiarízate con las herramientas de análisis</li>
              </ul>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://psicoaissist.com/dashboard" 
                 style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Acceder a mi Dashboard
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">
              Si necesitas ayuda, nuestro equipo está disponible en 
              <a href="mailto:soporte@psicoaissist.com">soporte@psicoaissist.com</a>
            </p>
          </div>
          <div style="background: #333; color: #999; padding: 15px; text-align: center; font-size: 12px;">
            © 2025 PsicoAIssist. Todos los derechos reservados.
          </div>
        </div>
      `,
      text: `
        ¡Bienvenido a PsicoAIssist!
        
        Hola ${name},

        Nos complace darte la bienvenida a PsicoAIssist, tu nuevo asistente de inteligencia artificial 
        para optimizar tu práctica psicológica.

        ¿Qué puedes hacer ahora?
        - Configura tu perfil profesional
        - Explora las funciones de transcripción automática
        - Genera tu primer informe con IA
        - Familiarízate con las herramientas de análisis

        Accede a tu dashboard: https://psicoaissist.com/dashboard

        Si necesitas ayuda, contacta: soporte@psicoaissist.com

        © 2025 PsicoAIssist. Todos los derechos reservados.
      `
    };
  };


  private getVerificationTemplate(name: string, token: string, plan?: string, interval?: string): EmailTemplate {
    const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    let verificationUrl = `${frontendUrl}/auth/verify-email?token=${token}`;
    if (plan) verificationUrl += `&plan=${plan}`;
    if (interval) verificationUrl += `&interval=${interval}`;

    return {
      subject: 'Verifica tu cuenta - PsicoAIssist',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Verifica tu Email</h1>
          </div>
          <div style="padding: 20px; background: #f8f9fa;">
            <h2 style="color: #333;">Hola ${name},</h2>
            <p style="color: #666; line-height: 1.6;">
              Gracias por registrarte en PsicoAIssist. Para comenzar, por favor verifica tu dirección de correo electrónico haciendo clic en el siguiente enlace:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Verificar Email
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">
              Si no has creado una cuenta en PsicoAIssist, puedes ignorar este mensaje.
            </p>
          </div>
          <div style="background: #333; color: #999; padding: 15px; text-align: center; font-size: 12px;">
            © 2025 PsicoAIssist. Todos los derechos reservados.
          </div>
        </div>
      `,
      text: `
        Verifica tu Email - PsicoAIssist
        
        Hola ${name},

        Por favor verifica tu cuenta haciendo clic en el siguiente enlace:
        ${verificationUrl}

        Si no has solicitado esto, ignora este mensaje.
      `
    };
  }

  private getSubscriptionTemplate(planName: string): EmailTemplate {
    return {
      subject: '¡Suscripción activada exitosamente!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">¡Suscripción Confirmada!</h1>
          </div>
          <div style="padding: 20px; background: #f8f9fa;">
            <h2 style="color: #333;">¡Excelente elección!</h2>
            <p style="color: #666; line-height: 1.6;">
              Tu suscripción al <strong>Plan ${planName}</strong> ha sido activada exitosamente.
            </p>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333;">Ahora tienes acceso a:</h3>
              <ul style="color: #666;">
                <li>Transcripción automática ilimitada</li>
                <li>Generación de informes con IA</li>
                <li>Analytics avanzados de tu práctica</li>
                <li>Soporte prioritario</li>
              </ul>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://psicoaissist.com/dashboard" 
                 style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Comenzar ahora
              </a>
            </div>
          </div>
        </div>
      `,
      text: `
        ¡Suscripción Confirmada!

        Tu suscripción al Plan ${planName} ha sido activada exitosamente.

        Ahora tienes acceso completo a todas las funcionalidades.

        Comienza: https://psicoaissist.com/dashboard
      `
    };
  }

  private getPasswordResetTemplate(resetToken: string): EmailTemplate {
    const resetUrl = `https://psicoaissist.com/reset-password?token=${resetToken}`;

    return {
      subject: 'Restablecer contraseña - PsicoAIssist',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #f59e0b; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Restablecer Contraseña</h1>
          </div>
          <div style="padding: 20px; background: #f8f9fa;">
            <p style="color: #666; line-height: 1.6;">
              Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace 
              para crear una nueva contraseña:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Restablecer Contraseña
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">
              Este enlace expirará en 1 hora por seguridad.
              Si no solicitaste este cambio, ignora este email.
            </p>
          </div>
        </div>
      `,
      text: `
        Restablecer Contraseña

        Has solicitado restablecer tu contraseña.

        Restablecer: ${resetUrl}

        Este enlace expira en 1 hora.
      `
    };
  }

  private getCancellationTemplate(): EmailTemplate {
    return {
      subject: 'Suscripción cancelada - PsicoAIssist',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #6b7280; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Suscripción Cancelada</h1>
          </div>
          <div style="padding: 20px; background: #f8f9fa;">
            <p style="color: #666; line-height: 1.6;">
              Tu suscripción ha sido cancelada. Seguirás teniendo acceso hasta el final 
              de tu período actual de facturación.
            </p>
            <p style="color: #666;">
              Esperamos verte de vuelta pronto. Si cambias de opinión, puedes reactivar 
              tu suscripción en cualquier momento.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://psicoaissist.com/pricing" 
                 style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Ver Planes
              </a>
            </div>
          </div>
        </div>
      `,
      text: `
        Suscripción Cancelada

        Tu suscripción ha sido cancelada. Seguirás teniendo acceso hasta el final 
        de tu período actual.

        Reactivar: https://psicoaissist.com/pricing
      `
    };
  }

  private getSessionReminderTemplate(data: { clientName: string; date: string; time: string; type: string }): EmailTemplate {
    return {
      subject: 'Recordatorio de Sesión - PsicoAIssist',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Recordatorio de Sesión</h1>
          </div>
          <div style="padding: 20px; background: #ffff;">
            <p style="color: #333; font-size: 16px;">Hola,</p>
            <p style="color: #555; line-height: 1.6;">
              Tienes una sesión programada para mañana. Aquí están los detalles:
            </p>
            
            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Paciente:</strong> ${data.clientName}</p>
              <p style="margin: 5px 0;"><strong>Fecha:</strong> ${data.date}</p>
              <p style="margin: 5px 0;"><strong>Hora:</strong> ${data.time}</p>
              <p style="margin: 5px 0;"><strong>Tipo:</strong> ${data.type}</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="https://psicoaissist.com/dashboard/sessions" 
                 style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Ver Agenda
              </a>
            </div>
          </div>
          <div style="background: #eee; padding: 10px; text-align: center; font-size: 12px; color: #777;">
            © 2025 PsicoAIssist
          </div>
        </div>
      `,
      text: `
        Recordatorio de Sesión

        Tienes una sesión programada para mañana:
        
        Paciente: ${data.clientName}
        Fecha: ${data.date}
        Hora: ${data.time}
        Tipo: ${data.type}

        Ver agenda: https://psicoaissist.com/dashboard/sessions
      `
    };
  };


  private getClientSessionReminderTemplate(data: { clientName: string; professionalName: string; date: string; time: string }): EmailTemplate {
    return {
      subject: `Recordatorio de cita con ${data.professionalName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Recordatorio de Cita</h1>
          </div>
          <div style="padding: 20px; background: #ffff;">
            <p style="color: #333; font-size: 16px;">Hola ${data.clientName},</p>
            <p style="color: #555; line-height: 1.6;">
              Este es un recordatorio de tu cita programada con <strong>${data.professionalName}</strong>.
            </p>
            
            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Fecha:</strong> ${data.date}</p>
              <p style="margin: 5px 0;"><strong>Hora:</strong> ${data.time}</p>
            </div>
          </div>
          <div style="background: #eee; padding: 10px; text-align: center; font-size: 12px; color: #777;">
            © 2025 PsicoAIssist
          </div>
        </div>
      `,
      text: `
        Recordatorio de Cita
        
        Hola ${data.clientName},
        
        Tienes una cita con ${data.professionalName}:
        
        Fecha: ${data.date}
        Hora: ${data.time}
      `
    };
  }

  private getOnboardingTemplate(name: string): EmailTemplate {
    return {
      subject: 'Pack On-boarding: ¡Empezamos! 🚀',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">¡On-boarding Iniciado!</h1>
          </div>
          <div style="padding: 20px; background: #f8f9fa;">
            <p style="color: #333; font-size: 16px;">Hola ${name},</p>
            <p style="color: #555; line-height: 1.6;">
              Hemos recibido tu contratación del <strong>Pack de On-boarding</strong>. ¡Gracias por confiar en nosotros!
            </p>
            <p style="color: #555; line-height: 1.6;">
              Nuestro equipo técnico ya ha sido notificado y comenzará a preparar tu servidor web personalizado. 
              Este proceso suele tardar entre 24 y 48 horas laborables.
            </p>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6366f1;">
               <h3 style="color: #333; margin-top: 0;">¿Qué sigue?</h3>
               <ul style="color: #666; margin-bottom: 0;">
                 <li>Un técnico asignado revisará tu solicitud.</li>
                 <li>Configuraremos tu entorno dedicado.</li>
                 <li>Te contactaremos por email cuando todo esté listo para entregarte las credenciales de acceso a tu nuevo servidor.</li>
               </ul>
            </div>
            <p style="color: #555; line-height: 1.6;">
              Mientras tanto, puedes seguir utilizando la plataforma con normalidad.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://psicoaissist.com/dashboard" 
                 style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Ir al Dashboard
              </a>
            </div>
          </div>
          <div style="background: #eee; padding: 10px; text-align: center; font-size: 12px; color: #777;">
            © 2025 PsicoAIssist
          </div>
        </div>
      `,
      text: `
        Pack On-boarding: ¡Empezamos!
  
        Hola ${name},
  
        Hemos recibido tu contratación del Pack de On-boarding. Nuestro equipo ya está trabajando en configurar tu servidor web.
  
        Te notificaremos en 24-48h laborables cuando esté listo.
  
        Gracias,
        Equipo de PsicoAIssist
      `
    };
  }

  private getDailySummaryTemplate(sessions: { time: string; patient: string; type: string }[]): EmailTemplate {
    const rows = sessions.map(s => `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 10px;"><strong>${s.time}</strong></td>
        <td style="padding: 10px;">${s.patient}</td>
        <td style="padding: 10px; color: #666;">${s.type}</td>
      </tr>
    `).join('');

    const textRows = sessions.map(s => `- ${s.time}: ${s.patient} (${s.type})`).join('\n');

    return {
      subject: `Resumen de Agenda - Mañana (${sessions.length} visitas)`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Tu Agenda para Mañana</h1>
          </div>
          <div style="padding: 20px; background: #fff;">
            <p style="color: #333; font-size: 16px;">Hola,</p>
            <p style="color: #555; line-height: 1.6;">
              Tienes <strong>${sessions.length} sesiones</strong> programadas para mañana.
            </p>
            
            <div style="background: white; border: 1px solid #eee; border-radius: 8px; overflow: hidden; margin: 20px 0;">
              <table style="width: 100%; border-collapse: collapse; text-align: left;">
                <thead style="background: #f8f9fa;">
                  <tr>
                    <th style="padding: 10px; color: #444;">Hora</th>
                    <th style="padding: 10px; color: #444;">Paciente</th>
                    <th style="padding: 10px; color: #444;">Tipo</th>
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
                Ver Agenda Completa
              </a>
            </div>
          </div>
          <div style="background: #eee; padding: 10px; text-align: center; font-size: 12px; color: #777;">
            © 2025 PsicoAIssist
          </div>
        </div>
      `,
      text: `
        Tu Agenda para Mañana

        Tienes ${sessions.length} sesiones programadas:

        ${textRows}

        Ver agenda: https://psicoaissist.com/dashboard/sessions
      `
    };
  }
}