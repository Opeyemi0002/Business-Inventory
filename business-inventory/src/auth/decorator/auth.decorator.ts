import { SetMetadata } from '@nestjs/common';
import { AuthType } from '../enum/auth.type';
import { AUTH_TYPE_KEY } from '../constants/user.constant';

export const Auth = (...authTypes: AuthType[]) =>
  SetMetadata(AUTH_TYPE_KEY, authTypes);
