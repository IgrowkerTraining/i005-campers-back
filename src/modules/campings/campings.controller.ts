import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseArrayPipe,
  ParseFilePipe,
  Post,
  Put,
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
import { UpdateCampingDto } from './dto/update-camping.dto';

@Controller('campings')
@ApiTags('Campings')
@ApiBearerAuth()
export class CampingsController {
  constructor(private readonly campingsService: CampingsService) {}

  @Post()
  @UseGuards(AuthGuardGuard, RolesGuard)
  @Roles(Role.owner)
  @ApiOperation({ summary: 'Create a new camping' })
  @UseInterceptors(FilesInterceptor('files'))
  @UsePipes(new ValidationPipe({ transform: true, validateCustomDecorators: true }))
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
  @UseGuards(AuthGuardGuard)
  @ApiOperation({ summary: 'Get all campings' })
  @UsePipes(new ValidationPipe({ transform: true, validateCustomDecorators: true }))
  async findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    return this.campingsService.findAll(pageNumber, limitNumber);
  }

  @Delete(':id')
  @UseGuards(AuthGuardGuard, RolesGuard)
  @Roles(Role.owner)
  @ApiOperation({ summary: 'Delete one camping' })
  @UsePipes(new ValidationPipe({ transform: true, validateCustomDecorators: true }))
  async remove(@Param('id') id: string, @Request() req) {
    const userId = req.user.id;
    return this.campingsService.remove(+id, userId);
  }

  @Put(':id')
  @UseGuards(AuthGuardGuard, RolesGuard)
  @Roles(Role.owner)
  @ApiOperation({ summary: 'Update one camping' })
  @UseInterceptors(FilesInterceptor('files'))
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
        updateCampingDto: {
          type: 'string',
          example: '{"name": "Updated Name", "description": "Updated Description"}',
        },
      },
    },
  })
  async update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateCampingDto: string,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    if (files && files.length > 0) {
      const maxFileSize = 1024 * 1024 * 4; // 4MB
      const allowedFileTypes = ['.png', '.jpeg', '.jpg'];

      for (const file of files) {
        const fileSizeValidator = new MaxFileSizeValidator({ maxSize: maxFileSize });
        if (!fileSizeValidator.isValid(file)) {
          throw new BadRequestException(`File size exceeds the limit of ${maxFileSize / (1024 * 1024)} MB`);
        }

        const fileTypeValidator = new FileTypeValidator({ fileType: allowedFileTypes.join('|') });
        if (!fileTypeValidator.isValid(file)) {
          throw new BadRequestException(`Invalid file type. Allowed types are ${allowedFileTypes.join(', ')}`);
        }
      }
    }

    const parsedDto = JSON.parse(updateCampingDto['updateCampingDto']) as UpdateCampingDto;
    return await this.campingsService.update(Number(id), parsedDto, req.user.id, files);
  }

  // createReviews

  @Post(':id/reviews')
  @UseGuards(AuthGuardGuard)
  @UsePipes(new ValidationPipe({ transform: true, validateCustomDecorators: true }))
  @ApiOperation({ summary: 'Create camping reviews' })
  @ApiResponse({ status: 201, type: [ReviewResponseDto] })
  @ApiBody({ type: createReviewDto })
  createReviews(@Body() body: createReviewDto, @Request() req) {
    return this.campingsService.createReviews(req.user.id, [body]);
  }

  @Get(':id/reviews')
  @UseGuards(AuthGuardGuard)
  @UsePipes(new ValidationPipe({ transform: true, validateCustomDecorators: true }))
  @ApiOperation({ summary: 'Get reviews from one camping' })
  @ApiResponse({ status: 200, type: [ReviewResponseDto] })
  getReviews(@Param('id') campingId: string): Promise<ReviewResponseDto[]> {
    return this.campingsService.getReviewsByCampingId(parseInt(campingId));
  }

  @Post(':id/favourites')
  @UseGuards(AuthGuardGuard)
  @ApiOperation({ summary: 'Add one camping to favourites' })
  @UsePipes(new ValidationPipe({ transform: true, validateCustomDecorators: true }))
  async addFavourite(@Param('id') campingId: string, @Request() req) {
    const dto: CreateFavouritesDto = {
      campingId: Number(campingId),
      userId: req.user.id,
    };
    await this.campingsService.addFavourite(dto);
    return { message: 'Camping added to favourites' };
  }

  @Delete(':id/favourites')
  @UseGuards(AuthGuardGuard)
  @ApiOperation({ summary: 'Delete one camping from favourites' })
  @UsePipes(new ValidationPipe({ transform: true, validateCustomDecorators: true }))
  async removeFavourite(@Param('id') campingId: string, @Request() req) {
    await this.campingsService.removeFavourite(req.user.id, Number(campingId));
    return { message: 'Camping deleted from favourites' };
  }

  @Get('favourites')
  @UseGuards(AuthGuardGuard)
  @ApiOperation({ summary: 'Get all favourite campings of the authenticated user' })
  @UsePipes(new ValidationPipe({ transform: true, validateCustomDecorators: true }))
  // @ApiResponse({ status: 200, description: 'Lista de campings favoritos', type: [CampingResponseDto] })
  async getFavourites(@Request() req) {
    return this.campingsService.getFavouritesByUser(req.user.id);
  }
}
