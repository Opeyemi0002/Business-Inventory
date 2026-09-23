import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GoogleDataDto {
  @IsNotEmpty()
  @IsString()
  googleId: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;
}
