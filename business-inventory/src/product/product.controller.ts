import { Controller } from '@nestjs/common';
import { ProductService } from './provider/product.service';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  createProduct() {}
}
