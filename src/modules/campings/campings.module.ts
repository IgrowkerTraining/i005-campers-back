import { Module } from '@nestjs/common';
import { CampingsService } from './campings.service';
import { CampingsController } from './campings.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { CampingSearchService } from './campings-search.service';
import { CampingsSearchController } from './campings-search.controller';
import { CampingGateway } from '../webSockets/camping.gateway';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Module({
  imports: [PrismaModule],
  providers: [CampingsService, CampingSearchService, CampingGateway, CloudinaryService],
  controllers: [CampingsController, CampingsSearchController],
  exports: [CampingsService, CampingGateway],
})
export class CampingsModule {}
