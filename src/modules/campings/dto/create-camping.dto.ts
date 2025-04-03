import { 
  IsString, IsNumber, IsBoolean, IsArray, 
  IsNotEmpty, IsOptional, IsUrl, IsPhoneNumber 
} from 'class-validator';

export class CreateCampingDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsNumber()
  pricePerNight: number;

  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber()
  phone: string;

  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber()
  whatsapp: string;

  @IsBoolean()
  @IsOptional()
  hasGrills?: boolean;

  @IsBoolean()
  @IsOptional()
  hasParking?: boolean;

  @IsBoolean()
  @IsOptional()
  rentsTents?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  nearNature?: string[];

  @IsArray()
  @IsUrl({}, { each: true })
  @IsOptional()
  photos?: string[];
}
