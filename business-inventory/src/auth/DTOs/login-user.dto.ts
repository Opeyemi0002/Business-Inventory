import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({
    description: 'it should contain a valid email of the user',
    example: 'johndoe@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'user password',
    example: 'Password!',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/, {
    message:
      'password must contain atleast one capital letter, one small letter, one special chracter and not less than 8 chracter length',
  })
  password: string;
}
