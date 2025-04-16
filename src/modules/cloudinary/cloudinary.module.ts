// import { Module } from '@nestjs/common';
// import { CloudinaryService } from './cloudinary.service';
// import { CloudinayProvider } from './cloudinary.provider';
// import { CloudinaryController } from './cloudinary.controller';

// @Module({
//   providers: [CloudinayProvider, CloudinaryService],
//   exports: [CloudinayProvider, CloudinaryService],
//   controllers: [CloudinaryController],
// })
// export class CloudinaryModule {}

import { Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { CloudinaryController } from './cloudinary.controller';

@Module({
  controllers: [CloudinaryController],
  providers: [CloudinaryService],
  exports: [CloudinaryService],
})
export class CloudinaryModule {}
