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

  @ApiProperty({ example: '03/12/2025' })
  @IsNotEmpty()
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
