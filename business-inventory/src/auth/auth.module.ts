import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './provider/auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { TokenService } from './provider/token.service';
import jwtConfig from '../config/jwt.config';
import { ConfigModule } from '@nestjs/config';
import { HashService } from './provider/hash.service';
import { BcryptService } from './provider/bcrypt.service';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => MailModule),
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync(jwtConfig.asProvider()),
  ],
  providers: [
    AuthService,
    TokenService,
    {
      provide: HashService,
      useClass: BcryptService,
    },
  ],
  controllers: [AuthController],
  exports: [TokenService],
})
export class AuthModule {}
