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
  IsNotEmpty,
  ValidateIf,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { NearbyAttraction, Pricing, Location } from '@prisma/client';

class LocationDto implements Omit<Location, 'id'> {
  @ApiProperty()
  city: string;

  @ApiProperty()
  region: string;

  @ApiProperty()
  country: string;

  @ApiProperty()
  @IsOptional()
  coordinates: string;
}

class PricingDto implements Omit<Pricing, 'id' | 'campingId'> {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  pricePerNight: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsIn(['Primavera', 'Verano', 'Otono', 'Invierno'])
  season: string;
}
class AmenityDto {
  @ApiProperty()
  @IsOptional()
  @IsNumber()
  id?: number;

  @ApiProperty()
  @IsOptional()
  @ValidateIf((o) => !o.id) // Requerido si no hay id
  @IsString()
  name?: string;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  available?: boolean;
}

class NearbyAttractionDto implements Omit<NearbyAttraction, 'id' | 'campingId'> {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  type: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  distance: number;
}

export class SearchCampingDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  @IsIn(['verano', 'invierno', 'primavera', 'otono'])
  season?: string; // Nuevo campo para temporada

  @ApiProperty()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  nearNature?: string[];

  @ApiProperty({ type: PricingDto })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  pricing?: PricingDto[];

  @ApiProperty({ type: AmenityDto })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  amenities?: AmenityDto[];

  @ApiProperty({ type: () => [NearbyAttractionDto] }) // <-- Array faltante
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  nearbyAttractions?: NearbyAttractionDto[];

  @ApiProperty({ type: LocationDto })
  @IsOptional()
  @ValidateNested()
  location: Location;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => Number(value))
  page?: number = 1;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => Number(value))
  limit?: number = 10;
}

// @IsOptional()
// @IsString()
// @Transform(({ value }) => value?.trim())
// searchTerm?: string;

//   @IsOptional()
//   @IsString()
//   @Transform(({ value }) => value?.trim())
//   location?: string;

//   @IsOptional()
//   @IsString()
//   @Transform(({ value }) => value?.trim())
//   region?: string;

//   // @IsOptional()
//   // @IsNumber()
//   // @Min(0)
//   // @Transform(({ value }) => Number(value))
//   // maxPrice?: number;

//   // @IsOptional()
//   // @IsNumber()
//   // @Min(0)
//   // @Transform(({ value }) => Number(value))
//   // minPrice?: number;

//   @IsOptional()
//   @IsArray()
//   @IsString({ each: true })
//   @Transform(({ value }) => (typeof value === 'string' ? value.split(',') : value))
//   amenities?: string[];

//   @IsOptional()
//   @IsArray()
//   @IsString({ each: true })
//   @Transform(({ value }) => (typeof value === 'string' ? value.split(',') : value))
//   @IsIn(['playa', 'montaña', 'rio', 'lago', 'bosque'], { each: true })
//   natureTypes?: string[];

//   @IsOptional()
//   @IsNumber()
//   @Min(0)
//   @Max(100)
//   @Transform(({ value }) => Number(value))
//   proximityToNature?: number;

//   @IsOptional()
//   @IsLatitude()
//   @Transform(({ value }) => Number(value))
//   lat?: number;

//   @IsOptional()
//   @IsLongitude()
//   @Transform(({ value }) => Number(value))
//   lng?: number;

//   @IsOptional()
//   @IsNumber()
//   @Min(1)
//   @Max(50)
//   @Transform(({ value }) => Number(value))
//   radius?: number;

//   @IsOptional()
//   @IsString()
//   @IsIn(['lowest-price', 'highest-price', 'best-rated', 'most-popular'])
//   sortBy?: string;

//   @IsOptional()
//   @IsNumber()
//   @Min(1)
//   @Transform(({ value }) => Number(value))
//   page?: number = 1;

//   @IsOptional()
//   @IsNumber()
//   @Min(1)
//   @Max(100)
//   @Transform(({ value }) => Number(value))
//   limit?: number = 10;
// }
