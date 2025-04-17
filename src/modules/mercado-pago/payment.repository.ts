import { Injectable } from '@nestjs/common';
import { Payment } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PaymentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Omit<Payment, 'id' | 'payerEmail' | 'statusDetail'>) {
    await this.prisma.payment.create({
      data,
    });
  }

  async delete(id: number) {
    await this.prisma.payment.delete({ where: { id } });
  }

  async findFirst(reservationId: number): Promise<Payment | null> {
    return await this.prisma.payment.findFirst({
      where: {
        reservationId,
      },
    });
  }
}
