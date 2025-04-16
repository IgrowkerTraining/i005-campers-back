import { ApiProperty } from '@nestjs/swagger';
import { Reservation } from '@prisma/client';
import { IsNotEmpty } from 'class-validator';

export class CreateReservationDto
  implements Omit<Reservation, 'id' | 'createdAt' | 'updatedAt' | 'cancelledAt' | 'status'>
{
  @IsNotEmpty()
  userId: string;
  @IsNotEmpty()
  campingId: number;
  @IsNotEmpty()
  peopleCount: number;
  @IsNotEmpty()
  tentsCount: number;
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    format: 'date',
    description: 'Fecha sin hora (YYYY-MM-DD)',
  })
  startDate: Date;
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    format: 'date',
    description: 'Fecha sin hora (YYYY-MM-DD)',
  })
  endDate: Date;
}
