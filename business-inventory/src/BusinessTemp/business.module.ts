import { Module } from '@nestjs/common';
import { BusinessService } from './provider/business.service';
import { BusinessController } from './business.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Business } from './business.entity';
import { BusinessMember } from './Business-member.entity';
import { User } from '../user/user.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule, TypeOrmModule.forFeature([Business, BusinessMember])],
  providers: [BusinessService],
  controllers: [BusinessController],
})
export class BusinessModule {}
