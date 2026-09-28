import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthType } from '../enum/auth.type';
import { AuthGuard } from './auth.guard';
import { Reflector } from '@nestjs/core';
import { AUTH_TYPE_KEY } from '../constants/user.constant';
@Injectable()
export class AuthenticationGuard implements CanActivate {
  private static readonly defaultAuthType = AuthType.Bearer;

  private readonly authGuardMap: Record<AuthType, CanActivate | CanActivate[]>;

  constructor(
    private readonly authGuard: AuthGuard,
    private readonly reflector: Reflector,
  ) {
    this.authGuardMap = {
      [AuthType.Bearer]: this.authGuard,
      [AuthType.None]: { canActivate: () => true },
    };
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authTypes = this.reflector.getAllAndOverride<AuthType[]>(
      AUTH_TYPE_KEY,
      [context.getHandler(), context.getClass()],
    ) ?? [AuthenticationGuard.defaultAuthType];
    const guards = authTypes.map((type) => this.authGuardMap[type]).flat();

    for (const instance of guards) {
      try {
        const guard = await Promise.resolve(instance.canActivate(context));

        if (guard) {
          return true;
        }
      } catch (err) {
        if (err instanceof UnauthorizedException) {
          continue;
        }
        throw err;
      }
    }
    throw new UnauthorizedException();
  }
}
