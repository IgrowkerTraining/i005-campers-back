import {
  IsOptional,
  IsString,
  IsNumber,
  Min,
  Max,
  IsArray,
  IsLatitude,
  IsLongitude,
  IsIn,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class SearchCampingDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  searchTerm?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  location?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  region?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => Number(value))
  maxPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => Number(value))
  minPrice?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',') : value,
  )
  amenities?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',') : value,
  )
  @IsIn(['playa', 'montaña', 'rio', 'lago', 'bosque'], { each: true })
  natureTypes?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Transform(({ value }) => Number(value))
  proximityToNature?: number;

  @IsOptional()
  @IsLatitude()
  @Transform(({ value }) => Number(value))
  lat?: number;

  @IsOptional()
  @IsLongitude()
  @Transform(({ value }) => Number(value))
  lng?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  @Transform(({ value }) => Number(value))
  radius?: number;

  @IsOptional()
  @IsString()
  @IsIn(['lowest-price', 'highest-price', 'best-rated', 'most-popular'])
  sortBy?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => Number(value))
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => Number(value))
  limit?: number = 10;
}
