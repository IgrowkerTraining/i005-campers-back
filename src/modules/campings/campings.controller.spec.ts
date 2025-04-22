import { Test, TestingModule } from '@nestjs/testing';
import { CampingsController } from './campings.controller';
import { AuthGuardGuard } from 'src/guards/auth-guard.guard';
import { JwtService } from '@nestjs/jwt';
import { CampingsService } from './campings.service';

describe('CampingsController', () => {
  let controller: CampingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CampingsController],
      providers: [
        { provide: JwtService, useValue: {} },
        { provide: CampingsService, useValue: {} },
      ],
    }).compile();

    controller = module.get<CampingsController>(CampingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
