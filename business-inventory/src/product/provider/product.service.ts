import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '../product.entity';
import { Repository } from 'typeorm';
import { CreateProductDto } from '../Dto/create-product.dto';
import { UserService } from '../../user/provider/user.service';
import { BusinessService } from '../../BusinessTemp/provider/business.service';

@Injectable()
export class ProductService {
  private readonly Logger = new Logger(ProductService.name);
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly userService: UserService,
    private readonly businessService: BusinessService,
  ) {}
  async createNewProduct(
    createProductDto: CreateProductDto,
    userId: number,
    businessId: number,
  ) {
    try {
      // find
      const findUser = await this.userService.findById(userId);
      if (!findUser) {
        this.Logger.warn('Non-user attempting to create product');
        throw new NotFoundException('User not found');
      }
      // find if he/she is business memeber

      const findBusiness = await this.businessService.findBusiness(businessId);
      const businessMembership = await this.businessService.findBusinessMember(
        findUser.id,
        findBusiness.id,
      );
      if (!businessMembership) {
        throw new NotFoundException();
      }
      let createProduct = this.productRepository.create(createProductDto);
      createProduct = await this.productRepository.save(createProduct);

      return {
        status: 'success',
        message: 'Product created successfully',
      };
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      this.Logger.error(
        'error creating product',
        err instanceof Error ? err.stack : undefined,
      );
      throw new InternalServerErrorException('Internal server error');
    }
  }
}
