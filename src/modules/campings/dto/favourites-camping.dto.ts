import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsInt, IsString } from 'class-validator';

export class CreateFavouritesDto {
  @ApiProperty()
  @IsInt()
  campingId: number;

  @ApiProperty()
  @IsString()
  userId: string;
}

export class RemoveFavouriteDto {
  @ApiProperty()
  @IsInt()
  campingId: number;

  @ApiProperty()
  @IsString()
  userId: string;
}

export class FavouriteResponseDto {
  @Expose()
  @IsInt()
  id: number;

  @Expose()
  @IsInt()
  campingId: number;

  @Expose()
  @IsString()
  userId: string;
}
