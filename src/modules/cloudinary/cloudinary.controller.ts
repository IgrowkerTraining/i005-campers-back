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
  Get,
  Delete,
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
  @UseInterceptors(FilesInterceptor('files'))
  async uploadFiles(@UploadedFiles() files: Array<Express.Multer.File>) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No images uploaded');
    }
    return await this.cloudinaryService.uploadFilesToCloudinary(files);
  }

  // // Endpoint to retrieve all images
  // @Get()
  // async findAll() {
  //   return await this.cloudinaryService.getAllImagesCloudinary();
  // }

  // // Endpoint to retrieve a specific image by ID
  // @Get(':id')
  // async findOne(@Param('id') id: string) {
  //   return await this.cloudinaryService.getImgByIdCloudinary(id);
  // }

  // // Endpoint to delete images
  // @Delete(':id')
  // async remove(@Body() deleteCloudinaryDto: DeleteCloudinaryDto) {
  //   return await this.cloudinaryService.deleteImgFromCloudinary(deleteCloudinaryDto.images);
  // }
}
