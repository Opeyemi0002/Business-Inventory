import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsString,
  Min,
  Matches,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    description: 'The name of the product',
    example: 'Nike shoe',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Description of the product',
    example: 'Nike Air white sneakers 2016, size 32',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({
    description: 'Display pictures of the product',
  })
  @IsString()
  @IsOptional()
  pictures?: string;

  @ApiProperty({
    description: 'Price of the product',
    example: '500.00',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{1,10}(?:\.\d{1,2})?$/, {
    message:
      'Enter a price like 500 or 500.50, with up to 10 whole digits and 2 decimal places.',
  })
  price: string;

  @IsInt()
  @Min(1)
  categoryId: number;
}
