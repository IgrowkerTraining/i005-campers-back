import { Reservation } from '@prisma/client';

export class CreateReservationDto implements Omit<Reservation, 'id' | 'createdAt' | 'updatedAt'> {
  campingId: number;
  startDate: Date;
  endDate: Date;
  peopleCount: number;
  tentsCount: number;
}
