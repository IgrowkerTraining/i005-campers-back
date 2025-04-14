import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CampingResponseDto, SearchCampingDto } from './dto/search-camping.dto';
import { Prisma } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { getDistance } from 'geolib';
import { Cache } from 'cache-manager';

import { CACHE_MANAGER } from '@nestjs/cache-manager';
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
      limitCamping: true,
    },
  };

  async searchCampings(filters: SearchCampingDto) {
    let { name, nearNature, location, pricing, amenities, nearbyAttractions, coordinates, lat, lng } = filters;

    const cacheKey = generateCacheKey(filters);
    const resultCache = await this.cacheManager.get(cacheKey);

    if (resultCache) {
      return resultCache;
    }

    const coordinateCondition =
      lat !== undefined && lng !== undefined
        ? { location: { coordinates: { contains: `{"lat":${lat},"lng":${lng}}` } } }
        : {};

    let where: Prisma.CampingWhereInput = {
      AND: [
        ...(filters.name ? [{ name: { equals: filters.name, mode: 'insensitive' } }] : []),
        ...(filters.pricePerNight ? [{ pricing: { some: { pricePerNight: Number(filters.pricePerNight) } } }] : []),
        ...(filters.city ? [{ location: { city: { equals: filters.city, mode: 'insensitive' } } }] : []),
        ...(filters.region ? [{ location: { region: { equals: filters.region, mode: 'insensitive' } } }] : []),
        ...(filters.country ? [{ location: { country: { equals: filters.country, mode: 'insensitive' } } }] : []),
        ...(lat !== undefined && lng !== undefined ? [coordinateCondition] : []),
        ...(amenities && Array.isArray(amenities)
          ? [
              {
                amenities: {
                  some: { OR: amenities.map((amenity) => ({ name: { equals: amenity, mode: 'insensitive' } })) },
                },
              },
            ]
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
        coordinates: camping.location.coordinates,
      },
      pricing: camping.pricing,
      amenities: camping.amenities,
      nearNature: camping.nearNature,
      nearbyAttractions: camping.nearbyAttractions,
      limitCamping: camping.limitCamping,
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

  async findNearby(lat: number, lng: number, radius: number, filters: SearchCampingDto) {
    const { location, page = 1, limit = 10 } = filters;

    const [campings, total] = await Promise.all([
      this.prisma.camping.findMany({
        include: {
          location: true,
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.camping.count(),
    ]);

    if (campings.length === 0) {
      throw new NotFoundException('No campings found with the specified criteria.');
    }

    const nearbyCampings = campings.filter((camping) => {
      if (!camping.location?.coordinates) {
        return false;
      }

      try {
        const campingCoords = JSON.parse(camping.location.coordinates);

        const distance = getDistance(
          { latitude: lat, longitude: lng },
          { latitude: campingCoords.lat, longitude: campingCoords.lng },
        );

        return distance <= radius * 1000;
      } catch (error) {
        console.error(`Error parsing coordinates for camping ${camping.id}:`, error);
        return false;
      }
    });
    if (campings.length === 0) {
      throw new NotFoundException('No campings found with the specified criteria.');
    }
    return {
      data: plainToInstance(CampingResponseDto, nearbyCampings),
      pagination: {
        total: nearbyCampings.length,
        page,
        limit,
        totalPages: Math.ceil(nearbyCampings.length / limit),
      },
    };
  }
}
