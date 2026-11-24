import {
  Body,
  Controller,
  Post,
  Req,
} from '@nestjs/common';
import { CartService } from './provider/cart.service';
import type { Request } from 'express';
import { USER_KEY } from '../auth/constants/user.constant';
import { AddToCartDto } from './Dto/add-to-cart.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('items')
  async addProductToCart(
    @Req() request: Request & { [USER_KEY]: { sub: number } },
    @Body()
    addToCartDto: AddToCartDto,
  ) {
    const userId = request[USER_KEY].sub;
    return this.cartService.addToCart(userId, addToCartDto);
  }
}
