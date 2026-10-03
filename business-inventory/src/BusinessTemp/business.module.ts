import { Module } from '@nestjs/common';
import { BusinessService } from './provider/business.service';
import { BusinessController } from './business.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Business } from './business.entity';
import { BusinessMember } from './Business-member.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Business, BusinessMember])],
  providers: [BusinessService],
  controllers: [BusinessController],
})
export class BusinessModule {}
