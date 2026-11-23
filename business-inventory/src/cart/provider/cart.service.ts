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
      // ensure user is authenticated
      const findUser = await this.userService.findById(userId);
      if (!findUser) {
        throw new NotFoundException('User not found');
      }
      // check if he has a cart before, query if yes, if not create a new one
      const findCart = await this.cartRepository.findOne({
        where: { user: { id: findUser.id } },
      });

      if (findCart) {
        return findCart;
      }
      const createCart = this.cartRepository.create({
        user: { id: findUser.id },
      });

      await this.cartRepository.save(createCart);

      return {
        status: 'success',
        message: 'cart created succesfully',
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
