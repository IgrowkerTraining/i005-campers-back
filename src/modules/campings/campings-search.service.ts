import { Inject, Injectable, NotFoundException } from '@nestjs/common';
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

  private readonly campingWithDetails = {
    include: {
      location: {
        select: {
          city: true,
          region: true,
          country: true,
          coordinates: true,
        },
      },
      pricing: true,
      amenities: true,
      nearbyAttractions: true,
    },
  };

  async searchCampings(filters: SearchCampingDto) {
    let { name, nearNature, location, pricing, amenities, lat, lng, radius, nearbyCampingName } = filters;

    const cacheKey = generateCacheKey(filters);
    const resultCache = await this.cacheManager.get(cacheKey);

    if (resultCache) {
      return resultCache;
    }

    let where: Prisma.CampingWhereInput = {
      AND: [
        ...(filters.pricePerNight ? [{ pricing: { some: { pricePerNight: Number(filters.pricePerNight) } } }] : []),
        ...(filters.city ? [{ location: { city: { equals: filters.city, mode: 'insensitive' } } }] : []),
        ...(filters.region ? [{ location: { region: { equals: filters.region, mode: 'insensitive' } } }] : []),
        ...(filters.country ? [{ location: { country: { equals: filters.country, mode: 'insensitive' } } }] : []),
        ...(filters.amenities
          ? [{ amenities: { some: { name: { equals: filters.amenities, mode: 'insensitive' } } } }]
          : []),
        ...(nearNature
          ? !Array.isArray(nearNature)
            ? [{ nearNature: { hasSome: [nearNature] } }]
            : nearNature.length > 0
              ? [{ nearNature: { hasEvery: nearNature } }]
              : []
          : []),
        ...(filters.nearbyAttractions
          ? [{ nearbyAttractions: { some: { name: { equals: filters.nearbyAttractions, mode: 'insensitive' } } } }]
          : []),
      ].filter(Boolean) as Prisma.CampingWhereInput[],
    };

    if (nearbyCampingName) {
      const nearbyCamping = await this.prisma.camping.findFirst({
        where: {
          name: {
            equals: nearbyCampingName,
            mode: 'insensitive',
          },
        },
        include: {
          location: true,
        },
      });

      if (!nearbyCamping) {
        throw new NotFoundException(`Camping with name "${nearbyCampingName}" not found.`);
      }

      if (!nearbyCamping.location?.coordinates) {
        throw new NotFoundException(`Camping with name "${nearbyCampingName}" does not have coordinates.`);
      }

      const coordinates = JSON.parse(nearbyCamping.location.coordinates);
      lat = coordinates.lat;
      lng = coordinates.lng;
    }

    if (lat !== undefined && lng !== undefined && radius !== undefined) {
      where = {
        AND: [
          ...(Array.isArray(where.AND) ? where.AND : [where.AND]),
          {
            location: {
              coordinates: {
                contains: `{"lat":${lat},"lng":${lng}}`,
              },
            },
          },
        ],
      };
    }

    const [campings, total] = await Promise.all([
      this.prisma.camping.findMany({
        ...this.campingWithDetails,
        where,
        skip: ((Number(filters.page) || 1) - 1) * (Number(filters.limit) || 10),
        take: Number(filters.limit) || 10,
        orderBy: {
          id: 'asc',
        },
      }),
      this.prisma.camping.count({ where }),
    ]);

    if (campings.length === 0) {
      throw new NotFoundException('No campings found with the specified criteria.');
    }

    const transformedCampings = campings.map((camping) => ({
      id: camping.id,
      name: camping.name,
      description: camping.description,
      location: {
        ...camping.location,
        coordinates: camping.location.coordinates, // Include coordinates in the location object
      },
      pricing: camping.pricing,
      amenities: camping.amenities,
      nearNature: camping.nearNature,
      nearbyAttractions: camping.nearbyAttractions,
      createdAt: camping.createdAt ? new Date(camping.createdAt).toLocaleDateString('en-CA') : null,
      updatedAt: camping.updatedAt ? new Date(camping.updatedAt).toLocaleDateString('en-CA') : null,
    }));

    const result = {
      data: transformedCampings,
      pagination: {
        total,
        page: Number(filters.page) || 1,
        limit: Number(filters.limit) || 10,
        totalPages: Math.ceil(total / (Number(filters.limit) || 10)),
      },
    };

    await this.cacheManager.set(cacheKey, result, 30000);
    return result;
  }
}
