import { Test, TestingModule } from '@nestjs/testing';
import { CampingService } from './campings.service';

describe('CampingService', () => {
  let service: CampingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CampingService],
    }).compile();

    service = module.get<CampingService>(CampingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
