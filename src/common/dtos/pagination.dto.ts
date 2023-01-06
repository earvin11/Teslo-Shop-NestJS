import { Type } from 'class-transformer';
import { IsPositive, IsOptional, Min } from 'class-validator';


export class PaginationDto {

    @IsOptional()
    @IsPositive()
    @Type( () => Number) //transforma el campo a Number
    limit?: number;

    @IsOptional()
    @Min(0)
    @Type( () => Number)
    offset?: number;
}