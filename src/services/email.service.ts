import { Resend } from 'resend';
import { env } from '../config/env';

const clienteEmail = new Resend(env.RESEND_API_KEY);

export const sendVerificationEmail = async (
    to: string,
    name: string,
    token: string
): Promise<void> => {
    // Monto el enlace aquí para no repetir la ruta de verificación en el controlador.
    const linkVerificacion = `${env.FRONTEND_URL}/verify-email/${token}`;

    await clienteEmail.emails.send({
        from: env.EMAIL_FROM,
        to,
        subject: '🍔 Verifica tu cuenta en ComoEnCasa 🇻🇪',
        html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f5f5f5; padding: 20px;">
          <div style="background: #1A1A2E; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: #fff; margin: 0; font-size: 28px;">🔥 ComoEnCasa</h1>
            <p style="color: #aaa; margin: 8px 0 0;">Rivas-Vaciamadrid</p>
          </div>
          <div style="background: #fff; padding: 30px; border-radius: 0 0 12px 12px;">
            <h2 style="color: #1A1A2E;">¡Hola, ${name}! 👋</h2>
            <p style="color: #555;">Gracias por registrarte en ComoEnCasa. Para activar tu cuenta y poder realizar pedidos, verifica tu correo electrónico:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${linkVerificacion}"
                style="background: linear-gradient(135deg, #E94560, #0F3460); color: white; padding: 14px 32px;
                      text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                Verificar mi cuenta
              </a>
            </div>
            <p style="color: #888; font-size: 14px;">Este enlace expirará en 24 horas. Si no creaste esta cuenta, puedes ignorar este email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #aaa; font-size: 12px; text-align: center;">
              ComoEnCasa · Pza. de la Constitución, 2 · Rivas-Vaciamadrid<br>
              📞 610 905 086 · 📸 @comoencasarivas
            </p>
          </div>
        </body>
      </html>
    `,
    });
};

export const sendPasswordResetEmail = async (
    to: string,
    name: string,
    token: string
): Promise<void> => {
    const linkReset = `${env.FRONTEND_URL}/reset-password/${token}`;

    await clienteEmail.emails.send({
        from: env.EMAIL_FROM,
        to,
        subject: '🔑 Recupera tu contraseña de ComoEnCasa 🇻🇪',
        html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f5f5f5; padding: 20px;">
          <div style="background: #1A1A2E; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: #fff; margin: 0; font-size: 28px;">🔥 ComoEnCasa</h1>
            <p style="color: #aaa; margin: 8px 0 0;">Rivas-Vaciamadrid</p>
          </div>
          <div style="background: #fff; padding: 30px; border-radius: 0 0 12px 12px;">
            <h2 style="color: #1A1A2E;">Hola, ${name}</h2>
            <p style="color: #555;">Recibimos una solicitud para restablecer la contraseña de tu cuenta. Haz clic en el botón para crear una nueva contraseña:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${linkReset}"
                style="background: linear-gradient(135deg, #E94560, #0F3460); color: white; padding: 14px 32px;
                      text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                Restablecer contraseña
              </a>
            </div>
            <p style="color: #888; font-size: 14px;">Este enlace expirará en 1 hora. Si no solicitaste este cambio, ignora este email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #aaa; font-size: 12px; text-align: center;">
              ComoEnCasa · Pza. de la Constitución, 2 · Rivas-Vaciamadrid
            </p>
          </div>
        </body>
      </html>
    `,
    });
};
