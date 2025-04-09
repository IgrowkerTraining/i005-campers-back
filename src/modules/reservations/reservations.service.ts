import { Injectable } from '@nestjs/common';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class ReservationsService {
  private readonly reservation: PrismaClient['reservation'];
  constructor(private readonly prisma: PrismaService) {
    this.reservation = prisma.reservation;
  }

  create(createReservationDto: CreateReservationDto) {
    return this.reservation.create({ data: createReservationDto });
  }

  findAll() {
    return this.reservation.findMany();
  }

  findOne(id: number) {
    return this.reservation.findFirstOrThrow({ where: { id } });
  }

  findByCampingId(campingId: number) {
    return this.reservation.findMany({ where: { campingId: campingId } });
  }

  update(id: number, updateReservationDto: UpdateReservationDto) {
    return this.reservation.update({ data: updateReservationDto, where: { id } });
  }

  remove(id: number) {
    return this.reservation.delete({ where: { id } });
  }
}
