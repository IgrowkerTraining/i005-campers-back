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
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsSanitizedHtml } from 'src/decorators/is-sanitizated-html.decorator';
import { SANITIZE_CONFIG, SANITIZE_RICH_TEXT_CONFIG } from 'src/config/sanitize.config';

class UpdateLocationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @IsSanitizedHtml(SANITIZE_CONFIG)
  campingAddress?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @IsUrl()
  mapLink?: string;
}

class UpdatePricingDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  pricePerNight?: number;

  @ApiProperty({ required: false, description: 'Tipo de precio' })
  @IsOptional()
  @IsString()
  @IsIn(['carpa', 'vehiculo', 'paseDiario'])
  tarifa?: string;
}

class UpdateAmenityDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  id?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @IsSanitizedHtml(SANITIZE_CONFIG)
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  available?: boolean;
}

class UpdateNearbyAttractionDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @IsSanitizedHtml(SANITIZE_CONFIG)
  name?: string;
}

class UpdateLimitCampingDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  maxTents?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  maxUsers?: number;
}

export class UpdateCampingDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @IsSanitizedHtml(SANITIZE_CONFIG)
  name?: string;

  @ApiProperty({ type: UpdateLocationDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateLocationDto)
  location?: UpdateLocationDto;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @IsSanitizedHtml(SANITIZE_RICH_TEXT_CONFIG)
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  contactPhone?: string;

  @ApiProperty({ type: [UpdatePricingDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdatePricingDto)
  pricing?: UpdatePricingDto[];

  @ApiProperty({ type: [UpdateAmenityDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateAmenityDto)
  amenities?: UpdateAmenityDto[];

  @ApiProperty({ type: [UpdateNearbyAttractionDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateNearbyAttractionDto)
  nearbyAttractions?: UpdateNearbyAttractionDto[];

  @ApiProperty({ type: UpdateLimitCampingDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateLimitCampingDto)
  limitCamping?: UpdateLimitCampingDto;
}
