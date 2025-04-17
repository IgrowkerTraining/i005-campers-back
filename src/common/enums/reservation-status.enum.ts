import { ReservationStatusType } from '../types/reservation-status';

export const RESERVATION_STATUS: Record<ReservationStatusType, ReservationStatusType> = {
  CANCELLED: 'CANCELLED',
  CONFIRMED: 'CONFIRMED',
  PENDING: 'PENDING',
} as const;
