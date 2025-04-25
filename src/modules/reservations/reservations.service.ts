import { Inject, Injectable,Logger, UnprocessableEntityException } from '@nestjs/common';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { LimitCamping, Reservation } from '@prisma/client';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { RESERVATION_STATUS } from 'src/common/enums/reservation-status.enum';
import { RESERVATION_ERROR_MESSAGES } from 'src/common/errorMessages/reservations-error-messages';

interface ReservationDataType {
  campingId: number;
  startDate: string;
  endDate: string;
  peopleCount: number;
  tentsCount: number;
}

@Injectable()
export class ReservationsService {
  private readonly cachePrefixKey = 'reservations:';
  private readonly logger = new Logger(ReservationsService.name);
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(createReservationDto: CreateReservationDto) {
    const { campingId, startDate, endDate, peopleCount, tentsCount } = createReservationDto;

    const setStartDate = new Date(startDate).toISOString();
    const setEndDate = new Date(endDate).toISOString();

    this.checkDates(setStartDate, setEndDate);

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
      throw new UnprocessableEntityException(RESERVATION_ERROR_MESSAGES.LIMIT_EXCEEDED);
    }

    const availability = await this.checkAvailability({
      campingId,
      startDate: setStartDate,
      endDate: setEndDate,
      peopleCount,
      tentsCount,
      limitCamping,
    });

    if (!availability) {
      throw new UnprocessableEntityException(RESERVATION_ERROR_MESSAGES.NOT_AVAILABILITY);
    }

    this.cacheManager.del(`${this.cachePrefixKey}${campingId}`);
    this.logger.log(`Reservation created: ${createReservationDto.campingId}`);

    return this.prisma.reservation.create({
      data: {
        ...createReservationDto,
        startDate: setStartDate,
        endDate: setEndDate,
        status: RESERVATION_STATUS.PENDING,
      },
    });
  }

  findAll() {
    return this.prisma.reservation.findMany();
  }

  async findOne(id: number): Promise<Reservation | null> {
    return await this.prisma.reservation.findFirst({ where: { id } });
  }

  async findByCampingId(campingId: number): Promise<Reservation[]> {
    const resultCache = await this.cacheManager.get<Reservation[]>(`${this.cachePrefixKey}${campingId}`);

    if (resultCache) {
      return resultCache;
    }

    const response = await this.prisma.reservation.findMany({ where: { campingId: campingId } });

    await this.cacheManager.set<Reservation[]>(`${this.cachePrefixKey}${campingId}`, response);

    return response;
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
        status: {
          not: RESERVATION_STATUS.CANCELLED,
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
    this.logger.log(`Availability per day for camping ${data.campingId}:`, dateMap);
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

  private checkDates(start: string, end: string) {
    if (start >= end) {
      throw new UnprocessableEntityException(RESERVATION_ERROR_MESSAGES.END_DATE_INVALID);
    }

    if (start.split('T')[0] < new Date().toISOString().split('T')[0]) {
      throw new UnprocessableEntityException(RESERVATION_ERROR_MESSAGES.PAST_DAY);
    }
  }
}
