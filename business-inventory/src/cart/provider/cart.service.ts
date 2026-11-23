import {
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart } from '../cart.entity';
import { Repository } from 'typeorm';
import { UserService } from '../../user/provider/user.service';
import { User } from '../../user/user.entity';

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    private readonly userService: UserService,
  ) {}

  async createCart(userId: number) {
    try {
      const newCart = await this.cartRepository.manager.transaction(
        async (manager) => {
          const carts = manager.getRepository(Cart);
          const users = manager.getRepository(User);

          const checkUser = await users.findOne({
            where: { id: userId },
            lock: { mode: 'pessimistic_write' },
          });

          if (!checkUser) {
            throw new NotFoundException('User not found');
          }

          const findCart = await carts.findOne({
            where: { user: { id: checkUser.id } },
          });
          if (findCart) {
            return findCart;
          }
          let createCart = carts.create({
            user: { id: checkUser.id },
          });

          createCart = await carts.save(createCart);

          return createCart;
        },
      );

      return {
        status: 'success',
        data: newCart,
      };
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      this.logger.error('error', err instanceof Error ? err.stack : undefined);
      throw new InternalServerErrorException('Internal server error');
    }
  }
}
