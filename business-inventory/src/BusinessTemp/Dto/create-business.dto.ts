import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsIn } from 'class-validator';
import {currencies, countries} from '../util/country-currency.utils'

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
    description: "the transaction currency of your business. If no currency is chosen, the default currency is set to the country's currency",
    enum:currencies,
    example: 'NGN',
  })
  @IsString()
  @IsOptional()
  @IsIn(currencies, {message: "please select a supported currency"})
  currency?: string;

  @ApiProperty({
    description:
      'The country where your business has been carrying out its operation',
      enum:countries,
    example: 'nigeria',
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(countries, {message: "please select a supported country"})
  country: string;
}
