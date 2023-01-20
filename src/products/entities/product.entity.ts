import { ApiProperty } from '@nestjs/swagger/dist/decorators';
import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from 'src/auth/entities/user.entity';
import { ProductImage } from './product-image.entity';

@Entity({ name: 'products' })
export class Product {

    // ApiProperty para la documentacion swagger
    @ApiProperty({
        example: '309eb9de-c902-48f9-9a27-9fba87a2c7fd',
        description: 'Product ID',
        uniqueItems: true
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({
        example: 'T-Shirt Teslo',
        description: 'Product Title',
        uniqueItems: true
    })
    @Column('text', {
        unique: true
    })
    title: string;

    @ApiProperty({
        example: 0,
        description: 'Product price',
    })
    @Column('float', {
        default: 0
    })
    price: number;

    @ApiProperty({
        example: 'The Mens Chill Crew Neck Sweatshirt has a premium, heavyweight exterior and soft fleece interior for comfort in any season.',
        description: 'Product description',
        default: null
    })
    @Column({
        type: 'text',
        nullable: true
    })
    description: string;

    @ApiProperty({
        example: 't_shirt_teslo',
        description: 'Product SLOG - for SEO',
        uniqueItems: true
    })
    @Column('text', {
        unique: true
    })
    slug: string;

    @ApiProperty({
        example: 10,
        description: 'Product stock',
        default: 0
    })
    @Column('int', {
        default: 0
    })
    stock: number;

    @ApiProperty({
        example: ['M', 'L', 'XL'],
        description: 'Product sizes',
    })
    @Column('text', {
        array: true
    })
    sizes: string[];

    @ApiProperty({
        example: 'women',
        description: 'Product gender',
    })
    @Column('text')
    gender: string;

    @ApiProperty()
    @Column('text', {
        array: true,
        default: []
    })
    tags: string[];

    @ApiProperty()
    // una a muchas
    @OneToMany(
        () => ProductImage,
        (productImage) => productImage.product,
        { cascade: true, eager: true } // eager para cargar la relacion en los metodos find
    )
    images?: ProductImage[];

    @ManyToOne(
        () => User,
        ( user ) => user.product,
        { eager: true } // cada vez que se consulte el producto tambien consulta el user que lo creo
    )
    user: User;

    @BeforeInsert()
    checkSlogInsert() {

        if ( !this.slug ) {
            this.slug = this.title
        }

        this.slug = this.slug
            .toLowerCase()
            .replaceAll(' ', '_')
            .replaceAll("'", '')
    }

    @BeforeUpdate()
    checkSlugUpdate() {
        this.slug = this.slug
            .toLowerCase()
            .replaceAll(' ', '_')
            .replaceAll("'", '')
    }

}
