import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { BusinessMember } from '../BusinessTemp/Business-member.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    nullable: true,
    unique: true,
  })
  googleId?: string | null;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  firstName?: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  lastName?: string;

  @Column({
    type: 'varchar',
    nullable: false,
    unique: true,
  })
  email: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  password?: string | null;

  @Column({
    type: 'int',
    nullable: false,
    default: 0,
  })
  passwordResetVersion: number;

  @Column({
    type: 'varchar',
    length: 64,
    nullable: true,
  })
  refreshTokenHash?: string | null;

  @Column({
    type: 'boolean',
    default: false,
    nullable: false,
  })
  isEmailVerified: boolean;

  @OneToMany(() => BusinessMember, (businessMember) => businessMember.user)
  businessMembers: BusinessMember[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date | null;
}
