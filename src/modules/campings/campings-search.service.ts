import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SearchCampingDto } from './dto/search-camping.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CampingSearchService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly campingWithDetails = {
    include: {
      location: {
        select: {
          city: true,
          region: true,
          country: true,
        },
      },
      pricing: true,
      amenities: true,
      nearbyAttractions: true,
    },
  };

  async searchCampings(filters: SearchCampingDto) {
    const { name, nearNature, location, pricePerNight, amenityName, country } = filters;

    let where: Prisma.CampingWhereInput = {
      AND: [
        ...(name ? [{ name: { contains: name, mode: 'insensitive' } as Prisma.StringFilter<'Camping'> }] : []),
        ...(nearNature ? [{ nearNature: { hasSome: nearNature } }] : []),
        ...(location?.country
          ? [
              {
                location: {
                  country: { equals: location.country, mode: 'insensitive' } as Prisma.StringFilter<'Location'>,
                },
              },
            ]
          : []),
        ...(pricePerNight ? [{ pricing: { some: { pricePerNight: { equals: Number(pricePerNight) } } } }] : []),
        ...(amenityName ? [{ amenities: { some: { name: { equals: amenityName, mode: 'insensitive' } } } }] : []),
      ].filter(Boolean) as any[],
    };

    const [campings, total] = await Promise.all([
      this.prisma.camping.findMany({
        ...this.campingWithDetails,
        where,
        skip: ((filters.page || 1) - 1) * (filters.limit || 10),
        take: filters.limit || 10,
      }),
      this.prisma.camping.count({ where }),
    ]);

    if (campings.length === 0) {
      throw new NotFoundException('No campings found with the specified criteria.');
    }

    return {
      data: campings,
      pagination: {
        total,
        page: filters.page || 1,
        limit: filters.limit || 10,
        totalPages: Math.ceil(total / (filters.limit || 10)),
      },
    };
  }

  async findNearby(lat: number, lng: number, radius: number, filters: SearchCampingDto) {
    const { name, season, nearNature, pricing, amenities, nearbyAttractions, location, page = 1, limit = 10 } = filters;

    const earthRadiusKm = 6371; // Radio de la Tierra en kilómetros
    const latitudRad = (lat * Math.PI) / 180;
    const longitudRad = (lng * Math.PI) / 180;

    const where: Prisma.CampingWhereInput = {
      ...(name && { name: { contains: name, mode: 'insensitive' } }),
      ...(season && {
        pricing: {
          some: {
            season: { equals: season, mode: 'insensitive' },
          },
        },
      }),
      ...(nearNature?.length && { nearNature: { hasSome: nearNature } }),
      ...(pricing?.length && {
        pricing: {
          some: {
            OR: pricing.map((p) => ({
              pricePerNight: p.pricePerNight ? { equals: p.pricePerNight } : undefined,
              season: p.season ? { equals: season, mode: 'insensitive' } : undefined,
            })),
          },
        },
      }),
      ...(amenities?.length && {
        amenities: {
          some: {
            OR: amenities.map((a) => ({
              name: a.name ? { equals: a.name, mode: 'insensitive' } : undefined,
              available: a.available !== undefined ? { equals: a.available } : undefined,
            })),
          },
        },
      }),
      ...(nearbyAttractions?.length && {
        nearbyAttractions: {
          some: {
            OR: nearbyAttractions.map((att) => ({
              name: att.name ? { contains: att.name, mode: 'insensitive' } : undefined,
              type: att.type ? { equals: att.type, mode: 'insensitive' } : undefined,
              distance: att.distance ? { lte: att.distance } : undefined,
            })),
          },
        },
      }),
      ...(location &&
        location.city && {
          location: {
            city: { contains: location.city, mode: 'insensitive' },
          },
        }),
      ...(location &&
        location.region && {
          location: {
            region: { contains: location.region, mode: 'insensitive' },
          },
        }),
      ...(location &&
        location.country && {
          location: {
            country: { equals: location.country, mode: 'insensitive' },
          },
        }),
      location: {
        coordinates: { contains: `{"lat":${lat},"lng":${lng}}` },
      },
    };

    const [campings, total] = await Promise.all([
      this.prisma.camping.findMany({
        ...this.campingWithDetails,
        where,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.camping.count({ where }),
    ]);

    return {
      data: campings,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
