import { $Enums } from '@prisma/client';
import { CreateReservationDto } from './create-reservation.dto';

export class UpdateReservationDto implements Partial<Omit<CreateReservationDto, 'campingId' | 'userId'>> {
  status?: $Enums.ReservationStatus;
  cancelledAt?: Date;
  startDate?: Date;
  endDate?: Date;
  peopleCount?: number;
  tentsCount?: number;
}
