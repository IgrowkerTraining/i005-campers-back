import { Test, TestingModule } from '@nestjs/testing';
import { CampingsController } from './campings.controller';

describe('CampingsController', () => {
  let controller: CampingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CampingsController],
    }).compile();

    controller = module.get<CampingsController>(CampingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
