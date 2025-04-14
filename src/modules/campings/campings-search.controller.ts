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
  @ApiQuery({ name: 'pricePerNight', required: false, type: Number })
  @ApiQuery({ name: 'nearNature', required: false, isArray: true, type: String })
  @ApiQuery({ name: 'amenities', required: false, isArray: true, type: String })
  @ApiQuery({ name: 'city', required: false, type: String })
  @ApiQuery({ name: 'region', required: false, type: String })
  @ApiQuery({ name: 'country', required: false, type: String })
  @ApiQuery({ name: 'lat', required: false, type: Number })
  @ApiQuery({ name: 'lng', required: false, type: Number })
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
  @Get('nearby')
  @ApiOkResponse({
    description: 'Returns nearby campings within a given radius. You can search by coordinates or by a camping name.',
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
  @ApiQuery({
    name: 'name',
    required: false,
    type: String,
    description: 'Name of the camping to use as the center point',
  })
  @ApiQuery({ name: 'lat', required: false, type: Number, description: 'Latitude of the center point' })
  @ApiQuery({ name: 'lng', required: false, type: Number, description: 'Longitude of the center point' })
  @ApiQuery({ name: 'radius', required: true, type: Number, description: 'Radius in kilometers' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async nearby(
    @Query('lat') lat?: number,
    @Query('lng') lng?: number,
    @Query('radius') radius = 10,
    @Query('name') name?: string,
    @Query() searchParams?: SearchCampingDto,
  ) {
    try {
      if (!name && (lat === undefined || lng === undefined)) {
        throw new HttpException(
          'You must provide either a camping name or both latitude and longitude.',
          HttpStatus.BAD_REQUEST,
        );
      }

      return await this.searchService.findNearby(lat!, lng!, radius, { ...searchParams, name });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      throw error;
    }
  }
}
