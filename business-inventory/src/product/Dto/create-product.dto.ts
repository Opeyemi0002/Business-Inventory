import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsInt, IsOptional, IsString, Min } from 'class-validator';

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
    example: '$500.00',
  })
  @IsString()
  @IsNotEmpty()
  price: string;

  @IsInt()
  @Min(1)
  categoryId: number;
}
