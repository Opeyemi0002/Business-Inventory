import {
  ConflictException,
  forwardRef,
  HttpException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user.entity';
import { CreateUserDto } from '../../auth/DTOs/create-user.dto';
import { HashService } from '../../auth/provider/hash.service';
import { MailService } from '../../mail/provider/mail.service';
import { GoogleDataDto } from '../Dtos/create-google-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly hashService: HashService,
    @Inject(forwardRef(() => MailService))
    private readonly mailService: MailService,
  ) {}

  async findByEmail(email: string) {
    try {
      const findUser = await this.userRepository.findOneBy({ email });
      if (!findUser) {
        return false;
      }
      return findUser;
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      throw new InternalServerErrorException('Internal server error');
    }
  }
  async findById(id: number) {
    try {
      const findUser = await this.userRepository.findOneBy({ id });
      if (!findUser) {
        return false;
      }
      return findUser;
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      throw new InternalServerErrorException('Internal server error');
    }
  }
  async findByGoogleId(googleId: string) {
    try {
      const findUser = await this.userRepository.findOneBy({ googleId });
      if (!findUser) {
        return false;
      }
      return findUser;
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      throw new InternalServerErrorException('Internal server error');
    }
  }
  async createUser(data: CreateUserDto) {
    try {
      const findUser = await this.userRepository.findOneBy({
        email: data.email,
      });
      if (findUser) {
        throw new ConflictException('Invalid details');
      }
      const hashPassword = await this.hashService.hashPassword(data.password);
      const user = this.userRepository.create({
        ...data,
        password: hashPassword,
      });
      const newUser = await this.userRepository.save(user);
      await this.mailService.sendWelcomeEmail(newUser);
      return {
        status: 'success',
        firstname: newUser.firstName,
        lastName: newUser.lastName,
      };
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      console.log(err);
      throw new InternalServerErrorException('Internal server error');
    }
  }
  async createGoogleUser(user: GoogleDataDto) {
    try {
      const createGoogleUser = this.userRepository.create({
        ...user,
        isEmailVerified: true,
      });
      return await this.userRepository.save(createGoogleUser);
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      throw new InternalServerErrorException('Internal server error');
    }
  }
  async updateUser(user: User): Promise<void> {
    await this.userRepository.save(user);
  }
}
