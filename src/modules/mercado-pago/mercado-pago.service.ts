import { BadRequestException, Injectable, Logger, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { ReservationsService } from '../reservations/reservations.service';
import { PaymentDataType } from 'src/common/types/mercadoPago/payment';
import { RESERVATION_STATUS } from 'src/common/enums/reservation-status.enum';
import { Reservation } from '@prisma/client';
import { PaymentRepository } from './payment.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { MP_ERROR_MESSAGES } from 'src/common/errorMessages/mercado-pago-messages';

@Injectable()
export class MercadoPagoService {
  private readonly logger = new Logger(MercadoPagoService.name);
  constructor(
    private readonly reservationService: ReservationsService,
    private readonly prisma: PrismaService,
    private readonly paymentRepository: PaymentRepository,
  ) {}
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
    this.logger.log('Payment URL generated:', response);
    return response;
  }

  async paymentAccredited(paymentId: string): Promise<Reservation> {
    const { external_reference, status, status_detail, ...rest } = await this.getPaymentData(paymentId);

    if (status !== 'approved' || status_detail !== 'accredited') {
      throw new BadRequestException('Ocurrio algun error con la verificacion del pago');
    }

    const transaction = await this.prisma.$transaction(async () => {
      const reservation = await this.reservationService.update(+external_reference, {
        status: RESERVATION_STATUS.CONFIRMED,
      });

      const startReservation = new Date(reservation.startDate);
      startReservation.setDate(startReservation.getDate() - 1);

      await this.paymentRepository.create({
        amount: rest.transaction_amount,
        externalPaymentId: paymentId,
        reservationId: +external_reference,
        limitDateRefound: startReservation,
      });

      return { reservation };
    });
    this.logger.log('Payment accredited:', transaction);
    return transaction.reservation;
  }

  async paymentRefound(reservationId: number) {
    const payment = await this.paymentRepository.findFirst(reservationId);

    if (!payment) throw new NotFoundException('pago de reservacion no encontrado');

    if (!this.checkIsPossibleRefound({ limitDateRefound: payment.limitDateRefound })) {
      throw new BadRequestException('Se Excedio la fecha limite de reembolso');
    }

    const result = await fetch(`https://api.mercadopago.com/v1/payments/${payment.externalPaymentId}/refunds`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Idempotency-Key': crypto.randomUUID(),
        Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
      },
    });

    if (result.ok && result.status === 201) {
      await this.paymentRepository.delete(payment.id);
      await this.reservationService.update(reservationId, { status: RESERVATION_STATUS.CANCELLED });
    }
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
      throw new BadRequestException();
    }

    if (reservation.status !== RESERVATION_STATUS.PENDING) {
      throw new BadRequestException(MP_ERROR_MESSAGES.STATUS_PENDING);
    }
  }

  private checkIsPossibleRefound({ limitDateRefound }: { limitDateRefound: Date }): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const limitDate = new Date(limitDateRefound);
    limitDate.setHours(0, 0, 0, 0);
    console.log(today, limitDate);

    return today < limitDate;
  }
}
