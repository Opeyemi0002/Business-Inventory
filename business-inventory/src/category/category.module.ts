import { Module } from '@nestjs/common';
import { CategoryService } from './provider/category.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './category.entity';
import { CategoryController } from './category.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Category])],
  providers: [CategoryService],
  exports: [],
  controllers: [CategoryController],
})
export class CategoryModule {}
