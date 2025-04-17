import { IsNotEmpty, IsNumber } from 'class-validator';

export class RefoundPaymentDto {
  @IsNotEmpty()
  @IsNumber()
  reservationId: number;
}
