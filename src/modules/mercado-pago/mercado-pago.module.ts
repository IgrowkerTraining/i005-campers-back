import { Module } from '@nestjs/common';
import { MercadoPagoService } from './mercado-pago.service';
import { MercadoPagoController } from './mercado-pago.controller';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [ConfigModule],
  controllers: [MercadoPagoController],
  providers: [MercadoPagoService, PrismaService],
})
export class MercadoPagoModule {}
