import { Module } from '@nestjs/common';
import { ProductService } from './provider/product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { UserModule } from '../user/user.module';
import { BusinessMember } from '../BusinessTemp/Business-member.entity';
import { BusinessModule } from '../BusinessTemp/business.module';
import { CategoryModule } from '../category/category.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
    UserModule,
    BusinessModule,
    CategoryModule,
  ],
  providers: [ProductService],
  controllers: [ProductController],
})
export class ProductModule {}
