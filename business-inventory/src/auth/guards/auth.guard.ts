import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import type { ConfigType } from '@nestjs/config';
import jwtConfig from '../../config/jwt.config';
import { USER_KEY } from '../constants/user.constant';
import { UserService } from '../../user/provider/user.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const token = this.getTokenFromHeaders(request);

    if (!token) {
      throw new UnauthorizedException('Authentication fails');
    }

    const payload = await this.jwtService.verifyAsync(
      token,
      this.jwtConfiguration,
    );
    if (!payload) {
      throw new UnauthorizedException('Authentication fails');
    }
    request[USER_KEY] = payload;

    const findUser = await this.userService.findById(payload.sub);

    if (findUser) {
      return true;
    }
    return false;
  }

  private getTokenFromHeaders(request: Request) {
    const token = request.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Authentiction fails');
    }
    return token;
  }
}
