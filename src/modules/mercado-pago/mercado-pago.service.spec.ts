import { Test, TestingModule } from '@nestjs/testing';
import { MercadoPagoService } from './mercado-pago.service';
import { ReservationsService } from '../reservations/reservations.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaymentRepository } from './payment.repository';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Reservation } from '@prisma/client';
import { RESERVATION_STATUS } from 'src/common/enums/reservation-status.enum';
import { MP_ERROR_MESSAGES } from 'src/common/errorMessages/mercado-pago-messages';

describe('MercadoPagoService', () => {
  let MpService: MercadoPagoService;
  let reservationService: ReservationsService;

  function ReservationResponseMock(overrides: Partial<Reservation> = {}): Reservation {
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 2);

    return {
      id: 4,
      cancelledAt: null,
      createdAt: new Date(),
      status: RESERVATION_STATUS.PENDING,
      updatedAt: null,
      campingId: 1,
      startDate: startDate,
      endDate: endDate,
      peopleCount: 2,
      tentsCount: 1,
      userId: 'abc-123-oeuoeu-oeu-oeu',
      ...overrides,
    };
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MercadoPagoService,
        {
          provide: ReservationsService,
          useValue: {
            findOne: jest.fn(),
          },
        },
        PrismaService,
        PaymentRepository,
        {
          provide: CACHE_MANAGER,
          useValue: {},
        },
      ],
    }).compile();

    MpService = module.get<MercadoPagoService>(MercadoPagoService);
    reservationService = module.get<ReservationsService>(ReservationsService);
  });

  it('should be defined', () => {
    expect(MpService).toBeDefined();
  });

  it('should throw if reservation is not found', async () => {
    (reservationService.findOne as jest.Mock).mockResolvedValue(null);

    await expect(MpService.createUrlPayment(1000, 999)).rejects.toThrow('Bad Request');
  });

  it('should throw if reservation status is not PENDING', async () => {
    (reservationService.findOne as jest.Mock).mockResolvedValue(
      ReservationResponseMock({ status: RESERVATION_STATUS.CONFIRMED }),
    );

    await expect(MpService.createUrlPayment(1000, 1)).rejects.toThrow(MP_ERROR_MESSAGES.STATUS_PENDING);

    (reservationService.findOne as jest.Mock).mockResolvedValue(
      ReservationResponseMock({ status: RESERVATION_STATUS.CANCELLED }),
    );

    await expect(MpService.createUrlPayment(1000, 1)).rejects.toThrow(MP_ERROR_MESSAGES.STATUS_PENDING);
  });
});
