import { $Enums } from '@prisma/client';
import { CreateReservationDto } from './create-reservation.dto';
import { IsOptional } from 'class-validator';

export class UpdateReservationDto implements Partial<Omit<CreateReservationDto, 'campingId' | 'userId'>> {
  @IsOptional()
  status?: $Enums.ReservationStatus;
  @IsOptional()
  cancelledAt?: Date;
  @IsOptional()
  startDate?: Date;
  @IsOptional()
  endDate?: Date;
  @IsOptional()
  peopleCount?: number;
  @IsOptional()
  tentsCount?: number;
}
