import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class AddToCartDto {
  @ApiProperty({
    description: 'The approved product to add to the signed-in user’s cart',
    example: 1,
  })
  @IsInt()
  @Min(1)
  productId: number;

  @ApiProperty({
    description: 'How many units of the product to add',
    example: 2,
  })
  @IsInt()
  @Min(1)
  quantity: number;
}
