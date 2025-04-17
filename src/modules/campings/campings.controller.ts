import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  Query,
  Request,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CreateCampingDto } from './dto/create-camping.dto';

import { FileInterceptor } from '@nestjs/platform-express';

import { AuthGuardGuard } from 'src/guards/auth-guard.guard';
import { ApiBearerAuth, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';

@Controller('campings')
@ApiBearerAuth()
export class CampingsController {
  constructor(private readonly campingsService: CampingsService) {}

  @Post()
  @UseGuards(AuthGuardGuard)
  @UseInterceptors(FilesInterceptor('files'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
        createCampingDto: {
          type: 'string',
          example: '{"name": "John", "age": 30}',
        },
      },
    },
  })
  async create(
    @Request() req,
    @Body() createCampingDto: string,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 4 }),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
      }),
    )
    files: Express.Multer.File[],
  ) {
    const a = JSON.parse(createCampingDto['createCampingDto']) as CreateCampingDto;

    console.log(a, files);
    return await this.campingsService.create(a, req?.user.id, files);
  }

  // @Get()
  // async findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
  //   const pageNumber = Number(page);

  //   const limitNumber = Number(limit);

  //   return this.campingsService.findAll(pageNumber, limitNumber);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.campingsService.remove(+id);
  // }
}
