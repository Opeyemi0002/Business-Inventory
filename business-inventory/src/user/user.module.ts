import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './provider/user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { HashService } from '../auth/provider/hash.service';
import { BcryptService } from '../auth/provider/bcrypt.service';
import { MailModule } from '../mail/mail.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => MailModule),
    forwardRef(() => AuthModule),
  ],
  providers: [UserService, { provide: HashService, useClass: BcryptService }],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
