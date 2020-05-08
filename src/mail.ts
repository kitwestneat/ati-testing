import nodemailer from 'nodemailer';
import { Attachment } from 'nodemailer/lib/mailer';

const EMAIL_TO = process.env.EMAIL_TO || 'kit,alec';

type SendEmailOpts = Partial<{
    subject: string;
    body: string;
    attachments: Attachment[];
    to: string;
}>;

export async function send_email({
    subject,
    body,
    attachments,
    to = EMAIL_TO,
}: SendEmailOpts): Promise<void> {
    if (!body) {
        return;
    }

    console.log('sending mail to', to, 'subject', subject);

    const transporter = nodemailer.createTransport({ sendmail: true });
    await transporter.sendMail({
        from: 'admin',
        to,
        subject,
        text: body,
        attachments,
    });
}
