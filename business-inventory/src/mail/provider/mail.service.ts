import {
  forwardRef,
  HttpException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from '../../user/user.entity';
import { TokenService } from '../../auth/provider/token.service';
import { Business } from '../../BusinessTemp/business.entity';
import { baseUrl } from '../../auth/constants/user.constant';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly tokenService: TokenService,
  ) {}
  async sendWelcomeEmail(user: User): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: `Welcome to business-inventory`,
        template: 'welcome',
        context: {
          name: user.firstName,
          verificationLink: await this.tokenService.emailVerificationUrl(user),
        },
      });
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async sendSetNewPassword(user: User) {
    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: `Kindly set your password`,
        template: `password-reset`,
        context: {
          name: user.firstName,
          setPasswordLink: await this.tokenService.setPasswordUrl(user.email),
        },
      });
    } catch (err) {
      throw err;
    }
  }

  async sendBusinessManagerInviteEmail(
    user: User,
    business: Business,
  ): Promise<void> {
    try {
      await this.mailerService.sendMail({
        from: `Customer Care <support@hallfisheries.com>`,
        to: user.email,
        subject: `You are invited to become a Manager in ${business.name}`,
        template: 'business-manager-invite',
        context: {
          name: user.firstName,
          businessName: `${business.name}`,
          invitationLink:
            await this.tokenService.generateNewBusinessManagerTokenUrl(
              user,
              business,
            ),
        },
      });
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async sendNonUserInviteEmail(
    email: string,
    business: Business,
  ): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: email,
        template: '/non-user-business-invite',
        subject: `Invitation to create account`,
        context: {
          businessName: `${business.name}`,
          invitationLink: `${baseUrl}/auth/register`,
        },
      });
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      throw new InternalServerErrorException('Internal server error');
    }
  }
}
