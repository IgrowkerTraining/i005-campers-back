import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SearchCampingDto } from './dto/search-camping.dto';
import { Prisma } from '@prisma/client';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { generateCacheKey } from 'src/common/keyCache.generate';

@Injectable()
export class CampingSearchService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private campingWithDetails = Prisma.validator<Prisma.CampingDefaultArgs>()({
    include: {
      amenities: true,
      location: true,
      pricing: true,
      nearbyAttractions: true,
    },
  });

  private async delay() {
    return new Promise((res, rej) => {
      setTimeout(() => {
        res(true);
      }, 900);
    });
  }

  async searchCampings(filters: SearchCampingDto) {
    const { location, region, minPrice, maxPrice, amenities, proximityToNature, page = 1, limit = 10 } = filters;

    const cacheKey = generateCacheKey(filters);
    const resultCache = await this.cacheManager.get(cacheKey);

    if (resultCache) {
      return resultCache;
    }

    const where: Prisma.CampingWhereInput = {
      AND: [
        location
          ? {
              OR: [
                { name: { contains: location, mode: 'insensitive' } },
                {
                  location: {
                    city: { contains: location, mode: 'insensitive' },
                  },
                },
              ],
            }
          : {},
        region ? { location: { region: { contains: region, mode: 'insensitive' } } } : {},
        minPrice ? { pricing: { some: { pricePerNight: { gte: minPrice } } } } : {},
        maxPrice ? { pricing: { some: { pricePerNight: { lte: maxPrice } } } } : {},
        amenities?.length ? { amenities: { some: { name: { in: amenities } } } } : {},
        proximityToNature
          ? {
              nearbyAttractions: {
                some: { distance: { lte: proximityToNature } },
              },
            }
          : {},
      ],
    };

    const result = await this.prisma.camping.findMany({
      ...this.campingWithDetails,
      where,
      skip: (page - 1) * limit,
      take: +limit,
      orderBy: {
        // modificado para visualizar paginacion
        // pricing: { _count: 'asc' },
        id: 'asc',
      },
    });
    //visualizar cache
    await this.delay();

    await this.cacheManager.set(cacheKey, result, 30000);
    return result;
  }

  async findNearby(lat: number, lng: number, radius: number) {
    return this.prisma.$queryRaw`
      SELECT 
        c.*,
        ST_Distance(
          ST_MakePoint(${lng}, ${lat})::geography,
          ST_MakePoint(l.longitude, l.latitude)::geography
        ) as distance
      FROM 
        "Camping" c
      JOIN 
        "Location" l ON c."locationId" = l.id
      WHERE 
        ST_DWithin(
          ST_MakePoint(${lng}, ${lat})::geography,
          ST_MakePoint(l.longitude, l.latitude)::geography,
          ${radius * 1000}
        )
      ORDER BY distance
    `;
  }
}
