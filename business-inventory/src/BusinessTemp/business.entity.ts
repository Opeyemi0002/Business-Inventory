import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BusinessMember } from './Business-member.entity';
import { Product } from '../product/product.entity';

@Entity()
export class Business {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  name: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  description?: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  phone: string;

  @Column({
    type: 'varchar',
    nullable: true,
    unique: true,
  })
  email?: string | null;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  address?: string | null;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  logo?: string | null;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  currency: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  country: string;

  @OneToMany(() => BusinessMember, (BusinessMember) => BusinessMember.business)
  members: BusinessMember[];

  @OneToMany(() => Product, (product) => product.business)
  products: Product[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date | null;
}
