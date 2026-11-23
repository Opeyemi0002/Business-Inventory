import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './provider/cart.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {}
