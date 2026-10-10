import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { BusinessRoleType } from './enums/RoleType.enum';
import { User } from '../user/user.entity';
import { Business } from './business.entity';

@Entity()
@Unique(['user', 'business'])
export class BusinessMember {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: BusinessRoleType,
  })
  role: BusinessRoleType;

  @Column({
    type: 'varchar',
    unique: true,
    nullable: true,
  })
  businessEmail?: string | null;

  @Column({
    type: 'boolean',
    nullable: false,
    default: false,
  })
  isBusinessMemberVerified: boolean;

  @ManyToOne(() => User, (user) => user.businessMembers, { nullable: false })
  user: User;

  @ManyToOne(() => Business, (business) => business.members, {
    nullable: false,
  })
  business: Business;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date | null;
}
