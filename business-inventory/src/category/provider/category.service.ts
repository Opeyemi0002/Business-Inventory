import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from '../category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async findall() {
    const findCategory = await this.categoryRepository.find({
      order: { name: 'ASC' },
    });

    return findCategory;
  }
  async findCategory(id: number) {
    try {
      const checkCategory = await this.categoryRepository.findOneBy({ id });

      if (!checkCategory) {
        throw new NotFoundException('Category not found');
      }
      return checkCategory;
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      throw new InternalServerErrorException('Internal server error');
    }
  }
}
