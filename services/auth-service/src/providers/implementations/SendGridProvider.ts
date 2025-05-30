// src/modules/auth/providers/implementations/SendGridProvider.ts
import sgMail from '@sendgrid/mail';
import { IMailProvider } from '../interfaces/IMailProvider';
import logger from '../../common/logger';

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY!;
const EMAIL_FROM = process.env.EMAIL_FROM!;

sgMail.setApiKey(SENDGRID_API_KEY);

/**
 * SendGridProvider
 * - SendGrid를 통해 이메일을 전송하는 구현체
 * - IMailProvider를 구현하여 의존성 주입에 대응
 */
export class SendGridProvider implements IMailProvider {
  async sendMail({ to, subject, body }: { to: string; subject: string; body: string }): Promise<void> {
    const msg = {
      to,
      from: EMAIL_FROM,
      subject,
      text: body,
    };

    try {
      await sgMail.send(msg);
      logger.info(`[SendGridProvider] 메일 전송 성공: to=${to}, subject=${subject}`);
    } catch (error: any) {
      logger.error(`[SendGridProvider] 메일 전송 실패: ${error.message}`);
      throw error;
    }
  }
}
