import {
  Body,
  Controller,
  Post,
  Get,
  Query,
  Res,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './DTOs/create-user.dto';
import { AuthService } from './provider/auth.service';

import { LoginUserDto } from './DTOs/login-user.dto';
import { SetPasswordDto } from './DTOs/set-password.dto';

import { GoogleAuthService } from './google-auth.service';
import { GoogleTokenDto } from './DTOs/google-token.dto';
import { Auth } from './decorator/auth.decorator';
import { AuthType } from './enum/auth.type';

import type { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly googleAuthService: GoogleAuthService,
    private readonly configService: ConfigService,
  ) {}

  @Auth(AuthType.None)
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.registerUser(createUserDto);
  }

  @Auth(AuthType.None)
  @Post('signin')
  async signIn(
    @Body() logInUserDto: LoginUserDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.loginUser(logInUserDto);

    if (!result.data) {
      return result;
    }
    const { refreshToken, ...data } = result.data;
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/auth',
      maxAge: this.configService.getOrThrow<number>('jwt.refreshTTL') * 1000,
    });
    response.setHeader('Cache-Control', 'no-store');
    return { ...result, data };
  }

  @Auth(AuthType.None)
  @Post('google-signin')
  async googleSignIn(
    @Body() googleTokenInDto: GoogleTokenDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.googleAuthService.authenticate(googleTokenInDto);

    if (!result.data) {
      return result;
    }
    const { refreshToken, ...data } = result.data;
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/auth',
      maxAge: this.configService.getOrThrow<number>('jwt.refreshTTL') * 1000,
    });
    response.setHeader('Cache-Control', 'no-store');
    return { ...result, data };
  }
  @Auth(AuthType.None)
  @Get(`verify-email`)
  async emailVerification(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Auth(AuthType.None)
  @Post('set-password')
  async passwordReset(
    @Body() setPasswordDto: SetPasswordDto,
    @Query('token') token: string,
  ) {
    return this.authService.setPassword(setPasswordDto, token);
  }

  @Auth(AuthType.None)
  @Post('/refresh')
  async refreshToken(@Req() request: Request) {
    const getToken = request.cookies?.refreshToken;
    if (!getToken || typeof getToken !== 'string') {
      throw new UnauthorizedException('You are authorized');
    }
    return this.authService.getNewAccessToken(getToken);
  }

  @Auth(AuthType.None)
  @Post('/log-out')
  async applicationLogOut(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies?.refreshToken;
    if (typeof refreshToken !== 'string' || !refreshToken) {
      throw new UnauthorizedException('Invalid or expired token');
    }
    const result = await this.authService.logOut(refreshToken);
    response.clearCookie('refreshToken', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/auth',
    });
    return result;
  }
}
