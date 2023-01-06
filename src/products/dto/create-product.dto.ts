import { IsString, MinLength, IsNumber, IsPositive, IsOptional, IsInt, IsArray, IsIn } from 'class-validator';


export class CreateProductDto {

    @IsString()
    @MinLength(1)
    title: string;

    @IsNumber()
    @IsPositive()
    @IsOptional()
    price?: number;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    slug?: string;

    @IsInt()
    @IsPositive()
    @IsOptional()
    stock?: number;

    // each true para decir que cada elemento del arr cumpla la condicion
    @IsString({ each: true })
    @IsArray()
    sizes: string[];

    // solo los valores dentro de isIn
    @IsIn(['men', 'women', 'kid', 'unisex'])
    gender: string;

    @IsOptional()
    @IsString({ each: true })
    @IsArray()
    tags: string[];

    @IsOptional()
    @IsString({ each: true })
    @IsArray()
    images?: string[];

}
