// import {
//   IsArray,
//   IsNotEmpty,
//   IsOptional,
//   IsString,
//   IsNumber,
//   IsBoolean,
//   IsUrl,
//   ValidateNested,
//   ArrayMinSize,
//   IsDateString,
// } from 'class-validator';
// import { Type } from 'class-transformer';

// class PricingDto {
//   @IsNotEmpty()
//   @IsString()
//   season: string;

//   @IsNotEmpty()
//   @IsNumber()
//   pricePerNight: number;

//   @IsOptional()
//   @IsString()
//   currency?: string;

//   @IsNotEmpty()
//   @IsDateString()
//   validFrom: string;

//   @IsNotEmpty()
//   @IsDateString()
//   validTo: string;
// }

// class AmenityDto {
//   @IsNotEmpty()
//   @IsNumber()
//   id: number;
// }

// class NearbyAttractionDto {
//   @IsNotEmpty()
//   @IsString()
//   name: string;

//   @IsNotEmpty()
//   @IsString()
//   type: string;

//   @IsNotEmpty()
//   @IsNumber()
//   distance: number;
// }

// export class CreateCampingDto {
//   @IsNotEmpty()
//   @IsString()
//   name: string;

//   @IsNotEmpty()
//   @IsString()
//   description: string;

//   // @IsOptional()
//   // @IsString()
//   // slug?: string;

//   // @IsOptional()
//   // @IsArray()
//   // @IsString({ each: true })
//   // @ArrayMinSize(1)
//   // highlights?: string[];

//   @IsNotEmpty()
//   @IsNumber()
//   locationId: number;

//   @IsOptional()
//   @IsArray()
//   @IsString({ each: true })
//   nearNature?: string[];

//   @IsOptional()
//   @IsArray()
//   @IsUrl({}, { each: true })
//   photos?: string[];

//   @IsOptional()
//   @IsArray()
//   @ValidateNested({ each: true })
//   @Type(() => PricingDto)
//   pricing?: PricingDto[];

//   @IsOptional()
//   @IsArray()
//   @ValidateNested({ each: true })
//   @Type(() => AmenityDto)
//   amenities?: AmenityDto[];

//   @IsOptional()
//   @IsArray()
//   @ValidateNested({ each: true })
//   @Type(() => NearbyAttractionDto)
//   nearbyAttractions?: NearbyAttractionDto[];

//   @IsOptional()
//   @IsBoolean()
//   isActive?: boolean;
// }

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

class LocationDto {
  @IsNotEmpty()
  @IsNumber()
  locationId: number;

  @IsNotEmpty()
  @IsString()
  city: string;

  @IsNotEmpty()
  @IsString()
  region: string;

  @IsNotEmpty()
  @IsString()
  country: string;
}

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
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  nearNature?: string[];

  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  photos?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PricingDto)
  pricing?: PricingDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AmenityDto)
  amenities?: AmenityDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NearbyAttractionDto)
  nearbyAttractions?: NearbyAttractionDto[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
  userId: any;
}