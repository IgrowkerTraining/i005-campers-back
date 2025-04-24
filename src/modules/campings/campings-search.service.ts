import {
  Inject,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SearchCampingDto } from './dto/search-camping.dto';
import { Prisma } from '@prisma/client';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { generateCacheKey } from 'src/common/keyCache.generate';
import { PrismaClientKnownRequestError, PrismaClientInitializationError } from '@prisma/client/runtime/library';
import e from 'express';

@Injectable()
export class CampingSearchService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private readonly campingWithDetails = {
    include: {
      location: true,
      pricing: true,
      amenities: true,
      nearbyAttractions: true,
      media: true,
      limitCamping: true,
    },
  };

  async searchCampings(filters: SearchCampingDto) {
    try {
      let { name, campingAddress, mapLink, amenities, pricePerNight, tarifa, nearbyAttractions, maxUsers, maxTents } =
        filters;

      const cacheKey = generateCacheKey(filters);
      const resultCache = await this.cacheManager.get(cacheKey);

      if (resultCache) {
        return resultCache;
      }

      if (filters.amenities && !Array.isArray(filters.amenities)) {
        filters.amenities = [filters.amenities];
      }

      if (filters.nearbyAttractions && !Array.isArray(filters.nearbyAttractions)) {
        filters.nearbyAttractions = [filters.nearbyAttractions];
      }

      let where: Prisma.CampingWhereInput = {
        AND: [
          ...(filters.name ? [{ name: { contains: filters.name, mode: 'insensitive' } }] : []),

          ...(filters.campingAddress
            ? [{ location: { campingAddress: { contains: filters.campingAddress, mode: 'insensitive' } } }]
            : []),
          ...(filters.mapLink ? [{ location: { mapLink: { contains: filters.mapLink, mode: 'insensitive' } } }] : []),

          ...(filters.amenities
            ? filters.amenities.map((amenity) => ({
                amenities: {
                  some: {
                    name: {
                      equals: amenity,
                      mode: 'insensitive',
                    },
                  },
                },
              }))
            : []),

          ...(filters.pricePerNight || filters.tarifa
            ? [
                {
                  pricing: {
                    some: {
                      AND: [
                        filters.pricePerNight ? { pricePerNight: Number(filters.pricePerNight) } : {},
                        filters.tarifa ? { tarifa: filters.tarifa } : {},
                      ],
                    },
                  },
                },
              ]
            : []),

          ...(filters.nearbyAttractions
            ? filters.nearbyAttractions.map((attraction) => ({
                nearbyAttractions: {
                  some: {
                    name: {
                      equals: attraction,
                      mode: 'insensitive',
                    },
                  },
                },
              }))
            : []),
          ...(filters.maxUsers ? [{ limitCamping: { maxUsers: Number(filters.maxUsers) } }] : []),
          ...(filters.maxTents ? [{ limitCamping: { maxTents: Number(filters.maxTents) } }] : []),
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
        location: camping.location,
        contactPhone: camping.contactPhone,
        media: camping.media,
        pricing: camping.pricing,
        amenities: camping.amenities,
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
    } catch (error) {
      if (error instanceof PrismaClientInitializationError) {
        throw new ServiceUnavailableException('Database connection error.');
      }
      if (error instanceof BadRequestException) {
        throw error;
      }

      if (error instanceof InternalServerErrorException) {
        throw new InternalServerErrorException('Failed to search campings.');
      }
      throw error;
    }
  }
}
