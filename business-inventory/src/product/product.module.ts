import { Module } from '@nestjs/common';
import { ProductService } from './provider/product.service';
import { ProductController } from './product.controller';

@Module({
  providers: [ProductService],
  controllers: [ProductController]
})
export class ProductModule {}
