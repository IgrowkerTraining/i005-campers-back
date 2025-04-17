// import {
//   Controller,
//   FileTypeValidator,
//   MaxFileSizeValidator,
//   ParseFilePipe,
//   Post,
//   UploadedFile,
//   UseInterceptors,
// } from '@nestjs/common';
// import { CloudinaryService } from './cloudinary.service';
// import { FileInterceptor } from '@nestjs/platform-express';
// import { ApiBody, ApiConsumes } from '@nestjs/swagger';

// @Controller('cloudinary')
// export class CloudinaryController {
//   constructor(private readonly cloudinaryService: CloudinaryService) {}

//   @Post('upload')
//   @UseInterceptors(FileInterceptor('file'))
//   @ApiConsumes('multipart/form-data')
//   @ApiBody({
//     schema: {
//       type: 'object',
//       properties: {
//         file: {
//           type: 'string',
//           format: 'binary',
//         },
//       },
//     },
//   })
//   uploadImage(
//     @UploadedFile(
//       new ParseFilePipe({
//         validators: [
//           new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 4 }),
//           new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
//         ],
//       }),
//     )
//     file: Express.Multer.File,
//   ) {
//     console.log(file);

//     return this.cloudinaryService.uploadFile(file);
//   }
// }

import {
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  Body,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { FilesInterceptor } from '@nestjs/platform-express';
// import { DeleteCloudinaryDto } from './dto/delete-cloudinary.dto';

@Controller('cloudinary')
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  // Endpoint to upload multiple files
  @Post('upload')
  @UseInterceptors(FileInterceptor('files'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  uploadImage(
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 4 }),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
      }),
    )
    files: Express.Multer.File,
  ) {
    console.log(files);

    return this.cloudinaryService.uploadFiles(files);
  }
}
