import {
  forwardRef,
  HttpException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { createHash, randomUUID } from 'node:crypto';
import { JsonWebTokenError, JwtService } from '@nestjs/jwt';
import type { ConfigType } from '@nestjs/config';
import jwtConfig from '../../config/jwt.config';
import { Business } from '../../BusinessTemp/business.entity';
import { User } from '../../user/user.entity';
import { UserService } from '../../user/provider/user.service';
import { baseUrl } from '../constants/user.constant';

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);
  constructor(
    private readonly jwtService: JwtService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  async emailVerificationUrl(user: User) {
    const token = await this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
        purpose: 'email-verification',
      },
      {
        secret: this.jwtConfiguration.secret,
        issuer: this.jwtConfiguration.issuer,
        audience: this.jwtConfiguration.audience,
        expiresIn: this.jwtConfiguration.refreshTTL,
      },
    );

    return `${baseUrl}/auth/verify-email/?token=${token}`;
  }

  async setPasswordUrl(email: string) {
    try {
      const findUser = await this.userService.findByEmail(email);
      if (!findUser) {
        throw new NotFoundException('User not found');
      }

      const token = await this.jwtService.signAsync(
        {
          sub: findUser.id,
          email: findUser.email,
          purpose: 'password-setup',
          passwordResetVersion: findUser.passwordResetVersion,
        },
        {
          secret: this.jwtConfiguration.secret,
          issuer: this.jwtConfiguration.issuer,
          audience: this.jwtConfiguration.audience,
          expiresIn: this.jwtConfiguration.refreshTTL,
        },
      );
      return `${baseUrl}/auth/set-password/?token=${token}`;
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async generateTokens(user: User) {
    const accessToken = await this.jwtService.signAsync(
      { sub: user.id, email: user.email, purpose: 'access' },
      {
        secret: this.jwtConfiguration.secret,
        issuer: this.jwtConfiguration.issuer,
        audience: this.jwtConfiguration.audience,
        expiresIn: this.jwtConfiguration.expiresIn,
      },
    );
    const refreshToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
        purpose: 'refresh',
        jti: randomUUID(),
      },
      {
        secret: this.jwtConfiguration.secret,
        issuer: this.jwtConfiguration.issuer,
        audience: this.jwtConfiguration.audience,
        expiresIn: this.jwtConfiguration.refreshTTL,
      },
    );
    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }

  async generateNewAccessToken(user: User) {
    const accessToken = await this.jwtService.signAsync(
      { sub: user.id, email: user.email, purpose: 'access' },
      {
        secret: this.jwtConfiguration.secret,
        issuer: this.jwtConfiguration.issuer,
        audience: this.jwtConfiguration.audience,
        expiresIn: this.jwtConfiguration.expiresIn,
      },
    );

    return {
      accessToken: accessToken,
    };
  }

  async refreshTokenHash(token: string) {
    try {
      const result = createHash('sha256').update(token).digest('hex');

      return result;
    } catch (err) {
      this.logger.error('', err instanceof Error ? err.stack : undefined);
      throw new InternalServerErrorException('Unexpected error occur');
    }
  }

  async generateNewBusinessManagerTokenUrl(user: User, business: Business) {
    try {
      const token = await this.jwtService.signAsync(
        {
          sub: user.id,
          businessId: business.id,
          email: user.email,
          permission: 'manager',
          purpose: 'invite-manager',
        },
        {
          secret: this.jwtConfiguration.secret,
          issuer: this.jwtConfiguration.issuer,
          audience: this.jwtConfiguration.audience,
          expiresIn: this.jwtConfiguration.businessInvite,
        },
      );

      return `${baseUrl}/business/user/manager/verify/?token=${token}`;
    } catch (err) {
      if (err instanceof JsonWebTokenError) {
        throw new UnauthorizedException('Expired or invalid token');
      }
      this.logger.error(
        'Token related error',
        err instanceof Error ? err.stack : undefined,
      );
      throw new InternalServerErrorException('Unexpected error occur');
    }
  }
}
