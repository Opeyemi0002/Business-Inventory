import { Module } from '@nestjs/common';
import { CategoryService } from './provider/category.service';

@Module({
  providers: [CategoryService]
})
export class CategoryModule {}
