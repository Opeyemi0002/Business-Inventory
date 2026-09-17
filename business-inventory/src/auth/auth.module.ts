import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './provider/auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { TokenService } from './provider/token.service';
import jwtConfig from '../config/jwt.config';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    forwardRef(() => UserModule),
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync(jwtConfig.asProvider()),
  ],
  providers: [AuthService, TokenService],
  controllers: [AuthController],
  exports: [TokenService],
})
export class AuthModule {}
