import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCampingDto } from './dto/create-camping.dto';

@Injectable()
export class CampingsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.camping.findMany({
      include: {
        location: true,
        pricing: true,
        amenities: true,
        nearbyAttractions: true,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.camping.delete({
      where: { id },
    });
  }

  // async create(createCampingDto: CreateCampingDto) {

  //   if (!createCampingDto.name || !createCampingDto.description) {
  //     throw new Error('Name and description are required');
  //   }

  //   // const data: Prisma.CampingCreateInput = {

  //   //       name = createCampingDto.name,
  //   //       description = createCampingDto.description,
  //   //       locationId = createCampingDto.locationId,
  //   //       nearNature = createCampingDto.nearNature,
  //   //       photos = createCampingDto.photos,
  //   //       pricing = createCampingDto.pricing,
  //   //       amenities = createCampingDto.amenities,
  //   //       nearbyAttractions = createCampingDto.nearbyAttractions

  //   // };

  //   return this.prisma.camping.create({
  //     data: {
  //       name: createCampingDto.name,
  //       description: createCampingDto.description,
  //       // locationId: createCampingDto.locationId,
  //       nearNature: createCampingDto.nearNature,

  //       // photos: createCampingDto.photos,
  //       pricing: {
  //         create: createCampingDto.pricing,
  //       }
  //       // amenities: {
  //       //   AmenityCreateNestedManyWithoutCampingsInput: {
  //       //     create: createCampingDto.amenities
  //       //   }

  //       //   // create: createCampingDto.amenities
  //       // },

  //       // nearbyAttractions: {
  //       //   create: createCampingDto.nearbyAttractions,
  //       // },
  //     },

  //     include: {
  //       location: true,
  //       pricing: true,
  //       amenities: true,
  //       nearbyAttractions: true,
  //     },
  //   });
  // }

  // async create(createCampingDto: CreateCampingDto, userId: string) {
  //   if (!createCampingDto.name || !createCampingDto.description) {
  //     throw new Error('Name and description are required');
  //   }

  //   const data: Prisma.CampingCreateInput = {
  //     name: createCampingDto.name,
  //     description: createCampingDto.description,
  //     nearNature: createCampingDto.nearNature, // Matches Prisma schema

  //     // Handle the location relation
  //     location: {
  //       connect: { id: createCampingDto.locationId } // Connect to existing Location by ID
  //     },
  //     // Handle nested pricing creation
  //     pricing: {
  //       create: createCampingDto.pricing?.map(price => ({
  //         season: price.season,
  //         pricePerNight: price.pricePerNight, // Matches Prisma Float
  //         currency: price.currency, // Optional
  //         // Note: validFrom and validTo are not in your Prisma Pricing model; add them if needed
  //       })) || []
  //     },
  //     // Handle nested amenities creation
  //     amenities: {
  //       connect: createCampingDto.amenities?.map(amenity => ({ id: amenity.id })) || []
  //       // If you want to create new amenities instead of connecting, use 'create' instead of 'connect'
  //       // create: createCampingDto.amenities?.map(amenity => ({ name: amenity.name })) || []
  //     },
  //     // Handle nested nearbyAttractions creation
  //     nearbyAttractions: {
  //       create: createCampingDto.nearbyAttractions?.map(attraction => ({
  //         name: attraction.name,
  //         type: attraction.type,
  //         distance: attraction.distance, // Matches Prisma Float
  //       })) || []
  //     },
  //     user: {
  //       create: undefined,
  //       connectOrCreate: {
  //         where: undefined,
  //         create: undefined
  //       },
  //       connect: undefined
  //     }
  //   };

  //   return this.prisma.camping.create({
  //     data,
  //     include: {
  //       location: true,
  //       pricing: true,
  //       amenities: true,
  //       nearbyAttractions: true,
  //       user: true, // Include user if needed
  //     },
  //   });
  // }

  async create(createCampingDto: CreateCampingDto, userId: string) {
    if (!createCampingDto.name || !createCampingDto.description) {
      throw new Error('Name and description are required');
    }

    const data: Prisma.CampingCreateInput = {
      name: createCampingDto.name,
      description: createCampingDto.description,
      nearNature: createCampingDto.nearNature,

      // Handle the location relation using the nested locationId
      location: {
        connect: { id: createCampingDto.location.locationId }, // Access nested locationId
      },

      // Handle nested pricing creation
      pricing: {
        create:
          createCampingDto.pricing?.map((price) => ({
            season: price.season,
            pricePerNight: price.pricePerNight,
            currency: price.currency,
            // Add validFrom and validTo if you update your Prisma schema
          })) || [],
      },

      // Handle nested amenities (connecting to existing amenities)
      amenities: {
        connect: createCampingDto.amenities?.map((amenity) => ({ id: amenity.id })) || [],
      },

      // Handle nested nearbyAttractions creation
      nearbyAttractions: {
        create:
          createCampingDto.nearbyAttractions?.map((attraction) => ({
            name: attraction.name,
            type: attraction.type,
            distance: attraction.distance,
          })) || [],
      },

      // Handle user relation (connect to existing user)
      user: {
        connect: { id: userId }, // Connect to the user with the provided userId
      },
    };

    return this.prisma.camping.create({
      data,
      include: {
        location: true,
        pricing: true,
        amenities: true,
        nearbyAttractions: true,
        user: true,
      },
    });
  }
}

