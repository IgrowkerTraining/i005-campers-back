import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CampingResponseDto, CreateCampingDto, PaginatedResponseDto } from './dto/create-camping.dto';
import { plainToInstance } from 'class-transformer';
import { Camping, Prisma } from '@prisma/client';
import { CampingGateway } from '../webSockets/camping.gateway';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class CampingsService {
  constructor(
    private prisma: PrismaService,
    private readonly campingGateway: CampingGateway,
    private readonly cloudinaryService: CloudinaryService,
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

  //   async create(data: CreateCampingDto, userId: string, media: Express.Multer.File[]): Promise<CampingResponseDto> {
  //     const { location, pricing = [], amenities = [], nearbyAttractions = [], limitCamping, ...rest } = data;

  //     return this.prisma.$transaction(async (tx) => {
  //       // let mediaUrls = [];
  //       let mediaUrls: string[] = [];

  //       if (mediaUrls.length > 0) {
  //         mediaUrls = await this.cloudinaryService.uploadImagesToCloudinary(media);
  //       }
  //       const createdCamping = await tx.camping.create({
  //         data: {
  //           ...rest,
  //           user: { connect: { id: userId } },
  //           location: {
  //             create: { ...location },
  //           },

  //           pricing: { create: pricing },

  //           amenities: {
  //             connectOrCreate: amenities.map((amenity) => {
  //               if (amenity.id) {
  //                 return {
  //                   where: { id: amenity.id },
  //                   create: {
  //                     name: `TEMP-${amenity.id}`,
  //                     available: true,
  //                   },
  //                 };
  //               }
  //               return {
  //                 where: { id: -1 },
  //                 create: {
  //                   name: amenity.name!,
  //                   available: amenity.available ?? true,
  //                 },
  //               };
  //             }),
  //           },
  //           // media: {
  //           //   create: mediaUrls.map((url) => ({
  //           //     url,
  //           //     type: 'image', // or 'video' depending on the type of media
  //           //   })),
  //           // },
  //           // console.log(mediaUrls);

  //           media: {
  //             create: data.media.map((mediaDto) => ({
  //               url: mediaDto.url,
  //               type: mediaDto.type,
  //             })),
  //           },

  //           nearbyAttractions: { create: nearbyAttractions },
  //           limitCamping: { create: { maxTents: limitCamping.maxTents, maxUsers: limitCamping.maxUsers } },
  //         },
  //         include: {
  //           location: true,
  //           pricing: {
  //             select: {
  //               pricePerNight: true,
  //               campingId: false,
  //             },
  //           },
  //           amenities: true,
  //           media: true,
  //           nearbyAttractions: true,
  //           limitCamping: true,
  //         },
  //       });
  //       this.campingGateway.notifyNewCamping(createdCamping);

  //       return plainToInstance(CampingResponseDto, createdCamping, {
  //         excludeExtraneousValues: true,
  //       });
  //     });
  //   }
  // }

  // async create(data: CreateCampingDto, userId: string, media: Express.Multer.File[]): Promise<CampingResponseDto> {
  //   const { campingAddress, mapLink, pricePerNight, tarifa, maxTents, maxUsers, ...rest } = data;

  //   const location = { campingAddress, mapLink };
  //   const pricing = [{ pricePerNight, tarifa }];
  //   const limitCamping = { maxTents, maxUsers };
  //   // const media = [{url:"", type:""}]
  //   return this.prisma.$transaction(async (tx) => {
  //     const createdCamping = await tx.camping.create({
  //       data: {
  //         ...rest,
  //         user: { connect: { id: userId } },
  //         location: { create: location },
  //         pricing: { create: pricing },
  //         limitCamping: { create: limitCamping },
  //       },
  //       include: {
  //         location: true,
  //         pricing: true,
  //         limitCamping: true,
  //       },
  //     });

  //     return plainToInstance(CampingResponseDto, createdCamping, { excludeExtraneousValues: true });
  //   });
  // }

  // async create(data: CreateCampingDto, userId: string, media: Express.Multer.File[]): Promise<CampingResponseDto> {
  //   const campingAddress = data.campingAddress;
  //   const mapLink = data.mapLink;
  //   const pricePerNight = data.pricePerNight;
  //   const tarifa = data.tarifa;
  //   const maxTents = data.maxTents;
  //   const maxUsers = data.maxUsers;
  //   const rest = { ...data };

  //   const location = { campingAddress, mapLink };
  //   const pricing = [{ pricePerNight, tarifa }];
  //   const limitCamping = { maxTents, maxUsers };

  //   console.log('Data en el servicio:', data);

  //   return this.prisma.$transaction(async (tx) => {
  //     const createdCamping = await tx.camping.create({
  //       data: {
  //         ...rest,
  //         user: { connect: { id: userId } },
  //         location: { create: location },
  //         pricing: { create: pricing },
  //         limitCamping: { create: limitCamping },
  //       },
  //       include: {
  //         location: true,
  //         pricing: true,
  //         limitCamping: true,
  //       },
  //     });

  //     return plainToInstance(CampingResponseDto, createdCamping, { excludeExtraneousValues: true });
  //   });
  // }

  async create(data: CreateCampingDto, userId: string, mediaFiles: Express.Multer.File[]): Promise<CampingResponseDto> {
    console.log('Data en el servicio:', data);

    const { name, description, contactPhone, campingAddress, mapLink, pricePerNight, tarifa, maxTents, maxUsers } =
      data;

    // Convertir los strings a los tipos de datos correctos
    const parsedPricePerNight = parseFloat(pricePerNight);
    const parsedMaxTents = parseInt(maxTents, 10);
    const parsedMaxUsers = parseInt(maxUsers, 10);

    const location = {
      campingAddress,
      mapLink,
    };

    const pricing = [
      {
        pricePerNight: parsedPricePerNight,
        tarifa,
      },
    ];

    const limitCamping = {
      maxTents: parsedMaxTents,
      maxUsers: parsedMaxUsers,
    };

    return this.prisma.$transaction(async (tx) => {
      // Subir las imágenes a Cloudinary
      let mediaUrls: string[] = [];

      if (mediaFiles && mediaFiles.length > 0) {
        mediaUrls = await this.cloudinaryService.uploadImagesToCloudinary(mediaFiles);
      }

      const createdCamping = await tx.camping.create({
        data: {
          name,
          description,
          contactPhone,
          user: { connect: { id: userId } },
          location: { create: location },
          pricing: { create: pricing },
          limitCamping: { create: limitCamping },
          media: {
            create: mediaUrls.map((url) => ({
              url,
              type: 'image', // O 'video' dependiendo del tipo de media
            })),
          },
        },
        include: {
          location: true,
          pricing: true,
          limitCamping: true,
          media: true,
        },
      });

      return plainToInstance(CampingResponseDto, createdCamping, { excludeExtraneousValues: true });
    });
  }
}
