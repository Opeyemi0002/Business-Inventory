import { Controller, Get } from '@nestjs/common';
import { CategoryService } from './provider/category.service';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get('/find')
  async getCategory() {
    return this.categoryService.findall();
  }
}
