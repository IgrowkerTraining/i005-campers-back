import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MercadoPagoService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}
  async createUrlPayment(price: number) {
    const result = await fetch(process.env.CHECKOUT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
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
    console.log(response);
    return response;
  }
}
