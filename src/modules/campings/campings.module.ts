import { Module } from '@nestjs/common';
import { CampingsService } from './campings.service';
import { CampingsController } from './campings.controller';
import { PrismaModule } from '../../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  providers: [CampingsService],
  controllers: [CampingsController],
  exports: [CampingsService]
})
export class CampingsModule {}
