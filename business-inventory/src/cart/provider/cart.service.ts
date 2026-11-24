import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart } from '../cart.entity';
import { Repository } from 'typeorm';
import { User } from '../../user/user.entity';
import { CartItem } from '../cart-item.entity';
import { AddToCartDto } from '../Dto/add-to-cart.dto';
import { Product } from '../../product/product.entity';

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
  ) {}

  async addToCart(userId: number, addToCartDto: AddToCartDto) {
    try {
      const cartItem = await this.cartRepository.manager.transaction(
        async (manager) => {
          const users = manager.getRepository(User);
          const products = manager.getRepository(Product);
          const carts = manager.getRepository(Cart);
          const cartItems = manager.getRepository(CartItem);

          const user = await users.findOne({
            where: { id: userId },
            lock: { mode: 'pessimistic_write' },
          });
          if (!user) {
            throw new NotFoundException('User not found');
          }

          const product = await products.findOne({
            where: { id: addToCartDto.productId, approval: true },
            lock: { mode: 'pessimistic_write' },
          });
          if (!product) {
            throw new NotFoundException('Product not found');
          }

          let cart = await carts.findOne({
            where: { user: { id: user.id } },
            lock: { mode: 'pessimistic_write' },
          });
          if (!cart) {
            cart = await carts.save(carts.create({ user }));
          }

          const existingCartItem = await cartItems.findOne({
            where: {
              cart: { id: cart.id },
              product: { id: product.id },
            },
            lock: { mode: 'pessimistic_write' },
          });

          const quantity = existingCartItem
            ? existingCartItem.quantity + addToCartDto.quantity
            : addToCartDto.quantity;

          if (quantity > product.stock) {
            throw new BadRequestException(
              'Requested quantity exceeds available stock',
            );
          }

          const savedCartItem = existingCartItem
            ? await cartItems.save({
                id: existingCartItem.id,
                quantity,
                unitPrice: product.price,
              })
            : await cartItems.save(
                cartItems.create({
                  cart,
                  product,
                  quantity,
                  unitPrice: product.price,
                }),
              );

          await carts.save({ id: cart.id, lastActivityAt: new Date() });

          return savedCartItem;
        },
      );

      return {
        status: 'success',
        message: 'Product added to cart successfully',
        data: {
          cartItemId: cartItem.id,
          productId: addToCartDto.productId,
          quantity: cartItem.quantity,
          unitPrice: cartItem.unitPrice,
        },
      };
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      this.logger.error(
        'Error adding product to cart',
        err instanceof Error ? err.stack : undefined,
      );
      throw new InternalServerErrorException('Internal server error');
    }
  }
}
