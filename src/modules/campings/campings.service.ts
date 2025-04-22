import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CampingResponseDto, CreateCampingDto, PaginatedResponseDto } from './dto/create-camping.dto';
import { plainToInstance } from 'class-transformer';
import { Camping, Prisma } from '@prisma/client';
import { CampingGateway } from '../webSockets/camping.gateway';
import { createReviewDto } from './dto/create-review.dto';
import { ReviewResponseDto } from './dto/review-response.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateFavouritesDto } from './dto/favourites-camping.dto';
import { UpdateCampingDto } from './dto/update-camping.dto';

@Injectable()
export class CampingsService {
  constructor(
    private prisma: PrismaService,
    private readonly campingGateway: CampingGateway,
    private readonly CloudinaryService: CloudinaryService,
  ) {}
  async findAll(page: number = 1, limit: number = 10): Promise<PaginatedResponseDto<CampingResponseDto>> {
    const skip = (page - 1) * limit;

    const [campings, total] = await Promise.all([
      this.prisma.camping.findMany({
        skip,
        take: limit,
        include: {
          location: true,
          media: true,
          pricing: true,
          amenities: true,
          nearbyAttractions: true,
          limitCamping: true,
        },
      }),
      this.prisma.camping.count(),
    ]);

    const response = {
      data: plainToInstance(CampingResponseDto, campings, {
        excludeExtraneousValues: true,
      }),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };

    return plainToInstance(PaginatedResponseDto<CampingResponseDto>, response, {
      excludeExtraneousValues: true,
    });
  }

  async remove(id: number): Promise<Camping> {
    try {
      const campingToDelete = await this.prisma.camping.findUnique({
        where: { id },
        include: {
          location: true,
          pricing: true,
          amenities: true,
          nearbyAttractions: true,
          limitCamping: true,
          media: true,
        },
      });

      if (!campingToDelete) {
        throw new NotFoundException(`Camping con ID ${id} no encontrado`);
      }

      await this.prisma.$transaction([
        this.prisma.pricing.deleteMany({ where: { campingId: id } }),
        this.prisma.nearbyAttraction.deleteMany({ where: { campingId: id } }),
        this.prisma.amenity.deleteMany({ where: { campings: { some: { id } } } }),
        this.prisma.media.deleteMany({ where: { campingId: id } }),
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

  async create(data: CreateCampingDto, userId: string, files: Express.Multer.File[]): Promise<Camping> {
    const { location, pricing = [], amenities = [], nearbyAttractions = [], limitCamping, ...rest } = data;

    const promiseFile = files.map((k) => this.CloudinaryService.uploadFiles(k));

    const response = await Promise.all(promiseFile);
    console.log(response);

    const urlArr = response.map((k) => k.url);

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
              if (amenity.id) {
                return {
                  where: { id: amenity.id },
                  create: {
                    name: `TEMP-${amenity.id}`,
                    available: true,
                  },
                };
              }
              return {
                where: { id: -1 },
                create: {
                  name: amenity.name!,
                  available: amenity.available ?? true,
                },
              };
            }),
          },
          media: {
            create: urlArr.map((mediaDto) => ({
              url: mediaDto,
              type: 'image',
            })),
          },

          nearbyAttractions: { create: nearbyAttractions },
          limitCamping: { create: { maxTents: limitCamping.maxTents, maxUsers: limitCamping.maxUsers } },
        },
        include: {
          location: true,
          pricing: {
            select: {
              pricePerNight: true,
              campingId: false,
            },
          },
          amenities: true,
          media: true,
          nearbyAttractions: true,
          limitCamping: true,
        },
      });
      this.campingGateway.notifyNewCamping(createdCamping);

      return plainToInstance(CampingResponseDto, createdCamping, {
        excludeExtraneousValues: true,
      });
    });
  }

  async update(id: number, data: UpdateCampingDto, userId: string, files?: Express.Multer.File[]): Promise<Camping> {
    const { location, pricing, amenities, nearbyAttractions, limitCamping, ...rest } = data;

    const camping = await this.prisma.camping.findUnique({
      where: { id },
      include: {
        user: true,
        location: true,
        pricing: true,
        amenities: true,
        nearbyAttractions: true,
        limitCamping: true,
        media: true,
      },
    });

    if (!camping) {
      throw new NotFoundException(`Camping with ID ${id} not found`);
    }

    if (camping.userId !== userId) {
      throw new ForbiddenException('You do not have permission to update this camping');
    }

    const updatePromises: any[] = [];

    const transaction = await this.prisma.$transaction(async (tx) => {
      // Outer transaction

      if (files && files.length > 0) {
        // Eliminar medios existentes solo si hay nuevos archivos
        await tx.media.deleteMany({
          where: { campingId: id },
        });

        const promiseFile = files.map((k) => this.CloudinaryService.uploadFiles(k));
        const response = await Promise.all(promiseFile);
        const urlArr = response.map((k) => k.url);

        updatePromises.push(
          tx.media.createMany({
            data: urlArr.map((url) => ({
              url: url,
              type: 'image',
              campingId: id,
            })),
          }),
        );
      }

      if (location) {
        updatePromises.push(
          tx.location.update({
            where: { id: camping.locationId },
            data: { ...location },
          }),
        );
      }

      if (pricing) {
        // Delete existing pricing records for the camping
        await tx.pricing.deleteMany({
          where: {
            campingId: id,
          },
        });

        // Create new pricing records for the camping
        updatePromises.push(
          tx.pricing.createMany({
            data: pricing.map((price) => ({
              ...price,
              campingId: id,
              tarifa: price.tarifa || 'carpa', // provide default value
              pricePerNight: price.pricePerNight !== undefined ? price.pricePerNight : 0,
            })),
          }),
        );
      }

      if (amenities) {
        // Disconnect all existing amenities
        updatePromises.push(
          tx.camping.update({
            where: { id: id },
            data: {
              amenities: {
                set: [], // Disconnect all
              },
            },
          }),
        );

        // Connect the new amenities
        const amenityConnectOrCreate = amenities.map((amenity) => {
          if (amenity.id) {
            return {
              where: { id: amenity.id },
              create: {
                name: `TEMP-${amenity.id}`,
                available: true,
              },
            };
          }
          return {
            where: { id: -1 },
            create: {
              name: amenity.name!,
              available: amenity.available ?? true,
            },
          };
        });

        updatePromises.push(
          tx.camping.update({
            where: { id: id },
            data: {
              amenities: {
                connectOrCreate: amenityConnectOrCreate,
              },
            },
          }),
        );
      }

      if (nearbyAttractions) {
        // Delete existing nearby attractions for the camping
        await tx.nearbyAttraction.deleteMany({
          where: {
            campingId: id,
          },
        });

        // Create new nearby attractions for the camping
        updatePromises.push(
          tx.nearbyAttraction.createMany({
            data: nearbyAttractions.map((attraction) => ({
              ...attraction,
              campingId: id,
              name: attraction.name || 'Default Attraction Name', // provide default value
            })),
          }),
        );
      }

      if (limitCamping) {
        updatePromises.push(
          tx.limitCamping.update({
            where: { id: camping.limitCampingId },
            data: { ...limitCamping },
          }),
        );
      }

      updatePromises.push(
        tx.camping.update({
          where: { id: id },
          data: { ...rest },
        }),
      );

      await Promise.all(updatePromises);

      const updatedCamping = await tx.camping.findUnique({
        where: { id },
        include: {
          location: true,
          pricing: true,
          amenities: true,
          nearbyAttractions: true,
          limitCamping: true,
          media: true,
        },
      });

      return plainToInstance(CampingResponseDto, updatedCamping, {
        excludeExtraneousValues: true,
      });
    });

    return transaction;
  }

  // create one review
  async createReviews(userId: string, createReviewDtos: createReviewDto[]): Promise<ReviewResponseDto[]> {
    return Promise.all(
      createReviewDtos.map(async (dto) => {
        // Verificar que el camping existe
        const camping = await this.prisma.camping.findUnique({ where: { id: dto.campingId } });
        if (!camping) throw new NotFoundException(`Camping con ID ${dto.campingId} no encontrado`);

        // Verificar reserva confirmada
        const hasReservation = await this.prisma.reservation.findFirst({
          where: { userId, campingId: dto.campingId, status: 'CONFIRMED' },
        });
        if (!hasReservation)
          throw new ForbiddenException(`Debes tener una reserva confirmada para el camping ${dto.campingId}`);

        // Crear reseña
        return this.prisma.review.create({
          data: {
            campingId: dto.campingId,
            userId,
            name: dto.name,
            comment: dto.comment,
            rating: dto.rating,
            profilePic: dto.profilePic,
            date: dto.date,
          },
          select: {
            id: true,
            campingId: true,
            name: true,
            date: true,
            comment: true,
            rating: true,
            profilePic: true,
          },
        });
      }),
    );
  }

  async getReviewsByCampingId(campingId: number): Promise<ReviewResponseDto[]> {
    const camping = await this.prisma.camping.findUnique({ where: { id: campingId } });
    if (!camping) throw new NotFoundException('Camping no encontrado');

    return this.prisma.review.findMany({
      where: { campingId },
      select: {
        id: true,
        campingId: true,
        name: true,
        date: true,
        comment: true,
        rating: true,
        profilePic: true,
      },
    });
  }

  async addFavourite(createFavouriteDto: CreateFavouritesDto): Promise<void> {
    const { campingId, userId } = createFavouriteDto;

    // Verifica que el camping existe
    const camping = await this.prisma.camping.findUnique({ where: { id: campingId } });
    if (!camping) {
      throw new NotFoundException(`Camping con ID ${campingId} no encontrado`);
    }

    // Verifica que no exista ya el favorito
    const exists = await this.prisma.favourites.findUnique({
      where: {
        userId_campingId: {
          userId,
          campingId,
        },
      },
    });
    if (exists) {
      throw new BadRequestException('Este camping ya está en favoritos');
    }

    // Crea el favorito
    await this.prisma.favourites.create({
      data: {
        userId,
        campingId,
      },
    });
  }

  async removeFavourite(userId: string, campingId: number): Promise<void> {
    const favourite = await this.prisma.favourites.findUnique({
      where: {
        userId_campingId: {
          userId,
          campingId,
        },
      },
    });

    if (!favourite) {
      throw new NotFoundException('Favorito no encontrado');
    }

    await this.prisma.favourites.delete({
      where: {
        userId_campingId: {
          userId,
          campingId,
        },
      },
    });
  }

  async getFavouritesByUser(userId: string) {
    // Busca los favoritos del usuario y trae la info del camping asociado
    const favourites = await this.prisma.favourites.findMany({
      where: { userId },
      include: {
        camping: {
          include: {
            location: true,
            media: true,
            pricing: true,
            amenities: true,
            nearbyAttractions: true,
            limitCamping: true,
          },
        },
      },
    });

    // Devuelve solo la info de los campings
    return favourites.map((fav) => fav.camping);
  }
}
