import { IsNotEmpty, IsString } from 'class-validator';

export class GoogleTokenDto {
  @IsNotEmpty()
  @IsString()
  googleToken: string;
}
