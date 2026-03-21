import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export type SendMailParams = {
  to: string[];
  subject: string;
  text: string;
  html?: string;
};

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private readonly transporter: nodemailer.Transporter | null;
  private readonly fromAddress: string;

  constructor(private configService: ConfigService) {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = Number(this.configService.get<string>('SMTP_PORT') ?? 587);
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');
    const secure = String(this.configService.get<string>('SMTP_SECURE') ?? 'false').toLowerCase() === 'true';

    this.fromAddress = this.configService.get<string>('SMTP_FROM') ?? user ?? 'no-reply@catequese.local';

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
          user,
          pass,
        },
      });
    } else {
      this.transporter = null;
      this.logger.warn('SMTP not configured. Emails will be skipped.');
    }
  }

  async sendMail(params: SendMailParams) {
    if (!this.transporter) {
      return { skipped: true };
    }

    const { to, subject, text, html } = params;

    return this.transporter.sendMail({
      from: this.fromAddress,
      to: to.join(','),
      subject,
      text,
      html,
    });
  }
}
