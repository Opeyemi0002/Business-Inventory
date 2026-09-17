import { forwardRef, Module } from '@nestjs/common';
import { MailService } from './provider/mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/adapters/ejs.adapter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { AuthModule } from '../auth/auth.module';
@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: {
          host: config.get<string>('mail.host'),
          port: config.get<number>('mail.port'),
          secure: false,
          auth: {
            user: config.get<string>('mail.username'),
            pass: config.get<string>('mail.password'),
          },
        },
        default: {
          from: `business inventory <support@businessinventory.com>`,
        },
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new EjsAdapter(),
          options: { strict: false },
        },
      }),
    }),
    forwardRef(() => AuthModule),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
