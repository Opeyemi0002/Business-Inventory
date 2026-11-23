import { Controller, Post, Req } from '@nestjs/common';
import { CartService } from './provider/cart.service';
import type { Request } from 'express';
import { USER_KEY } from '../auth/constants/user.constant';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('create-cart')
  async createCart(@Req() request: Request & { [USER_KEY]: { sub: number } }) {
    const userId = request[USER_KEY].sub;

    return this.cartService.createCart(userId);
  }
}

//@Post('add-to-cart')
