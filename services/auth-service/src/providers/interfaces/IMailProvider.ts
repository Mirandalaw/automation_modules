/**
 * IMailProvider
 *
 * 외부 이메일 서비스와의 통신을 담당하는 추상 인터페이스.
 * - 메일 전송에 필요한 기본 정보(subject, body, recipient 등)를 정의함
 * - 구현체는 SMTP, SendGrid, Mailgun 등으로 다양하게 가능
 */
export interface IMailProvider {
  sendMail(params: {
    to: string;
    subject: string;
    body: string;
  }): Promise<void>;
}
