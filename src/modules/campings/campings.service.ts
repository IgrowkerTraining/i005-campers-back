import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ServiceUnavailableException,
  Logger,
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
import { CAMPING_ERROR_MESSAGES } from '../../common/errorMessages/camping-error-messages';
import { error } from 'console';
import { PrismaClientInitializationError, PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import e from 'express';

@Injectable()
export class CampingsService {
  private readonly logger = new Logger(CampingsService.name);
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
      if (error instanceof PrismaClientInitializationError) {
        console.error('Database connection error:', error);
        throw new ServiceUnavailableException(CAMPING_ERROR_MESSAGES.PRISMA.DATABASE);
      }
      if (error instanceof InternalServerErrorException) {
        console.error('Error getting all campings:', error);
        throw new InternalServerErrorException(`Error getting all campings: ${error.message}`);
      }
      throw error;
    }
  }

  async remove(id: number, userId: string): Promise<Camping> {
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
        throw new NotFoundException(CAMPING_ERROR_MESSAGES.PRISMA.NOT_FOUND(id));
      }

      if (campingToDelete.userId !== userId) {
        throw new BadRequestException(CAMPING_ERROR_MESSAGES.PRISMA.NOT_AUTHORIZED);
      }

      await this.prisma.$transaction([
        this.prisma.pricing.deleteMany({ where: { campingId: id } }),
        this.prisma.nearbyAttraction.deleteMany({ where: { campingId: id } }),
        this.prisma.amenity.deleteMany({ where: { campings: { some: { id } } } }),
        this.prisma.media.deleteMany({ where: { campingId: id } }),
        this.prisma.camping.delete({ where: { id } }),
      ]);
      this.logger.log(`Attempting to delete camping with ID ${id}`);
      this.logger.log(`Camping delete successfully: ${campingToDelete.name}`);
      return plainToInstance(CampingResponseDto, campingToDelete, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (error instanceof PrismaClientInitializationError) {
        console.error('Database connection error:', error);
        throw new ServiceUnavailableException(CAMPING_ERROR_MESSAGES.PRISMA.DATABASE);
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(CAMPING_ERROR_MESSAGES.PRISMA.NOT_FOUND(id));
        }
      }
      if (error instanceof InternalServerErrorException) {
        throw new InternalServerErrorException('Error deleting camping');
      }
      throw error;
    }
  }

  async create(data: CreateCampingDto, userId: string, files: Express.Multer.File[]): Promise<Camping> {
    try {
      const { location, pricing = [], amenities = [], nearbyAttractions = [], limitCamping, ...rest } = data;

      const promiseFile = files.map((k) => this.CloudinaryService.uploadFiles(k));

      let urlArr: string[] = [];
      try {
        const response = await Promise.all(promiseFile);
        urlArr = response.map((k) => k.url);
      } catch (cloudinaryError) {
        console.error('Cloudinary error when creating camping:', cloudinaryError);
        throw new ServiceUnavailableException(CAMPING_ERROR_MESSAGES.CLOUDINARY);
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
        this.logger.log(`Camping created successfully: ${createdCamping.name}`);
        this.logger.log(`Attempting to create camping: ${createdCamping.name}`);
        return plainToInstance(CampingResponseDto, createdCamping, {
          excludeExtraneousValues: true,
        });
      });
    } catch (error) {
      console.error('Error creating camping:', error);
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new BadRequestException(CAMPING_ERROR_MESSAGES.PRISMA.DUPLICATE);
      }
      if (error instanceof PrismaClientInitializationError) {
        throw new ServiceUnavailableException(CAMPING_ERROR_MESSAGES.PRISMA.DATABASE);
      }
      if (error instanceof InternalServerErrorException) {
        throw new InternalServerErrorException('Error creating camping');
      }
      throw error;
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
        throw new NotFoundException(CAMPING_ERROR_MESSAGES.PRISMA.NOT_FOUND(id));
      }

      if (camping.userId !== userId) {
        throw new BadRequestException(CAMPING_ERROR_MESSAGES.PRISMA.NOT_AUTHORIZED);
      }

      const updatePromises: any[] = [];

      const transaction = await this.prisma.$transaction(async (tx) => {
        if (files && files.length > 0) {
          await tx.media.deleteMany({
            where: { campingId: id },
          });

          const promiseFile = files.map((k) => this.CloudinaryService.uploadFiles(k));

          try {
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
            console.error('Cloudinary error when updating camping:', cloudinaryError);
            throw new ServiceUnavailableException(CAMPING_ERROR_MESSAGES.CLOUDINARY);
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
          await tx.pricing.deleteMany({
            where: {
              campingId: id,
            },
          });

          updatePromises.push(
            tx.pricing.createMany({
              data: pricing.map((price) => ({
                ...price,
                campingId: id,
                tarifa: price.tarifa || 'carpa',
                pricePerNight: price.pricePerNight !== undefined ? price.pricePerNight : 0,
              })),
            }),
          );
        }

        if (amenities) {
          updatePromises.push(
            tx.camping.update({
              where: { id: id },
              data: {
                amenities: {
                  set: [],
                },
              },
            }),
          );

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
          await tx.nearbyAttraction.deleteMany({
            where: {
              campingId: id,
            },
          });

          updatePromises.push(
            tx.nearbyAttraction.createMany({
              data: nearbyAttractions.map((attraction) => ({
                ...attraction,
                campingId: id,
                name: attraction.name || 'Default Attraction Name',
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
      this.logger.log(`Attempting to update camping: ${transaction.name}`);
      this.logger.log(`Camping updated successfully: ${transaction.name}`);

      return transaction;
    } catch (error) {
      console.error('Error creating camping:', error);

      if (error instanceof PrismaClientInitializationError) {
        throw new ServiceUnavailableException(CAMPING_ERROR_MESSAGES.PRISMA.DATABASE);
      }
      if (error instanceof InternalServerErrorException) {
        throw new InternalServerErrorException('Error creating camping');
      }
      throw error;
    }
  }

  async createReviews(userId: string, createReviewDtos: createReviewDto[]): Promise<ReviewResponseDto[]> {
    try {
      return Promise.all(
        createReviewDtos.map(async (dto) => {
          const camping = await this.prisma.camping.findUnique({ where: { id: dto.campingId } });

          if (!camping) throw new NotFoundException(CAMPING_ERROR_MESSAGES.PRISMA.NOT_FOUND);

          const hasReservation = await this.prisma.reservation.findFirst({
            where: { userId, campingId: dto.campingId, status: 'CONFIRMED' },
          });
          if (!hasReservation) throw new ForbiddenException('You must have a confirmed reservation for this camping');

          // Crear reseña
          this.logger.log(`Attempting to create review for camping: ${dto.campingId}`);
          this.logger.log(`Review created successfully: ${dto.name}`);
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
      console.error('Error creating review:', error);
      if (error instanceof PrismaClientInitializationError) {
        throw new ServiceUnavailableException(CAMPING_ERROR_MESSAGES.PRISMA.DATABASE);
      }
      if (error instanceof NotFoundException) {
        throw new NotFoundException(CAMPING_ERROR_MESSAGES.PRISMA.NOT_FOUND);
      }

      if (error instanceof ForbiddenException) {
        throw new ForbiddenException('You must have a confirmed reservation for this camping');
      }
      if (error instanceof InternalServerErrorException) {
        throw new InternalServerErrorException('Error creating review');
      }
      throw error;
    }
  }

  async getReviewsByCampingId(campingId: number): Promise<ReviewResponseDto[]> {
    try {
      const camping = await this.prisma.camping.findUnique({ where: { id: campingId } });

      if (!camping) throw new NotFoundException(CAMPING_ERROR_MESSAGES.PRISMA.NOT_FOUND(campingId));

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
      console.error('Error getting reviews:', error);
      if (error instanceof PrismaClientInitializationError) {
        throw new ServiceUnavailableException(CAMPING_ERROR_MESSAGES.PRISMA.DATABASE);
      }
      if (error instanceof NotFoundException) {
        throw new NotFoundException(CAMPING_ERROR_MESSAGES.PRISMA.NOT_FOUND(campingId));
      }
      if (error instanceof InternalServerErrorException) {
        throw new InternalServerErrorException('Error getting reviews');
      }
      throw error;
    }
  }

  async addFavourite(createFavouriteDto: CreateFavouritesDto): Promise<void> {
    try {
      const { campingId, userId } = createFavouriteDto;

      const camping = await this.prisma.camping.findUnique({ where: { id: campingId } });
      if (!camping) {
        throw new NotFoundException('Camping not found');
      }

      const exists = await this.prisma.favourites.findUnique({
        where: {
          userId_campingId: {
            userId,
            campingId,
          },
        },
      });
      if (exists) {
        throw new BadRequestException('This camping is already a favorite');
      }

      // Crea el favorito
      this.logger.log(`Attempting to add favorite for camping: ${campingId}`);
      this.logger.log(`Favorite added successfully: ${campingId}`);
      await this.prisma.favourites.create({
        data: {
          userId,
          campingId,
        },
      });
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        console.error('Error adding camping to favorites:', error);
        throw new InternalServerErrorException('Error adding camping to favorites');
      }
      throw error;
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
        throw new NotFoundException('Favorite not found');
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
      console.error('Error removing camping fromfavorites:', error);
      if (error instanceof InternalServerErrorException) {
        throw new InternalServerErrorException('Error removing camping from favorites');
      }
      throw error;
    }
  }

  async getFavouritesByUser(userId: string) {
    try {
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

      if (favourites.length === 0) {
        throw new NotFoundException('There are no favorites campings for this user');
      }

      return favourites.map((fav) => fav.camping);
    } catch (error) {
      console.error('Error getting favorites by user:', error);
      if (error instanceof InternalServerErrorException) {
        throw new InternalServerErrorException('Error getting favorites by user');
      }
      throw error;
    }
  }
}
