import { Module } from '@nestjs/common';
import { CampingsController } from './campings.controller';

@Module({
  controllers: [CampingsController]
})
export class CampingsModule {}
