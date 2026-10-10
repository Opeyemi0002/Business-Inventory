import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { UserService } from '../../user/provider/user.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Business } from '../business.entity';
import { BusinessMember } from '../Business-member.entity';
import { CreateBusinessDto } from '../Dto/create-business.dto';
import { BusinessRoleType } from '../enums/RoleType.enum';
import { getCurrency } from '../util/country-currency.utils';
import { CreateBusinessInviteDto } from '../Dto/create-businessinvite.dto';

import { JsonWebTokenError, JwtService, TokenExpiredError } from '@nestjs/jwt';
import type { ConfigType } from '@nestjs/config';
import jwtConfig from '../../config/jwt.config';
import { MailService } from '../../mail/provider/mail.service';

@Injectable()
export class BusinessService {
  private readonly logger = new Logger(BusinessService.name);
  constructor(
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly userService: UserService,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    @InjectRepository(BusinessMember)
    private readonly businessMemberRepository: Repository<BusinessMember>,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  async create(id: number, createBusinessDto: CreateBusinessDto) {
    try {
      const findUser = await this.userService.findById(id);
      if (!findUser) {
        this.logger.warn(
          'unregistered user attempting to create business profile',
        );
        throw new NotFoundException('User not found');
      }
      if (findUser.isEmailVerified !== true) {
        this.logger.warn(
          'unverified user attempting to create business profile',
        );
        throw new UnauthorizedException('kindly verify your email');
      }
      const currency =
        createBusinessDto?.currency || getCurrency(createBusinessDto.country);

      if (!currency) {
        throw new BadRequestException(
          'Please provide a currency for this country',
        );
      }
      await this.businessRepository.manager.transaction(async (manager) => {
        const businessRepository = manager.getRepository(Business);

        const businessMemberRepository = manager.getRepository(BusinessMember);

        const createNewBusiness = businessRepository.create({
          ...createBusinessDto,
          currency,
        });
        const newBusiness = await businessRepository.save(createNewBusiness);
        const createNewBusinessMember = businessMemberRepository.create({
          role: BusinessRoleType.Owner,
          user: findUser,
          business: newBusiness,
        });
        await businessMemberRepository.save(createNewBusinessMember);
      });

      return {
        status: 'success',
        message: `Congratulations, ${findUser.firstName}have successfully start a new business`,
      };
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      this.logger.error(
        'database error',
        err instanceof Error ? err.stack : undefined,
      );
      throw new InternalServerErrorException('unexpected error occured');
    }
  }

  async inviteBusinessManager(
    userId: number,
    id: number,
    createBusinessInviteDto: CreateBusinessInviteDto,
  ) {
    try {
      //check for business
      const business = await this.businessRepository.findOneBy({ id });
      if (!business) {
        this.logger.warn('Business not found');
        throw new NotFoundException('Business not found');
      }
      //check for business member
      const findUser = await this.userService.findById(userId);
      if (!findUser) {
        this.logger.warn('User not found');
        throw new NotFoundException('User not found');
      }

      const membership = await this.businessMemberRepository.findOne({
        where: {
          user: { id: findUser.id },
          business: { id: business.id },
        },
      });

      if (!membership) {
        this.logger.warn('User is not a member of the business');
        throw new ConflictException('User is not member of this business');
      }
      //check for your role in the business
      if (membership.role !== BusinessRoleType.Owner) {
        this.logger.warn('An unauthorized user is trying to gain permission');
        throw new UnauthorizedException("You don't have this access");
      }
      //asked for email
      const checkUser = await this.userService.findByEmail(
        createBusinessInviteDto.email,
      );
      if (checkUser) {
        await this.mailService.sendBusinessManagerInviteEmail(
          checkUser,
          business,
        );
        return {
          status: 'success',
          message: 'Invite email has been sent successfully',
        };
      }
      //send an invitation letter to the create account
      await this.mailService.sendNonUserInviteEmail(
        createBusinessInviteDto.email,
        business,
      );
      return {
        message:
          'User need to register before creating an account. An invitation email has been sent to begin registration process',
      };
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      this.logger.error(
        'database error',
        err instanceof Error ? err.stack : undefined,
      );
      throw new InternalServerErrorException('Unexpected error occur');
    }
  }
  async verifyBusinessManagerInvite(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(
        token,
        this.jwtConfiguration,
      );
      if (!payload || payload.purpose !== 'invite-manager') {
        this.logger.warn('Token not found or invalid token');
        throw new UnauthorizedException('Expired or invalid token');
      }
      const findBusiness = await this.businessRepository.findOneBy({
        id: payload.businessId,
      });

      if (!findBusiness) {
        this.logger.warn('Business missing');
        throw new NotFoundException('Business not found');
      }

      const findUser = await this.userService.findById(payload.sub);
      if (!findUser) {
        this.logger.warn('User nt found');
        throw new NotFoundException('Business not found');
      }

      const checkBusinessMember = await this.businessMemberRepository.findOne({
        where: {
          user: { id: findUser.id },
          business: { id: findBusiness.id },
        },
      });
      if (checkBusinessMember) {
        throw new ConflictException('You are  member of this business');
      }
      const businessMembership = this.businessMemberRepository.create({
        role: BusinessRoleType.Manager,
        isBusinessMemberVerified: true,
        user: findUser,
        business: findBusiness,
      });
      await this.businessMemberRepository.save(businessMembership);
      return {
        status: 'success',
        message: 'Congratulation, you are welcome to the team.',
      };
    } catch (err) {
      if (err instanceof JsonWebTokenError) {
        throw new UnauthorizedException('Invalid token');
      }
      if (err instanceof TokenExpiredError) {
        throw new UnauthorizedException('Expired token');
      }
      this.logger.error(
        'database error',
        err instanceof Error ? err.stack : undefined,
      );
      throw new InternalServerErrorException('Unexpected error occur');
    }
  }
}
