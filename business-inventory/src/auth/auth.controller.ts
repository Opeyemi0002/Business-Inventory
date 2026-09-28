import { Body, Controller, Post, Get, Query } from '@nestjs/common';
import { CreateUserDto } from './DTOs/create-user.dto';
import { AuthService } from './provider/auth.service';

import { LoginUserDto } from './DTOs/login-user.dto';
import { SetPasswordDto } from './DTOs/set-password.dto';

import { GoogleAuthService } from './google-auth.service';
import { GoogleTokenDto } from './DTOs/google-token.dto';
import { Auth } from './decorator/auth.decorator';
import { AuthType } from './enum/auth.type';
import { RefreshTokenDto } from './DTOs/refresh.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly googleAuthService: GoogleAuthService,
  ) {}

  @Auth(AuthType.None)
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.registerUser(createUserDto);
  }

  @Auth(AuthType.None)
  @Post('signin')
  async signIn(@Body() logInUserDto: LoginUserDto) {
    return this.authService.loginUser(logInUserDto);
  }

  @Auth(AuthType.None)
  @Post('google-signin')
  async googleSignIn(@Body() googleTokenInDto: GoogleTokenDto) {
    return this.googleAuthService.authenticate(googleTokenInDto);
  }

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
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.getNewTokens(refreshTokenDto);
  }
}
