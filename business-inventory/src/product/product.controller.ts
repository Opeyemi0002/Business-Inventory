import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { ProductService } from './provider/product.service';
import { CreateProductDto } from './Dto/create-product.dto';
import { USER_KEY } from '../auth/constants/user.constant';
import { ApproveProductDto } from './Dto/approve-product.dto';
import { Auth } from '../auth/decorator/auth.decorator';
import { AuthType } from '../auth/enum/auth.type';

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

  @Patch('new/approval/:businessId/:productId')
  async productApproval(
    @Req() req: Request & { [USER_KEY]: { sub: number } },
    @Param() approveProductDto: ApproveProductDto,
  ) {
    const userId = req[USER_KEY].sub;

    return this.productService.approveProduct(userId, approveProductDto);
  }

  @Auth(AuthType.None)
  @Get('/all-products/:businessId')
  async getAllProducts(@Param('businessId', ParseIntPipe) businessId: number) {
    return this.productService.getProducts(businessId);
  }

  @Auth(AuthType.None)
  @Get('/get-product/:businessId/:productId')
  async getProduct(@Param() approveProductDto: ApproveProductDto) {
    return this.productService.getProduct(approveProductDto);
  }

  @Delete('delete-post/:businessId/:productId')
  async deleteProduct(
    @Param() approveProductDto: ApproveProductDto,
    @Req() req: Request & { [USER_KEY]: { sub: number } },
  ) {
    const userId = req[USER_KEY].sub;

    return this.productService.deleteProduct(userId, approveProductDto);
  }
}
