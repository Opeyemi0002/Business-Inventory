import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
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

@Injectable()
export class BusinessService {
  private readonly logger = new Logger(BusinessService.name);
  constructor(
    private readonly userService: UserService,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    @InjectRepository(BusinessMember)
    private readonly businessMemberRepository: Repository<BusinessMember>,
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
        
      }
      //send an invitation letter to the email
    } catch (err) {}
  }
}
