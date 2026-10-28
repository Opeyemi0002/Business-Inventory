import { Module } from '@nestjs/common';
import { CategoryService } from './provider/category.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Category])],
  providers: [CategoryService],
  exports: [],
})
export class CategoryModule {}
