import {
  Controller,
  Get,
  Query,
  NotFoundException,
  HttpException,
  HttpStatus,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { CampingSearchService } from './campings-search.service';
import { SearchCampingDto } from './dto/search-camping.dto';
import { ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Campings - Search')
@Controller('campings/search')
@UseInterceptors(ClassSerializerInterceptor)
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
  @ApiQuery({ name: 'campiningAddress', required: false, type: String })
  @ApiQuery({ name: 'mapLink', required: false, type: String })
  @ApiQuery({ name: 'pricePerNight', required: false, type: Number })
  @ApiQuery({ name: 'tarifa', required: false, type: String })
  @ApiQuery({ name: 'amenities', required: false, isArray: true, type: String })
  @ApiQuery({ name: 'nearbyAttractions', required: false, isArray: true, type: String })
  @ApiQuery({ name: 'maxUsers', required: false, type: Number })
  @ApiQuery({ name: 'maxTents', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async search(@Query() searchParams: SearchCampingDto) {
    try {
      return await this.searchService.searchCampings(searchParams);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      throw error;
    }
  }
}
