import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Cart } from './cart.entity';
import { Product } from '../product/product.entity';

@Entity()
export class CartItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'int',
    nullable: false,
    default: 0,
  })
  quantity: number;

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
  })
  unitPrice: string;

  @ManyToOne(() => Cart, (cart) => cart.items, { nullable: false })
  cart: Cart;

  @ManyToOne(() => Product, (product) => product.cartItems, { nullable: false })
  product: Product;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date | null;
}
