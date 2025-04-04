import { Module } from '@nestjs/common';
import { CampingsService } from './campings.service';
import { CampingsController } from './campings.controller';
import { PrismaModule } from '../../prisma/prisma.module'
import { CampingSearchService } from './campings-search.service';
import { CampingsSearchController } from './campings-search.controller';

@Module({
  imports: [PrismaModule],
  providers: [CampingsService, CampingSearchService],
  controllers: [CampingsController, CampingsSearchController],
  exports: [CampingsService]
})
export class CampingsModule {}
