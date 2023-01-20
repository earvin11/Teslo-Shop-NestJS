// import { PartialType } from '@nestjs/mapped-types';
import { PartialType } from '@nestjs/swagger/dist';
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {}
