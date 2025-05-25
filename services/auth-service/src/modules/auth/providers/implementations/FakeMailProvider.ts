import { IMailProvider } from '../interfaces/IMailProvider';
import logger from '../../../../utils/logger';

/**
 * FakeMailProvider
 *
 * - 실제 메일을 전송하지 않고, 콘솔 또는 로그에만 기록
 * - 테스트나 개발 환경에서 사용하기 적합
 */
export class FakeMailProvider implements IMailProvider {
  async sendMail({ to, subject, body }: { to: string; subject: string; body: string }): Promise<void> {
    logger.debug(`[FakeMailProvider] 메일 전송 (모의): to=${to}, subject=${subject}`);
    logger.debug(`[FakeMailProvider] 내용:\n${body}`);
  }
}
