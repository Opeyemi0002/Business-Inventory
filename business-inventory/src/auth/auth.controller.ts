import { Body, Controller, Post, Get, Query } from '@nestjs/common';
import { CreateUserDto } from './DTOs/create-user.dto';
import { AuthService } from './provider/auth.service';

import { LoginUserDto } from './DTOs/login-user.dto';
import { SetPasswordDto } from './DTOs/set-password.dto';
import { GoogleDataDto } from '../user/Dtos/create-google-user.dto';
import { GoogleAuthService } from './google-auth.service';
import { GoogleTokenDto } from './DTOs/google-token.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly googleAuthService: GoogleAuthService,
  ) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.registerUser(createUserDto);
  }

  @Post('signin')
  async signIn(@Body() logInUserDto: LoginUserDto) {
    return this.authService.loginUser(logInUserDto);
  }
  @Post('google-signin')
  async googleSignIn(@Body() googleTokenInDto: GoogleTokenDto) {
    return this.googleAuthService.authenticate(googleTokenInDto);
  }

  @Get(`verify-email`)
  async emailVerification(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('set-password')
  async passwordReset(
    @Body() setPasswordDto: SetPasswordDto,
    @Query('token') token: string,
  ) {
    return this.authService.setPassword(setPasswordDto, token);
  }
}
