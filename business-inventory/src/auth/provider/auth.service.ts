import {
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
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../../user/provider/user.service';
import { CreateUserDto } from '../DTOs/create-user.dto';
import type { ConfigType } from '@nestjs/config';
import jwtConfig from '../../config/jwt.config';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
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

  async verifyEmail(token: string) {
    try {
      //extract the email or id from token
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.jwtConfiguration.secret,
        issuer: this.jwtConfiguration.issuer,
        audience: this.jwtConfiguration.audience,
      });
      //search the id through the database
      const findUser = await this.userService.findById(payload.sub);

      // isEmailVerified changed to true
      if (!findUser) {
        throw new NotFoundException('User not found');
      }
      findUser.isEmailVerified = true;
      await this.userService.updateUser(findUser);
      return { status: 'success', message: 'email verified successfully' };
    } catch (err) {
      throw new UnauthorizedException('problem verifying your email');
    }
  }
}
