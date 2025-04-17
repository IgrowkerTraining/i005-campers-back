import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Query, Request, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { CreateCampingDto } from './dto/create-camping.dto';
import { CampingsService } from './campings.service';
import { AuthGuardGuard } from 'src/guards/auth-guard.guard';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { createReviewDto } from './dto/create-review.dto';
import { ReviewResponseDto } from './dto/review-response.dto';

@Controller('campings')
@ApiBearerAuth()
export class CampingsController {
  constructor(private readonly campingsService: CampingsService) {}

  @Post()
  @UseGuards(AuthGuardGuard)
  async create(@Request() req, @Body() createCampingDto: CreateCampingDto) {
    return await this.campingsService.create(createCampingDto, req?.user.id);
  }

  @Get()
  async findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    return this.campingsService.findAll(pageNumber, limitNumber);
  }

  @Delete(':id')
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
