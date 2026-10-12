import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { BusinessService } from './provider/business.service';
import { CreateBusinessDto } from './Dto/create-business.dto';
import type { Request } from 'express';
import { USER_KEY } from '../auth/constants/user.constant';
import { CreateBusinessInviteDto } from './Dto/create-businessinvite.dto';
import { AuthType } from '../auth/enum/auth.type';
import { Auth } from '../auth/decorator/auth.decorator';

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

  @Post('/:businessId/invites')
  async sendBusinessManagerInviteEmail(
    @Req() request: Request & { [USER_KEY]: { sub: number } },
    @Param('businessId', ParseIntPipe) businessId: number,
    @Body() createBusinessInviteDto: CreateBusinessInviteDto,
  ) {
    const userId = request[USER_KEY].sub;
    return this.businessService.inviteBusinessWorker(
      userId,
      businessId,
      createBusinessInviteDto,
    );
  }
  @Auth(AuthType.None)
  @Get('user/verify')
  async verifyBusinessWorker(@Query('token') token: string) {
    return this.businessService.verifyBusinessManagerInvite(token);
  }
}
