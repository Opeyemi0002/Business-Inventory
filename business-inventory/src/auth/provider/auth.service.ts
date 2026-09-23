import {
  BadRequestException,
  ConflictException,
  forwardRef,
  HttpException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService, JsonWebTokenError } from '@nestjs/jwt';
import { UserService } from '../../user/provider/user.service';
import { CreateUserDto } from '../DTOs/create-user.dto';
import type { ConfigType } from '@nestjs/config';
import jwtConfig from '../../config/jwt.config';
import { LoginUserDto } from '../DTOs/login-user.dto';
import { HashService } from './hash.service';
import { SetPasswordDto } from '../DTOs/set-password.dto';
import { MailService } from '../../mail/provider/mail.service';
import { TokenService } from './token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly hashService: HashService,
    private readonly jwtService: JwtService,
    private readonly tokenService: TokenService,
    @Inject(forwardRef(() => MailService))
    private readonly mailService: MailService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  async registerUser(createUserDto: CreateUserDto) {
    try {
      const findUser = await this.userService.findByEmail(createUserDto.email);
      if (findUser) {
        throw new ConflictException('Invalid details');
      }

      const createUser = await this.userService.createUser(createUserDto);
      return createUser;
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }

      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  async loginUser(logInUserDto: LoginUserDto) {
    try {
      //query the data to check if email exists,
      const findUser = await this.userService.findByEmail(logInUserDto.email);
      //if it doesn't exist, throw a conflictexception
      if (!findUser) {
        throw new ConflictException('Invalid details');
      }
      //if it exist, compare the encrypted password to see if it pass
      if (!findUser.password) {
        if (findUser.googleId) {
          await this.mailService.sendSetNewPassword(findUser);
          return { message: 'please check your email to set a new password' };
        }
        throw new BadRequestException('error signing in');
      }
      const verifyPassword = await this.hashService.comparePassword(
        logInUserDto.password,
        findUser.password,
      );
      if (!verifyPassword) {
        throw new ConflictException('Invalid details');
      }
      if (!findUser.isEmailVerified) {
        await this.mailService.sendWelcomeEmail(findUser);
        return {
          message: 'we have sent you an email for verification',
        };
      }
      return {
        status: 'success',
        message: 'User login succesfully',
        data: {
          firstName: findUser.firstName,
          lastname: findUser.lastName,
          ...(await this.tokenService.generateToken(findUser)),
        },
      };
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async verifyEmail(token: string) {
    try {
      //extract the email or id from token
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.jwtConfiguration.secret,
        issuer: this.jwtConfiguration.issuer,
        audience: this.jwtConfiguration.audience,
      });
      if (!payload || payload.purpose !== 'email-verification') {
        throw new UnauthorizedException('Email verification fails');
      }
      //search the id through the database
      const findUser = await this.userService.findById(payload.sub);

      // isEmailVerified changed to true
      if (!findUser) {
        throw new NotFoundException('User not found');
      }
      if (findUser.isEmailVerified) {
        throw new ConflictException('Email verified already');
      }
      findUser.isEmailVerified = true;
      await this.userService.updateUser({
        id: findUser.id,
        isEmailVerified: true,
      });
      return { status: 'success', message: 'email verified successfully' };
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      if (err instanceof JsonWebTokenError) {
        throw new UnauthorizedException(
          'Invalid or expired email verification link',
        );
      }
      throw new InternalServerErrorException('problem verifying your email');
    }
  }
  async setPassword(setPasswordDto: SetPasswordDto, token: string) {
    try {
      //extract email from token and find the email, if email is not found throw exception
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.jwtConfiguration.secret,
        issuer: this.jwtConfiguration.issuer,
        audience: this.jwtConfiguration.audience,
      });
      if (!payload || payload.purpose !== 'password-setup') {
        throw new UnauthorizedException('User password authentiction fails');
      }
      const findUser = await this.userService.findByEmail(payload.email);
      if (!findUser) {
        throw new NotFoundException('User not found');
      }
      //if email found, hash the password and save to the database
      if (payload.passwordResetVersion !== findUser.passwordResetVersion) {
        throw new ConflictException(
          'This password link is no longer valid. Please request a new one.',
        );
      }
      const passwordHash = await this.hashService.hashPassword(
        setPasswordDto.password,
      );
      await this.userService.savePasswordWithLock(
        findUser.id,
        passwordHash,
        payload.passwordResetVersion,
      );

      return {
        status: 'success',
        message: 'password updated successfully',
      };
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      if (err instanceof JsonWebTokenError) {
        throw new UnauthorizedException('Invalid or expired password link');
      }
      throw new InternalServerErrorException('Internal server error');
    }
  }
}
