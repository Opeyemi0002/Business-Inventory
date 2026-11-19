import {
  ForbiddenException,
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
import { CategoryService } from '../../category/provider/category.service';
import { ApproveProductDto } from '../Dto/approve-product.dto';

@Injectable()
export class ProductService {
  private readonly Logger = new Logger(ProductService.name);
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly userService: UserService,
    private readonly businessService: BusinessService,
    private readonly categoryService: CategoryService,
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

      const checkCategory = await this.categoryService.findCategory(
        createProductDto.categoryId,
      );

      if (!checkCategory) {
        throw new NotFoundException('Category not found');
      }

      let createProduct = this.productRepository.create({
        ...createProductDto,
        category: checkCategory,
        business: findBusiness,
      });
      createProduct = await this.productRepository.save(createProduct);

      return {
        status: 'success',
        message: 'Product created successfully',
        productId: createProduct.id,
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

  async approveProduct(userId: number, approveProductDto: ApproveProductDto) {
    try {
      const BusinessMember = await this.businessService.findBusinessMember(
        userId,
        approveProductDto.businessId,
      );

      if (
        BusinessMember.role === 'Director' ||
        BusinessMember.role === 'Employee'
      ) {
        throw new ForbiddenException('You are not allowed ');
      }
      const findProduct = await this.productRepository.findOneBy({
        id: approveProductDto.productId,
        business: { id: approveProductDto.businessId },
      });

      if (!findProduct) {
        throw new NotFoundException('Product Not Found');
      }

      await this.productRepository.save({
        id: findProduct.id,
        approval: true,
      });

      return {
        status: 'Success',
        message: 'Approved successfully',
      };
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      this.Logger.error(
        'Unknown error',
        err instanceof Error ? err.stack : undefined,
      );
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  async getProducts(businessId: number) {
    try {
      const business = await this.businessService.findBusiness(businessId);
      const products = await this.productRepository.find({
        where: { business: { id: businessId }, approval: true },
      });
      return products;
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }

      this.Logger.error('Error', err instanceof Error ? err.stack : undefined);
      throw new InternalServerErrorException('Internal server error');
    }
  }
  async getProduct(approveProductDto: ApproveProductDto) {
    try {
      const business = await this.businessService.findBusiness(
        approveProductDto.businessId,
      );
      const product = await this.productRepository.findOne({
        where: {
          id: approveProductDto.productId,
          business: { id: business.id },
          approval: true,
        },
      });
      if (!product) {
        throw new NotFoundException('Product not found');
      }
      return product;
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      this.Logger.error('error', err instanceof Error ? err.stack : undefined);
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async deleteProduct(userId: number, approveProductDto: ApproveProductDto) {
    try {
      const BusinessMember = await this.businessService.findBusinessMember(
        userId,
        approveProductDto.businessId,
      );

      if (
        BusinessMember.role === 'Director' ||
        BusinessMember.role === 'Employee'
      ) {
        throw new ForbiddenException('You are not allowed');
      }

      const product = await this.productRepository.findOne({
        where: {
          id: approveProductDto.productId,
          business: { id: approveProductDto.businessId },
        },
      });
      if (!product) {
        throw new NotFoundException('Product not found');
      }
      await this.productRepository.softDelete(product.id);

      return {
        status: 'Success',
        message: 'Product deleted successfully',
      };
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      this.Logger.error('Error', err instanceof Error ? err.stack : undefined);
      throw new InternalServerErrorException('Internal server error');
    }
  }
}
