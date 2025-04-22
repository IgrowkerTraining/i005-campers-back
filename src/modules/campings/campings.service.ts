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
    try {
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
    } catch (error) {
      console.error('Error getting all campings:', error);
      throw new InternalServerErrorException(`Error al obtener los campings: ${error.message}`);
    }
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
        throw new NotFoundException(`Camping with ID ${id} not found`);
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
        console.error('Prisma error when deleting camping:', error);
        throw new InternalServerErrorException(`Error when deleting camping: ${error.message}`);
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Unexpected error when deleting camping:', error);
      throw new InternalServerErrorException(`Error al eliminar el camping: ${error.message}`);
    }
  }

  async create(data: CreateCampingDto, userId: string, files: Express.Multer.File[]): Promise<Camping> {
    try {
      const { location, pricing = [], amenities = [], nearbyAttractions = [], limitCamping, ...rest } = data;

      const promiseFile = files.map((k) => this.CloudinaryService.uploadFiles(k));

      let urlArr: string[] = [];
      try {
        // Espera a que todas las subidas de archivos terminen
        const response = await Promise.all(promiseFile);
        urlArr = response.map((k) => k.url);
      } catch (cloudinaryError) {
        // Este bloque catch captura los errores de Cloudinary
        console.error('Cloudinary error when creating camping:', cloudinaryError);
        throw new InternalServerErrorException(`Error uploading file/s to Cloudinary: ${cloudinaryError.message}`);
      }

      return await this.prisma.$transaction(async (tx) => {
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
                id: true,
                tarifa: true,
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
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        console.error('Prisma error when creating camping:', error);
        throw new InternalServerErrorException(`Error creating camping: ${error.message}`);
      }
      if (error instanceof InternalServerErrorException) {
        // Re-throw InternalServerErrorException to be handled by the global filter
        throw error;
      }
      console.error('Unexpected error when creating camping:', error);
      throw new InternalServerErrorException(`Error creating camping: ${error.message}`);
    }
  }

  async update(id: number, data: UpdateCampingDto, userId: string, files?: Express.Multer.File[]): Promise<Camping> {
    try {
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

          try {
            // Espera a que todas las subidas de archivos terminen
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
          } catch (cloudinaryError) {
            // Este bloque catch captura los errores de Cloudinary
            console.error('Cloudinary error when updating camping:', cloudinaryError);
            throw new InternalServerErrorException(`Error uloading file/s to Cloudinary: ${cloudinaryError.message}`);
          }
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

      // Return the transaction result
      return transaction;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        console.error('Prisma error when updating camping:', error);
        throw new InternalServerErrorException(`Error updating camping: ${error.message}`);
      }
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof ForbiddenException) {
        throw error;
      }
      console.error('Unexpected error when updating camping:', error);
      throw new InternalServerErrorException(`Error updating camping: ${error.message}`);
    }
  }

  // create one review
  async createReviews(userId: string, createReviewDtos: createReviewDto[]): Promise<ReviewResponseDto[]> {
    try {
      return Promise.all(
        createReviewDtos.map(async (dto) => {
          // Verificar que el camping existe
          const camping = await this.prisma.camping.findUnique({ where: { id: dto.campingId } });
          if (!camping) throw new NotFoundException(`Camping with ID ${dto.campingId} not found`);

          // Verificar reserva confirmada
          const hasReservation = await this.prisma.reservation.findFirst({
            where: { userId, campingId: dto.campingId, status: 'CONFIRMED' },
          });
          if (!hasReservation)
            throw new ForbiddenException(`You must have a confirmed reservation for camping ${dto.campingId}`);

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
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        console.error('Prisma error when creating review:', error);
        throw new InternalServerErrorException(`Error creating review: ${error.message}`);
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof ForbiddenException) {
        throw error;
      }
      console.error('Unexpected error when creating review:', error);
      throw new InternalServerErrorException(`Error creating review: ${error.message}`);
    }
  }

  async getReviewsByCampingId(campingId: number): Promise<ReviewResponseDto[]> {
    try {
      const camping = await this.prisma.camping.findUnique({ where: { id: campingId } });
      if (!camping) throw new NotFoundException('Camping not found');

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
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        console.error('Prisma error when getting reviews:', error);
        throw new InternalServerErrorException(`Error getting reviews: ${error.message}`);
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Unexpected error when getting reviews:', error);
      throw new InternalServerErrorException(`Error getting reviews: ${error.message}`);
    }
  }

  async addFavourite(createFavouriteDto: CreateFavouritesDto): Promise<void> {
    try {
      const { campingId, userId } = createFavouriteDto;

      // Verifica que el camping existe
      const camping = await this.prisma.camping.findUnique({ where: { id: campingId } });
      if (!camping) {
        throw new NotFoundException(`Camping with ID ${campingId} not found`);
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
        throw new BadRequestException('This camping is already in favorites');
      }

      // Crea el favorito
      await this.prisma.favourites.create({
        data: {
          userId,
          campingId,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        console.error('Prisma error when adding favorite:', error);
        throw new InternalServerErrorException(`Error adding favorite: ${error.message}`);
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Unexpected error when adding favorite:', error);
      throw new InternalServerErrorException(`Error adding favorite: ${error.message}`);
    }
  }

  async removeFavourite(userId: string, campingId: number): Promise<void> {
    try {
      const favourite = await this.prisma.favourites.findUnique({
        where: {
          userId_campingId: {
            userId,
            campingId,
          },
        },
      });

      if (!favourite) {
        throw new NotFoundException('Favorito not found');
      }

      await this.prisma.favourites.delete({
        where: {
          userId_campingId: {
            userId,
            campingId,
          },
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        console.error('Prisma error when removing favorite:', error);
        throw new InternalServerErrorException(`Error deleting favorite: ${error.message}`);
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Unexpected error when removing favorite:', error);
      throw new InternalServerErrorException(`Error deleting favorite: ${error.message}`);
    }
  }

  async getFavouritesByUser(userId: string) {
    try {
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
    } catch (error) {
      console.error('Prisma error when getting favorites by user:', error);
      throw new InternalServerErrorException(`Error getting favorites from user: ${error.message}`);
    }
  }
}
