import {
  BadRequestException,
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
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CampingResponseDto, CreateCampingDto } from './dto/create-camping.dto';
import { CampingsService } from './campings.service';
import { AuthGuardGuard } from 'src/guards/auth-guard.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/decorators/roles.decorators';
import { Role } from 'src/common/enums/role.enum';
import { RolesGuard } from 'src/guards/roles.guard';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ReviewResponseDto } from './dto/review-response.dto';
import { createReviewDto } from './dto/create-review.dto';
import { CreateFavouritesDto } from './dto/favourites-camping.dto';

@Controller('campings')
@ApiBearerAuth()
export class CampingsController {
  constructor(private readonly campingsService: CampingsService) {}

  @Post()
  // @ApiTags('Campings - Create')
  @UseGuards(AuthGuardGuard)
  // @Roles(Role.owner)
  @UseInterceptors(FilesInterceptor('files'))
  // @UsePipes(new ValidationPipe({ transform: true, validateCustomDecorators: true }))
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
  // @ApiTags('Campings - Search All Campings')
  @UseGuards(AuthGuardGuard)
  // @UsePipes(new ValidationPipe({ transform: true, validateCustomDecorators: true }))
  async findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    return this.campingsService.findAll(pageNumber, limitNumber);
  }

  @Delete(':id')
  // @ApiTags('Campings - Delete One camping')
  @UseGuards(AuthGuardGuard, RolesGuard)
  // @UsePipes(new ValidationPipe({ transform: true, validateCustomDecorators: true }))
  @Roles(Role.owner)
  remove(@Param('id') id: string) {
    return this.campingsService.remove(+id);
  }
  @Post(':id/reviews')
  // @ApiTags('Campings - Create Reviews')
  @UseGuards(AuthGuardGuard)
  // @UsePipes(new ValidationPipe({ transform: true, validateCustomDecorators: true }))
  @ApiOperation({ summary: 'Crear una o más reseñas para un camping' })
  @ApiResponse({ status: 201, type: [ReviewResponseDto] })
  @ApiBody({ type: [createReviewDto] })
  createReviews(@Body() body: createReviewDto, @Request() req) {
    return this.campingsService.createReviews(req.user.id, [body]);
  }
  @Get(':id/reviews')
  // @ApiTags('Campings - Get Reviews')
  @UseGuards(AuthGuardGuard)
  // @UsePipes(new ValidationPipe({ transform: true, validateCustomDecorators: true }))
  @ApiOperation({ summary: 'Obtener reseñas de un camping' })
  @ApiResponse({ status: 200, type: [ReviewResponseDto] })
  getReviews(@Param('id') campingId: string): Promise<ReviewResponseDto[]> {
    return this.campingsService.getReviewsByCampingId(parseInt(campingId));
  }

  @Post(':id/favourites')
  // @ApiTags('Campings - Add Favourites')
  @UseGuards(AuthGuardGuard)
  // @UsePipes(new ValidationPipe({ transform: true, validateCustomDecorators: true }))

  // @Roles(Role.owner)
  async addFavourite(@Param('id') campingId: string, @Request() req) {
    // Si el userId viene del token, no es necesario recibirlo en el body
    const dto: CreateFavouritesDto = {
      campingId: Number(campingId),
      userId: req.user.id,
    };
    await this.campingsService.addFavourite(dto);
    return { message: 'Camping agregado a favoritos' };
  }

  @Delete(':id/favourites')
  // @ApiTags('Campings - Remove Favourites')
  @UseGuards(AuthGuardGuard)
  // @UsePipes(new ValidationPipe({ transform: true, validateCustomDecorators: true }))
  async removeFavourite(@Param('id') campingId: string, @Request() req) {
    await this.campingsService.removeFavourite(req.user.id, Number(campingId));
    return { message: 'Camping eliminado de favoritos' };
  }

  @Get('favourites')
  // @ApiTags('Campings - Get All Favourites')
  @UseGuards(AuthGuardGuard)
  // @UsePipes(new ValidationPipe({ transform: true, validateCustomDecorators: true }))
  @ApiOperation({ summary: 'Listar campings favoritos del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Lista de campings favoritos', type: [CampingResponseDto] })
  async getFavourites(@Request() req) {
    return this.campingsService.getFavouritesByUser(req.user.id);
  }
}
