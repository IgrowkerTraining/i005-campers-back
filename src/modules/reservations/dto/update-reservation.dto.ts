import { CreateReservationDto } from './create-reservation.dto';

export class UpdateReservationDto implements Omit<CreateReservationDto, 'campingId'> {
  startDate: Date;
  endDate: Date;
  peopleCount: number;
  tentsCount: number;
}
