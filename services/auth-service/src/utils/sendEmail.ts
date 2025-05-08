import sgMail from '@sendgrid/mail';

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY!;
const EMAIL_FROM = process.env.EMAIL_FROM!;

sgMail.setApiKey(SENDGRID_API_KEY);

export const sendEmail = async (to: string, subject: string, text: string) => {
  const msg = {
    to,
    from : EMAIL_FROM,
    subject,
    text,
  };

  await sgMail.send(msg);
};
