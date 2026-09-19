import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class SetPasswordDto {
  @ApiProperty({
    description: 'set new password',
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
