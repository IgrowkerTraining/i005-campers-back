import {
  IsOptional,
  IsString,
  IsNumber,
  Min,
  Max,
  IsArray,
  IsIn,
  ValidateNested,
  IsBoolean,
  IsNotEmpty,
  IsUrl,
} from 'class-validator';
import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsSanitizedHtml } from 'src/decorators/is-sanitizated-html.decorator';
import { SANITIZE_CONFIG } from 'src/config/sanitize.config';

export class LocationDto {
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

export class PricingDto {
  @ApiProperty({ required: true, description: 'Precio por noche' })
  @IsNotEmpty()
  @IsNumber()
  pricePerNight: number;

  @ApiProperty({ required: true, description: 'Tipo de precio' })
  @IsNotEmpty()
  @IsString()
  @IsIn(['carpa', 'vehiculo', 'paseDiario'])
  tarifa: string;
}

export class AmenityDto {
  @ApiProperty({ required: false, description: 'Nombre del servicio' })
  @IsOptional()
  @IsString()
  @IsSanitizedHtml(SANITIZE_CONFIG)
  name?: string;

  @ApiProperty({ required: false, description: 'Disponibilidad del servicio' })
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

export class NearbyAttractionDto {
  @ApiProperty({ required: true, description: 'Nombre de la atracción cercana' })
  @IsString()
  @IsSanitizedHtml(SANITIZE_CONFIG)
  name: string;
}

class LimitCampingDto {
  @ApiProperty()
  maxTents: number;

  @ApiProperty()
  maxUsers: number;
}
export class SearchCampingDto {
  @ApiProperty({ required: false, description: 'Nombre del camping' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false, type: [PricingDto], description: 'Criterios de precios' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PricingDto)
  pricing?: PricingDto[];

  @ApiProperty({ required: false, description: 'Precio por noche exacto a buscar' })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  pricePerNight?: number;

  @ApiProperty({ required: false, description: 'Precio por noche exacto a buscar' })
  @IsOptional()
  @IsString()
  tarifa?: string;

  @ApiProperty({ required: false, description: 'Direccion del camping' })
  @IsOptional()
  @IsString()
  @IsSanitizedHtml(SANITIZE_CONFIG)
  campingAddress?: string;

  @ApiProperty({ required: false, description: 'Link del mapa con la ubicacion del camping' })
  @IsOptional()
  @IsString()
  mapLink?: string;

  @ApiProperty({ required: false, type: [AmenityDto], description: 'Servicios disponibles' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  amenities?: string[];

  @ApiProperty({ required: false, type: [NearbyAttractionDto], description: 'Atracciones cercanas' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  nearbyAttractions?: string[];

  @ApiProperty({ required: false, description: 'numero maximo de usuarios' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => Number(value))
  maxUsers?: number;

  @ApiProperty({ required: false, description: 'numero maximo de carpas' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => Number(value))
  maxTents?: number;

  @ApiProperty({ required: false, description: 'Número de página' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => Number(value))
  page?: number = 1;

  @ApiProperty({ required: false, description: 'Límite de resultados por página' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => Number(value))
  limit?: number = 10;
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
  @ApiProperty({ type: () => [NearbyAttractionDto] })
  nearbyAttractions: NearbyAttractionDto[];

  @Expose()
  @ApiProperty({ type: () => LimitCampingDto })
  limitCamping: LimitCampingDto;

  @Exclude()
  userId: string;

  @Exclude()
  locationId: number;

  @Exclude()
  limitCampingId: number;

  @Exclude()
  @Transform(({ value }) => {
    const date = typeof value === 'string' ? new Date(value) : value;
    return date ? date.toISOString().split('T')[0] : null;
  })
  createdAt: Date | string;

  @Exclude()
  @Transform(({ value }) => {
    const date = typeof value === 'string' ? new Date(value) : value;
    return date ? date.toISOString().split('T')[0] : null;
  })
  updatedAt: Date | string;
}
