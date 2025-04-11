import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CampingResponseDto, CreateCampingDto } from './dto/create-camping.dto';
import { plainToInstance } from 'class-transformer';
import { Camping, Prisma } from '@prisma/client';
import { CampingGateway } from '../webSockets/camping.gateway';


@Injectable()
export class CampingsService {
  constructor(private prisma: PrismaService,
    private readonly campingGateway:CampingGateway
  ) {}
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
        limitCamping: true,
      },
    });

    return plainToInstance(CampingResponseDto, campings, {
      excludeExtraneousValues: true, // Solo incluye campos marcados con @Expose
    });
  }

  async remove(id: number): Promise<Camping> {
    try {
      // Primero obtener el camping con sus relaciones
      const campingToDelete = await this.prisma.camping.findUnique({
        where: { id },
        include: {
          location: true,
          pricing: true,
          amenities: true,
          nearbyAttractions: true,
        },
      });

      if (!campingToDelete) {
        throw new NotFoundException(`Camping con ID ${id} no encontrado`);
      }

      // Eliminar en orden inverso para mantener la integridad referencial
      await this.prisma.$transaction([
        this.prisma.pricing.deleteMany({ where: { campingId: id } }),
        this.prisma.nearbyAttraction.deleteMany({ where: { campingId: id } }),
        this.prisma.amenity.deleteMany({ where: { campings: { some: { id } } } }),
        this.prisma.camping.delete({ where: { id } }),
      ]);

      return plainToInstance(CampingResponseDto, campingToDelete, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new InternalServerErrorException(`Error al eliminar el camping: ${error.message}`);
      }
      throw error;
    }
  }

  async create(data: CreateCampingDto, userId: string) {
    const { location, pricing = [], amenities = [], nearbyAttractions = [], limitCamping, ...rest } = data;

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
          limitCamping: { create: { maxTents: limitCamping.maxTents, maxUsers: limitCamping.maxUsers } },
        },
        include: {
          location: true,
          pricing: true,
          amenities: true,
          nearbyAttractions: true,
          limitCamping: true,
        },
      });
      this.campingGateway.notifyNewCamping(createdCamping);

      return plainToInstance(CampingResponseDto, createdCamping, {
        excludeExtraneousValues: false,
      });
    });


  }
}
