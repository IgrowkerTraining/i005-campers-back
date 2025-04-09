import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CampingResponseDto, CreateCampingDto } from './dto/create-camping.dto';
import { plainToInstance } from 'class-transformer';
import { Prisma } from '@prisma/client';

@Injectable()
export class CampingsService {
  constructor(private prisma: PrismaService) {}
  async findAll() {
    const campings = await this.prisma.camping.findMany({
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
    });

    return plainToInstance(CampingResponseDto, campings, {
      excludeExtraneousValues: true, // Solo incluye campos marcados con @Expose

      // console.log('Coordenas crudas:', campings[0]?.location?.coordinates);
      // return JSON.parse(JSON.stringify(campings));
    });
  }
  // async remove(id: number) {
  //   return this.prisma.camping.delete({
  //     where: { id },
  //   });
  // }
  async remove(id: number) {
    try {
      return await this.prisma.camping.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new BadRequestException(
            `No se puede eliminar el camping porque tiene datos relacionados. ${error.meta?.field_name}`,
          );
        }
      }
      throw error;
    }
  }

  async create(data: CreateCampingDto, userId: string) {
    const { location, pricing = [], amenities = [], nearbyAttractions = [], ...rest } = data;
    // // if (typeof data.location.coordinates === 'string') {
    // //   try {
    // //     data.location.coordinates = JSON.parse(data.location.coordinates);
    // //   } catch (error) {
    // //     throw new BadRequestException('Formato de coordenadas inválido');
    // //   }
    // // }
    // if (location.coordinates) {
    //   try {
    //     location.coordinates =
    //       typeof location.coordinates === 'string' ? JSON.parse(location.coordinates) : location.coordinates;
    //   } catch (error) {
    //     throw new BadRequestException('Formato de coordenadas inválido. Debe ser un objeto JSON válido.');
    //   }
    // }

    return this.prisma.$transaction(async (tx) => {
      const createdCamping = await tx.camping.create({
        data: {
          ...rest,
          user: { connect: { id: userId } },
          location: {
            create: { ...location },
          },

          pricing: { create: pricing },

          amenities: {
            connectOrCreate: amenities.map((amenity) => {
              // Para amenities existentes (con ID)
              if (amenity.id) {
                return {
                  where: { id: amenity.id },
                  create: {
                    name: `TEMP-${amenity.id}`, // Valor dummy que no se usará
                    available: true,
                  },
                };
              }
              // Para nuevas amenities (sin ID)
              return {
                where: { id: -1 }, // Forzar creación
                create: {
                  name: amenity.name!, // Validado por el DTO
                  available: amenity.available ?? true,
                },
              };
            }),
          },
          nearbyAttractions: { create: nearbyAttractions },
        },
        include: {
          location: true,
          pricing: true,
          amenities: true,
          nearbyAttractions: true,
        },
      });
      return plainToInstance(CampingResponseDto, createdCamping, {
        excludeExtraneousValues: false,
        // return JSON.parse(JSON.stringify(createdCamping));
      });
    });
  }
}
