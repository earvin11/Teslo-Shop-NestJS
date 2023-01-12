import { NotFoundException } from '@nestjs/common';
import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product, ProductImage } from './entities';
import { PaginationDto } from '../common/dtos/pagination.dto';

import { validate as isUUID } from 'uuid';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource,

  ) {}

  async create(createProductDto: CreateProductDto) {

    try {

      const { images = [], ...productDetails } = createProductDto;

      const product = this.productRepository.create({
        ...productDetails,
        images: images.map( image => this.productImageRepository.create({ url: image }) ) // creacion de imagenes en su tabla para este producto
      });
      await this.productRepository.save( product );
      return { ...product, images };
      
    } catch (error) {
      this.handleDBExceptions(error);
    }

  }

  async findAll( paginationDto: PaginationDto ) {

    const { limit = 10, offset = 0 } = paginationDto;

    try {
      const products = await this.productRepository.find({
        take: limit,
        skip: offset,
        relations: {
          images: true
        }
      });

      return products.map( product => ({ 
        ...product, 
        images: product.images.map( img => (img.url)) 
      }));

    } catch (error) {
      this.handleDBExceptions(error)
    }
  }

  async findOne(term: string) {

    let product: Product;

    if( isUUID(term) ) {
      product = await this.productRepository.findOneBy({ id: term });
    }else{
      const queryBuilder = this.productRepository.createQueryBuilder('prod'); // prod es un alias para identificar la tabla que se consltara
      product = await queryBuilder
        .where('UPPER(title) =:title or slug =:slug',{
          title: term.toUpperCase(),
          slug: term.toLowerCase()
        })
        .leftJoinAndSelect('prod.images', 'prodImages') // la propiedad a relacionar dentro de prod para la query, el segundo argumento el alias de esta tabla relacionada
        .getOne();
    }
      
    if(!product) 
      throw new NotFoundException(`Product with ${term} not found`);

    return product;
  }

  async findOnePlain( term: string ) {
    const { images, ...rest } = await this.findOne( term );

    return {
      ...rest,
      images: images.map( img => (img.url))
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {

    const { images, ...toUpdate } = updateProductDto;

    const product = await this.productRepository.preload({
      id,
      ...toUpdate
    });

    if(!product) throw new NotFoundException(`Product with id ${id} not found`);

    // QueryRunner
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {

      if( images ) {
        // Borra las anteriores si viene el campo images
        // para borrar el primer argumento es de la tabla, segundo el criterio para eliminar
        await queryRunner.manager.delete( ProductImage, { product: { id } });

        // carga las nuevas
        product.images = images.map( 
          image => this.productImageRepository.create({ url: image })
        )
      }

      await queryRunner.manager.save( product );

      // si todo sale bien haz el commit y desconecta el queryRunner con release
      await queryRunner.commitTransaction();
      await queryRunner.release()

      // await this.productRepository.save( product );
      return this.findOnePlain(id);
    } catch (error) {

      // si falla haz rollback del queryRunner
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      this.handleDBExceptions(error);
    }

  }

  async remove(id: string) {

      const product = await this.findOne(id);
      await this.productRepository.remove(product);
      
  }

  private handleDBExceptions( error: any ) {
    if(error.code === '23505')
        throw new BadRequestException(error.detail);

    this.logger.error(error);
    throw new InternalServerErrorException('Unexpected error, check logs');
  }

  async deleteAllProducts() {
    const query = this.productRepository.createQueryBuilder('product');

    try {
      return await query
        .delete()
        .where({})
        .execute();
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

}
