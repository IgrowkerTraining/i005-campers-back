import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SearchCampingDto } from './dto/search-camping.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CampingSearchService {
  constructor(private readonly prisma: PrismaService) {}

  private campingWithDetails = Prisma.validator<Prisma.CampingDefaultArgs>()({
    include: {
      amenities: true,
      location: true,
      pricing: true,
      nearbyAttractions: true,
    },
  });

  async searchCampings(filters: SearchCampingDto) {
    const {
      location,
      region,
      minPrice,
      maxPrice,
      amenities,
      proximityToNature,
      page = 1,
      limit = 10,
    } = filters;

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
        region
          ? { location: { region: { contains: region, mode: 'insensitive' } } }
          : {},
        minPrice
          ? { pricing: { some: { pricePerNight: { gte: minPrice } } } }
          : {},
        maxPrice
          ? { pricing: { some: { pricePerNight: { lte: maxPrice } } } }
          : {},
        amenities?.length
          ? { amenities: { some: { name: { in: amenities } } } }
          : {},
        proximityToNature
          ? {
              nearbyAttractions: {
                some: { distance: { lte: proximityToNature } },
              },
            }
          : {},
      ],
    };

    return this.prisma.camping.findMany({
      ...this.campingWithDetails,
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        pricing: { _count: 'asc' },
      },
    });
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
