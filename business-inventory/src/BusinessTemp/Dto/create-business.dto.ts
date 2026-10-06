import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBusinessDto {
  @ApiProperty({
    description: 'This is the name of the business',
    example: 'Nike',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'This explains the description of your business',
    example: 'we sell all kind of frozen fishes',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'contact phone number of the business',
    example: '(+1)23456789',
  })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiPropertyOptional({
    description: 'contact email of the business',
    example: 'Johnfishes@example.com',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    description: 'physical locaton of the business',
    example: '16, lincoln street, off New-york road, england',
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({
    description: 'URL of the business logo',
    example: 'https://example.com/give.png',
  })
  @IsString()
  @IsOptional()
  logo?: string;

  @ApiPropertyOptional({
    description: 'the transaction currency of your business',
    example: 'NGN',
  })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({
    description:
      'The country where your business has been carrying out its operation',
    example: 'Nigeria',
  })
  @IsString()
  @IsNotEmpty()
  country: string;
}
