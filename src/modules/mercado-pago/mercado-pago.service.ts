import { BadRequestException, Injectable, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { ReservationsService } from '../reservations/reservations.service';
import { PaymentDataType } from 'src/common/types/mercadoPago/payment';
import { RESERVATION_STATUS } from 'src/common/enums/reservation-status.enum';
import { Reservation } from '@prisma/client';

@Injectable()
export class MercadoPagoService {
  constructor(private readonly reservationService: ReservationsService) {}
  async createUrlPayment(price: number, reservationId: number) {
    await this.checkReservation(reservationId);

    const result = await fetch(process.env.CHECKOUT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        notification_url: `${process.env.APP_BASE_URL.length > 0 ? process.env.APP_BASE_URL : process.env.ULR_MP_DESARROLLO}/api/v1/payment/notification`,
        external_reference: reservationId,
        items: [
          {
            title: 'Reserva Camping',
            quantity: 1,
            currency_id: 'ARS',
            unit_price: price,
          },
        ],
      }),
    });

    const response = await result.json();
    return response;
  }

  async updateReservation(paymentId: string): Promise<Reservation> {
    const { external_reference, status, status_detail } = await this.getPaymentData(paymentId);

    if (status === 'approved' && status_detail === 'accredited') {
      return await this.reservationService.update(+external_reference, {
        status: RESERVATION_STATUS.CONFIRMED,
      });
    }

    throw new BadRequestException('Ocurrio algun error con la verificacion del pago');
  }

  private async getPaymentData(paymentId: string): Promise<PaymentDataType> {
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
      },
    });

    return await response.json();
  }

  private async checkReservation(id: number) {
    const reservation = await this.reservationService.findOne(id);

    if (!reservation) {
      throw new NotFoundException();
    }

    if (reservation.status !== RESERVATION_STATUS.PENDING) {
      throw new NotAcceptableException('El estatus de la reservacion debe ser PENDING');
    }
  }
}
