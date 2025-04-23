import { Test, TestingModule } from '@nestjs/testing';
import { CampingsService } from './campings.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CampingGateway } from '../webSockets/camping.gateway';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

describe('CampingService', () => {
  let service: CampingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CampingsService,
        {
          provide: PrismaService,
          useValue: {},
        },
        {
          provide: CampingGateway,
          useValue: {},
        },
        {
          provide: CloudinaryService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<CampingsService>(CampingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
