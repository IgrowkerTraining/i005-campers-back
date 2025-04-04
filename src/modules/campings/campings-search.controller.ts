import { Controller, Get, Query, ParseIntPipe } from '@nestjs/common';
import { CampingSearchService } from './campings-search.service';
import { SearchCampingDto } from './dto/search-camping.dto';
import { ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Campings - Search')
@Controller('campings/search')
export class CampingsSearchController {
  constructor(private readonly searchService: CampingSearchService) {}

  @Get()
  @ApiOkResponse({ description: 'Returns filtered campings' })
  @ApiQuery({ name: 'location', required: false })
  @ApiQuery({ name: 'region', required: false })
  @ApiQuery({ name: 'minPrice', required: false, type: Number })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number })
  @ApiQuery({ name: 'amenities', required: false, isArray: true })
  @ApiQuery({ name: 'proximityToNature', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async search(@Query() searchParams: SearchCampingDto) {
    return this.searchService.searchCampings(searchParams);
  }

  @Get('nearby')
  @ApiOkResponse({ description: 'Returns nearby campings within radius' })
  @ApiQuery({ name: 'lat', required: true, type: Number })
  @ApiQuery({ name: 'lng', required: true, type: Number })
  @ApiQuery({ name: 'radius', required: false, type: Number })
  async nearby(
    @Query('lat', ParseIntPipe) lat: number,
    @Query('lng', ParseIntPipe) lng: number,
    @Query('radius', ParseIntPipe) radius: number = 10,
  ) {
    return this.searchService.findNearby(lat, lng, radius);
  }
}
