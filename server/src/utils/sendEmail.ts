import nodemailer from 'nodemailer';

interface SendOtpEmailOptions {
  to: string;
  name: string;
  otpCode: string;
}

export const sendOtpEmail = async ({ to, name, otpCode }: SendOtpEmailOptions): Promise<boolean> => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  const htmlContent = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      <div style="background-color: #2563eb; padding: 32px 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 2px;">VINFAST ELECTRIC AUTO</h1>
        <p style="color: #bfdbfe; margin-top: 8px; font-size: 14px; font-weight: 500;">Xác Thực Tài Khoản Hội Viên</p>
      </div>
      <div style="padding: 32px 24px; color: #1e293b;">
        <p style="font-size: 16px; font-weight: 600; margin-top: 0;">Xin chào <strong style="color: #2563eb;">${name}</strong>,</p>
        <p style="font-size: 14px; color: #64748b; line-height: 1.6;">Cảm ơn bạn đã đăng ký tài khoản hội viên tại hệ thống ô tô điện VinFast. Để hoàn tất đăng ký, vui lòng sử dụng mã OTP xác thực dưới đây:</p>
        
        <div style="background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
          <span style="font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 8px;">MÃ XÁC THỰC OTP CỦA BẠN</span>
          <span style="font-family: monospace; font-size: 32px; font-weight: 900; color: #2563eb; letter-spacing: 8px;">${otpCode}</span>
        </div>

        <p style="font-size: 13px; color: #ef4444; font-weight: 500; text-align: center;">⏱️ Mã OTP có hiệu lực trong vòng <strong>10 phút</strong>. Vui lòng không chia sẻ mã này cho bất kỳ ai.</p>
      </div>
      <div style="background-color: #f1f5f9; padding: 16px 24px; text-align: center; font-size: 12px; color: #94a3b8;">
        <p style="margin: 0;">© 2026 VinFast Auto. Tất cả quyền được bảo lưu.</p>
      </div>
    </div>
  `;

  // 1. Try sending via configured Gmail / SMTP
  if (emailUser && emailPass && !emailUser.includes('demo') && !emailPass.includes('demo')) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: Number(process.env.EMAIL_PORT) || 587,
        secure: Number(process.env.EMAIL_PORT) === 465,
        auth: {
          user: emailUser.trim(),
          pass: emailPass.replace(/\s+/g, ''), // Gmail App Password ignores internal spaces
        },
      });

      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM || `"VinFast Auto" <${emailUser}>`,
        to,
        subject: `[VinFast Auto] Mã xác thực OTP đăng ký tài khoản: ${otpCode}`,
        html: htmlContent,
      });

      console.log(`[EMAIL GMAIL] 📩 Đã gửi Email OTP tới hòm thư Gmail [${to}]. MessageId: ${info.messageId}`);
      return true;
    } catch (smtpErr: any) {
      console.warn(`[EMAIL WARNING] Gửi qua Gmail SMTP không thành công (${smtpErr.message}). Đang dùng chế độ thử nghiệm Ethereal Email...`);
    }
  }

  // 2. Fallback Ethereal test mailer for instant delivery preview
  try {
    const testAccount = await nodemailer.createTestAccount();
    const testTransporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    const info = await testTransporter.sendMail({
      from: '"VinFast Auto" <no-reply@vinfast.vn>',
      to,
      subject: `[VinFast Auto] Mã xác thực OTP đăng ký tài khoản: ${otpCode}`,
      html: htmlContent,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log(`[EMAIL TEST] 📩 Đã gửi thư thử nghiệm tới [${to}]`);
    if (previewUrl) {
      console.log(`[EMAIL TEST] 🔗 Mở link này để xem nội dung Email: ${previewUrl}`);
    }
    return true;
  } catch (err) {
    console.error('[EMAIL ERROR] Thất bại khi gửi email:', err);
    return false;
  }
};

// Generic sendEmail for order and testDrive notifications
export const sendEmail = async (options: { email: string; subject: string; message: string; html?: string }): Promise<boolean> => {
  return sendOtpEmail({
    to: options.email,
    name: 'Khách hàng',
    otpCode: options.message,
  });
};

export default sendEmail;
