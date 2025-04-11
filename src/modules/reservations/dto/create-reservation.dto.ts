import { ApiProperty } from '@nestjs/swagger';
import { Reservation } from '@prisma/client';

export class CreateReservationDto implements Omit<Reservation, 'id' | 'createdAt' | 'updatedAt'> {
  campingId: number;
  peopleCount: number;
  tentsCount: number;
  @ApiProperty({
    type: String,
    format: 'date',
    description: 'Fecha sin hora (YYYY-MM-DD)',
  })
  startDate: Date;
  @ApiProperty({
    type: String,
    format: 'date',
    description: 'Fecha sin hora (YYYY-MM-DD)',
  })
  endDate: Date;
}
