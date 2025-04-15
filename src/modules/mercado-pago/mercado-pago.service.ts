import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { RESPONSE_PASSTHROUGH_METADATA } from '@nestjs/common/constants';
import { ReservationsService } from '../reservations/reservations.service';
import { PaymentDataType } from 'src/common/types/mercadoPago/payment';
import { RESERVATION_STATUS } from 'src/common/enums/reservation-status.enum';

@Injectable()
export class MercadoPagoService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private readonly reservationService: ReservationsService,
  ) {}
  async createUrlPayment(price: number, reservationId: number) {
    const result = await fetch(process.env.CHECKOUT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        notification_url: 'https://664e-181-29-188-9.ngrok-free.app/api/v1/payment/notification',
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

  async updateReservation(paymentId: string) {
    const { external_reference, status, status_detail } = await this.getPaymentData(paymentId);
    console.log(status, status_detail);

    if (status === 'approved' && status_detail === 'accredited') {
      await this.reservationService.update(+external_reference, { status: RESERVATION_STATUS.CONFIRMED });
    } else {
      return false;
    }

    return true;
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
}
