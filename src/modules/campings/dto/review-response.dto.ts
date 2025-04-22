import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';

export class ReviewResponseDto {
  @Expose()
  @ApiProperty({ example: 1 })
  id: number;

  @Expose()
  @ApiProperty({ example: 1 })
  campingId: number;

  @Expose()
  @ApiProperty({ example: 'leoanrdo nf' })
  name: string;

  @Expose()
  @ApiProperty({ example: '2025-11-22' })
  @Transform(({ value }) => value.toISOString().split('T')[0])
  date: Date;

  @Expose()
  @ApiProperty({ example: 'muy bueno' })
  comment: string;

  @Expose()
  @ApiProperty({ example: 4.8 })
  rating: number;

  @Expose()
  @ApiProperty({ example: 'perfil.jpg' })
  profilePic: string;
}
