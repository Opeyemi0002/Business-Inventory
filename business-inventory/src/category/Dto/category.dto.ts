import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'This is the name of the category',
    example: 'Electronics',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'This provides the details of the category',
    example:
      'This category contains any electronics gadgets such speakers, wouvers',
  })
  @IsNotEmpty()
  @IsString()
  description: string;
}
