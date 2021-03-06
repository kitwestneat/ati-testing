import nodemailer from 'nodemailer';
import { Attachment } from 'nodemailer/lib/mailer';

const EMAIL_TO = process.env.EMAIL_TO || 'admin@pbh-network.com';

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

    const data: any = {
        from: 'admin@pbh-network.com',
        to,
        subject,
        text: body,
    };

    if (attachments && attachments.length > 0) {
        data.attachments = attachments;
    }

    console.log('sending mail to', to, 'subject', subject);

    const transporter = nodemailer.createTransport({ sendmail: true, path: '/usr/sbin/sendmail' });
    await transporter.sendMail(data);
}
