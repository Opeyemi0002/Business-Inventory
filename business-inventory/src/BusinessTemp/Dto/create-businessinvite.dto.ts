import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
import { BusinessRoleType } from '../enums/RoleType.enum';

export class CreateBusinessInviteDto {
  @ApiProperty({
    description: 'put the email of the invite here',
    example: 'johndoe@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'the role of the invitee in the business',
    enum: BusinessRoleType,
  })
  @IsNotEmpty()
  @IsEnum(BusinessRoleType)
  role: BusinessRoleType;
}
