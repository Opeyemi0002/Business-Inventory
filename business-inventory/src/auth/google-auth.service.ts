import {
  HttpException,
  Inject,
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { gaxios, OAuth2Client } from 'google-auth-library';
import type { LoginTicket } from 'google-auth-library';
import googleClientConfig from '../config/google-client.config';
import { GoogleTokenDto } from './DTOs/google-token.dto';
import { UserService } from '../user/provider/user.service';
import { TokenService } from './provider/token.service';

@Injectable()
export class GoogleAuthService {
  private oAuthClient: OAuth2Client;
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
    @Inject(googleClientConfig.KEY)
    private readonly googleConfig: ConfigType<typeof googleClientConfig>,
  ) {
    this.oAuthClient = new OAuth2Client({
      client_secret: this.googleConfig.secret,
      client_id: this.googleConfig.id,
    });
  }

  async authenticate(token: GoogleTokenDto) {
    try {
      if (!this.googleConfig.id) {
        throw new InternalServerErrorException(
          'Google sign-in is not configured',
        );
      }

      let loginTicket: LoginTicket;
      try {
        loginTicket = await this.oAuthClient.verifyIdToken({
          idToken: token.googleToken,
          audience: this.googleConfig.id,
        });
      } catch (err) {
        // A Google/network outage is not an invalid user credential.
        if (
          err instanceof gaxios.GaxiosError ||
          (err instanceof Error &&
            err.message.startsWith(
              'Failed to retrieve verification certificates:',
            ))
        ) {
          throw new ServiceUnavailableException(
            'Google sign-in is temporarily unavailable. Please try again.',
          );
        }
        throw new UnauthorizedException('Invalid or expired Google token');
      }
      const payload = loginTicket.getPayload();

      if (!payload || typeof payload.sub !== 'string' || !payload.sub) {
        throw new UnauthorizedException('Authentication fails');
      }
      const {
        given_name: firstName,
        family_name: lastName,
        email,
        sub: googleId,
      } = payload;
      const findUser = await this.userService.findByGoogleId(googleId);
      if (findUser) {
        const tokens = await this.tokenService.generateToken(findUser);
        return {
          status: 'Success',
          message: 'User login successfully',
          data: {
            firstName: findUser.firstName,
            lastName: findUser.lastName,
            ...tokens,
          },
        };
      }
      if (!email || payload.email_verified !== true) {
        throw new UnauthorizedException('Google Authorization fails');
      }
      const findExistingUser = await this.userService.findByEmail(email);
      if (findExistingUser) {
        if (
          findExistingUser.googleId &&
          findExistingUser.googleId !== googleId
        ) {
          throw new UnauthorizedException(
            'This account is linked to a different Google account',
          );
        }
        await this.userService.updateUser({
          id: findExistingUser.id,
          googleId,
          isEmailVerified: true,
        });

        const tokens = await this.tokenService.generateToken(findExistingUser);
        return {
          status: 'success',
          message: 'User login successfully',
          data: {
            firstName: findExistingUser.firstName,
            lastName: findExistingUser.lastName,
            ...tokens,
          },
        };
      }
      const newGoogleUser = await this.userService.createGoogleUser({
        firstName,
        lastName,
        email,
        googleId,
      });
      const tokens = await this.tokenService.generateToken(newGoogleUser);

      return {
        status: 'success',
        message: 'user login successfully',
        data: {
          firstName: newGoogleUser.firstName,
          lastName: newGoogleUser.lastName,
          ...tokens,
        },
      };
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      throw new InternalServerErrorException('Internal server error');
    }
  }
}
