import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, IsNumber, IsPositive, IsOptional, IsInt, IsArray, IsIn } from 'class-validator';


export class CreateProductDto {

    @ApiProperty({
        description: 'Product title (unique)',
        nullable: false,
        minLength: 1
    })
    @IsString()
    @MinLength(1)
    title: string;

    @ApiProperty()
    @IsNumber()
    @IsPositive()
    @IsOptional()
    price?: number;

    @ApiProperty()
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    slug?: string;

    @ApiProperty()
    @IsInt()
    @IsPositive()
    @IsOptional()
    stock?: number;

    // each true para decir que cada elemento del arr cumpla la condicion
    @ApiProperty()
    @IsString({ each: true })
    @IsArray()
    sizes: string[];

    // solo los valores dentro de isIn
    @ApiProperty()
    @IsIn(['men', 'women', 'kid', 'unisex'])
    gender: string;

    @ApiProperty()
    @IsOptional()
    @IsString({ each: true })
    @IsArray()
    tags: string[];

    @ApiProperty()
    @IsOptional()
    @IsString({ each: true })
    @IsArray()
    images?: string[];

}
