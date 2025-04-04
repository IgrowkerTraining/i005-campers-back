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
import { Location, Prisma, User } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

class PricingDto {
  @IsNotEmpty()
  @IsString()
  season: string;

  @IsNotEmpty()
  @IsNumber()
  pricePerNight: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsNotEmpty()
  @IsDateString()
  validFrom: string;

  @IsNotEmpty()
  @IsDateString()
  validTo: string;
}

class AmenityDto {
  @IsNotEmpty()
  @IsNumber()
  id: number;
}

class NearbyAttractionDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  type: string;

  @IsNotEmpty()
  @IsNumber()
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
  @ApiProperty()
  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  highlights?: string[];

  // @IsNotEmpty()
  // @IsNumber()
  // locationId: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  nearNature?: string[];

  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  photos?: string[];

  // @IsOptional()
  // @IsArray()
  // @ValidateNested({ each: true })
  // // @Type(() => PricingDto)
  // pricing?: Prisma.PricingCreateNestedManyWithoutCampingInput;

  // @IsOptional()
  // @IsArray()
  // @ValidateNested({ each: true })
  // amenities?: Prisma.AmenityIncludeCreateManyAndReturn;

  // @IsOptional()
  // @IsArray()
  // @ValidateNested({ each: true })
  // // @Type(() => Prisma.NearbyAttractionCreateNestedManyWithoutCampingInput)
  // nearbyAttractions?: Prisma.NearbyAttractionCreateNestedManyWithoutCampingInput;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty()
  @Type(() => Location)
  location: Location;
}
