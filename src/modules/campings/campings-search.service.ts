// // // import { Injectable } from '@nestjs/common';
// // // import { PrismaService } from '../../prisma/prisma.service';
// // // import { SearchCampingDto } from './dto/search-camping.dto';
// // // import { Prisma } from '@prisma/client';

// // // @Injectable()
// // // export class CampingSearchService {
// // //   constructor(private readonly prisma: PrismaService) {}

// // //   private campingWithDetails = Prisma.validator<Prisma.CampingDefaultArgs>()({
// // //     include: {
// // //       amenities: true,
// // //       location: true,
// // //       pricing: true,
// // //       nearbyAttractions: true,
// // //     },
// // //   });

// // //   async searchCampings(filters: SearchCampingDto) {
// // //     const { location, region, minPrice, maxPrice, amenities, proximityToNature, page = 1, limit = 10 } = filters;

// // //     const where: Prisma.CampingWhereInput = {
// // //       AND: [
// // //         location
// // //           ? {
// // //               OR: [
// // //                 { name: { contains: location, mode: 'insensitive' } },
// // //                 {
// // //                   location: {
// // //                     city: { contains: location, mode: 'insensitive' },
// // //                   },
// // //                 },
// // //               ],
// // //             }
// // //           : {},
// // //         region ? { location: { region: { contains: region, mode: 'insensitive' } } } : {},
// // //         minPrice ? { pricing: { some: { pricePerNight: { gte: minPrice } } } } : {},
// // //         maxPrice ? { pricing: { some: { pricePerNight: { lte: maxPrice } } } } : {},
// // //         amenities?.length ? { amenities: { some: { name: { in: amenities } } } } : {},
// // //         proximityToNature
// // //           ? {
// // //               nearbyAttractions: {
// // //                 some: { distance: { lte: proximityToNature } },
// // //               },
// // //             }
// // //           : {},
// // //       ],
// // //     };

// // //     return this.prisma.camping.findMany({
// // //       ...this.campingWithDetails,
// // //       where,
// // //       skip: (page - 1) * limit,
// // //       take: +limit,
// // //       orderBy: {
// // //         pricing: { _count: 'asc' },
// // //       },
// // //     });
// // //   }

// // //   async findNearby(lat: number, lng: number, radius: number) {
// // //     return this.prisma.$queryRaw`
// // //       SELECT
// // //         c.*,
// // //         ST_Distance(
// // //           ST_MakePoint(${lng}, ${lat})::geography,
// // //           ST_MakePoint(l.longitude, l.latitude)::geography
// // //         ) as distance
// // //       FROM
// // //         "Camping" c
// // //       JOIN
// // //         "Location" l ON c."locationId" = l.id
// // //       WHERE
// // //         ST_DWithin(
// // //           ST_MakePoint(${lng}, ${lat})::geography,
// // //           ST_MakePoint(l.longitude, l.latitude)::geography,
// // //           ${radius * 1000}
// // //         )
// // //       ORDER BY distance
// // //     `;
// // //   }
// // // }

// // // import { Injectable } from '@nestjs/common';
// // // import { PrismaService } from '../../prisma/prisma.service';
// // // import { SearchCampingDto } from './dto/search-camping.dto';
// // // import { Prisma } from '@prisma/client';

// // // @Injectable()
// // // export class CampingSearchService {
// // //   constructor(private readonly prisma: PrismaService) {}

// // //   private campingWithDetails = Prisma.validator<Prisma.CampingDefaultArgs>()({
// // //     include: {
// // //       amenities: true,
// // //       location: true,
// // //       pricing: true,
// // //       nearbyAttractions: true,
// // //     },
// // //   });

// // //   async searchCampings(filters: SearchCampingDto) {
// // //     const { name, season, nearNature, pricing, amenities, nearbyAttractions, location, page = 1, limit = 10 } = filters;

// // //     const where: Prisma.CampingWhereInput = {
// // //       AND: [
// // //         { name: { contains: name, mode: 'insensitive' } },
// // //         season && {
// // //           pricing: {
// // //             some: {
// // //               season: { equals: season, mode: 'insensitive' },
// // //             },
// // //           },
// // //         },
// // //         nearNature?.length && { nearNature: { hasSome: nearNature } },
// // //         pricing && this.buildPricingConditions(pricing),
// // //         amenities && this.buildAmenitiesConditions(amenities),
// // //         nearbyAttractions && this.buildAttractionsConditions(nearbyAttractions),
// // //         location && this.buildLocationConditions(location),
// // //       ].filter(Boolean),
// // //     };

// // //     const [campings, total] = await Promise.all([
// // //       this.prisma.camping.findMany({
// // //         ...this.campingWithDetails,
// // //         where,
// // //         skip: (page - 1) * limit,
// // //         take: limit,
// // //       }),
// // //       this.prisma.camping.count({ where }),
// // //     ]);

// // //     return {
// // //       data: campings,
// // //       pagination: {
// // //         total,
// // //         page,
// // //         limit,
// // //         totalPages: Math.ceil(total / limit),
// // //       },
// // //     };
// // //   }

// // //   private buildPricingConditions(pricing: SearchCampingDto['pricing']): Prisma.CampingWhereInput {
// // //     return {
// // //       AND: pricing.map((price) => ({
// // //         pricing: {
// // //           some: {
// // //             season: { equals: price.season, mode: 'insensitive' },
// // //             pricePerNight: { equals: price.pricePerNight },
// // //           },
// // //         },
// // //       })),
// // //     };
// // //   }

// // //   private buildAmenitiesConditions(amenities: SearchCampingDto['amenities']): Prisma.CampingWhereInput {
// // //     return {
// // //       amenities: {
// // //         some: {
// // //           AND: amenities.map((amenity) => ({
// // //             id: amenity.id ? { equals: amenity.id } : undefined,
// // //             name: amenity.name ? { equals: amenity.name, mode: 'insensitive' } : undefined,
// // //             available: amenity.available !== undefined ? { equals: amenity.available } : undefined,
// // //           })),
// // //         },
// // //       },
// // //     };
// // //   }

// // //   private buildAttractionsConditions(attractions: SearchCampingDto['nearbyAttractions']): Prisma.CampingWhereInput {
// // //     return {
// // //       nearbyAttractions: {
// // //         some: {
// // //           AND: attractions.map((attraction) => ({
// // //             name: attraction.name ? { contains: attraction.name, mode: 'insensitive' } : undefined,
// // //             type: attraction.type ? { equals: attraction.type, mode: 'insensitive' } : undefined,
// // //             distance: attraction.distance ? { lte: attraction.distance } : undefined,
// // //           })),
// // //         },
// // //       },
// // //     };
// // //   }

// // //   private buildLocationConditions(location: SearchCampingDto['location']): Prisma.CampingWhereInput {
// // //     return {
// // //       location: {
// // //         city: location.city ? { contains: location.city, mode: 'insensitive' } : undefined,
// // //         region: location.region ? { contains: location.region, mode: 'insensitive' } : undefined,
// // //         country: location.country ? { equals: location.country, mode: 'insensitive' } : undefined,
// // //       },
// // //     };
// // //   }
// // // }

// // import { Injectable } from '@nestjs/common';
// // import { PrismaService } from '../../prisma/prisma.service';
// // import { SearchCampingDto } from './dto/search-camping.dto';
// // import { Prisma } from '@prisma/client';

// // @Injectable()
// // export class CampingSearchService {
// //   constructor(private readonly prisma: PrismaService) {}

// //   private readonly campingWithDetails = Prisma.validator<Prisma.CampingDefaultArgs>()({
// //     include: {
// //       amenities: true,
// //       location: true,
// //       pricing: true,
// //       nearbyAttractions: true,
// //     },
// //   });

// //   async searchCampings(filters: SearchCampingDto) {
// //     const { name, season, nearNature, pricing, amenities, nearbyAttractions, location, page = 1, limit = 10 } = filters;

// //     // Construcción segura de condiciones
// //     const conditions: Prisma.CampingWhereInput[] = [{ name: { contains: name, mode: 'insensitive' } }];

// //     if (season) {
// //       conditions.push({
// //         pricing: {
// //           some: {
// //             season: { equals: season, mode: 'insensitive' },
// //           },
// //         },
// //       });
// //     }

// //     if (nearNature?.length) {
// //       conditions.push({ nearNature: { hasSome: nearNature } });
// //     }

// //     if (pricing?.length) {
// //       conditions.push(this.buildPricingConditions(pricing));
// //     }

// //     if (amenities?.length) {
// //       conditions.push(this.buildAmenitiesConditions(amenities));
// //     }

// //     if (nearbyAttractions?.length) {
// //       conditions.push(this.buildAttractionsConditions(nearbyAttractions));
// //     }

// //     if (location) {
// //       conditions.push(this.buildLocationConditions(location));
// //     }

// //     const where: Prisma.CampingWhereInput = conditions.length > 1 ? { AND: conditions } : (conditions[0] ?? {});

// //     const [campings, total] = await Promise.all([
// //       this.prisma.camping.findMany({
// //         ...this.campingWithDetails,
// //         where,
// //         skip: (page - 1) * limit,
// //         take: limit,
// //         orderBy: this.getOrderBy(filters.sortBy),
// //       }),
// //       this.prisma.camping.count({ where }),
// //     ]);

// //     return {
// //       data: campings,
// //       pagination: {
// //         total,
// //         page,
// //         limit,
// //         totalPages: Math.ceil(total / limit),
// //       },
// //     };
// //   }

// //   private buildPricingConditions(pricing: SearchCampingDto['pricing']): Prisma.CampingWhereInput {
// //     const pricingConditions = pricing.map((price) => ({
// //       pricePerNight: price.pricePerNight ? { equals: price.pricePerNight } : undefined,
// //       season: price.season ? { equals: price.season, mode: 'insensitive' } : undefined,
// //     }));

// //     return {
// //       pricing: {
// //         some: {
// //           OR: pricingConditions,
// //         },
// //       },
// //     };
// //   }

// //   private buildAmenitiesConditions(amenities: SearchCampingDto['amenities']): Prisma.CampingWhereInput {
// //     const amenityConditions = amenities.map((amenity) => ({
// //       id: amenity.id ? { equals: amenity.id } : undefined,
// //       name: amenity.name ? { equals: amenity.name, mode: 'insensitive' } : undefined,
// //       available: amenity.available !== undefined ? { equals: amenity.available } : undefined,
// //     }));

// //     return {
// //       amenities: {
// //         some: {
// //           OR: amenityConditions,
// //         },
// //       },
// //     };
// //   }

// //   private buildAttractionsConditions(attractions: SearchCampingDto['nearbyAttractions']): Prisma.CampingWhereInput {
// //     const attractionConditions = attractions.map((attraction) => ({
// //       name: attraction.name ? { contains: attraction.name, mode: 'insensitive' } : undefined,
// //       type: attraction.type ? { equals: attraction.type, mode: 'insensitive' } : undefined,
// //       distance: attraction.distance ? { lte: attraction.distance } : undefined,
// //     }));

// //     return {
// //       nearbyAttractions: {
// //         some: {
// //           OR: attractionConditions,
// //         },
// //       },
// //     };
// //   }

// //   private buildLocationConditions(location: SearchCampingDto['location']): Prisma.CampingWhereInput {
// //     return {
// //       location: {
// //         city: location.city ? { contains: location.city, mode: 'insensitive' } : undefined,
// //         region: location.region ? { contains: location.region, mode: 'insensitive' } : undefined,
// //         country: location.country ? { equals: location.country, mode: 'insensitive' } : undefined,
// //         coordinates: location.coordinates ? { equals: location.coordinates } : undefined,
// //       },
// //     };
// //   }

// //   private getOrderBy(sortBy?: string): Prisma.CampingOrderByWithRelationInput {
// //     if (!sortBy) return { createdAt: 'desc' };

// //     const orderMap: Record<string, Prisma.CampingOrderByWithRelationInput> = {
// //       'price-asc': { pricing: { _min: { pricePerNight: 'asc' } } },
// //       'price-desc': { pricing: { _max: { pricePerNight: 'desc' } } },
// //       rating: { ratings: { _avg: { rating: 'desc' } } },
// //       popular: { reservations: { _count: 'desc' } },
// //     };

// //     return orderMap[sortBy] || { createdAt: 'desc' };
// //   }

// //   async findById(id: number) {
// //     return this.prisma.camping.findUnique({
// //       ...this.campingWithDetails,
// //       where: { id },
// //     });
// //   }
// // }

// import { Injectable } from '@nestjs/common';
// import { PrismaService } from '../../prisma/prisma.service';
// import { SearchCampingDto } from './dto/search-camping.dto';
// import { Prisma } from '@prisma/client';

// @Injectable()
// export class CampingSearchService {
//   constructor(private readonly prisma: PrismaService) {}

//   private readonly campingWithDetails = {
//     include: {
//       location: {
//         select: {
//           city: true,
//           region: true,
//           country: true,
//           coordinates: true,
//         },
//       },
//       pricing: true,
//       amenities: true,
//       nearbyAttractions: true,
//     },
//   };

//   async searchCampings(filters: SearchCampingDto) {
//     const { name, season, nearNature, pricing, amenities, nearbyAttractions, location, page = 1, limit = 10 } = filters;

//     const where: Prisma.CampingWhereInput = {
//       name: { contains: name, mode: 'insensitive' },
//       ...(season && {
//         pricing: {
//           some: {
//             season: { equals: season, mode: 'insensitive' },
//           },
//         },
//       }),
//       ...(nearNature?.length && { nearNature: { hasSome: nearNature } }),
//       ...(pricing?.length && {
//         pricing: {
//           some: {
//             OR: pricing.map((p) => ({
//               pricePerNight: p.pricePerNight ? { equals: p.pricePerNight } : undefined,
//               season: p.season ? { equals: p.season, mode: 'insensitive' } : undefined,
//             })),
//           },
//         },
//       }),
//       ...(amenities?.length && {
//         amenities: {
//           some: {
//             OR: amenities.map((a) => ({
//               id: a.id ? { equals: a.id } : undefined,
//               name: a.name ? { equals: a.name, mode: 'insensitive' } : undefined,
//               available: a.available !== undefined ? { equals: a.available } : undefined,
//             })),
//           },
//         },
//       }),
//       ...(nearbyAttractions?.length && {
//         nearbyAttractions: {
//           some: {
//             OR: nearbyAttractions.map((att) => ({
//               name: att.name ? { contains: att.name, mode: 'insensitive' } : undefined,
//               type: att.type ? { equals: att.type, mode: 'insensitive' } : undefined,
//               distance: att.distance ? { lte: att.distance } : undefined,
//             })),
//           },
//         },
//       }),
//       ...(location && {
//         location: {
//           city: location.city ? { contains: location.city, mode: 'insensitive' } : undefined,
//           region: location.region ? { contains: location.region, mode: 'insensitive' } : undefined,
//           country: location.country ? { equals: location.country, mode: 'insensitive' } : undefined,
//           coordinates: location.coordinates ? { equals: location.coordinates } : undefined,
//         },
//       }),
//     };

//     const [campings, total] = await Promise.all([
//       this.prisma.camping.findMany({
//         ...this.campingWithDetails,
//         where,
//         skip: (page - 1) * limit,
//         take: limit,
//       }),
//       this.prisma.camping.count({ where }),
//     ]);

//     return {
//       data: campings,
//       pagination: {
//         total,
//         page,
//         limit,
//         totalPages: Math.ceil(total / limit),
//       },
//     };
//   }
// }

import { Injectable } from '@nestjs/common';
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
          coordinates: true,
        },
      },
      pricing: true,
      amenities: true,
      nearbyAttractions: true,
    },
  };

  async searchCampings(filters: SearchCampingDto) {
    const { name, season, nearNature, pricing, amenities, nearbyAttractions, location, page = 1, limit = 10 } = filters;

    const where: Prisma.CampingWhereInput = {
      name: { contains: name, mode: 'insensitive' },
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
              season: p.season ? { equals: p.season, mode: 'insensitive' } : undefined,
            })),
          },
        },
      }),
      ...(amenities?.length && {
        amenities: {
          some: {
            OR: amenities.map((a) => ({
              id: a.id ? { equals: a.id } : undefined,
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
      ...(location && {
        location: {
          city: location.city ? { contains: location.city, mode: 'insensitive' } : undefined,
          region: location.region ? { contains: location.region, mode: 'insensitive' } : undefined,
          country: location.country ? { equals: location.country, mode: 'insensitive' } : undefined,
          coordinates: location.coordinates ? { equals: location.coordinates } : undefined,
        },
      }),
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
