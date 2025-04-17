import { Controller, Get, Post, Query, ParseIntPipe, BadRequestException, Body, Res, Req } from '@nestjs/common';
import { MercadoPagoService } from './mercado-pago.service';
import { Request, Response } from 'express';
import { NotificationMPType } from 'src/common/types/mercadoPago/notification';
import { CampingGateway } from '../webSockets/camping.gateway';
import { RefoundPaymentDto } from './dto/refound-payment.dto';

@Controller('payment')
export class MercadoPagoController {
  constructor(
    private readonly mercadoPagoService: MercadoPagoService,
    private readonly campingGateway: CampingGateway,
  ) {}

  @Get()
  async createUrlPayment(
    @Query('price', ParseIntPipe) price: number,
    @Query('reservationId', ParseIntPipe) reservationId: number,
    @Res() res: Response,
  ) {
    if (price <= 0 || reservationId < 0) {
      throw new BadRequestException('price or reservationId must be greater than 0');
    }
    const result = await this.mercadoPagoService.createUrlPayment(price, reservationId);

    return res.status(200).json({ url: result.init_point });
  }

  @Post('notification')
  async notificationPayment(@Req() req: Request, @Body() notification: NotificationMPType, @Res() res: Response) {
    if (notification.action === 'payment.created') {
      this.mercadoPagoService.paymentAccredited(notification.data.id).then((data) => {
        if (data) {
          this.campingGateway.notifyReservationPayment(data);
        }
      });
    }

    return res.status(200).json({ message: 'OK' });
  }

  @Post('refound')
  async paymentRefound(@Body() body: RefoundPaymentDto) {
    await this.mercadoPagoService.paymentRefound(body.reservationId);
  }
}
