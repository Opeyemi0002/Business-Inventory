import { Body, Controller, Post, Req } from '@nestjs/common';
import { BusinessService } from './provider/business.service';
import { CreateBusinessDto } from './Dto/create-business.dto';
import type { Request } from 'express';
import { USER_KEY } from '../auth/constants/user.constant';

@Controller('business')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Post('/create-new')
  async createBusiness(
    @Body()
    createBusinessDto: CreateBusinessDto,
    @Req() request: Request & { [USER_KEY]: { sub: number } },
  ) {
    const userId = request[USER_KEY].sub;
    return this.businessService.create(userId, createBusinessDto);
  }
}
