import { Controller, Get, Post, Query, ParseIntPipe, BadRequestException, Body, Res, Req } from '@nestjs/common';
import { MercadoPagoService } from './mercado-pago.service';
import { Request, Response } from 'express';
import { NotificationMPType } from 'src/common/types/mercadoPago/notification';

@Controller('payment')
export class MercadoPagoController {
  constructor(private readonly mercadoPagoService: MercadoPagoService) {}

  @Get()
  async createUrlPayment(
    @Query('price', ParseIntPipe) price: number,
    @Query('reservationId', ParseIntPipe) reservationId: number,
  ) {
    try {
      if (price <= 0 || reservationId < 0) {
        throw new BadRequestException('price or reservationId must be greater than 0');
      }
      return await this.mercadoPagoService.createUrlPayment(price, reservationId);
    } catch (error) {
      throw new BadRequestException(`Error creating payment with Mercado Pago: ${error}`);
    }
  }

  @Post('notification')
  async notificationPayment(@Req() req: Request, @Body() notification: NotificationMPType, @Res() res: Response) {
    console.log(req.query);
    if (notification.action === 'payment.created') {
      this.mercadoPagoService.updateReservation(notification.data.id);
    }

    return res.status(200).json({ message: 'OK' });
  }
}
