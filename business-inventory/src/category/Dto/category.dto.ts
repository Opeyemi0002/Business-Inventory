import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'This is the name of the category',
    example: 'Electronics',
  })
  @Transform(({value}:{value:unknown})=> typeof value ==="string" ? value.trim():value)
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'This provides the details of the category',
    example:
      'This category contains any electronics gadgets such speakers, wouvers',
  })
  @Transform(({value}:{value:unknown})=> typeof value ==="string" ? value.trim():value)
  @IsNotEmpty()
  @IsString()
  description: string;
}
