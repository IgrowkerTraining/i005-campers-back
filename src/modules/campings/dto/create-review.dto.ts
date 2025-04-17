import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {  IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, Matches, Max, Min } from 'class-validator';
import { SANITIZE_CONFIG } from 'src/config/sanitize.config';
import { IsSanitizedHtml } from 'src/decorators/is-sanitizated-html.decorator';

export class createReviewDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  campingId: number;

  @ApiProperty({ example: 'leoanrdo nf' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: '22/11/2025' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{1,2}\/\d{1,2}\/\d{4}$/, { message: 'La fecha debe estar en formato DD/MM/YYYY' })
  @Transform(({ value }) => {
    const [day, month, year] = value.split('/').map((part) => part.padStart(2, '0'));
    const date = new Date(`${year}-${month}-${day}`);
    if (isNaN(date.getTime())) throw new Error('Formato de fecha inválido');
    return date;
  })
  date: Date;

  @ApiProperty({ example: 'muy bueno' })
  @IsNotEmpty()
  @IsString()
  @IsSanitizedHtml(SANITIZE_CONFIG)
  comment: string;

  @ApiProperty({ example: 4.8 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(5)
  rating: number;

  @ApiProperty({ example: 'perfil.jpg' })
  @IsOptional()
  @IsString()
  profilePic?: string;
}
