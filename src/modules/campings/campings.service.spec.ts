import { Test, TestingModule } from '@nestjs/testing';
import { CampingsService } from './campings.service';

describe('CampingService', () => {
  let service: CampingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CampingsService],
    }).compile();

    service = module.get<CampingsService>(CampingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
