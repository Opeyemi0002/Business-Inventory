import { Body, Controller, Post, Get, Query, Patch } from '@nestjs/common';
import { CreateUserDto } from './DTOs/create-user.dto';
import { AuthService } from './provider/auth.service';
import { TokenService } from './provider/token.service';
import { LoginUserDto } from './DTOs/login-user.dto';
import { SetPasswordDto } from './DTOs/set-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.registerUser(createUserDto);
  }

  @Post('signin')
  async signIn(@Body() logInUserDto: LoginUserDto) {
    return this.authService.loginUser(logInUserDto);
  }

  @Get(`verify-email`)
  async emailVerification(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Patch('set-password')
  async passwordReset(
    @Body() setPasswordDto: SetPasswordDto,
    @Query('token') token: string,
  ) {
    return this.authService.setPassword(setPasswordDto, token);
  }
}
