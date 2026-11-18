import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';

export class ApproveProductDto {
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  businessId: number;

  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  productId: number;
}
