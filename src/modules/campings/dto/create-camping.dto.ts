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
} from 'class-validator';
import { Amenity, Location, NearbyAttraction, Pricing, Prisma, User } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { JsonValue } from '@prisma/client/runtime/library';

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

  // @Expose()
  // @Transform(({ value }) => {
  //   if (!value) return null;
  //   try {
  //     return typeof value === 'string' ? JSON.parse(value) : value;
  //   } catch {
  //     return value; // Devuelve el valor original si falla el parseo
  //   }
  // })
  // coordinates: Prisma.JsonValue;
  // @Expose()
  // location: {
  //   city: string;
  //   region: string;
  //   country: string;
  //   coordinates: any; // Usa "any" temporalmente para debug o Prisma.JsonValue si es consistente
  // };

  @Expose()
  location: {
    city: string;
    region: string;
    country: string;
    coordinates: string; // O el tipo correcto
  };
}

class LocationDto implements Omit<Location, 'id'> {
  // coordinates: string;
  // coordinates: Prisma.JsonValue;
  @ApiProperty()
  city: string;

  @ApiProperty()
  region: string;

  @ApiProperty()
  country: string;

  // @ApiProperty()
  //   type: 'object',
  //   properties: {
  //     lat: { type: 'number' },
  //     lng: { type: 'number' },
  //   },
  //   required: ['lat', 'lng'],
  //   additionalProperties: false,
  //   example: { lat: 40.4168, lng: -3.7038 },
  //   description: 'Coordenadas en formato JSON { lat: number, lng: number }',
  // })
  // @IsOptional()
  // // coordinates: any; // Usar JsonValue de Prisma
  // coordinates: string;
  @ApiProperty()
  @IsOptional()
  coordinates: string;
}

// @ApiProperty({
//   type: 'object',
//   example: { lat: 40.7128, lng: -74.006 },
// })
// @ApiProperty({
//   type: 'object',
//   properties: {
//     lat: { type: 'number' },
//     lng: { type: 'number' },
//   },
//   required: ['lat', 'lng'],
//   additionalProperties: false,
//   example: { lat: 40.7128, lng: -74.006 },
// })
// @IsJSON({ message: 'Las coordenadas deben ser un JSON válido' })
// coordinates: string;
// coordinates: JsonValue;

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

  // Validación personalizada para asegurar que o tiene id o name
  @ValidateIf((o) => !o.id && !o.name)
  @IsNotEmpty({ message: 'Debe proporcionar id o name' })
  _?: never;
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
  @ArrayMinSize(1)
  highlights?: string[];

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

  @ApiProperty({ type: NearbyAttractionDto })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  nearbyAttractions?: NearbyAttractionDto;

  @ApiProperty({ type: LocationDto })
  location: Location;
}
