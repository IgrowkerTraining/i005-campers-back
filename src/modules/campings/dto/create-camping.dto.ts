import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  IsUrl,
  ValidateNested,
  ArrayMinSize,
  IsDateString,
  IsIn,
  ValidateIf,
  IsDate,
  IsJSON,
  isNotEmpty,
} from 'class-validator';
import { Amenity, Location, NearbyAttraction, Pricing, Prisma, User } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Transform } from 'class-transformer';

class LimitCampingDto {
  @ApiProperty()
  maxTents: number;

  @ApiProperty()
  maxUsers: number;
}

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

export class CreateCampingDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  nearNature?: string[];

  @ApiProperty()
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  photos?: string[];

  @ApiProperty({ type: PricingDto })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  pricing?: PricingDto;

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

  @ApiProperty({
    type: 'object',
    properties: {
      maxTents: { type: 'number', example: 5 },
      maxUsers: { type: 'number', example: 10 },
    },
  })
  @IsNotEmpty()
  @ValidateNested()
  limitCamping: {
    maxTents: number;
    maxUsers: number;
  };

  @ApiProperty({ type: LocationDto })
  @IsNotEmpty()
  @ValidateNested()
  location: Location;
}

export class CampingResponseDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  @Transform(({ value }) => value.toISOString().split('T')[0])
  createdAt: Date;

  @Expose()
  @Transform(({ value }) => value.toISOString().split('T')[0])
  updatedAt: Date;

  @Exclude()
  userId: string;

  @Expose()
  @ApiProperty({ type: () => [String] })
  nearNature: string[];

  @Expose()
  @ApiProperty({ type: () => [NearbyAttractionDto] })
  nearbyAttractions: NearbyAttractionDto[];

  @Exclude()
  locationId: number;

  @Expose()
  pricing: {
    pricePerNight: number;
    season: string;
  };

  @Expose()
  @ApiProperty({ type: () => [AmenityDto] }) // <-- Para arrays
  amenities: string[];
  K;
  @Exclude()
  limitCampingId: number;

  @Expose()
  @ApiProperty({ type: () => LocationDto })
  location: LocationDto;

  @Expose()
  @ApiProperty({ type: () => LimitCampingDto })
  limitCamping: LimitCampingDto;
}
