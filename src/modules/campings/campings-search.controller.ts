import { Controller, Get, Query, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { CampingSearchService } from './campings-search.service';
import { SearchCampingDto } from './dto/search-camping.dto';
import { ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Campings - Search')
@Controller('campings/search')
export class CampingsSearchController {
  constructor(private readonly searchService: CampingSearchService) {}

  @Get()
  @ApiOkResponse({
    description: 'Returns filtered campings with detailed information',
    schema: {
      example: {
        data: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 10,
        },
      },
    },
  })
  @ApiQuery({ name: 'name', required: false, type: String })
  @ApiQuery({ name: 'season', required: false, enum: ['verano', 'invierno', 'primavera', 'otono'] })
  @ApiQuery({ name: 'nearNature', required: false, isArray: true, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'amenityName', required: false, type: String })
  @ApiQuery({ name: 'country', required: false, type: String })
  async search(@Query() searchParams: SearchCampingDto) {
    try {
      return await this.searchService.searchCampings(searchParams);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      throw error; // Re-lanza otros errores inesperados
    }
  }

  @Get('nearby')
  @ApiOkResponse({ description: 'Returns nearby campings within radius' })
  @ApiQuery({ name: 'lat', required: true, type: Number })
  @ApiQuery({ name: 'lng', required: true, type: Number })
  @ApiQuery({ name: 'radius', required: false, type: Number })
  async nearby(
    @Query('lat') lat: number,
    @Query('lng') lng: number,
    @Query('radius') radius: number = 10,
    @Query() searchParams: SearchCampingDto,
  ) {
    return this.searchService.findNearby(lat, lng, radius, searchParams);
  }
}
