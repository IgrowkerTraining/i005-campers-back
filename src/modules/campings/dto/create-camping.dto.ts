import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  IsUrl,
  ValidateNested,
  IsIn,
  ValidateIf,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { IsSanitizedHtml } from '../../../../src/decorators/is-sanitizated-html.decorator';
import { SANITIZE_CONFIG, SANITIZE_RICH_TEXT_CONFIG } from '../../../../src/config/sanitize.config';

class LocationDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsSanitizedHtml(SANITIZE_CONFIG)
  campingAddress: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsUrl()
  mapLink: string;
}

class PricingDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  pricePerNight: number;

  @ApiProperty({ required: true, description: 'Tipo de precio' })
  @IsNotEmpty()
  @IsString()
  @IsIn(['carpa', 'vehiculo', 'paseDiario'])
  tarifa: string;
}

class AmenityDto {
  @ApiProperty()
  @IsOptional()
  @IsNumber()
  id?: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @IsSanitizedHtml(SANITIZE_CONFIG)
  name?: string;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  available?: boolean;
}

class MediaDto {
  @IsUrl()
  url: string;

  @IsIn(['image', 'video'])
  type: string;
}

class NearbyAttractionDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsSanitizedHtml(SANITIZE_CONFIG)
  name: string;
}

class LimitCampingDto {
  @ApiProperty()
  @IsNumber()
  maxTents: number;

  @ApiProperty()
  @IsNumber()
  maxUsers: number;
}
export class CreateCampingDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsSanitizedHtml(SANITIZE_CONFIG)
  name: string;

  @ApiProperty({ type: LocationDto })
  @IsNotEmpty()
  @ValidateNested()
  location: LocationDto;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsSanitizedHtml(SANITIZE_RICH_TEXT_CONFIG)
  description: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  contactPhone: string;

  @ApiProperty({ type: PricingDto })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  pricing: PricingDto;

  @ApiProperty({ type: AmenityDto })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  amenities?: AmenityDto[];

  @ApiProperty({ type: () => [NearbyAttractionDto] })
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
  limitCamping: {
    maxTents: number;
    maxUsers: number;
  };
}

export class CampingResponseDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  @ApiProperty({ type: () => LocationDto })
  location: LocationDto;

  @Expose()
  contactPhone: string;

  @Expose()
  media: MediaDto[];

  @Expose()
  pricing: PricingDto;

  @Expose()
  @ApiProperty({ type: () => [AmenityDto] })
  amenities: string[];

  @Expose()
  @ApiProperty({ type: () => LimitCampingDto })
  limitCamping: LimitCampingDto;

  @Exclude()
  userId: string;

  @Exclude()
  campingId: number;

  @Expose()
  @ApiProperty({ type: () => [NearbyAttractionDto] })
  nearbyAttractions: NearbyAttractionDto[];

  @Exclude()
  locationId: number;

  @Exclude()
  limitCampingId: number;

  @Expose()
  @Transform(({ value }) => {
    if (value instanceof Date) {
      return value.toISOString().split('T')[0];
    }
    return value;
  })
  createdAt: Date;

  @Expose()
  @Transform(({ value }) => {
    if (value instanceof Date) {
      return value.toISOString().split('T')[0];
    }
    return value;
  })
  updatedAt: Date;
}

export class PaginatedResponseDto<T> {
  @Expose()
  data: T[];

  @Expose()
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
