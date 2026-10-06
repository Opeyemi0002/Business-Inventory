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
import { JwtService, JsonWebTokenError, TokenExpiredError } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';
import { UserService } from '../../user/provider/user.service';
import { CreateUserDto } from '../DTOs/create-user.dto';
import type { ConfigType } from '@nestjs/config';
import jwtConfig from '../../config/jwt.config';
import { LoginUserDto } from '../DTOs/login-user.dto';
import { HashService } from './hash.service';
import { SetPasswordDto } from '../DTOs/set-password.dto';
import { MailService } from '../../mail/provider/mail.service';
import { TokenService } from './token.service';
import { createHash } from 'node:crypto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
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
        this.logger.warn('attempting registration with an existing email');
        throw new ConflictException('Invalid details');
      }

      const createUser = await this.userService.createUser(createUserDto);
      this.logger.log(`user registered succesfully`);
      return createUser;
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      this.logger.error(
        `unexpected error occurred during registration.`,
        err instanceof Error ? err.stack : undefined,
      );
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
      const tokens = await this.tokenService.generateTokens(findUser);
      const tokenHash = await this.tokenService.refreshTokenHash(
        tokens.refreshToken,
      );

      await this.userService.updateUser({
        id: findUser.id,
        refreshTokenHash: tokenHash,
      });

      return {
        status: 'success',
        message: 'User login succesfully',
        data: {
          firstName: findUser.firstName,
          lastname: findUser.lastName,
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

  async getNewAccessToken(token: string) {
    try {
      //verify refreshtoken
      const getPayload = await this.jwtService.verifyAsync(
        token,
        this.jwtConfiguration,
      );
      //if invalidated, throw error
      if (!getPayload || getPayload.purpose !== 'refresh') {
        throw new UnauthorizedException('You are unauthorized');
      }
      //validated, generate a new accessToken
      const findUser = await this.userService.findById(getPayload.sub);
      if (!findUser) {
        throw new NotFoundException('User not found');
      }
      const tokenHash = await this.tokenService.refreshTokenHash(token);

      if (tokenHash !== findUser.refreshTokenHash) {
        throw new UnauthorizedException('token no longer valid');
      }
      const newToken = await this.tokenService.generateNewAccessToken(findUser);

      return newToken;
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      if (err instanceof JsonWebTokenError) {
        throw new UnauthorizedException('Authorization fails');
      }
      if (err instanceof TokenExpiredError) {
        throw new UnauthorizedException('Invalid or expired token');
      }

      throw new InternalServerErrorException('Internal server error');
    }
  }
  async logOut(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(
        token,
        this.jwtConfiguration,
      );
      if (!payload || payload.purpose !== 'refresh') {
        this.logger.warn('token not found or invalid token');
        throw new UnauthorizedException('Invalid token');
      }
      const findUser = await this.userService.findById(payload.sub);
      if (!findUser) {
        this.logger.warn(`failed to find user`);
        throw new NotFoundException('User not found');
      }
      const hashedRefreshToken = createHash('sha256')
        .update(token)
        .digest('hex');
      await this.userService.clearRefreshTokenHashWithLock(
        findUser.id,
        hashedRefreshToken,
      );

      return {
        status: 'success',
        message: 'User logged-out successfully',
      };
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      if (err instanceof JsonWebTokenError) {
        throw new UnauthorizedException('Invalid token');
      }
      if (err instanceof TokenExpiredError) {
        throw new UnauthorizedException('Expired token');
      }

      this.logger.error(
        'unexpected error',
        err instanceof Error ? err.stack : undefined,
      );
      throw new InternalServerErrorException('Unexpected error occured');
    }
  }
}
