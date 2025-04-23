import { Test, TestingModule } from '@nestjs/testing';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { JwtService } from '@nestjs/jwt';

describe('ReservationsController', () => {
  let controller: ReservationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReservationsController],
      providers: [
        ReservationsService,
        { provide: PrismaService, useValue: {} },
        { provide: CACHE_MANAGER, useValue: { get: jest.fn(), set: jest.fn(), del: jest.fn() } as Partial<Cache> },
        { provide: JwtService, useValue: {} },
      ],
    }).compile();

    controller = module.get<ReservationsController>(ReservationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
