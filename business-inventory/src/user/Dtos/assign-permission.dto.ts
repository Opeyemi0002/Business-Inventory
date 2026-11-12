import { IsEmail, IsNotEmpty } from 'class-validator';

export class AssignPermissionDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
