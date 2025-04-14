import { IsOptional, IsString, IsNumber, Min, Max, IsArray, IsIn, ValidateNested, IsBoolean } from 'class-validator';
import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class LimitCampingDto {
  @ApiProperty()
  maxTents: number;

  @ApiProperty()
  maxUsers: number;
}
export class LocationDto {
  @ApiProperty({ required: false, description: 'Ciudad de la ubicación' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ required: false, description: 'Región de la ubicación' })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiProperty({ required: false, description: 'País de la ubicación' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ required: false, description: 'Coordenadas de la ubicación' })
  @IsOptional()
  @IsString()
  coordinates?: string;
}

export class PricingDto {
  @ApiProperty({ required: true, description: 'Precio por noche' })
  @IsNumber()
  pricePerNight: number;

  @ApiProperty({ required: true, description: 'Temporada del precio' })
  @IsOptional()
  @IsIn(['Primavera', 'Verano', 'Otono', 'Invierno'])
  @IsString()
  season?: string;
}

export class AmenityDto {
  @ApiProperty({ required: false, description: 'Nombre del servicio' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false, description: 'Disponibilidad del servicio' })
  @IsOptional()
  @IsBoolean()
  available?: boolean;
}

export class NearbyAttractionDto {
  @ApiProperty({ required: true, description: 'Nombre de la atracción cercana' })
  @IsString()
  name: string;

  @ApiProperty({ required: true, description: 'Tipo de atracción cercana' })
  @IsString()
  type: string;

  @ApiProperty({ required: true, description: 'Distancia a la atracción cercana' })
  @IsNumber()
  distance: number;
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

  @ApiProperty({ required: false, type: LocationDto, description: 'Ubicación del camping' })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDto)
  location?: LocationDto;

  @ApiProperty({ required: false, description: 'Ciudad de la ubicación' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ required: false, description: 'Región de la ubicación' })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiProperty({ required: false, description: 'País de la ubicación específico a buscar' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ required: false, description: 'Coordenadas de la ubicación' })
  @IsOptional()
  @IsString()
  coordinates?: string;

  @ApiProperty({ required: false, type: [AmenityDto], description: 'Servicios disponibles' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AmenityDto)
  amenities?: AmenityDto[];

  @ApiProperty({ required: false, description: 'Tipos de naturaleza cercana' })
  @IsOptional()
  @IsString({ each: true })
  @IsArray()
  nearNature?: string[];

  @ApiProperty({ required: false, type: [NearbyAttractionDto], description: 'Atracciones cercanas' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NearbyAttractionDto)
  nearbyAttractions?: NearbyAttractionDto[];

  @ApiProperty({ required: false, description: 'Latitud para búsqueda cercana' })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  lat?: number;

  @ApiProperty({ required: false, description: 'Longitud para búsqueda cercana' })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  lng?: number;

  @ApiProperty({ required: false, description: 'Radio para búsqueda cercana' })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  radius?: number;

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
  @ApiProperty({ type: () => [AmenityDto] })
  amenities: string[];

  @Exclude()
  limitCampingId: number;

  @Expose()
  @ApiProperty({ type: () => LocationDto })
  location: LocationDto;

  @Expose()
  @ApiProperty({ type: () => LimitCampingDto })
  limitCamping: LimitCampingDto;
}
