import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './provider/cart.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './cart.entity';
import { CartItem } from './cart-item.entity';
import { User } from '../user/user.entity';
import { Product } from '../product/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cart, CartItem, User, Product])],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {}
