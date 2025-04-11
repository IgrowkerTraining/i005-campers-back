import { Controller, Get, Post, Query, ParseIntPipe, BadRequestException } from '@nestjs/common';
import { MercadoPagoService } from './mercado-pago.service';


@Controller('payment')
export class MercadoPagoController {
  constructor(private readonly mercadoPagoService: MercadoPagoService) {}


  @Get()
  async createUrlPayment(@Query('price', ParseIntPipe) price: number) {
    try {
      if (price <= 0) {
        throw new BadRequestException('Price must be greater than 0');
      }
      return await this.mercadoPagoService.createUrlPayment(price);

    } catch (error) {
      throw new BadRequestException(`Error creating payment with Mercado Pago: ${error}`);
      
    }
  }
}
