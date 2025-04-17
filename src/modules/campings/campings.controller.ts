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
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CreateCampingDto } from './dto/create-camping.dto';
import { CampingsService } from './campings.service';
import { AuthGuardGuard } from 'src/guards/auth-guard.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from 'src/decorators/roles.decorators';
import { Role } from 'src/common/enums/role.enum';
import { RolesGuard } from 'src/guards/roles.guard';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('campings')
@ApiBearerAuth()
export class CampingsController {
  constructor(private readonly campingsService: CampingsService) {}

  @Post()
  @UseGuards(AuthGuardGuard, RolesGuard)
  @Roles(Role.owner)
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

  @Get()
  async findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    return this.campingsService.findAll(pageNumber, limitNumber);
  }

  @Delete(':id')
  @UseGuards(AuthGuardGuard, RolesGuard)
  @Roles(Role.owner)
  remove(@Param('id') id: string) {
    return this.campingsService.remove(+id);
  }
  // createReviews
  @Post(':id/reviews')
  @UseGuards(AuthGuardGuard)
  @UsePipes(new ValidationPipe({ transform: true, validateCustomDecorators: true }))
  @ApiOperation({ summary: 'Crear una o más reseñas para un camping' })
  @ApiResponse({ status: 201, type: [ReviewResponseDto] })
  @ApiBody({ type: [createReviewDto] })
  createReviews(
    @Param('id') campingId: string,
    @Body() body: createReviewDto | createReviewDto[],
    @Request() req,
  ) {
    const createReviewDtos = Array.isArray(body) ? body : [body];

    const parseCampingId = parseInt(campingId);

    createReviewDtos.forEach((dto) => {
      if (dto.campingId !== parseCampingId) {
        throw new BadRequestException('El campingId en el cuerpo de la solicitud no coincide con el parámetro de la URL');
      }
    });
  
    return this.campingsService.createReviews(req.user.id, createReviewDtos);
  }
  // getReviews
  @Get(':id/reviews')
  @ApiOperation({ summary: 'Obtener reseñas de un camping' })
  @ApiResponse({ status: 200, type: [ReviewResponseDto] })
  getReviews(@Param('id') campingId: string): Promise<ReviewResponseDto[]> {
    return this.campingsService.getReviewsByCampingId(parseInt(campingId));
  }
  
}
