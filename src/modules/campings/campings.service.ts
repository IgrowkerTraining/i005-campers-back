import { Injectable } from '@nestjs/common';
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

  async create(data: CreateCampingDto, id: string) {
    const { location, pricing, amenities, ...rest } = data;

    await this.prisma.camping.create({
      data: {
        ...rest,
        user: {
          connect: {
            id: id,
          },
        },
        location: {
          create: location,
        },
        pricing: {
          create: pricing,
        },
      },
    });
  }
}
