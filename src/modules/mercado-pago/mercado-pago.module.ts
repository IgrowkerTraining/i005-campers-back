import { Module } from '@nestjs/common';
import { MercadoPagoService } from './mercado-pago.service';
import { MercadoPagoController } from './mercado-pago.controller';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReservationsService } from '../reservations/reservations.service';
import { CampingGateway } from '../webSockets/camping.gateway';
import { PaymentRepository } from './payment.repository';

@Module({
  imports: [ConfigModule],
  controllers: [MercadoPagoController],
  providers: [MercadoPagoService, PrismaService, ReservationsService, CampingGateway, PaymentRepository],
})
export class MercadoPagoModule {}
