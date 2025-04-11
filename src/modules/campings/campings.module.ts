import { Module } from '@nestjs/common';
import { CampingsService } from './campings.service';
import { CampingsController } from './campings.controller';
import { PrismaModule } from '../../prisma/prisma.module'
import { CampingSearchService } from './campings-search.service';
import { CampingsSearchController } from './campings-search.controller';
import { CampingGateway } from '../webSockets/camping.gateway';

@Module({
  imports: [PrismaModule],
  providers: [CampingsService, CampingSearchService, CampingGateway],
  controllers: [CampingsController, CampingsSearchController],
  exports: [CampingsService, CampingGateway]
})
export class CampingsModule {}
