import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { USER_KEY } from '../constants/user.constant';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const callerId = request[USER_KEY]?.sub;

    if (typeof callerId !== 'number') {
      throw new UnauthorizedException('Sign in first');
    }

    const superAdminId = this.configService.getOrThrow<number>(
      'database.superAdminId',
    );
    if (callerId !== superAdminId) {
      throw new ForbiddenException(
        'You are not allowed to carry this operation',
      );
    }
    return true;
  }
}
