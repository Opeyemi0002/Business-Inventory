import {
  forwardRef,
  HttpException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { ConfigType } from '@nestjs/config';
import jwtConfig from '../../config/jwt.config';
import { User } from '../../user/user.entity';
import { UserService } from '../../user/provider/user.service';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  async emailVerificationUrl(user: User) {
    const baseUrl = `http://localhost:3000`;
    const token = await this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
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
      const baseUrl = `http://localhost:3000`;

      const token = await this.jwtService.signAsync(
        {
          sub: findUser.id,
          email: findUser.email,
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

  async generateToken(user: User) {
    const accessToken = await this.jwtService.signAsync(
      { sub: user.id, email: user.email },
      {
        secret: this.jwtConfiguration.secret,
        issuer: this.jwtConfiguration.issuer,
        audience: this.jwtConfiguration.audience,
        expiresIn: this.jwtConfiguration.expiresIn,
      },
    );
    const refreshToken = await this.jwtService.signAsync(
      { sub: user.id, email: user.email },
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
}
