import { Injectable } from '@nestjs/common';

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

@Injectable()
export class EmailService {
  // In a real implementation, you would use a service like:
  // - SendGrid
  // - AWS SES
  // - Mailgun
  // - Nodemailer with SMTP

  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    const template = this.getWelcomeTemplate(name);
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

  private async sendEmail(to: string, template: EmailTemplate): Promise<void> {
    // Mock implementation - logs to console
    // In production, replace with actual email service
    console.log('📧 Sending email:');
    console.log('To:', to);
    console.log('Subject:', template.subject);
    console.log('HTML:', template.html.substring(0, 100) + '...');

    // Simulate async email sending
    await new Promise(resolve => setTimeout(resolve, 100));
  }

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
  }
}