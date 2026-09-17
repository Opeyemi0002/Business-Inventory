import { Body, Controller, Post, Get, Query } from '@nestjs/common';
import { CreateUserDto } from './DTOs/create-user.dto';
import { AuthService } from './provider/auth.service';
import { TokenService } from './provider/token.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
  ) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return await this.authService.registerUser(createUserDto);
  }

  @Get(`verify-email`)
  async emailVerification(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }
}
