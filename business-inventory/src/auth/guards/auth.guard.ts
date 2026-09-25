import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { JsonWebTokenError, JwtService, TokenExpiredError } from '@nestjs/jwt';
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
    try {
      const request = context.switchToHttp().getRequest();

      const getToken = this.getTokenFromHeaders(request);

      if (!getToken) {
        throw new UnauthorizedException('Authentication fails');
      }

      const payload = await this.jwtService.verifyAsync(
        getToken,
        this.jwtConfiguration,
      );
      if (!payload) {
        throw new UnauthorizedException('Authentication fails');
      }
      request[USER_KEY] = payload;

      const findUser = await this.userService.findById(payload.sub);

      if (!findUser) {
        throw new NotFoundException('User not found');
      }
      return true;
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      if (err instanceof TokenExpiredError) {
        throw new UnauthorizedException('Token has expired');
      }
      if (err instanceof JsonWebTokenError) {
        throw new UnauthorizedException('Authentication fails');
      }
      throw new InternalServerErrorException('Internal server error');
    }
  }

  private getTokenFromHeaders(request: Request) {
    const [Bearer, token] = request.headers.authorization?.split(' ') || [];
    if (!token || Bearer?.toLowerCase() !== 'bearer') {
      throw new UnauthorizedException('Authentication fails');
    }
    return token;
  }
}
