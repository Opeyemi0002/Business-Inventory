import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { ProductService } from './provider/product.service';
import { CreateProductDto } from './Dto/create-product.dto';
import { USER_KEY } from '../auth/constants/user.constant';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post('new/:businessId')
  async createProduct(
    @Req() request: Request & { [USER_KEY]: { sub: number } },
    @Body()
    createProductDto: CreateProductDto,
    @Param('businessId', ParseIntPipe) businessId: number,
  ) {
    const userId = request[USER_KEY].sub;
    return this.productService.createNewProduct(
      createProductDto,
      userId,
      businessId,
    );
  }
}
