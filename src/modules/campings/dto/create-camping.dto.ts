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
} from 'class-validator';
import { Type } from 'class-transformer';
import { Amenity, Location, NearbyAttraction, Pricing, Prisma, User } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

class LocationDto implements Omit<Location, 'id'> {
  @ApiProperty()
  city: string;
  @ApiProperty()
  region: string;
  @ApiProperty()
  country: string;
  @ApiProperty()
  coordinates: string;
}

class PricingDto implements Omit<Pricing, 'id' | 'campingId'> {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  pricePerNight: number;
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  season: string;
}

class AmenityDto implements Omit<Amenity, 'id'> {
  @ApiProperty()
  name: string;
  @ApiProperty()
  available: boolean;
}

class NearbyAttractionDto implements Omit<NearbyAttraction, 'id' | 'campingId'> {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  name: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  type: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  distance: number;
}

export class CreateCampingDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  description: string;

  // @ApiProperty()
  // @IsOptional()
  // @IsString()
  // slug?: string;

  // @IsOptional()
  // @IsArray()
  // @IsString({ each: true })
  // @ArrayMinSize(1)
  // highlights?: string[];

  // @IsNotEmpty()
  // @IsNumber()
  // locationId: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  nearNature?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @ApiProperty({ type: PricingDto })
  pricing?: PricingDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @ApiProperty({ type: AmenityDto })
  amenities?: AmenityDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @ApiProperty({ type: NearbyAttractionDto })
  nearbyAttractions?: NearbyAttractionDto;

  // @IsOptional()
  // @IsBoolean()
  // isActive?: boolean;

  @ApiProperty({ type: LocationDto })
  location: Location;
}
