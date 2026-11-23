import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './provider/cart.service';
import { UserModule } from '../user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './cart.entity';
import { CartItem } from './cart-item.entity';
import { User } from '../user/user.entity';

@Module({
  imports: [UserModule, TypeOrmModule.forFeature([Cart, CartItem, User])],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {}
