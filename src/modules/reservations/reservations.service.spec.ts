import { Test, TestingModule } from '@nestjs/testing';
import { ReservationsService } from './reservations.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UnprocessableEntityException } from '@nestjs/common';
import { RESERVATION_ERROR_MESSAGES } from 'src/common/errorMessages/reservations-error-messages';

describe('ReservationsService', () => {
  let service: ReservationsService;
  let cache: Cache;
  let prismaService: PrismaService;

  function createReservationMock(overrides: Partial<CreateReservationDto> = {}): CreateReservationDto {
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 2);

    return {
      campingId: 1,
      startDate: startDate,
      endDate: endDate,
      peopleCount: 2,
      tentsCount: 1,
      userId: 'abc-123',
      ...overrides,
    };
  }

  const fakeCampingId = 1;
  const fakeCacheKey = `reservations:${fakeCampingId}`;
  const fakeReservations = [
    createReservationMock({ campingId: fakeCampingId }),
    createReservationMock({ campingId: fakeCampingId }),
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        {
          provide: PrismaService,
          useValue: {
            camping: {
              findFirstOrThrow: jest.fn().mockResolvedValue({
                limitCamping: {
                  maxTents: 10,
                  maxUsers: 20,
                },
              }),
            },
            reservation: {
              findMany: jest.fn().mockResolvedValue(fakeReservations),
            },
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn().mockResolvedValue(fakeReservations),
            set: jest.fn(),
            del: jest.fn(),
          } as Partial<Cache>,
        },
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);
    cache = module.get<Cache>(CACHE_MANAGER);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw an error if the start date is in the past', async () => {
      const startDate = new Date('2020-05-05');
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 2);

      try {
        await service.create(createReservationMock({ startDate, endDate }));
      } catch (error) {
        expect(error).toBeInstanceOf(UnprocessableEntityException);
        expect(error.getStatus()).toBe(422);
        expect(error.message).toBe(RESERVATION_ERROR_MESSAGES.PAST_DAY);
      }
    });

    it('should throw an error if the end date is less or same to start date', async () => {
      const startDate = new Date();
      const endDate = startDate;

      try {
        await service.create(createReservationMock({ startDate, endDate }));
      } catch (error) {
        expect(error).toBeInstanceOf(UnprocessableEntityException);
        expect(error.getStatus()).toBe(422);
        expect(error.message).toBe(RESERVATION_ERROR_MESSAGES.END_DATE_INVALID);
      }
    });

    it('should throw an error if the limit of people or tents is exceeded', async () => {
      try {
        await service.create(createReservationMock({ peopleCount: 50, tentsCount: 100 }));
      } catch (error) {
        expect(error).toBeInstanceOf(UnprocessableEntityException);
        expect(error.getStatus()).toBe(422);
        expect(error.message).toBe(RESERVATION_ERROR_MESSAGES.LIMIT_EXCEEDED);
      }
    });
  });

  describe('findByCampingId', () => {
    it('should return cached reservations if cache exists', async () => {
      const result = await service.findByCampingId(fakeCampingId);

      expect(cache.get).toHaveBeenCalledWith(fakeCacheKey);
      expect(result).toEqual(fakeReservations);
      expect(prismaService.reservation.findMany).not.toHaveBeenCalled();
    });

    it('should query DB and cache result if no cache found', async () => {
      (cache.get as jest.Mock).mockResolvedValue(undefined);

      const result = await service.findByCampingId(fakeCampingId);

      expect(cache.get).toHaveBeenCalledWith(fakeCacheKey);
      expect(prismaService.reservation.findMany).toHaveBeenCalledWith({ where: { campingId: fakeCampingId } });
      expect(cache.set).toHaveBeenCalledWith(fakeCacheKey, fakeReservations);
      expect(result).toEqual(fakeReservations);
    });
  });
});
