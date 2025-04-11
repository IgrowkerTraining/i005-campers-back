import { Injectable, NotAcceptableException } from '@nestjs/common';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { LimitCamping, Reservation } from '@prisma/client';

interface ReservationDataType {
  campingId: number;
  startDate: string;
  endDate: string;
  peopleCount: number;
  tentsCount: number;
}

@Injectable()
export class ReservationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createReservationDto: CreateReservationDto) {
    const { campingId, startDate, endDate, peopleCount, tentsCount } = createReservationDto;

    if (startDate > endDate) {
      throw new NotAcceptableException('La fecha de inicio de reserva no puede ser mayor a la de finalizacion');
    }

    const { limitCamping } = await this.prisma.camping.findFirstOrThrow({
      where: {
        id: campingId,
      },
      select: {
        limitCamping: {
          select: {
            maxTents: true,
            maxUsers: true,
          },
        },
      },
    });

    if (tentsCount > limitCamping.maxTents || peopleCount > limitCamping.maxUsers) {
      throw new NotAcceptableException('La reserva supera el limite personas o carpas permitidos en el camping');
    }

    const setStartDate = new Date(startDate).toISOString();
    const setEndDate = new Date(endDate).toISOString();

    const availability = await this.checkAvailability({
      campingId,
      startDate: setStartDate,
      endDate: setEndDate,
      peopleCount,
      tentsCount,
      limitCamping,
    });

    if (!availability) {
      throw new NotAcceptableException(
        'La reserva supera el límite de carpas o personas permitidas en alguna de las fechas seleccionadas.',
      );
    }

    return this.prisma.reservation.create({
      data: { ...createReservationDto, startDate: setStartDate, endDate: setEndDate },
    });
  }

  findAll() {
    return this.prisma.reservation.findMany();
  }

  findOne(id: number) {
    return this.prisma.reservation.findFirstOrThrow({ where: { id } });
  }

  findByCampingId(campingId: number) {
    return this.prisma.reservation.findMany({ where: { campingId: campingId } });
  }

  update(id: number, updateReservationDto: UpdateReservationDto) {
    return this.prisma.reservation.update({ data: updateReservationDto, where: { id } });
  }

  remove(id: number) {
    return this.prisma.reservation.delete({ where: { id } });
  }

  private findByPeriodTime({
    startDate,
    endDate,
    campingId,
  }: Pick<ReservationDataType, 'endDate' | 'startDate' | 'campingId'>): Promise<Reservation[]> {
    return this.prisma.reservation.findMany({
      where: {
        campingId,
        startDate: {
          lte: new Date(endDate).toISOString(),
        },
        endDate: {
          gte: new Date(startDate).toISOString(),
        },
      },
    });
  }

  async availabilityPerDay(data: Pick<ReservationDataType, 'endDate' | 'startDate' | 'campingId'>) {
    const reservationsBetween = await this.findByPeriodTime(data);

    // tiene la cantidad de personas y carpas por dia en el camping
    const dateMap = new Map<string, { people: number; tents: number }>();

    reservationsBetween.forEach((reservation) => {
      const curr = new Date(reservation.startDate);
      const end = new Date(reservation.endDate);

      while (curr <= end) {
        if (curr >= new Date(data.startDate) && curr <= new Date(data.endDate)) {
          const key = curr.toISOString().split('T')[0];
          const totals = dateMap.get(key) || { people: 0, tents: 0 };

          totals.people += reservation.peopleCount;
          totals.tents += reservation.tentsCount;
          dateMap.set(key, totals);
        }

        curr.setDate(curr.getDate() + 1);
      }
    });

    return dateMap;
  }

  private async checkAvailability(
    data: ReservationDataType & {
      limitCamping: Pick<LimitCamping, 'maxTents' | 'maxUsers'>;
    },
  ) {
    const { limitCamping, ...restData } = data;

    const availabilityPerDay: Map<string, { people: number; tents: number }> = await this.availabilityPerDay(restData);

    for (const [key] of availabilityPerDay) {
      const valueMap = availabilityPerDay.get(key);

      if (
        valueMap.tents + data.tentsCount > limitCamping.maxTents ||
        valueMap.people + data.peopleCount > limitCamping.maxUsers
      ) {
        return false;
      }
    }
    return true;
  }
}
